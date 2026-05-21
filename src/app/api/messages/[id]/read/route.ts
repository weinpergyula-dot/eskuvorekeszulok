import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Step 1 – mark as read (always required, must succeed)
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("id", id)
    .eq("recipient_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Step 2 – stamp read_at (best-effort; silently skipped if column not yet migrated)
  await supabase
    .from("messages")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ read_at: new Date().toISOString() } as any)
    .eq("id", id)
    .eq("recipient_id", user.id);

  return NextResponse.json({ ok: true });
}
