import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendProviderEmail(
  adminClient: ReturnType<typeof createAdminClient>,
  providerId: string,
  action: "approve" | "reject",
  reason?: string
) {
  if (!resend) return;
  try {
    // Get provider + email
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
      await resend.emails.send({
        from: "Esküvőre Készülök <info@eskuvorekeszulok.hu>",
        to: email,
        subject: "✅ Profilod jóváhagyásra került – Esküvőre Készülök",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #84AAA6;">Profiljod jóváhagyásra került!</h2>
            <p>Kedves ${prov.full_name},</p>
            <p>Örömmel értesítünk, hogy szolgáltatói profilod az <strong>Esküvőre Készülök</strong> oldalon <strong>jóváhagyásra került</strong>, és mostantól látható a látogatók számára.</p>
            <p><a href="https://eskuvorekeszulok.hu/profil" style="background:#84AAA6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">Profil megtekintése</a></p>
            <p style="color:#888;font-size:13px;margin-top:24px;">Esküvőre Készülök csapata</p>
          </div>
        `,
      });
    } else {
      await resend.emails.send({
        from: "Esküvőre Készülök <info@eskuvorekeszulok.hu>",
        to: email,
        subject: "❌ Profilod elutasításra került – Esküvőre Készülök",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #c0392b;">Profilod elutasításra került</h2>
            <p>Kedves ${prov.full_name},</p>
            <p>Sajnálattal értesítünk, hogy szolgáltatói profilod az <strong>Esküvőre Készülök</strong> oldalon <strong>nem került jóváhagyásra</strong>.</p>
            ${reason ? `<p><strong>Indoklás:</strong> ${reason}</p>` : ""}
            <p>Ha kérdésed van, vedd fel velünk a kapcsolatot.</p>
            <p style="color:#888;font-size:13px;margin-top:24px;">Esküvőre Készülök csapata</p>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("Email send error:", err);
  }
}

const VALID_KEYS = [
  "full_name", "phone", "counties", "categories",
  "description", "detailed_description", "website", "avatar_url", "gallery_urls",
];

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
      await sendProviderEmail(admin, id, "approve");
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
      await sendProviderEmail(admin, id, "approve");
    }
  } else if (action === "reject") {
    if (type === "edit") {
      const { error } = await admin
        .from("providers")
        .update({ pending_changes: null, approval_status: "approved", rejection_reason: reason || null })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await sendProviderEmail(admin, id, "reject", reason);
    } else {
      const { error } = await admin
        .from("providers")
        .update({ approval_status: "rejected", rejection_reason: reason || null })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await sendProviderEmail(admin, id, "reject", reason);
    }
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
