"use client";

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";

/**
 * A szolgáltatói szekció címe a főoldalon: a gyorskategória-csempéken
 * kiválasztott kategóriát tükrözi ("Összes szolgáltató", vagy a kategória
 * neve), mögötte zárójelben a találatok számával. A ProvidersContent az
 * "eskuvo:category" eseménnyel a mindenkori szűrőt, az "eskuvo:count"
 * eseménnyel a darabszámot jelzi.
 *
 * Mobilon a cím mellett jobbra a szűrő és a kereső ikonja áll. A kereső
 * koppintásra a cím alatt nyílik ki; gépelés közben a lista név, kategória,
 * megye és leírás szerint szűr ("eskuvo:set-query"), bezáráskor törlődik.
 */
export function ProvidersSectionTitle() {
  const [category, setCategory] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [filter, setFilter] = useState({ open: false, active: false });

  useEffect(() => {
    const h = (e: Event) => setCategory((e as CustomEvent<string>).detail ?? "");
    window.addEventListener("eskuvo:category", h);
    const c = (e: Event) => setCount((e as CustomEvent<number>).detail);
    window.addEventListener("eskuvo:count", c);
    const f = (e: Event) => setFilter((e as CustomEvent<{ open: boolean; active: boolean }>).detail);
    window.addEventListener("eskuvo:filter-state", f);
    return () => {
      window.removeEventListener("eskuvo:filter-state", f);
      window.removeEventListener("eskuvo:category", h);
      window.removeEventListener("eskuvo:count", c);
    };
  }, []);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /* Rövid késleltetéssel küldjük a listának, hogy ne szűrjön minden leütésre. */
  useEffect(() => {
    const t = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("eskuvo:set-query", { detail: query.trim() }));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  /* Nyitáskor fókusz a mezőre (iOS-en a koppintás közvetlen következménye,
     így a billentyűzet is feljön). */
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
    window.dispatchEvent(new CustomEvent("eskuvo:set-query", { detail: query.trim() }));
  };

  const label = CATEGORY_LABELS[category as ServiceCategory];
  const iconBtn = (on: boolean) =>
    `relative grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl border transition-colors ${
      on ? "border-[#84AAA6] bg-[#84AAA6]/10 text-[#5C8480]" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
    }`;

  return (
    /* Desktopon (lg-től) a cím a szolgáltatói lista vezérlősorába kerül, a
       rendezés mellé (ProvidersContent), itt csak mobilon látszik. */
    <div className="mb-6 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] md:text-[24px] font-bold text-gray-900">
          {label ?? "Összes szolgáltató"}
          {count !== null && <span className="font-semibold text-gray-500"> ({count})</span>}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          {/* Mobilon (lg alatt) a megyeszűrő ezzel nyílik; desktopon a bal
              oldali megyelista mindig látszik. */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("eskuvo:toggle-filter"))}
            aria-expanded={filter.open}
            aria-label="Szűrő"
            title="Szűrő"
            className={iconBtn(filter.open)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {filter.active && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#B8925A]" aria-label="Aktív szűrő" />}
          </button>
          <button
            type="button"
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            aria-expanded={searchOpen}
            aria-controls="szolgaltato-kereso"
            aria-label="Szolgáltató keresése"
            title="Keresés"
            className={iconBtn(searchOpen)}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <form id="szolgaltato-kereso" role="search" onSubmit={submitSearch} className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") closeSearch(); }}
            placeholder="Szolgáltató, kategória, megye…"
            aria-label="Keresés a szolgáltatók között"
            /* 16px, hogy iOS-en fókuszáláskor ne nagyítson rá az oldal */
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-10 text-base text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#84AAA6] [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Keresés bezárása"
            className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-gray-400 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
