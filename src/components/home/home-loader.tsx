"use client";

import { useEffect, useState } from "react";

/* Ennyi ideig várunk legfeljebb a banner videójára, mielőtt az oldalt
   megmutatjuk (lassú hálózat, letiltott automatikus lejátszás). */
const MAX_WAIT_MS = 6000;

/**
 * Mobilos töltőképernyő a főoldalon: amíg a banner első diájának videója
 * be nem tölt, ez takarja az oldalt, hogy a tartalom ne a videó nélkül
 * villanjon fel. A MobileHeroBanner az "eskuvo:hero-ready" eseménnyel (és a
 * window.__heroReady jelzővel) szól, ha mehet; legkésőbb MAX_WAIT_MS után
 * magától eltűnik. A szerver már az első HTML-ben elküldi, JavaScript
 * nélkül pedig a <noscript> stílus elrejti.
 */
export function HomeLoader() {
  const [state, setState] = useState<"on" | "fading" | "off">("on");

  useEffect(() => {
    if (state !== "on") return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    /* Desktopon (md+) a töltőképernyő rejtett, ott nem zárjuk a görgetést. */
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (mobile) root.style.overflow = "hidden";
    const hide = () => setState("fading");
    if ((window as Window & { __heroReady?: boolean }).__heroReady || !mobile) {
      const t = setTimeout(hide, 0);
      return () => { clearTimeout(t); root.style.overflow = prevOverflow; };
    }
    window.addEventListener("eskuvo:hero-ready", hide);
    const t = setTimeout(hide, MAX_WAIT_MS);
    return () => {
      window.removeEventListener("eskuvo:hero-ready", hide);
      clearTimeout(t);
      root.style.overflow = prevOverflow;
    };
  }, [state]);

  if (state === "off") return null;

  return (
    <>
      <noscript>
        <style>{".home-loader{display:none!important}"}</style>
      </noscript>
      {/* A sütibanner (z-9998) fölött: az csak a töltés után jelenjen meg. */}
      <div
        aria-hidden
        onTransitionEnd={() => setState("off")}
        className={`home-loader fixed inset-0 z-[10000] grid place-items-center bg-white transition-opacity duration-500 md:hidden ${
          state === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="home-loader-logo h-10 w-auto" />
      </div>
    </>
  );
}
