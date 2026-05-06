import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("user_id", user.id).single();

  if (profile?.role === "visitor" || profile?.role === "admin") {
    const { data: qr } = await admin
      .from("quote_requests")
      .select("id, subject, category, counties, message, created_at")
      .eq("id", id)
      .eq("visitor_id", user.id)
      .single();
    if (!qr) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: recipients } = await admin
      .from("quote_request_recipients")
      .select("id, provider_id, provider_user_id, read, created_at")
      .eq("quote_request_id", id);

    const providersWithMessages = await Promise.all((recipients ?? []).map(async (rec) => {
      const [{ data: prov }, { data: messages }] = await Promise.all([
        admin.from("providers").select("id, full_name, avatar_url, categories").eq("id", rec.provider_id).single(),
        admin.from("quote_messages")
          .select("id, sender_id, body, read, created_at")
          .eq("quote_request_id", id)
          .eq("provider_id", rec.provider_id)
          .order("created_at", { ascending: true }),
      ]);
      const hasReply = (messages ?? []).some((m) => m.sender_id !== user.id);
      const unreadCount = (messages ?? []).filter((m) => m.sender_id !== user.id && !m.read).length;
      return { ...prov, recipient_id: rec.id, messages: messages ?? [], has_reply: hasReply, unread_count: unreadCount };
    }));

    return NextResponse.json({ ...qr, providers: providersWithMessages });
  }

  if (profile?.role === "provider") {
    const { data: providerData } = await admin.from("providers").select("id").eq("user_id", user.id).single();
    if (!providerData) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: rec } = await admin
      .from("quote_request_recipients")
      .select("id, read")
      .eq("quote_request_id", id)
      .eq("provider_user_id", user.id)
      .single();
    if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [{ data: qr }, { data: messages }] = await Promise.all([
      admin.from("quote_requests").select("id, subject, category, counties, message, created_at, visitor_id").eq("id", id).single(),
      admin.from("quote_messages")
        .select("id, sender_id, body, read, created_at")
        .eq("quote_request_id", id)
        .eq("provider_id", providerData.id)
        .order("created_at", { ascending: true }),
    ]);

    const { data: visitorProfile } = await admin.from("profiles").select("full_name").eq("user_id", qr?.visitor_id ?? "").single();

    return NextResponse.json({
      ...qr,
      recipient_id: rec.id,
      provider_id: providerData.id,
      request_read: rec.read,
      visitor_name: visitorProfile?.full_name || "Ismeretlen látogató",
      messages: messages ?? [],
    });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
