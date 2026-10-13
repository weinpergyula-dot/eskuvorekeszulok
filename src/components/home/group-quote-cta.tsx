"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Send, X } from "lucide-react";
import { LoginRequiredContent, useIsLoggedIn } from "@/components/providers/masked-contact";

/* A lefelé lógó fül körvonala (px). Az oldalak kb. 60°-ban dőlnek befelé
   (felül szélesebb, mint a böngészőfülek); a tetején homorú ív simítja a
   teal sáv aljába, alul erősen lekerekített sarok zárja. A teteje nyitott
   (ott nincs perem, a fül a sávhoz simul). A bal oldal pontjait tükrözzük a
   jobb oldalra; csak a szélesség változik (mobil / desktop). */
const TAB_H = 56;
function tabPath(w: number): string {
  const m = (x: number) => w - x;
  return [
    `M 0 0`,
    /* homorú ív a sávból a ferde oldalra */
    `C 14 0 21 7 26 16`,
    /* ferde oldal: 14px vízszintesen, 24px függőlegesen ≈ 60° */
    `L 40 40`,
    /* lekerekített alsó sarok */
    `C 43.5 46 50 56 66 56`,
    `L ${m(66)} 56`,
    `C ${m(50)} 56 ${m(43.5)} 46 ${m(40)} 40`,
    `L ${m(26)} 16`,
    `C ${m(21)} 7 ${m(14)} 0 ${w} 0`,
  ].join(" ");
}

/** A fül gombja adott szélességgel – mobilon keskenyebb, desktopon szélesebb. */
function TabButton({ width, className, onOpen }: { width: number; className: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`relative h-14 cursor-pointer transition-transform hover:translate-y-0.5 ${className}`}
      style={{ width }}
    >
      {/* A perem (0.5px világosszürke) és az árnyék a chat beviteli doboz
          üvegét követi, a homorú íveken is végigfut. */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_10px_14px_rgba(0,0,0,0.08)]"
        viewBox={`0 0 ${width} ${TAB_H}`}
      >
        <path
          d={tabPath(width)}
          fill="rgba(255,255,255,0.96)"
          stroke="rgb(219,219,219)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="relative flex h-full items-center justify-center gap-2.5 px-14 md:gap-3 md:px-16">
        <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C65EA5]">
          <Send className="h-4 w-4 text-white" strokeWidth={2} />
        </span>
        <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C65EA5] md:text-xs md:tracking-[0.16em]">
          Csoportos ajánlatkérés
        </span>
      </span>
    </button>
  );
}

/**
 * Csoportos ajánlatkérés a főoldalon, a szolgáltatói lista előtt: középen
 * álló lapfül, ami a kategóriaválasztó teal sávjának aljáról lóg le.
 * Kattintásra felugró ablakban jelenik meg a cím, a leírás és a Megnézem
 * gomb; kijelentkezve a Megnézem ugyanebben az ablakban a bejelentkezési
 * tájékoztatót mutatja. Desktopon a fül alapból a sáv mögé húzódik (csak a
 * pereme kandikál ki), és egérrel fölé érve csúszik le; mobilon mindig látszik.
 */
export function GroupQuoteTab() {
  const [open, setOpen] = useState(false);
  /* Kijelentkezve a Megnézem gomb a felugró ablak tartalmát cseréli a
     bejelentkezési tájékoztatóra. */
  const [loginStep, setLoginStep] = useState(false);
  const loggedIn = useIsLoggedIn();
  const close = () => { setOpen(false); setLoginStep(false); };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setLoginStep(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    /* A -mt-6 a teal sáv aljára illeszti (a fehér, lekerekített átmenet
       fölé), így a fül a sávból lóg le. */
    <div className="relative z-10 -mt-6 flex justify-center">
      <TabButton width={330} className="md:hidden" onOpen={() => setOpen(true)} />
      {/* Desktopon a fül a teal sáv alja mögé húzódik: a kivágó doboz teteje a
          sáv aljánál van, így felfelé csúsztatva eltűnik, csak az alsó pereme
          látszik. A doboz egész területe figyeli az egeret (és a fókuszt). */}
      <div className="group/tab hidden overflow-hidden pb-5 md:block" style={{ width: 400 + 40, paddingInline: 20 }}>
        <TabButton
          width={400}
          className="-translate-y-[calc(100%-12px)] transition-transform duration-300 ease-out group-hover/tab:translate-y-0 group-focus-within/tab:translate-y-0"
          onOpen={() => setOpen(true)}
        />
      </div>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={loginStep ? "login-required-title" : "group-quote-dialog-title"}
            onClick={(e) => e.stopPropagation()}
            className="chat-composer-glass relative w-full max-w-md bg-white/90 px-6 pb-7 pt-9 text-center sm:px-8 sm:pb-8"
            /* A bejelentkezési tájékoztató ugyanebben az alakban, de teli
               fehér háttérrel jelenik meg. */
            style={loginStep ? { backgroundColor: "#fff" } : undefined}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Bezár"
              className="absolute right-4 top-4 cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            {loginStep ? (
              <LoginRequiredContent message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el." />
            ) : (
              <>
                <span aria-hidden className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#C65EA5]">
                  <Send className="h-5 w-5 text-white" strokeWidth={2} />
                </span>
                <h2 id="group-quote-dialog-title" className="mt-4 font-heading text-xl font-bold leading-snug text-gray-900">
                  Nem akarsz egyesével ajánlatot kérni?
                </h2>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                  Küldj egyetlen ajánlatkérést a választott szolgáltatóknak.
                </p>
                <a
                  href="/profil?tab=quotes"
                  onClick={(e) => {
                    if (loggedIn === false) { e.preventDefault(); setLoginStep(true); }
                  }}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C65EA5] px-7 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-[#B04E91]"
                >
                  Megnézem
                  <ArrowRight className="h-4 w-4" />
                </a>
              </>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
