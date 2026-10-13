"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";

/**
 * A szolgáltatói szekció címe a főoldalon: a gyorskategória-csempéken
 * kiválasztott kategóriát tükrözi ("Összes szolgáltató", vagy a kategória
 * neve), mögötte zárójelben a találatok számával. A ProvidersContent az
 * "eskuvo:category" eseménnyel a mindenkori szűrőt, az "eskuvo:count"
 * eseménnyel a darabszámot jelzi.
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

  const label = CATEGORY_LABELS[category as ServiceCategory];

  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <h2 className="text-[22px] md:text-[28px] font-bold text-gray-900">
        {label ?? "Összes szolgáltató"}
        {count !== null && <span className="font-semibold text-gray-500"> ({count})</span>}
      </h2>
      {/* Mobilon (lg alatt) a megyeszűrő ezzel nyílik; desktopon a bal
          oldali megyelista mindig látszik. */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("eskuvo:toggle-filter"))}
        aria-expanded={filter.open}
        className={`relative flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-base font-medium transition-colors cursor-pointer lg:hidden ${
          filter.open ? "border-[#84AAA6] bg-[#84AAA6]/10 text-[#5C8480]" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        Szűrő
        <SlidersHorizontal className="h-4 w-4" />
        {filter.active && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#C65EA5]" aria-label="Aktív szűrő" />}
      </button>
    </div>
  );
}
