import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_KEYS = [
  "notify_new_message",
  "notify_new_review",
  "notify_new_quote_request",
  "notify_quote_reply",
  "notify_contact_message",
] as const;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Ha még nincs sor, adjuk vissza az alapértelmezett beállításokat
  const defaults = Object.fromEntries(ALLOWED_KEYS.map((k) => [k, true]));
  return NextResponse.json(data ?? defaults);
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Csak az engedélyezett kulcsokat fogadjuk el
  const patch: Record<string, boolean> = {};
  for (const key of ALLOWED_KEYS) {
    if (key in body && typeof body[key] === "boolean") {
      patch[key] = body[key];
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nincs érvényes mező." }, { status: 400 });
  }

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      { user_id: user.id, ...patch, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
