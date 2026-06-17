"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    // iOS Safari keeps a stale touch hit-area for the sticky navbar after a
    // client-side navigation (e.g. right after login), so taps on the menu /
    // user-dropdown are ignored until the user manually scrolls a little. When
    // the page already sits at the top, the scrollTo above is a no-op and never
    // triggers that refresh. Nudge 1px down then back up — across frames, after
    // layout settles — to force the browser to recompute the hit-area. It's
    // imperceptible to the user and a harmless no-op on other platforms.
    const t = setTimeout(() => {
      window.scrollBy(0, 1);
      requestAnimationFrame(() => window.scrollBy(0, -1));
    }, 60);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}
