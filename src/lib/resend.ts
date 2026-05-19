import { Resend } from "resend";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

// "production" | "preview" | "development" | undefined (helyi fejlesztés)
const VERCEL_ENV = process.env.VERCEL_ENV;
const IS_PRODUCTION = VERCEL_ENV === "production";

// Production: saját domain, minden más: Resend sandbox cím
const FROM_ADDRESS = IS_PRODUCTION
  ? "Esküvőre Készülök <info@eskuvorekeszulok.hu>"
  : "Esküvőre Készülök <onboarding@resend.dev>";

// Kliens csak egyszer példányosodik (module-szintű singleton)
const resendClient = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  /** React Email template komponens */
  template: ReactElement;
}

export interface SendEmailResult {
  ok: boolean;
  skipped?: boolean;
  data?: unknown;
  error?: unknown;
}

/**
 * Emailt küld Resenden keresztül.
 * Preview és Development környezetben csak console.log-ol, nem hívja a Resend API-t.
 */
export async function sendEmail({
  to,
  subject,
  template,
}: SendEmailOptions): Promise<SendEmailResult> {
  const html = await render(template);

  // Nem production: logolás, tényleges küldés nélkül
  if (!IS_PRODUCTION) {
    console.log(
      `\n[sendEmail] ⏭  SKIPPED (VERCEL_ENV=${VERCEL_ENV ?? "local"})`
    );
    console.log(`  from:    ${FROM_ADDRESS}`);
    console.log(`  to:      ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`  subject: ${subject}`);
    console.log(`  html:    ${html.slice(0, 300)}…\n`);
    return { ok: true, skipped: true };
  }

  // Production: tényleges küldés
  if (!resendClient) {
    console.error("[sendEmail] ❌ RESEND_API_KEY nincs beállítva production-ban!");
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[sendEmail] ❌ Resend hiba:", error);
      return { ok: false, error };
    }

    return { ok: true, data };
  } catch (err) {
    console.error("[sendEmail] ❌ Váratlan hiba:", err);
    return { ok: false, error: err };
  }
}
