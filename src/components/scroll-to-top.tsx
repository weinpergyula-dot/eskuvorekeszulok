"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    /* Horgonnyal érkezünk (pl. a szolgáltatói profilról a Vissza gomb a
       listázás elejére visz): ilyenkor nem a lap tetejére ugrunk, hanem a
       megcímzett elemhez. A célelem néha csak a következő festéskor kerül a
       DOM-ba (a lista Suspense mögött tölt), ezért megvárjuk. */
    const hash = window.location.hash.slice(1);
    if (hash) {
      let cancelled = false;
      let tries = 0;
      const go = () => {
        if (cancelled) return;
        const el = document.getElementById(decodeURIComponent(hash));
        if (el) { el.scrollIntoView({ behavior: "instant", block: "start" }); return; }
        if (tries++ < 30) { requestAnimationFrame(go); return; }
        /* A megcímzett elem nem került elő (pl. a kártya a listázás másik
           oldalán van): ilyenkor a listázás elejére, végső soron a lap
           tetejére állunk. */
        const list = document.getElementById("szolgaltatok");
        if (list) list.scrollIntoView({ behavior: "instant", block: "start" });
        else window.scrollTo({ top: 0, behavior: "instant" });
      };
      go();
      return () => { cancelled = true; };
    }

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
