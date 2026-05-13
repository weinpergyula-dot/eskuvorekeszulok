import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/";

    const isRecovery =
      type === "recovery" ||
      next.startsWith("/auth/reset");

    const successUrl = isRecovery
      ? `${origin}/auth/reset-password`
      : `${origin}/auth/verified`;

    // Build response so we can set cookies on it
    const response = NextResponse.redirect(successUrl);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(`${origin}/auth/login?error=config`);
    }

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

    // PKCE code exchange
    if (code) {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return response;
      } catch {
        // PKCE verifier missing (different browser/device) – fall through to error
      }
    }

    // Token hash (email confirmation / recovery)
    if (tokenHash && type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any });
      if (!error) return response;
    }

    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  } catch {
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  }
}
