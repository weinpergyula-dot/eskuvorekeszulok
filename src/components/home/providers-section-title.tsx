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
 *
 * Mobilon a cím mellett jobbra a szűrő ikonja áll. (A keresés a főoldali
 * hero keresőjéből történik.)
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
  const iconBtn = (on: boolean) =>
    `relative grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl border transition-colors ${
      on ? "border-[#E8336A] bg-[#E8336A]/10 text-[#B3264F]" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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
        </div>
      </div>

    </div>
  );
}
