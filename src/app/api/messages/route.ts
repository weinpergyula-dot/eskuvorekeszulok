import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  const senderIds = [...new Set((messages ?? []).map((m) => m.sender_id))];

  const [{ data: profiles }, { data: senderProviders }] = await Promise.all([
    senderIds.length > 0
      ? supabase.from("profiles").select("user_id, full_name").in("user_id", senderIds)
      : Promise.resolve({ data: [] }),
    senderIds.length > 0
      ? supabase.from("providers").select("user_id, id").in("user_id", senderIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.full_name]));
  const providerMap = Object.fromEntries((senderProviders ?? []).map((p) => [p.user_id, p.id]));

  const enriched = (messages ?? []).map((m) => ({
    ...m,
    sender_name: profileMap[m.sender_id] || "Névtelen felhasználó",
    sender_provider_id: providerMap[m.sender_id] ?? null,
  }));

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
