import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";
import { sendEmail } from "@/lib/resend";
import { ConfirmEmail } from "@/emails/confirm-email";
import React from "react";

export async function POST(request: NextRequest) {
  try {
    const { error: forbidden } = await requireAdmin();
    if (forbidden) return forbidden;

    const { email, name } = await request.json();
    if (!email) return NextResponse.json({ error: "Hiányzó email cím." }, { status: 400 });

    const admin = createAdminClient();
    const origin = request.nextUrl.origin;

    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (error || !data?.properties?.hashed_token) {
      console.error("[admin/pre-registrations/resend] generateLink hiba:", error?.message);
      return NextResponse.json({ error: "Nem sikerült a megerősítő link generálása." }, { status: 500 });
    }

    const confirmLink = `${origin}/auth/callback?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=magiclink`;

    const result = await sendEmail({
      to: email,
      subject: "Regisztráció megerősítése",
      template: React.createElement(ConfirmEmail, { confirmLink, name: name ?? "" }),
    });

    if (!result.ok && !result.skipped) {
      console.error("[admin/pre-registrations/resend] sendEmail hiba:", result.error);
      return NextResponse.json({ error: "Email küldési hiba." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/pre-registrations/resend]", err);
    return NextResponse.json({ error: "Hiba történt." }, { status: 500 });
  }
}
