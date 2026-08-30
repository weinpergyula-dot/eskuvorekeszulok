import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error: forbidden } = await requireAdmin();
  if (forbidden) return forbidden;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("error_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function DELETE() {
  const { error: forbidden } = await requireAdmin();
  if (forbidden) return forbidden;
  const admin = createAdminClient();

  const { error } = await admin.from("error_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
