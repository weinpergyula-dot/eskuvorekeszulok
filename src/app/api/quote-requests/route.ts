import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Provider nézet ha van provider rekordja (role-tól függetlenül: visitor→provider átmenet, admin saját profil)
  const { data: providerData } = await admin.from("providers").select("id").eq("user_id", user.id).maybeSingle();

  if (providerData) {
    const { data: recipients } = await admin
      .from("quote_request_recipients")
      .select("id, read, created_at, quote_request_id")
      .eq("provider_user_id", user.id)
      .order("created_at", { ascending: false });

    if (!recipients) return NextResponse.json([]);

    const enriched = await Promise.all(recipients.map(async (rec) => {
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
    }));

    return NextResponse.json(enriched);
  }

  // Látogató / admin nézet (nincs provider rekordjuk)
  const { data: requests } = await admin
    .from("quote_requests")
    .select("id, subject, category, counties, message, created_at")
    .eq("visitor_id", user.id)
    .order("created_at", { ascending: false });

  if (!requests) return NextResponse.json([]);

  const enriched = await Promise.all(requests.map(async (req) => {
    const [{ count: recipientCount }, { data: unreadMsgs }] = await Promise.all([
      admin.from("quote_request_recipients").select("*", { count: "exact", head: true }).eq("quote_request_id", req.id),
      admin.from("quote_messages").select("id").eq("quote_request_id", req.id).neq("sender_id", user.id).eq("read", false),
    ]);
    return { ...req, recipient_count: recipientCount ?? 0, unread_reply_count: unreadMsgs?.length ?? 0 };
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, category, counties, message } = await request.json();
  if (!subject?.trim() || !category || !counties?.length || !message?.trim())
    return NextResponse.json({ error: "Hiányzó mezők." }, { status: 400 });

  const admin = createAdminClient();

  const { data: qr, error: qrError } = await admin
    .from("quote_requests")
    .insert({ visitor_id: user.id, subject, category, counties, message })
    .select("id")
    .single();

  if (qrError || !qr) return NextResponse.json({ error: "Hiba az ajánlatkérés létrehozásakor." }, { status: 500 });

  const searchCounties = [...counties, "Országosan"];
  const { data: providers } = await admin
    .from("providers")
    .select("id, user_id")
    .eq("approval_status", "approved")
    .contains("categories", [category])
    .overlaps("counties", searchCounties);

  let insertedCount = 0;
  if (providers && providers.length > 0) {
    const results = await Promise.allSettled(
      providers.map((p) =>
        admin.from("quote_request_recipients").insert({
          quote_request_id: qr.id,
          provider_id: p.id,
          provider_user_id: p.user_id,
        })
      )
    );
    insertedCount = results.filter((r) => r.status === "fulfilled").length;
  }

  return NextResponse.json({ id: qr.id, recipient_count: insertedCount });
}
