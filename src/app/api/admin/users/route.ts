import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: self } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (self?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [{ data: profiles, error }, { data: providers }] = await Promise.all([
      supabase.from("profiles").select("id, user_id, email, full_name, role, created_at").order("created_at", { ascending: false }),
      supabase.from("providers").select("user_id, id, categories, view_count, phone, approval_status, pending_changes"),
    ]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const provMap = new Map((providers ?? []).map((p) => [p.user_id, p]));
    const enriched = (profiles ?? []).map((u) => {
      const prov = provMap.get(u.user_id);
      return {
        ...u,
        phone: prov?.phone ?? null,
        providerCategories: (prov?.categories ?? null) as string[] | null,
        providerViewCount: (prov?.view_count ?? null) as number | null,
        providerId: prov?.id ?? null,
        providerApprovalStatus: prov?.approval_status ?? null,
        providerHasPendingChanges: !!prov?.pending_changes,
      };
    });

    return NextResponse.json(enriched);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: self } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (self?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { userId, role } = await request.json();
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: self } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (self?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId hiányzik." }, { status: 400 });

    if (userId === user.id) {
      return NextResponse.json({ error: "Saját magadat nem törölheted." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
