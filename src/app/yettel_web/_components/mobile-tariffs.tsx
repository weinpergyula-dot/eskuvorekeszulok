"use client";

import { useState } from "react";
import { ChevronDown, PhoneCall, Globe, Plane } from "lucide-react";
import { OFFERS, type Offer } from "../_data/offers";
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
        <div className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
          {tariffs.map((t, i) => (
            <OfferCard
              key={t.id}
              offer={t}
              ctaLabel="Kosárba rakom"
              body={<MobileQuotas offer={t} premium={!!t.premium} />}
              className={[
                "min-w-[82%] shrink-0 snap-start sm:min-w-0 sm:shrink",
                // Mobilon minden swipe-olható; desktopon az első sor után csak a "Még több" mutatja
                i >= INITIAL && !showAll ? "sm:hidden" : "",
              ].join(" ")}
            />
          ))}
        </div>
      )}

      {/* Még több… / Kevesebb – kompakt, csak nagyobb kijelzőn (mobilon swipe) */}
      {tariffs.length > INITIAL && (
        <div className="mt-4 hidden justify-center sm:flex">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#002340] hover:underline"
          >
            {showAll ? "Kevesebb" : "Még több…"}
            <ChevronDown className={["h-4 w-4 transition-transform", showAll ? "rotate-180" : ""].join(" ")} />
          </button>
        </div>
      )}
    </div>
  );
}

// Grafikus keret-kijelző: Hívás / Net / Roaming, sávdiagramokkal.
function MobileQuotas({ offer, premium }: { offer: Offer; premium?: boolean }) {
  const callUnlimited = !!offer.unlimitedCall;
  const dataUnlimited = !!offer.unlimitedNet;
  const callNum = parseInt(offer.voiceLabel ?? "", 10);
  const dataNum = parseInt(offer.dataLabel ?? "", 10);
  const roam = offer.roamingGb ?? 0;

  const rows = [
    {
      icon: PhoneCall,
      label: "Hívás",
      value: callUnlimited ? "Korlátlan" : `${callNum} perc`,
      pct: callUnlimited ? 1 : Math.min(callNum / 300, 1),
    },
    {
      icon: Globe,
      label: "Net",
      value: dataUnlimited ? "Korlátlan" : `${dataNum} GB`,
      pct: dataUnlimited ? 1 : Math.min(dataNum / 100, 1),
    },
    {
      icon: Plane,
      label: "Roaming",
      value: `${roam} GB`,
      pct: Math.min(roam / 120, 1),
    },
  ];

  // Prémium (teljes lime) kártyán a sáv navy, hogy jól látszódjon a lime háttéren.
  const labelCls = premium ? "text-[#0A3A24]" : "text-[#2D466C]";
  const trackCls = premium ? "bg-[#002340]/15" : "bg-[#E4F2F7]";
  const fillCls = premium ? "bg-[#002340]" : "bg-[#B4FF00]";

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-center justify-between">
            <span className={["inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.04em]", labelCls].join(" ")}>
              <r.icon className="h-3.5 w-3.5" /> {r.label}
            </span>
            <span className="text-sm font-extrabold text-[#002340]">{r.value}</span>
          </div>
          <div className={["h-2 w-full overflow-hidden rounded-full", trackCls].join(" ")}>
            <div className={["h-full rounded-full", fillCls].join(" ")} style={{ width: `${Math.round(r.pct * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
