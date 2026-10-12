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
 * kategóriaválasztó teal sávjának aljáról lóg le. A teteje a sávhoz simul,
 * az oldalsó és alsó kerete ugyanaz az üveg, mint a chat beviteli dobozáé
 * (`.glass-tab`). Kattintásra felugró ablakban jelenik meg a cím, a leírás
 * és a Megnézem gomb.
 */
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
        className="glass-tab flex cursor-pointer items-center gap-3 rounded-b-3xl px-6 pb-3 pt-2.5 transition-transform hover:translate-y-0.5"
      >
        <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C65EA5]">
          <Send className="h-4 w-4 text-white" strokeWidth={2} />
        </span>
        <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] text-[#C65EA5]">
          Csoportos ajánlatkérés
        </span>
        <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-[#C65EA5]" />
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
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#C65EA5]">
              Csoportos ajánlatkérés
            </p>
            <h2 id="group-quote-dialog-title" className="mt-2 font-heading text-xl font-bold leading-snug text-gray-900">
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
