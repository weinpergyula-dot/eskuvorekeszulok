"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown, Send, X } from "lucide-react";
import { LoginGateLink } from "@/components/providers/masked-contact";

/**
 * Csoportos ajánlatkérés — a szolgáltatói listázás előtt álló sáv a
 * főoldalon. Egy üzenettel több szolgáltató is megszólítható, ezért érdemes
 * még a böngészés előtt felkínálni.
 *
 * Alapból csak a fejléc sora látszik (ikon, felirat, kacsacsőr); a sorra
 * kattintva nyílik le a cím, a leírás és a Megnézem gomb.
 *
 * A keret ugyanaz az iOS 27 „Liquid Glass” üveg, mint a chat beviteli
 * dobozáé (`chat-composer-glass`, lásd globals.css).
 */
export function GroupQuoteCta() {
  const [open, setOpen] = useState(false);

  return (
    /* Mobilon ez az üvegkártya; desktopon (md-től) a GroupQuoteTab lapfül
       veszi át a helyét. */
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 md:hidden lg:px-8">
      <div className="chat-composer-glass relative isolate overflow-hidden px-6 py-5 sm:px-10 sm:py-6">
        {/* Fejléc: ikon + felirat, jobb szélén a kacsacsőr. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="group-quote-body"
          className="flex w-full cursor-pointer items-center gap-3 text-left"
        >
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#C65EA5]"
          >
            <Send className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          </span>
          <span className="flex-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#C65EA5]">
            Csoportos ajánlatkérés
          </span>
          <ChevronDown
            aria-hidden
            className={`h-5 w-5 shrink-0 text-[#C65EA5] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Lenyíló rész – a grid-rows 0fr → 1fr átmenet animálja a magasságot. */}
        <div
          id="group-quote-body"
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden" inert={!open}>
            {/* Mobilon egy oszlop, alul teljes szélességű gomb; gépen egy sor:
                balra a szövegek, jobbra (függőlegesen középen) a gomb. */}
            <div className="flex flex-col gap-6 pb-2 pt-4 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="min-w-0">
                <h2 className="font-heading text-xl font-bold leading-snug text-gray-900 sm:text-[1.375rem]">
                  Nem akarsz egyesével ajánlatot kérni?
                </h2>
                <p className="mt-2 text-base leading-relaxed text-gray-600">
                  Küldj egyetlen ajánlatkérést a választott szolgáltatóknak.
                </p>
              </div>

              {/* Kijelentkezve a gomb a tájékoztató ablakot nyitja (LoginGateLink). */}
              <LoginGateLink
                href="/profil?tab=quotes"
                message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
                className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C65EA5] px-7 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-[#B04E91] md:w-auto"
              >
                Megnézem
                <ArrowRight className="h-4 w-4" />
              </LoginGateLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Desktopon a csoportos ajánlatkérés középen álló lapfül, ami a
 * kategóriaválasztó teal sávjának aljáról lóg le, a tetején homorú ívekkel.
 * A perem és az árnyék a chat beviteli doboz üvegét követi. Kattintásra felugró ablakban jelenik meg a cím, a leírás
 * és a Megnézem gomb.
 */
/* A lefelé lógó fül méretei és körvonala (px). Az oldalak kb. 60°-ban
   dőlnek befelé (felül szélesebb, mint a böngészőfülek); a tetején homorú
   ív simítja a teal sáv aljába, alul lekerekített sarok zárja. A teteje
   nyitott (ott nincs perem, a fül a sávhoz simul). A bal oldal pontjait
   tükrözzük a jobb oldalra. */
const TAB_W = 380;
const TAB_H = 56;
const m = (x: number) => TAB_W - x;
const TAB_PATH = [
  `M 0 0`,
  /* homorú ív a sávból a ferde oldalra */
  `C 9 0 13 5 16 12`,
  /* ferde oldal: 20px vízszintesen, 34px függőlegesen ≈ 60° */
  `L 36 46`,
  /* lekerekített alsó sarok */
  `C 38.5 51 42 56 50 56`,
  `L ${m(50)} 56`,
  `C ${m(42)} 56 ${m(38.5)} 51 ${m(36)} 46`,
  `L ${m(16)} 12`,
  `C ${m(13)} 5 ${m(9)} 0 ${TAB_W} 0`,
].join(" ");

export function GroupQuoteTab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    /* A -mt-6 a teal sáv aljára illeszti (a fehér, lekerekített átmenet
       fölé), így a fül a sávból lóg le. */
    <div className="relative z-10 -mt-6 hidden justify-center md:flex">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="group relative h-14 cursor-pointer transition-transform hover:translate-y-0.5"
        style={{ width: TAB_W }}
      >
        {/* A fül alakja: a tetején homorú ívek kötik a teal sávhoz, alul
            lekerekített sarkok. A perem (0.5px világosszürke) és az árnyék
            a chat beviteli doboz üvegét követi, az íveken is végigfut. */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_10px_14px_rgba(0,0,0,0.08)]"
          viewBox={`0 0 ${TAB_W} ${TAB_H}`}
        >
          <path
            d={TAB_PATH}
            fill="rgba(255,255,255,0.96)"
            stroke="rgb(219,219,219)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="relative flex h-full items-center justify-center gap-3 px-14">
          <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C65EA5]">
            <Send className="h-4 w-4 text-white" strokeWidth={2} />
          </span>
          <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] text-[#C65EA5]">
            Csoportos ajánlatkérés
          </span>
        </span>
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-quote-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="chat-composer-glass relative w-full max-w-md bg-white/90 px-8 pb-8 pt-9 text-center"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Bezár"
              className="absolute right-4 top-4 cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <span aria-hidden className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#C65EA5]">
              <Send className="h-5 w-5 text-white" strokeWidth={2} />
            </span>
            <h2 id="group-quote-dialog-title" className="mt-4 font-heading text-xl font-bold leading-snug text-gray-900">
              Nem akarsz egyesével ajánlatot kérni?
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              Küldj egyetlen ajánlatkérést a választott szolgáltatóknak.
            </p>
            {/* Kijelentkezve a gomb a tájékoztató ablakot nyitja (LoginGateLink). */}
            <LoginGateLink
              href="/profil?tab=quotes"
              message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C65EA5] px-7 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-[#B04E91]"
            >
              Megnézem
              <ArrowRight className="h-4 w-4" />
            </LoginGateLink>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
