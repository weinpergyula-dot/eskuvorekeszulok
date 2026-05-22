import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
