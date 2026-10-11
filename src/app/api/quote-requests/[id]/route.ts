import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  /* Melyik nézet jár? Nem a szerepkör dönti el, hanem hogy a felhasználó
     szolgáltatóként címzettje-e ennek az ajánlatkérésnek – a meghívós
     kéréseket például az admin fiók szolgáltatói profilja kapja meg. */
  const { data: providerData } = await admin
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: rec } = providerData
    ? await admin
        .from("quote_request_recipients")
        .select("id, read")
        .eq("quote_request_id", id)
        .eq("provider_user_id", user.id)
        .maybeSingle()
    : { data: null };

  if (providerData && rec) {
    const [{ data: qr }, { data: messages }] = await Promise.all([
      admin.from("quote_requests").select("*").eq("id", id).maybeSingle(),
      admin.from("quote_messages")
        .select("id, sender_id, body, read, read_at, created_at")
        .eq("quote_request_id", id)
        .eq("provider_id", providerData.id)
        .order("created_at", { ascending: true }),
    ]);

    const { data: visitorProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("user_id", qr?.visitor_id ?? "")
      .maybeSingle();

    return NextResponse.json({
      ...qr,
      recipient_id: rec.id,
      provider_id: providerData.id,
      request_read: rec.read,
      visitor_name: visitorProfile?.full_name || "Ismeretlen látogató",
      messages: messages ?? [],
    });
  }

  // Küldői nézet: a saját ajánlatkérése, minden címzettel és üzenettel.
  const { data: qr } = await admin
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .eq("visitor_id", user.id)
    .maybeSingle();
  if (!qr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: recipients } = await admin
    .from("quote_request_recipients")
    .select("id, provider_id, provider_user_id, read, created_at")
    .eq("quote_request_id", id);

  const providersWithMessages = await Promise.all((recipients ?? []).map(async (rec) => {
    const [{ data: prov }, { data: messages }] = await Promise.all([
      admin.from("providers").select("id, full_name, avatar_url, categories").eq("id", rec.provider_id).maybeSingle(),
      admin.from("quote_messages")
        .select("id, sender_id, body, read, read_at, created_at")
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Ha van provider rekordja → soft-delete a saját recipient során + rendszerüzenet a quote_messages-ben
  const { data: providerData } = await admin.from("providers").select("id").eq("user_id", user.id).maybeSingle();
  if (providerData) {
    // Insert system message into quote_messages (visible to visitor in Ajánlatkérések)
    await admin.from("quote_messages").insert({
      quote_request_id: id,
      provider_id: providerData.id,
      sender_id: user.id,
      body: "__SYSTEM__:A szolgáltató visszavonta magát az ajánlatkérésből. Válaszadásra nincs lehetőség.",
    });

    // Soft-delete: mark as deleted for provider (keeps row so visitor still sees the thread)
    const { error } = await admin
      .from("quote_request_recipients")
      .update({ deleted_by_provider: true })
      .eq("quote_request_id", id)
      .eq("provider_user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Látogató → rendszerüzenet a quote_messages-ben minden szolgáltatónak + soft-delete az ajánlatkérésen
  const [{ data: recipients }, { data: qr }] = await Promise.all([
    admin.from("quote_request_recipients").select("provider_id").eq("quote_request_id", id),
    admin.from("quote_requests").select("subject").eq("id", id).single(),
  ]);

  await Promise.all(
    (recipients ?? []).map((rec) =>
      admin.from("quote_messages").insert({
        quote_request_id: id,
        provider_id: rec.provider_id,
        sender_id: user.id,
        body: `__SYSTEM__:A kérelmező visszavonta a(z) „${qr?.subject ?? "ezt az ajánlatkérést"}". Válaszadásra nincs lehetőség.`,
      })
    )
  );

  const { error } = await admin
    .from("quote_requests")
    .update({ deleted_by_visitor: true })
    .eq("id", id)
    .eq("visitor_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
