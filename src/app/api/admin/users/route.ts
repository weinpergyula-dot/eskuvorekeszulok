import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";
import { logError } from "@/lib/log-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error: forbidden, supabase } = await requireAdmin();
    if (forbidden) return forbidden;

    const [{ data: profiles, error }, { data: providers }, { data: deletedRows }] = await Promise.all([
      supabase.from("profiles").select("id, user_id, email, full_name, role, created_at").order("created_at", { ascending: false }),
      supabase.from("providers").select("user_id, id, categories, view_count, phone, approval_status, pending_changes, featured, avatar_url"),
      supabase.from("deleted_accounts").select("id, user_id, email, full_name, role, deleted_at, deleted_by").order("deleted_at", { ascending: false }),
    ]);

    if (error) { await logError("api/admin/users GET", error.message); return NextResponse.json({ error: error.message }, { status: 500 }); }

    const provMap = new Map((providers ?? []).map((p) => [p.user_id, p]));
    const enriched = (profiles ?? []).map((u) => {
      const prov = provMap.get(u.user_id);
      return {
        ...u,
        avatar_url: prov?.avatar_url ?? null,
        phone: prov?.phone ?? null,
        providerCategories: (prov?.categories ?? null) as string[] | null,
        providerViewCount: (prov?.view_count ?? null) as number | null,
        providerId: prov?.id ?? null,
        providerApprovalStatus: prov?.approval_status ?? null,
        providerHasPendingChanges: !!prov?.pending_changes,
        providerFeatured: (prov?.featured as "teal" | "silver" | "gold" | null) ?? null,
      };
    });

    return NextResponse.json({ users: enriched, deletedUsers: deletedRows ?? [] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { error: forbidden, user, supabase } = await requireAdmin();
    if (forbidden) return forbidden;

    const body = await request.json();
    const { userId, role, setFeaturedTier, providerId } = body;

    // Set featured tier on a provider (null | "silver" | "gold")
    if (setFeaturedTier !== undefined && providerId) {
      const tier = setFeaturedTier as "silver" | "gold" | null;
      const { error } = await supabase.from("providers").update({ featured: tier }).eq("id", providerId);
      if (error) { await logError("api/admin/users PATCH featured", error.message); return NextResponse.json({ error: error.message }, { status: 500 }); }
      return NextResponse.json({ ok: true, featured: tier });
    }

    if (!userId || !["visitor", "provider", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Prevent self-demotion
    if (userId === user.id && role !== "admin") {
      return NextResponse.json({ error: "Saját magad nem léptetheted vissza." }, { status: 400 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("user_id", userId);

    if (error) { await logError("api/admin/users PATCH", error.message, { userId, role }); return NextResponse.json({ error: error.message }, { status: 500 }); }
    return NextResponse.json({ ok: true });
  } catch (e) {
    await logError("api/admin/users PATCH", String(e));
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error: forbidden, user, supabase } = await requireAdmin();
    if (forbidden) return forbidden;

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId hiányzik." }, { status: 400 });

    if (userId === user.id) {
      return NextResponse.json({ error: "Saját magadat nem törölheted." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Log to deleted_accounts before hard-delete
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("email, full_name, role")
      .eq("user_id", userId)
      .single();

    await adminClient.from("deleted_accounts").insert({
      user_id:    userId,
      email:      targetProfile?.email ?? null,
      full_name:  targetProfile?.full_name ?? null,
      role:       targetProfile?.role ?? null,
      deleted_by: user.id,
    });

    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) { await logError("api/admin/users DELETE", error.message, { userId }); return NextResponse.json({ error: error.message }, { status: 500 }); }
    return NextResponse.json({ ok: true });
  } catch (e) {
    await logError("api/admin/users DELETE", String(e));
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
