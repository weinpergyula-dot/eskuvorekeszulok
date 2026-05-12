import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  const isEmailConfirmation =
    (type === "signup" || type === "email" || type === "recovery") && !next.startsWith("/auth/reset");

  const successUrl =
    type === "recovery" || next.startsWith("/auth/reset")
      ? `${origin}${next}`
      : `${origin}/auth/verified`;

  // Build response so we can set cookies on it
  const response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  // PKCE code exchange
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return response;
    } catch {
      // PKCE verifier missing (different browser/device) – fall through to error
    }
  }

  // Token hash (PKCE email confirmation)
  if (tokenHash && type) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any });
    if (!error) return isEmailConfirmation ? response : NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth`);
}
