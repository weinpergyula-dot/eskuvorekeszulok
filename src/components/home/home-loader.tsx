"use client";

import { useEffect, useState } from "react";

/* Ennyi ideig várunk legfeljebb a banner videójára, mielőtt az oldalt
   megmutatjuk (lassú hálózat, letiltott automatikus lejátszás). */
const MAX_WAIT_MS = 8000;
/* A keret bezárulása (a 100% kirajzolása) után ennyit vár az eltűnéssel. */
const CLOSE_HOLD_MS = 550;

/* A logó keretének vonala a logo.png koordinátáiban (4319 × 1098): a
   felirat (logo-text.png) ugyanebben a dobozban ül. A vonal alul középről
   indul, balra, fel, át a tetején, le a jobb oldalon, és vissza középre. */
const VB_W = 4319;
const VB_H = 1098;
const L = 18, T = 9, R = 4300, B = 1088, RAD = 323, CX = VB_W / 2;
const FRAME_PATH = [
  `M ${CX} ${B}`,
  `H ${L + RAD}`,
  `A ${RAD} ${RAD} 0 0 1 ${L} ${B - RAD}`,
  `V ${T + RAD}`,
  `A ${RAD} ${RAD} 0 0 1 ${L + RAD} ${T}`,
  `H ${R - RAD}`,
  `A ${RAD} ${RAD} 0 0 1 ${R} ${T + RAD}`,
  `V ${B - RAD}`,
  `A ${RAD} ${RAD} 0 0 1 ${R - RAD} ${B}`,
  `H ${CX}`,
].join(" ");

type HeroWindow = Window & { __heroReady?: boolean; __heroProgress?: number };

/**
 * Mobilos töltőképernyő a főoldalon: amíg a banner első diájának videója
 * be nem tölt, ez takarja az oldalt, hogy a tartalom ne a videó nélkül
 * villanjon fel. A logó kerete a betöltés állását mutatja: alul középről
 * indulva rajzolódik körbe, és 100%-nál bezárul. A MobileHeroBanner az
 * "eskuvo:hero-progress" (0–1) és "eskuvo:hero-ready" eseményekkel jelez;
 * legkésőbb MAX_WAIT_MS után magától eltűnik. JavaScript nélkül a
 * <noscript> stílus elrejti, desktopon nem látszik.
 */
export function HomeLoader() {
  const [state, setState] = useState<"on" | "closing" | "fading" | "off">("on");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (state !== "on") return;
    const w = window as HeroWindow;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (!mobile) {
      const t = setTimeout(() => setState("off"), 0);
      return () => clearTimeout(t);
    }
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const onProgress = (e: Event) => setProgress((e as CustomEvent<number>).detail ?? 0);
    const finish = () => setState("closing");
    window.addEventListener("eskuvo:hero-progress", onProgress);
    window.addEventListener("eskuvo:hero-ready", finish);
    const sync = setTimeout(() => {
      if (w.__heroProgress) setProgress(w.__heroProgress);
      if (w.__heroReady) finish();
    }, 0);
    const t = setTimeout(finish, MAX_WAIT_MS);
    return () => {
      window.removeEventListener("eskuvo:hero-progress", onProgress);
      window.removeEventListener("eskuvo:hero-ready", finish);
      clearTimeout(sync);
      clearTimeout(t);
      root.style.overflow = prevOverflow;
    };
  }, [state]);

  /* 100%-nál a keret bezárul, rövid szünet, majd elhalványul; ekkor a
     banner videója az elejéről indul ("eskuvo:loader-done"). */
  useEffect(() => {
    if (state !== "closing") return;
    const t = setTimeout(() => {
      setState("fading");
      window.dispatchEvent(new Event("eskuvo:loader-done"));
    }, CLOSE_HOLD_MS);
    return () => clearTimeout(t);
  }, [state]);

  if (state === "off") return null;
  const shown = state === "on" ? progress : 1;

  return (
    <>
      <noscript>
        <style>{".home-loader{display:none!important}"}</style>
      </noscript>
      {/* A sütibanner (z-9998) fölött: az csak a töltés után jelenjen meg. */}
      <div
        aria-hidden
        onTransitionEnd={(e) => { if (e.target === e.currentTarget && state === "fading") setState("off"); }}
        className={`home-loader fixed inset-0 z-[10000] grid place-items-center bg-white transition-opacity duration-500 md:hidden ${
          state === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="relative w-[240px]" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full overflow-visible" fill="none">
            {/* Halvány alapvonal, rajta a betöltés állását mutató keret */}
            <path d={FRAME_PATH} stroke="#84AAA6" strokeOpacity="0.18" strokeWidth="36" />
            <path
              className="home-loader-frame"
              d={FRAME_PATH}
              pathLength={1}
              stroke="#84AAA6"
              strokeWidth="36"
              strokeLinecap="round"
              strokeDasharray="1 1"
              style={{ strokeDashoffset: 1 - shown }}
            />
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-text.png" alt="" className="absolute inset-0 h-full w-full" />
        </div>
      </div>
    </>
  );
}
