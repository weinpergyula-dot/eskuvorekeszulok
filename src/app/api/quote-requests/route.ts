import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewQuoteRequest } from "@/lib/notifications";
import { logError } from "@/lib/log-error";

export const dynamic = "force-dynamic";

/**
 * Igaz, ha a beszúrás azért bukott el, mert az image_url oszlop nincs meg a
 * PostgREST sémagyorsítótárában – tipikusan mert a migráció még nem futott le
 * a deploy után. A kódot (PGRST204) és a hibaszöveget is nézzük, hogy a
 * tartalék ág akkor is lefusson, ha a kód idővel változik.
 *
 * A lekérdezéseknél ezért kérünk `*`-ot: azok így nem tudnak elhasalni egy új
 * oszlopon, csak azt adják vissza, ami épp létezik.
 */
function isMissingImageColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "PGRST204" || /image_url/.test(error.message ?? "");
}

// ── Visitor chat helper ───────────────────────────────────────────────────────

type RawReq = { id: string; subject: string; category: string; counties: string[]; message: string; image_url: string | null; created_at: string };
type RawRec = { id: string; quote_request_id: string; provider_id: string; provider_user_id: string };
type RawMsg = { id: string; quote_request_id: string; provider_id: string; sender_id: string; body: string; read: boolean; created_at: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchVisitorChats(admin: any, userId: string) {
  const { data: requests, error: reqError } = await admin
    .from("quote_requests")
    .select("*")
    .eq("visitor_id", userId)
    .eq("deleted_by_visitor", false);

  /* A hibát eddig elnyeltük, és a hívó üres listát kapott – vagyis a
     látogató úgy látta, egyetlen ajánlatkérése sincs. Így legalább nyoma
     marad a hibanaplóban. */
  if (reqError) await logError("api/quote-requests GET", reqError.message, { user: userId });

  if (!requests || requests.length === 0) return [];

  const reqIds = (requests as RawReq[]).map((r) => r.id);

  const [{ data: recipients }, { data: allMessages }] = await Promise.all([
    admin
      .from("quote_request_recipients")
      .select("id, quote_request_id, provider_id, provider_user_id")
      .in("quote_request_id", reqIds),
    admin
      .from("quote_messages")
      .select("id, quote_request_id, provider_id, sender_id, body, read, read_at, created_at")
      .in("quote_request_id", reqIds)
      .order("created_at", { ascending: true }),
  ]);

  if (!recipients || recipients.length === 0) return [];

  const providerUserIds: string[] = [
    ...new Set(
      (recipients as RawRec[]).map((r) => r.provider_user_id).filter(Boolean)
    ),
  ];
  const providerIds: string[] = [
    ...new Set((recipients as RawRec[]).map((r) => r.provider_id).filter(Boolean)),
  ];

  const [{ data: profiles }, { data: providerAvatarRows }] = await Promise.all([
    admin.from("profiles").select("user_id, full_name").in("user_id", providerUserIds),
    providerIds.length > 0
      ? admin.from("providers").select("id, avatar_url").in("id", providerIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = new Map(
    ((profiles ?? []) as { user_id: string; full_name: string }[]).map((p) => [p.user_id, p.full_name])
  );
  const providerAvatarMap = new Map(
    ((providerAvatarRows ?? []) as { id: string; avatar_url: string | null }[]).map((p) => [p.id, p.avatar_url])
  );

  const msgMap = new Map<string, RawMsg[]>();
  for (const msg of ((allMessages ?? []) as RawMsg[])) {
    const key = `${msg.quote_request_id}__${msg.provider_id}`;
    if (!msgMap.has(key)) msgMap.set(key, []);
    msgMap.get(key)!.push(msg);
  }

  const reqMap = new Map<string, RawReq>((requests as RawReq[]).map((r) => [r.id, r]));

  const chats = (recipients as RawRec[]).map((rec) => {
    const req = reqMap.get(rec.quote_request_id);
    const msgs = msgMap.get(`${rec.quote_request_id}__${rec.provider_id}`) ?? [];
    const unreadCount = msgs.filter((m) => !m.read && m.sender_id !== userId).length;
    const lastMsg = msgs[msgs.length - 1];
    return {
      request_id: rec.quote_request_id,
      subject: req?.subject ?? "",
      category: req?.category ?? "",
      counties: req?.counties ?? [],
      message: req?.message ?? "",
      image_url: req?.image_url ?? null,
      provider_id: rec.provider_id,
      provider_full_name: profileMap.get(rec.provider_user_id) ?? "Ismeretlen",
      provider_avatar_url: providerAvatarMap.get(rec.provider_id) ?? null,
      messages: msgs,
      unread_count: unreadCount,
      last_at: lastMsg?.created_at ?? req?.created_at ?? "",
    };
  });

  chats.sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime());
  return chats;
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const { data: providerData } = await admin.from("providers").select("id").eq("user_id", user.id).maybeSingle();

  if (providerData) {
    const { data: recipients } = await admin
      .from("quote_request_recipients")
      .select("id, read, created_at, quote_request_id")
      .eq("provider_user_id", user.id)
      .eq("deleted_by_provider", false)
      .order("created_at", { ascending: false });

    const [providerRequests, visitorChats] = await Promise.all([
      Promise.all((recipients ?? []).map(async (rec) => {
        const [{ data: qr }, { data: unreadMsgs }, { data: lastMsgRows }] = await Promise.all([
          admin.from("quote_requests").select("*").eq("id", rec.quote_request_id).single(),
          admin.from("quote_messages").select("id").eq("quote_request_id", rec.quote_request_id).eq("provider_id", providerData.id).neq("sender_id", user.id).eq("read", false),
          admin.from("quote_messages").select("id, sender_id, body, created_at").eq("quote_request_id", rec.quote_request_id).eq("provider_id", providerData.id).order("created_at", { ascending: false }).limit(1),
        ]);
        const lastMsg = lastMsgRows?.[0] ?? null;
        const { data: visitorProfile } = await admin.from("profiles").select("full_name, avatar_url").eq("user_id", qr?.visitor_id ?? "").single();
        return {
          recipient_id: rec.id,
          quote_request_id: rec.quote_request_id,
          provider_id: providerData.id,
          subject: qr?.subject ?? "",
          category: qr?.category ?? "",
          counties: qr?.counties ?? [],
          message: qr?.message ?? "",
          image_url: qr?.image_url ?? null,
          created_at: qr?.created_at ?? rec.created_at,
          read: rec.read,
          visitor_name: visitorProfile?.full_name || "Ismeretlen látogató",
          visitor_avatar_url: visitorProfile?.avatar_url ?? null,
          unread_reply_count: unreadMsgs?.length ?? 0,
          last_message_at: lastMsg?.created_at ?? null,
          last_message_body: lastMsg?.body ?? null,
          last_message_sender_id: lastMsg?.sender_id ?? null,
        };
      })),
      fetchVisitorChats(admin, user.id),
    ]);

    return NextResponse.json({ providerRequests, visitorChats });
  }

  // Visitor-only path
  const visitorChats = await fetchVisitorChats(admin, user.id);
  return NextResponse.json(visitorChats);
}

/**
 * A saját (meghívós) ajánlatkéréseket nem a regisztrált szolgáltatók kapják,
 * hanem kizárólag az itteni fiók szolgáltatói profilja. A cím környezeti
 * változóval felülírható, hogy staging/dev alatt is a megfelelő fiókhoz
 * fusson be.
 */
const HOUSE_ACCOUNT_EMAIL = process.env.HOUSE_ACCOUNT_EMAIL ?? "weinper.gyula@gmail.com";

type HouseProvider = { id: string; user_id: string };

/**
 * A ház szolgáltatói profilja, ha még nem létezik. Csak a beszélgetés
 * horgonya: a címzett a providers táblán keresztül kötődik az
 * ajánlatkéréshez, ezért kell hozzá egy sor.
 *
 * `active: false`, ezért sehol nem jelenik meg nyilvánosan – sem a főoldali
 * listában, sem a kategóriaszámokban, sem az általános ajánlatkérő
 * címzettválasztójában (ezek mind a jóváhagyott ÉS aktív sorokat kérik le).
 * Az `approval_status` viszont "approved", hogy ne kerüljön az admin
 * jóváhagyásra váró listájába.
 */
const HOUSE_PROVIDER_DEFAULTS = {
  full_name: "Esküvőre Készülök – Digitális meghívó",
  phone: "+36 70 788 8787",
  description:
    "A saját digitális esküvői meghívó szolgáltatásunk. Ezen a profilon keresztül érkeznek be a meghívós ajánlatkérések.",
  categories: ["meghivo"],
  counties: ["Országosan"],
  approval_status: "approved",
  active: false,
};

/**
 * A ház szolgáltatói profilja – ide megy a meghívós ajánlatkérés.
 *
 * A keresés szándékosan engedékeny: a cím kis-nagybetűtől függetlenül
 * illeszkedik, és ha több találat is van (pl. régi, törölt fiók ugyanazzal a
 * címmel, vagy több szolgáltatói rekord), az elsőt vesszük – a maybeSingle()
 * ilyenkor hibát adna, és a címzett „nem elérhető” lenne. A visszaadott ok
 * bekerül a naplóba, hogy a beállítás hiánya azonnal látszódjon.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findHouseProvider(admin: any): Promise<{ provider: HouseProvider | null; reason: string }> {
  const email = HOUSE_ACCOUNT_EMAIL.trim();

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("user_id")
    .ilike("email", email)
    .limit(1);

  if (profileError) return { provider: null, reason: `profiles query failed: ${profileError.message}` };

  const userId = (profiles ?? [])[0]?.user_id;
  if (!userId) return { provider: null, reason: `nincs profil ezzel a címmel: ${email}` };

  const { data: providers, error: providerError } = await admin
    .from("providers")
    .select("id, user_id")
    .eq("user_id", userId)
    .limit(1);

  if (providerError) return { provider: null, reason: `providers query failed: ${providerError.message}` };

  const provider = (providers ?? [])[0] as HouseProvider | undefined;
  if (provider) return { provider, reason: "ok" };

  // Még nincs profil: elsőre létrehozzuk. A user_id egyedi, ezért egyidejű
  // kérésnél a vesztes ág is megtalálja a másik által beszúrt sort.
  const { data: created, error: insertError } = await admin
    .from("providers")
    .insert({ ...HOUSE_PROVIDER_DEFAULTS, user_id: userId, email })
    .select("id, user_id")
    .maybeSingle();

  if (created) return { provider: created as HouseProvider, reason: "created" };

  const { data: retry } = await admin
    .from("providers")
    .select("id, user_id")
    .eq("user_id", userId)
    .limit(1);
  const existing = (retry ?? [])[0] as HouseProvider | undefined;
  if (existing) return { provider: existing, reason: "ok" };

  return {
    provider: null,
    reason: `a(z) ${email} fiókhoz nem sikerült szolgáltatói profilt létrehozni: ${insertError?.message ?? "ismeretlen hiba"}`,
  };
}

/**
 * A csatolt kép hivatkozását a kliens küldi, ezért csak a saját Supabase
 * tárhelyünkre mutató, nyilvános URL-t fogadunk el – így nem lehet idegen
 * (követő vagy kártékony) címet becsempészni a chatbe.
 */
function ownStorageUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!base) return null;
  return value.startsWith(`${base}/storage/v1/object/public/`) ? value : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, category, counties, message, selectedProviderIds, houseOnly, imageUrl } = await request.json();
  if (!subject?.trim() || !category || !counties?.length || !message?.trim())
    return NextResponse.json({ error: "Hiányzó mezők." }, { status: 400 });

  // A csatolt kép csak az általános ajánlatkéréshez tartozik – a meghívósnál
  // nincs feltöltés, ezért ott a hivatkozást akkor sem vesszük át, ha megjön.
  const safeImageUrl = houseOnly ? null : ownStorageUrl(imageUrl);

  const admin = createAdminClient();

  // A ház ajánlatkérése: csak a saját profil kapja meg, szolgáltatókeresés nélkül.
  let houseProvider: HouseProvider | null = null;
  if (houseOnly) {
    const found = await findHouseProvider(admin);
    houseProvider = found.provider;
    if (found.reason === "created" && houseProvider) {
      // Egyszeri esemény: jó, ha nyoma marad, mikor jött létre a fogadó profil.
      await logError("api/quote-requests POST", `house provider created (${houseProvider.id})`, { email: HOUSE_ACCOUNT_EMAIL });
    }
    if (!houseProvider) {
      await logError("api/quote-requests POST", `house provider not found: ${found.reason}`, { user: user.id, category });
      return NextResponse.json(
        { error: "Az ajánlatkérés címzettje jelenleg nem elérhető. Kérlek, hívj minket telefonon!" },
        { status: 503 },
      );
    }
  }

  const row = { visitor_id: user.id, subject, category, counties, message };

  let { data: qr, error: qrError } = await admin
    .from("quote_requests")
    .insert({ ...row, image_url: safeImageUrl })
    .select("id")
    .single();

  /* Ha az image_url oszlop még nincs meg (a migráció a deploy után fut le),
     a kérés kép nélkül is menjen el: a melléklet elvesztése kellemetlen, az
     egész ajánlatkérésé viszont adatvesztés. A migráció után ez sosem fut. */
  if (isMissingImageColumn(qrError)) {
    await logError("api/quote-requests POST", "image_url oszlop hiányzik, az ajánlatkérés kép nélkül ment el (futtatandó migráció: 20260831_quote_request_image.sql)", { user: user.id, subject, category });
    ({ data: qr, error: qrError } = await admin.from("quote_requests").insert(row).select("id").single());
  }

  if (qrError || !qr) { await logError("api/quote-requests POST", qrError?.message ?? "insert returned null", { user: user.id, subject, category }); return NextResponse.json({ error: "Hiba az ajánlatkérés létrehozásakor." }, { status: 500 }); }

  if (houseProvider) {
    await admin.from("quote_request_recipients").insert({
      quote_request_id: qr.id,
      provider_id: houseProvider.id,
      provider_user_id: houseProvider.user_id,
    });
    notifyNewQuoteRequest({
      providerUserId: houseProvider.user_id,
      visitorUserId: user.id,
      subject,
      category,
      message,
      origin: request.nextUrl.origin,
    }).catch(() => {});
    return NextResponse.json({ id: qr.id, recipient_count: 1 });
  }

  // "Országosan" means every provider in the category, regardless of county.
  const nationwide = Array.isArray(counties) && counties.includes("Országosan");
  let providersQuery = admin
    .from("providers")
    .select("id, user_id")
    .eq("approval_status", "approved")
    .or("active.is.null,active.eq.true")
    .contains("categories", [category]);
  if (!nationwide) {
    providersQuery = providersQuery.overlaps("counties", [...counties, "Országosan"]);
  }
  const { data: allProviders } = await providersQuery;

  const hasSelection = Array.isArray(selectedProviderIds) && selectedProviderIds.length > 0;

  /* Ha a látogató név szerint kijelölte a címzetteket, pontosan azokat a
     sorokat vesszük. Az azonos user_id-jű duplikátumok kiszűrése csak akkor
     kell, ha mindenkinek megy: a lekérdezésen nincs rendezés, ezért a szűrés
     más sort tarthat meg, mint amit a címzettválasztó mutatott – így a
     kijelölt szolgáltató kieshetne a listából. */
  const targetProviders = hasSelection
    ? (allProviders ?? []).filter((p) => p.user_id && selectedProviderIds.includes(p.id))
    : (() => {
        const seenUserIds = new Set<string>();
        return (allProviders ?? []).filter((p) => {
          if (!p.user_id || seenUserIds.has(p.user_id)) return false;
          seenUserIds.add(p.user_id);
          return true;
        });
      })();

  if (hasSelection && targetProviders.length === 0) {
    await logError("api/quote-requests POST", "a kijelölt szolgáltatók egyike sem szerepel a találatok közt", { user: user.id, category, counties, selectedProviderIds });
  }

  /* A supabase-js adatbázishibánál nem dob kivételt, hanem `error`-ral tér
     vissza – a Promise tehát akkor is "fulfilled", ha a beszúrás elhasalt.
     Ezért a hibát külön kell megnézni, különben a hívó sikert lát, közben
     egyetlen címzett sem jött létre, és a naplóban sincs nyoma. */
  const results = await Promise.all(
    targetProviders.map(async (p) => {
      const { error } = await admin.from("quote_request_recipients").insert({
        quote_request_id: qr.id,
        provider_id: p.id,
        provider_user_id: p.user_id,
      });
      if (error) await logError("api/quote-requests POST", `címzett beszúrása sikertelen: ${error.message}`, { quoteRequestId: qr.id, provider_id: p.id });
      return { provider: p, ok: !error };
    })
  );

  const delivered = results.filter((r) => r.ok).map((r) => r.provider);

  /* Címzett nélkül az ajánlatkérés sehol nem látszik – sem a küldőnél, sem a
     szolgáltatónál –, ezért ilyenkor ne mondjunk sikert. */
  if (delivered.length === 0) {
    await logError("api/quote-requests POST", "az ajánlatkérés egyetlen címzetthez sem jutott el", { quoteRequestId: qr.id, user: user.id, category, targets: targetProviders.length });
    return NextResponse.json(
      { error: "Az ajánlatkérés egyetlen szolgáltatóhoz sem jutott el. Kérlek, próbáld újra, vagy jelezd nekünk!" },
      { status: 500 },
    );
  }

  const origin = request.nextUrl.origin;
  for (const p of delivered) {
    if (p.user_id) {
      notifyNewQuoteRequest({
        providerUserId: p.user_id,
        visitorUserId: user.id,
        subject,
        category,
        message,
        origin,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ id: qr.id, recipient_count: delivered.length });
}
