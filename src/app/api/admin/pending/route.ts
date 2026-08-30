import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  try {
    const { error: forbidden, supabase } = await requireAdmin();
    if (forbidden) return forbidden;

    const admin = createAdminClient();

    // Unconfirmed user IDs (pre-registrations) — exclude from pending providers
    let unconfirmedIds = new Set<string>();
    try {
      const { data: rpcData } = await admin.rpc("get_unconfirmed_users");
      unconfirmedIds = new Set((rpcData ?? []).map((u: { id: string }) => u.id));
    } catch { /* ignore */ }

    const [{ data: rawPending }, { data: pendingChanges }] = await Promise.all([
      supabase
        .from("providers")
        .select("*")
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("providers")
        .select("*")
        .eq("approval_status", "approved")
        .not("pending_changes", "is", null)
        .order("updated_at", { ascending: false }),
    ]);

    const pendingProviders = (rawPending ?? []).filter(
      (p: { user_id: string }) => !unconfirmedIds.has(p.user_id)
    );

    return NextResponse.json({ pendingProviders, pendingChanges: pendingChanges ?? [] });
  } catch (err) {
    console.error("[api/admin/pending]", err);
    return NextResponse.json({ error: "Hiba történt." }, { status: 500 });
  }
}
