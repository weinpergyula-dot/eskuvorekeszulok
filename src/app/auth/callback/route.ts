import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code      = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type      = searchParams.get("type");
    const next      = searchParams.get("next") ?? "/";
    const intent    = searchParams.get("intent"); // "oauth" | "link" | null

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(`${origin}/auth/login?error=config`);
    }

    // ── Password reset: token_hash flow (implicit / OTP) ─────────────────────
    if (tokenHash && type === "recovery") {
      return NextResponse.redirect(
        `${origin}/auth/reset-password?token_hash=${encodeURIComponent(tokenHash)}`
      );
    }

    // ── Password reset: code flow (PKCE) ─────────────────────────────────────
    if (code && (type === "recovery" || next.startsWith("/auth/reset"))) {
      return NextResponse.redirect(
        `${origin}/auth/reset-password?code=${encodeURIComponent(code)}`
      );
    }

    // ── OAuth (Google / later Facebook) ──────────────────────────────────────
    if (intent === "oauth" || intent === "link") {
      if (!code) {
        return NextResponse.redirect(`${origin}/auth/login?error=auth`);
      }

      const oauthResponse = NextResponse.redirect(`${origin}/`);
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              oauthResponse.cookies.set(name, value, options);
            });
          },
        },
      });

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        return NextResponse.redirect(`${origin}/auth/login?error=auth`);
      }

      if (intent === "link") {
        oauthResponse.headers.set(
          "location",
          `${origin}/profil?tab=connected&linked=google`
        );
        return oauthResponse;
      }

      // intent === "oauth": detect new vs returning user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.redirect(`${origin}/auth/login?error=auth`);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, accepted_tos_at")
        .eq("user_id", user.id)
        .single();

      // Ha nincs profil vagy nincs elfogadott ToS → új Google user → regisztrációs flow
      if (!profile || !profile.accepted_tos_at) {
        oauthResponse.headers.set("location", `${origin}/auth/complete-registration`);
        return oauthResponse;
      }

      // Visszatérő user – role alapján irányítás
      if (profile.role === "admin") {
        oauthResponse.headers.set("location", `${origin}/admin`);
      } else if (profile.role === "provider") {
        oauthResponse.headers.set("location", `${origin}/profil?tab=dashboard`);
      } else {
        oauthResponse.headers.set("location", `${origin}/`);
      }
      return oauthResponse;
    }

    // ── Email confirmation — create a session normally ────────────────────────
    const response = NextResponse.redirect(`${origin}/auth/verified`);

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
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
      if (!error) {
        await supabase.auth.signOut();
        return response;
      }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  } catch {
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/login?error=auth`);
  }
}
