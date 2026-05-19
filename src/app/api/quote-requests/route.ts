import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewQuoteRequest } from "@/lib/notifications";
import { logError } from "@/lib/log-error";

export const dynamic = "force-dynamic";

// ── Visitor chat helper ───────────────────────────────────────────────────────

type RawReq = { id: string; subject: string; category: string; counties: string[]; message: string; created_at: string };
type RawRec = { id: string; quote_request_id: string; provider_id: string; provider_user_id: string };
type RawMsg = { id: string; quote_request_id: string; provider_id: string; sender_id: string; body: string; read: boolean; created_at: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchVisitorChats(admin: any, userId: string) {
  const { data: requests } = await admin
    .from("quote_requests")
    .select("id, subject, category, counties, message, created_at")
    .eq("visitor_id", userId)
    .eq("deleted_by_visitor", false);

  if (!requests || requests.length === 0) return [];

  const reqIds = (requests as RawReq[]).map((r) => r.id);

  const [{ data: recipients }, { data: allMessages }] = await Promise.all([
    admin
      .from("quote_request_recipients")
      .select("id, quote_request_id, provider_id, provider_user_id")
      .in("quote_request_id", reqIds),
    admin
      .from("quote_messages")
      .select("id, quote_request_id, provider_id, sender_id, body, read, created_at")
      .in("quote_request_id", reqIds)
      .order("created_at", { ascending: true }),
  ]);

  if (!recipients || recipients.length === 0) return [];

  const providerUserIds: string[] = [
    ...new Set(
      (recipients as RawRec[]).map((r) => r.provider_user_id).filter(Boolean)
    ),
  ];
  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", providerUserIds);

  const profileMap = new Map(
    ((profiles ?? []) as { user_id: string; full_name: string }[]).map((p) => [p.user_id, p.full_name])
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
      provider_id: rec.provider_id,
      provider_full_name: profileMap.get(rec.provider_user_id) ?? "Ismeretlen",
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
        const [{ data: qr }, { data: unreadMsgs }] = await Promise.all([
          admin.from("quote_requests").select("subject, category, counties, message, created_at, visitor_id").eq("id", rec.quote_request_id).single(),
          admin.from("quote_messages").select("id").eq("quote_request_id", rec.quote_request_id).eq("provider_id", providerData.id).neq("sender_id", user.id).eq("read", false),
        ]);
        const { data: visitorProfile } = await admin.from("profiles").select("full_name").eq("user_id", qr?.visitor_id ?? "").single();
        return {
          recipient_id: rec.id,
          quote_request_id: rec.quote_request_id,
          provider_id: providerData.id,
          subject: qr?.subject ?? "",
          category: qr?.category ?? "",
          counties: qr?.counties ?? [],
          message: qr?.message ?? "",
          created_at: qr?.created_at ?? rec.created_at,
          read: rec.read,
          visitor_name: visitorProfile?.full_name || "Ismeretlen látogató",
          unread_reply_count: unreadMsgs?.length ?? 0,
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

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, category, counties, message, selectedProviderIds } = await request.json();
  if (!subject?.trim() || !category || !counties?.length || !message?.trim())
    return NextResponse.json({ error: "Hiányzó mezők." }, { status: 400 });

  const admin = createAdminClient();

  const { data: qr, error: qrError } = await admin
    .from("quote_requests")
    .insert({ visitor_id: user.id, subject, category, counties, message })
    .select("id")
    .single();

  if (qrError || !qr) { await logError("api/quote-requests POST", qrError?.message ?? "insert returned null", { user: user.id, subject, category }); return NextResponse.json({ error: "Hiba az ajánlatkérés létrehozásakor." }, { status: 500 }); }

  const searchCounties = [...counties, "Országosan"];
  const { data: allProviders } = await admin
    .from("providers")
    .select("id, user_id")
    .eq("approval_status", "approved")
    .contains("categories", [category])
    .overlaps("counties", searchCounties);

  const seenUserIds = new Set<string>();
  const uniqueProviders = (allProviders ?? []).filter((p) => {
    if (!p.user_id || seenUserIds.has(p.user_id)) return false;
    seenUserIds.add(p.user_id);
    return true;
  });

  const targetProviders = Array.isArray(selectedProviderIds) && selectedProviderIds.length > 0
    ? uniqueProviders.filter((p) => selectedProviderIds.includes(p.id))
    : uniqueProviders;

  let insertedCount = 0;
  if (targetProviders.length > 0) {
    const results = await Promise.allSettled(
      targetProviders.map((p) =>
        admin.from("quote_request_recipients").insert({
          quote_request_id: qr.id,
          provider_id: p.id,
          provider_user_id: p.user_id,
        })
      )
    );
    insertedCount = results.filter((r) => r.status === "fulfilled").length;
  }

  const origin = request.nextUrl.origin;
  for (const p of targetProviders) {
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

  return NextResponse.json({ id: qr.id, recipient_count: insertedCount });
}
