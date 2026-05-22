import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { ConfirmEmail } from "@/emails/confirm-email";
import React from "react";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
