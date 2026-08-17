"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { OFFERS } from "../_data/offers";
import { OfferCard } from "./offer-card";

type FilterKey = "net" | "call";
const INITIAL = 3; // egy sor (weben)

// Havidíjas mobil tarifák: szűrő + rácsban (ugyanaz az OfferCard, mint az
// internetnél), alul "Még több…" gombbal.
export function MobileTariffs() {
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const toggleFilter = (k: FilterKey) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
    setShowAll(false);
  };

  // Drágától az olcsóig; a kijelölt szűrők együtt (ÉS kapcsolat).
  const tariffs = [...OFFERS.havidijas]
    .filter((t) => (!filters.has("net") || t.unlimitedNet) && (!filters.has("call") || t.unlimitedCall))
    .sort((a, b) => b.price - a.price);

  const shown = showAll ? tariffs : tariffs.slice(0, INITIAL);

  const chips: { key: FilterKey | "all"; label: string }[] = [
    { key: "all", label: "Összes" },
    { key: "net", label: "Korlátlan internet" },
    { key: "call", label: "Korlátlan hívás" },
  ];

  return (
    <div>
      {/* Szűrő */}
      <div className="mb-6 flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = c.key === "all" ? filters.size === 0 : filters.has(c.key as FilterKey);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                if (c.key === "all") {
                  setFilters(new Set());
                  setShowAll(false);
                } else {
                  toggleFilter(c.key as FilterKey);
                }
              }}
              aria-pressed={active}
              className={[
                "rounded-full border px-4 py-2 text-sm font-bold transition-colors",
                active
                  ? "border-[#002340] bg-[#002340] text-white"
                  : "border-[#CDE0EA] bg-white text-[#002340] hover:border-[#002340]",
              ].join(" ")}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {tariffs.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[#CDE0EA] bg-white px-6 py-12 text-center text-sm text-[#2D466C]">
          Nincs a szűrésnek megfelelő tarifa. Próbálj más szűrőt!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-7 px-3 sm:grid-cols-2 sm:gap-5 sm:px-0 lg:grid-cols-3">
          {shown.map((t) => (
            <OfferCard key={t.id} offer={t} ctaLabel="Kosárba rakom" />
          ))}
        </div>
      )}

      {/* Még több… / Kevesebb gomb */}
      {tariffs.length > INITIAL && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#002340] px-6 py-3 text-sm font-bold text-[#002340] transition-colors hover:bg-[#002340] hover:text-white"
          >
            {showAll ? "Kevesebb" : "Még több…"}
            <ChevronDown className={["h-4 w-4 transition-transform", showAll ? "rotate-180" : ""].join(" ")} />
          </button>
        </div>
      )}
    </div>
  );
}
