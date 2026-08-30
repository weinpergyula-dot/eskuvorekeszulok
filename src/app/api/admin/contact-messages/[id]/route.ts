import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error: forbidden } = await requireAdmin();
    if (forbidden) return forbidden;

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/contact-messages DELETE]", err);
    return NextResponse.json({ error: "Hiba történt." }, { status: 500 });
  }
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error: forbidden } = await requireAdmin();
    if (forbidden) return forbidden;

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("contact_messages").update({ read: true }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/contact-messages PATCH]", err);
    return NextResponse.json({ error: "Hiba történt." }, { status: 500 });
  }
}
