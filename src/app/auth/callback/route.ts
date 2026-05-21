import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code      = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type      = searchParams.get("type");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(`${origin}/auth/login?error=config`);
    }

    // -- Password reset: token_hash flow
    if (tokenHash && type === "recovery") {
      return NextResponse.redirect(
        `${origin}/auth/reset-password?token_hash=${encodeURIComponent(tokenHash)}`
      );
    }

    // -- Password reset: code flow (PKCE)
    if (code && type === "recovery") {
      return NextResponse.redirect(
        `${origin}/auth/reset-password?code=${encodeURIComponent(code)}`
      );
    }

    // -- PKCE code exchange (OAuth login / account linking)
    if (code) {
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.redirect(`${origin}/auth/login?error=auth`);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, accepted_tos_at")
        .eq("user_id", user.id)
        .single();

      // Admin accounts may not have accepted_tos_at set -- exempt them from TOS check
      const isNew = !profile || (!profile.accepted_tos_at && profile.role !== "admin");
      if (isNew) {
        oauthResponse.headers.set("location", `${origin}/auth/register?prefill=1`);
        return oauthResponse;
      }

      if (profile.role === "admin") {
        oauthResponse.headers.set("location", `${origin}/admin`);
      } else if (profile.role === "provider") {
        oauthResponse.headers.set("location", `${origin}/profil?tab=dashboard`);
      } else {
        const nextPath = searchParams.get("next") ?? "/";
        oauthResponse.headers.set("location", `${origin}${nextPath}`);
      }
      return oauthResponse;
    }

    // -- Email confirmation
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
