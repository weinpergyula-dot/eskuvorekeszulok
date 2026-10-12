"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Send } from "lucide-react";
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
 * Desktopon a csoportos ajánlatkérés középen álló fehér lapfül, ami a
 * fehér tartalomból a kategóriaválasztó teal sávjába nyúlik fel (mint egy
 * mappafül). Csukva csak a fül: ikon, felirat, kacsacsőr; kattintásra
 * alatta, fehér háttéren lenyílik a cím, a leírás és a Megnézem gomb.
 * A fül alsó sarkainál homorú ív köti a fehér részhez.
 */
export function GroupQuoteTab() {
  const [open, setOpen] = useState(false);

  return (
    /* A -mt-6 a teal sáv fehér, lekerekített aljára illeszti. */
    <div className="relative z-10 -mt-6 hidden md:block">
      <div className="flex justify-center">
        <div className="relative -mt-8 rounded-t-3xl bg-white">
          {/* Homorú ívek a fül két alsó sarkánál (a teal és a fehér határán). */}
          <span aria-hidden className="white-tab-fillet-l absolute -left-4 top-4 h-4 w-4 bg-white" />
          <span aria-hidden className="white-tab-fillet-r absolute -right-4 top-4 h-4 w-4 bg-white" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="group-quote-tab-body"
            className="flex cursor-pointer items-center gap-3 px-6 pb-2 pt-3"
          >
            <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#C65EA5]">
              <Send className="h-4 w-4 text-white" strokeWidth={2} />
            </span>
            <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] text-[#C65EA5]">
              Csoportos ajánlatkérés
            </span>
            <ChevronDown
              aria-hidden
              className={`h-5 w-5 shrink-0 text-[#C65EA5] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      <div
        id="group-quote-tab-body"
        className={`grid bg-white transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden" inert={!open}>
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-8 px-8 pb-2 pt-6">
            <div className="min-w-0">
              <h2 className="font-heading text-xl font-bold leading-snug text-gray-900">
                Nem akarsz egyesével ajánlatot kérni?
              </h2>
              <p className="mt-1.5 text-base leading-relaxed text-gray-600">
                Küldj egyetlen ajánlatkérést a választott szolgáltatóknak.
              </p>
            </div>
            {/* Kijelentkezve a gomb a tájékoztató ablakot nyitja (LoginGateLink). */}
            <LoginGateLink
              href="/profil?tab=quotes"
              message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C65EA5] px-7 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-[#B04E91]"
            >
              Megnézem
              <ArrowRight className="h-4 w-4" />
            </LoginGateLink>
          </div>
        </div>
      </div>
    </div>
  );
}
