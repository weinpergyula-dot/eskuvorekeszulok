"use client";

import { useRef, useState } from "react";
import { Globe, PhoneCall, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { OFFERS, formatFt, type Offer } from "../_data/offers";
import { OfferDetailsModal } from "./offer-card";

type FilterKey = "net" | "call";

// Havidíjas mobil tarifák: szűrő + egysoros, nyíllal lapozható carousel.
export function MobileTariffs() {
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set());
  const [details, setDetails] = useState<Offer | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const toggleFilter = (k: FilterKey) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  // Drágától az olcsóig; a kijelölt szűrők együtt (ÉS kapcsolat).
  const tariffs = [...OFFERS.havidijas]
    .filter((t) => (!filters.has("net") || t.unlimitedNet) && (!filters.has("call") || t.unlimitedCall))
    .sort((a, b) => b.price - a.price);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 300), behavior: "smooth" });
  };

  const chips: { key: FilterKey | "all"; label: string }[] = [
    { key: "all", label: "Összes" },
    { key: "net", label: "Korlátlan internet" },
    { key: "call", label: "Korlátlan hívás" },
  ];

  return (
    <div>
      {/* Szűrő + lapozó nyilak egy sorban */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => {
            const active = c.key === "all" ? filters.size === 0 : filters.has(c.key as FilterKey);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => (c.key === "all" ? setFilters(new Set()) : toggleFilter(c.key as FilterKey))}
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
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Előző"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#CDE0EA] bg-white text-[#002340] transition-colors hover:border-[#002340] hover:bg-[#E4F2F7]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Következő"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#CDE0EA] bg-white text-[#002340] transition-colors hover:border-[#002340] hover:bg-[#E4F2F7]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Egysoros, vízszintesen görgethető sáv */}
      {tariffs.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[#CDE0EA] bg-white px-6 py-12 text-center text-sm text-[#2D466C]">
          Nincs a szűrésnek megfelelő tarifa. Próbálj más szűrőt!
        </div>
      ) : (
        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        >
          {tariffs.map((t) => (
            <MobileTariffCard key={t.id} tariff={t} onDetails={() => setDetails(t)} />
          ))}
        </div>
      )}

      {/* Mobilon lapozó nyilak alul középen */}
      <div className="mt-4 flex justify-center gap-3 sm:hidden">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Előző"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#CDE0EA] bg-white text-[#002340]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Következő"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#CDE0EA] bg-white text-[#002340]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {details && (
        <OfferDetailsModal
          offer={{ ...details, details: buildDetails(details) }}
          priceUnit="hó"
          onClose={() => setDetails(null)}
        />
      )}
    </div>
  );
}

function buildDetails(t: Offer): string[] {
  return [
    t.dataLabel === "Korlátlan" ? "Korlátlan belföldi mobilnet" : `${t.dataLabel} belföldi mobilnet`,
    t.voiceLabel === "Korlátlan" ? "Korlátlan belföldi beszélgetés" : `${t.voiceLabel} belföldi beszélgetés`,
    ...t.features,
    "5G hálózat",
    "e-Komfort csomaggal, 11 hónap hűséggel",
  ];
}

function Stat({ icon: Icon, value, label }: { icon: typeof Globe; value: string; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center px-2 text-center">
      <Icon className="h-6 w-6 text-[#002340]" strokeWidth={1.9} />
      <span className="mt-1.5 text-lg font-extrabold leading-tight text-[#002340]">{value}</span>
      <span className="text-xs text-[#2D466C]">{label}</span>
    </div>
  );
}

function MobileTariffCard({ tariff, onDetails }: { tariff: Offer; onDetails: () => void }) {
  return (
    <div className="flex w-[290px] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-[#CDE0EA] bg-white shadow-[0_10px_30px_-20px_rgba(0,35,64,0.35)]">
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-center text-lg font-extrabold text-[#002340]">{tariff.name}</h3>

        <div className="mt-4 flex divide-x divide-[#CDE0EA]">
          <Stat icon={Globe} value={tariff.dataLabel ?? "—"} label="mobilnet" />
          <Stat icon={PhoneCall} value={tariff.voiceLabel ?? "—"} label="beszélgetés" />
        </div>

        <div className="mt-4 space-y-1.5 border-t border-[#CDE0EA] pt-4 text-center">
          {tariff.features.map((f, i) => (
            <p key={f} className={i === 0 ? "text-sm font-bold text-[#002340]" : "text-xs text-[#2D466C]"}>
              {f}
            </p>
          ))}
        </div>

        <button
          type="button"
          onClick={onDetails}
          className="mx-auto mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#002340] underline decoration-dotted underline-offset-2 hover:decoration-solid"
        >
          Tarifa részletek <Info className="h-4 w-4" />
        </button>
      </div>

      {/* Lime ár-lábléc + Kosárba rakom */}
      <div className="bg-[#B4FF00] px-5 py-4 text-center">
        <p className="text-[#002340]">
          <span className="text-2xl font-extrabold tracking-tight">{formatFt(tariff.price)}</span>
          <span className="text-sm font-semibold"> /hó</span>
        </p>
        <p className="mt-0.5 text-xs text-[#002340]/80">e-Komfort csomaggal, 11 hónap hűséggel</p>
        <button
          type="button"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#002340] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#001D36]"
        >
          Kosárba rakom
        </button>
      </div>
    </div>
  );
}
