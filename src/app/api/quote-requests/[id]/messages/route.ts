import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewMessage, notifyQuoteReply } from "@/lib/notifications";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider_id, body } = await request.json();
  if (!provider_id || !body?.trim()) return NextResponse.json({ error: "Hiányzó mezők." }, { status: 400 });

  const admin = createAdminClient();

  const { error } = await admin.from("quote_messages").insert({
    quote_request_id: id,
    provider_id,
    sender_id: user.id,
    body,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Értesítés: meghatározzuk ki a másik fél
  const origin = request.nextUrl.origin;

  // Lekérjük az ajánlatkérés adatait (tárgy + látogató)
  const { data: qr } = await admin
    .from("quote_requests")
    .select("subject, visitor_id")
    .eq("id", id)
    .maybeSingle();

  // Lekérjük a szolgáltató user_id-jét
  const { data: providerRow } = await admin
    .from("providers")
    .select("user_id")
    .eq("id", provider_id)
    .maybeSingle();

  if (qr) {
    const isProviderSending = providerRow?.user_id === user.id;

    if (isProviderSending && qr.visitor_id) {
      // Szolgáltató válaszol → értesítjük a látogatót
      notifyQuoteReply({
        visitorUserId: qr.visitor_id,
        providerUserId: user.id,
        subject: qr.subject,
        origin,
      }).catch(() => {});
    } else if (!isProviderSending && providerRow?.user_id) {
      // Látogató ír → értesítjük a szolgáltatót (mint új üzenet)
      notifyNewMessage({
        recipientId: providerRow.user_id,
        senderId: user.id,
        subject: qr.subject,
        origin,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}
