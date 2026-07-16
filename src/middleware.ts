import { NextRequest, NextResponse } from "next/server";

/**
 * Basic-Auth gate for the standalone Yettel mockup previews.
 *
 * Scope is intentionally limited to the two preview paths via `config.matcher`,
 * so the rest of the site (Supabase auth, etc.) is untouched.
 *
 * Any username is accepted; only the password is checked.
 */
const PREVIEW_PASSWORD = "Teszt1234!";
const REALM = "Yettel preview";

function unauthorized(): NextResponse {
  return new NextResponse("Hitelesítés szükséges.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function passwordFromHeader(header: string | null): string | null {
  if (!header || !header.startsWith("Basic ")) return null;
  try {
    const decoded = atob(header.slice(6));
    const sep = decoded.indexOf(":");
    return sep === -1 ? decoded : decoded.slice(sep + 1);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest): NextResponse {
  if (passwordFromHeader(req.headers.get("authorization")) !== PREVIEW_PASSWORD) {
    return unauthorized();
  }

  const { pathname } = req.nextUrl;

  // Serve the clean URLs from the static HTML files in /public.
  if (pathname === "/yettel_dark" || pathname === "/yettel_light") {
    const url = req.nextUrl.clone();
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

export const config = {
  matcher: ["/yettel_dark", "/yettel_light", "/yettel_dark.html", "/yettel_light.html"],
};
