import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { ResetPasswordEmail } from "@/emails/reset-password";
import React from "react";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: true }); // biztonsági okokból mindig ok
    }

    const origin = new URL(request.url).origin;
    const admin = createAdminClient();

    // Generálunk egy recovery linket az admin API-val (nem küld emailt)
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: email.trim().toLowerCase(),
    });

    if (error || !data?.properties?.hashed_token) {
      // Biztonsági okokból nem árulunk el semmit — mindig ok választ adunk
      console.error("[reset-password] generateLink error:", error?.message);
      return NextResponse.json({ ok: true });
    }

    // Saját callback URL-t építünk a token_hash alapján
    const resetLink = `${origin}/auth/callback?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery`;

    await sendEmail({
      to: email.trim().toLowerCase(),
      subject: "Jelszó visszaállítása – Esküvőre Készülök",
      template: React.createElement(ResetPasswordEmail, { resetLink }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password] hiba:", err);
    return NextResponse.json({ ok: true }); // mindig ok — ne derüljön ki hogy létezik-e a fiók
  }
}
