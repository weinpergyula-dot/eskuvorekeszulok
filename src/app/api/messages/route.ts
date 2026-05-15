import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewMessage } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only return messages that the current user hasn't soft-deleted
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},deleted_for_sender.eq.false),` +
      `and(recipient_id.eq.${user.id},deleted_for_recipient.eq.false)`
    )
    .order("created_at", { ascending: false });

  const senderIds = [...new Set((messages ?? []).filter(m => m.sender_id !== user.id).map((m) => m.sender_id))];
  const recipientIds = [...new Set((messages ?? []).filter(m => m.sender_id === user.id).map((m) => m.recipient_id))];

  const adminClient = createAdminClient();
  const [{ data: profiles }, { data: senderProviders }, { data: recipientProfiles }, { data: recipientProviders }] = await Promise.all([
    senderIds.length > 0
      ? adminClient.from("profiles").select("user_id, full_name, role").in("user_id", senderIds)
      : Promise.resolve({ data: [] }),
    senderIds.length > 0
      ? adminClient.from("providers").select("user_id, id, categories").in("user_id", senderIds)
      : Promise.resolve({ data: [] }),
    recipientIds.length > 0
      ? adminClient.from("profiles").select("user_id, full_name, role").in("user_id", recipientIds)
      : Promise.resolve({ data: [] }),
    recipientIds.length > 0
      ? adminClient.from("providers").select("user_id, id, categories").in("user_id", recipientIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, { name: p.full_name, role: p.role }]));
  const providerMap = Object.fromEntries((senderProviders ?? []).map((p) => [p.user_id, { id: p.id, categories: (p.categories ?? []) as string[] }]));
  const recipientProfileMap = Object.fromEntries((recipientProfiles ?? []).map((p) => [p.user_id, { name: p.full_name as string, role: p.role as string }]));
  const recipientProviderMap = Object.fromEntries((recipientProviders ?? []).map((p) => [p.user_id, { id: p.id as string, categories: (p.categories ?? []) as string[] }]));

  const enriched = (messages ?? []).map((m) => {
    const isOwn = m.sender_id === user.id;
    return {
      ...m,
      is_own: isOwn,
      sender_name: isOwn ? "Ön" : (profileMap[m.sender_id]?.name || "Névtelen felhasználó"),
      sender_role: isOwn ? "self" : (profileMap[m.sender_id]?.role ?? "visitor"),
      sender_provider_id: isOwn ? null : (providerMap[m.sender_id]?.id ?? null),
      sender_provider_categories: isOwn ? null : (providerMap[m.sender_id]?.categories ?? null),
      recipient_name: isOwn ? (recipientProfileMap[m.recipient_id]?.name ?? "Névtelen") : null,
      recipient_role: isOwn ? (recipientProfileMap[m.recipient_id]?.role ?? null) : null,
      recipient_provider_id: isOwn ? (recipientProviderMap[m.recipient_id]?.id ?? null) : null,
      recipient_provider_categories: isOwn ? (recipientProviderMap[m.recipient_id]?.categories ?? null) : null,
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipient_id, provider_id, subject, body } = await req.json();
  if (!recipient_id || !subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Hiányzó mezők." }, { status: 400 });
  }
  if (recipient_id === user.id) {
    return NextResponse.json({ error: "Saját magadnak nem küldhetsz üzenetet." }, { status: 400 });
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id,
    provider_id: provider_id ?? null,
    subject: subject.trim(),
    body: body.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Értesítés küldése (fire-and-forget – nem blokkolja a választ)
  const origin = new URL(req.url).origin;
  notifyNewMessage({ recipientId: recipient_id, senderId: user.id, subject: subject.trim(), origin }).catch(() => {});

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Hiányzó azonosítók." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch thread info to find the other party and the subject
  const { data: threadMessages } = await admin
    .from("messages")
    .select("sender_id, recipient_id, subject, body")
    .in("id", ids);

  // Determine the other user (not the current user)
  const msgs = threadMessages ?? [];
  const otherUserId =
    msgs.find((m) => m.sender_id !== user.id)?.sender_id ??
    msgs.find((m) => m.recipient_id !== user.id)?.recipient_id ?? null;

  const subject = msgs[0]?.subject?.replace(/^(Re:\s*)+/i, "").trim() ?? "";

  // Only insert a system message if the thread wasn't already terminated by the other side
  const alreadyTerminated = msgs.some(
    (m) => m.sender_id !== user.id && (m.body as string).startsWith("__SYSTEM__:")
  );

  if (otherUserId && !alreadyTerminated) {
    // Insert system message for the other party.
    // Mark deleted_for_sender=true so the deleting user never sees it.
    await admin.from("messages").insert({
      sender_id: user.id,
      recipient_id: otherUserId,
      subject,
      body: "__SYSTEM__:A másik fél törölte ezt a beszélgetést. Válaszadásra nincs lehetőség.",
      deleted_for_sender: true,
    });
  }

  // Soft-delete: mark messages as deleted for the current user instead of hard-deleting.
  // The other party still sees the original messages plus the system notification above.
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    admin
      .from("messages")
      .update({ deleted_for_sender: true })
      .in("id", ids)
      .eq("sender_id", user.id),
    admin
      .from("messages")
      .update({ deleted_for_recipient: true })
      .in("id", ids)
      .eq("recipient_id", user.id),
  ]);

  if (e1 || e2) return NextResponse.json({ error: (e1 ?? e2)?.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
