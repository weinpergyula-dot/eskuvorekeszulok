import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const senderIds = [...new Set((messages ?? []).filter(m => m.sender_id !== user.id).map((m) => m.sender_id))];
  const recipientIds = [...new Set((messages ?? []).filter(m => m.sender_id === user.id).map((m) => m.recipient_id))];

  const adminClient = createAdminClient();
  const [{ data: profiles }, { data: senderProviders }, { data: recipientProfiles }, { data: recipientProviders }] = await Promise.all([
    senderIds.length > 0
      ? adminClient.from("profiles").select("user_id, full_name, role").in("user_id", senderIds)
      : Promise.resolve({ data: [] }),
    senderIds.length > 0
      ? adminClient.from("providers").select("user_id, id").in("user_id", senderIds)
      : Promise.resolve({ data: [] }),
    recipientIds.length > 0
      ? adminClient.from("profiles").select("user_id, full_name, role").in("user_id", recipientIds)
      : Promise.resolve({ data: [] }),
    recipientIds.length > 0
      ? adminClient.from("providers").select("user_id, id").in("user_id", recipientIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, { name: p.full_name, role: p.role }]));
  const providerMap = Object.fromEntries((senderProviders ?? []).map((p) => [p.user_id, p.id]));
  const recipientProfileMap = Object.fromEntries((recipientProfiles ?? []).map((p) => [p.user_id, { name: p.full_name as string, role: p.role as string }]));
  const recipientProviderMap = Object.fromEntries((recipientProviders ?? []).map((p) => [p.user_id, p.id as string]));

  const enriched = (messages ?? []).map((m) => {
    const isOwn = m.sender_id === user.id;
    return {
      ...m,
      is_own: isOwn,
      sender_name: isOwn ? "Ön" : (profileMap[m.sender_id]?.name || "Névtelen felhasználó"),
      sender_role: isOwn ? "self" : (profileMap[m.sender_id]?.role ?? "visitor"),
      sender_provider_id: isOwn ? null : (providerMap[m.sender_id] ?? null),
      recipient_name: isOwn ? (recipientProfileMap[m.recipient_id]?.name ?? "Névtelen") : null,
      recipient_role: isOwn ? (recipientProfileMap[m.recipient_id]?.role ?? null) : null,
      recipient_provider_id: isOwn ? (recipientProviderMap[m.recipient_id] ?? null) : null,
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

  const { error } = await supabase
    .from("messages")
    .delete()
    .in("id", ids)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
