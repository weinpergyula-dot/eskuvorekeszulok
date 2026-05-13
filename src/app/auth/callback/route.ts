import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code      = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type      = searchParams.get("type");
    const next      = searchParams.get("next") ?? "/";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(`${origin}/auth/login?error=config`);
    }

    // ── Password reset: token_hash flow (implicit / OTP) ─────────────────────
    // Redirect WITHOUT creating a browser session — server action handles it.
    if (tokenHash && type === "recovery") {
      return NextResponse.redirect(
        `${origin}/auth/reset-password?token_hash=${encodeURIComponent(tokenHash)}`
      );
    }

    // ── Password reset: code flow (PKCE) ─────────────────────────────────────
    // Same: pass code to reset-password page, no exchange here.
    if (code && (type === "recovery" || next.startsWith("/auth/reset"))) {
      return NextResponse.redirect(
        `${origin}/auth/reset-password?code=${encodeURIComponent(code)}`
      );
    }

    // ── Email confirmation — create a session normally ────────────────────────
    const response = NextResponse.redirect(`${origin}/auth/verified`);

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    if (code) {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return response;
      } catch {
        // PKCE verifier missing — fall through
      }
    }

    if (tokenHash && type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any });
      if (!error) return response;
    }

    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  } catch {
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/login?error=auth`);
  }
}
