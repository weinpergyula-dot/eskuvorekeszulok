import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error: forbidden } = await requireAdmin();
    if (forbidden) return forbidden;

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.rpc("delete_unconfirmed_user", { target_id: id });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/users DELETE]", err);
    return NextResponse.json({ error: "Hiba történt." }, { status: 500 });
  }
}
