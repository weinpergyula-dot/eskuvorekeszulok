import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Copy cookies from one response to another (needed when we redirect after exchange). */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, ...opts }) => {
    to.cookies.set(name, value, opts);
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code       = searchParams.get("code");
    const tokenHash  = searchParams.get("token_hash");
    const type       = searchParams.get("type");
    const next       = searchParams.get("next") ?? "/";

    // URL already hints at recovery (belt-and-suspenders)
    const hintIsRecovery = type === "recovery" || next.startsWith("/auth/reset");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(`${origin}/auth/login?error=config`);
    }

    // Placeholder response — cookies land here during exchange, then get copied
    const cookieHolder = NextResponse.next();

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieHolder.cookies.set(name, value, options);
          });
        },
      },
    });

    // ── PKCE code exchange ────────────────────────────────────────────────────
    if (code) {
      // For recovery (password reset): do NOT exchange the code here.
      // Pass it to the reset-password page which handles exchange + update
      // server-side so the browser never receives a session cookie.
      if (hintIsRecovery) {
        return NextResponse.redirect(`${origin}/auth/reset-password?code=${encodeURIComponent(code)}`);
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          // Email confirmation — check if it might be an undetected recovery
          const { data: { user } } = await supabase.auth.getUser();
          const recoverySentAt = user?.recovery_sent_at
            ? new Date(user.recovery_sent_at).getTime()
            : 0;
          const isPasswordReset = recoverySentAt > 0 && Date.now() - recoverySentAt < 2 * 60 * 60 * 1000;

          if (isPasswordReset) {
            // Exchange already happened — sign out immediately to avoid browser session,
            // then hand off to reset-password page
            await supabase.auth.signOut();
            return NextResponse.redirect(`${origin}/auth/reset-password?code=${encodeURIComponent(code)}`);
          }

          const response = NextResponse.redirect(`${origin}/auth/verified`);
          copyCookies(cookieHolder, response);
          return response;
        }
      } catch {
        // PKCE verifier missing (different browser/device) – fall through to error
      }
    }

    // ── Token hash (OTP / magic-link) ─────────────────────────────────────────
    if (tokenHash && type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any });
      if (!error) {
        const dest = hintIsRecovery
          ? `${origin}/auth/reset-password`
          : `${origin}/auth/verified`;
        const response = NextResponse.redirect(dest);
        copyCookies(cookieHolder, response);
        return response;
      }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  } catch {
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  }
}
