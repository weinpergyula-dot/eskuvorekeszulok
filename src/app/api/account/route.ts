import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/log-error";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nincs bejelentkezve." }, { status: 401 });

    const adminClient = createAdminClient();

    // Log to deleted_accounts before the hard-delete
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name, role")
      .eq("user_id", user.id)
      .single();

    await adminClient.from("deleted_accounts").insert({
      user_id:    user.id,
      email:      profile?.email ?? user.email ?? null,
      full_name:  profile?.full_name ?? null,
      role:       profile?.role ?? "visitor",
      deleted_by: null, // self-deleted
    });

    const { error } = await adminClient.auth.admin.deleteUser(user.id);

    if (error) { await logError("api/account DELETE", error.message, { user: user.id }); return NextResponse.json({ error: error.message }, { status: 500 }); }
    return NextResponse.json({ ok: true });
  } catch (e) {
    await logError("api/account DELETE", String(e));
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
