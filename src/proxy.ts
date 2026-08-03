import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Basic-Auth gate for the standalone Yettel mockup previews
 * (/yettel_dark, /yettel_light and their _eng and _cz pairs — served as static
 * HTML from /public).
 *
 * Any username is accepted; only the shared preview password is checked.
 * Handled at the very top of `proxy` so the Supabase session logic below is
 * never reached for these paths.
 */
const PREVIEW_PASSWORD = "Teszt1234!";
const PREVIEW_REALM = "Yettel preview";
const PREVIEW_PATHS = new Set([
  "/yettel_dark",
  "/yettel_light",
  "/yettel_dark_eng",
  "/yettel_light_eng",
  "/yettel_dark_cz",
  "/yettel_light_cz",
  "/yettel_light_asis",
  "/yettel_dark.html",
  "/yettel_light.html",
  "/yettel_dark_eng.html",
  "/yettel_light_eng.html",
  "/yettel_dark_cz.html",
  "/yettel_light_cz.html",
  "/yettel_light_asis.html",
]);

function previewUnauthorized(): NextResponse {
  return new NextResponse("Hitelesítés szükséges.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${PREVIEW_REALM}", charset="UTF-8"`,
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function previewPasswordFromHeader(header: string | null): string | null {
  if (!header || !header.startsWith("Basic ")) return null;
  try {
    const decoded = atob(header.slice(6));
    const sep = decoded.indexOf(":");
    return sep === -1 ? decoded : decoded.slice(sep + 1);
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams, origin } = request.nextUrl;

  // --- Public baby-shower poll: clean URLs -> static HTML in /public ---
  if (pathname === "/bella" || pathname === "/bella_result") {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}.html`;
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // --- Password-gated Yettel mockup previews ---
  if (PREVIEW_PATHS.has(pathname)) {
    if (
      previewPasswordFromHeader(request.headers.get("authorization")) !==
      PREVIEW_PASSWORD
    ) {
      return previewUnauthorized();
    }
    // Rewrite the clean URLs to the static HTML files in /public.
    if (!pathname.endsWith(".html")) {
      const url = request.nextUrl.clone();
      url.pathname = `${pathname}.html`;
      const res = NextResponse.rewrite(url);
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
    // Direct .html access (already authenticated above).
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // If Supabase redirects code/token_hash to homepage instead of /auth/callback, forward it
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if ((code || tokenHash) && !pathname.startsWith("/auth/")) {
    const callbackUrl = new URL(`${origin}/auth/callback`);
    if (code) callbackUrl.searchParams.set("code", code);
    if (tokenHash) callbackUrl.searchParams.set("token_hash", tokenHash);
    if (type) callbackUrl.searchParams.set("type", type);
    return NextResponse.redirect(callbackUrl);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPaths = ["/dashboard", "/admin"];
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
