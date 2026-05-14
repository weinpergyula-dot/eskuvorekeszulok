import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { ProviderApprovedEmail } from "@/emails/provider-approved";
import { ProviderRejectedEmail } from "@/emails/provider-rejected";
import React from "react";

const VALID_KEYS = [
  "full_name", "phone", "counties", "categories",
  "description", "detailed_description", "website", "avatar_url", "gallery_urls",
];

async function notifyProvider(
  adminClient: ReturnType<typeof createAdminClient>,
  providerId: string,
  action: "approve" | "reject",
  reason?: string
) {
  try {
    const { data: prov } = await adminClient
      .from("providers")
      .select("user_id, full_name")
      .eq("id", providerId)
      .single();
    if (!prov) return;

    const { data: authUser } = await adminClient.auth.admin.getUserById(prov.user_id);
    const email = authUser?.user?.email;
    if (!email) return;

    if (action === "approve") {
      await sendEmail({
        to: email,
        subject: "✅ Profilod jóváhagyásra került – Esküvőre Készülök",
        template: React.createElement(ProviderApprovedEmail, { name: prov.full_name }),
      });
    } else {
      await sendEmail({
        to: email,
        subject: "Tájékoztatás a szolgáltatói profil elbírálásáról – Esküvőre Készülök",
        template: React.createElement(ProviderRejectedEmail, { name: prov.full_name, reason }),
      });
    }
  } catch (err) {
    // Email hiba nem akadályozza meg a jóváhagyást
    console.error("[notifyProvider] hiba:", err);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("user_id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, type, changes, reason } = await request.json();

  if (action === "approve") {
    if (type === "edit" && changes) {
      const safeChanges: Record<string, unknown> = {};
      for (const key of VALID_KEYS) {
        if (key in changes) safeChanges[key] = changes[key];
      }
      if (!safeChanges.categories && changes.category) safeChanges.categories = [changes.category];
      if (!safeChanges.counties && changes.county) safeChanges.counties = [changes.county];

      const { error } = await admin
        .from("providers")
        .update({ ...safeChanges, pending_changes: null, approval_status: "approved", rejection_reason: null })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await notifyProvider(admin, id, "approve");
    } else {
      const { error } = await admin
        .from("providers")
        .update({ approval_status: "approved", rejection_reason: null })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Új regisztráció jóváhagyásakor frissítjük a profiles.role-t "provider"-re
      // (csak ha eddig "visitor" volt — admin role-t nem írjuk felül)
      const { data: provRec } = await admin.from("providers").select("user_id").eq("id", id).single();
      if (provRec) {
        await admin
          .from("profiles")
          .update({ role: "provider" })
          .eq("user_id", provRec.user_id)
          .eq("role", "visitor");
      }
      await notifyProvider(admin, id, "approve");
    }
  } else if (action === "reject") {
    if (type === "edit") {
      const { error } = await admin
        .from("providers")
        .update({ pending_changes: null, approval_status: "approved", rejection_reason: reason || null })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await notifyProvider(admin, id, "reject", reason);
    } else {
      const { error } = await admin
        .from("providers")
        .update({ approval_status: "rejected", rejection_reason: reason || null })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await notifyProvider(admin, id, "reject", reason);
    }
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
