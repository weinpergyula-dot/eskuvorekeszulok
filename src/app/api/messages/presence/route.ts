import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Called when a user opens a thread chat — keeps their presence alive. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { thread_key } = await req.json();
  if (!thread_key) return NextResponse.json({ error: "Missing thread_key" }, { status: 400 });

  const admin = createAdminClient();
  await admin
    .from("message_presence")
    .upsert(
      { user_id: user.id, thread_key, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  return NextResponse.json({ ok: true });
}

/** Called when a user closes/leaves the thread chat. */
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  await admin.from("message_presence").delete().eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
