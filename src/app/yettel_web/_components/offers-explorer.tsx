"use client";

import { useState } from "react";
import { Check, ArrowRight, Sparkles, Smartphone, Wifi, Tv, Package, type LucideIcon } from "lucide-react";
import { OFFERS, OFFER_TABS, formatFt, type OfferCategory, type Offer } from "../_data/offers";

const TAB_ICONS: Record<OfferCategory, LucideIcon> = {
  havidijas: Smartphone,
  net: Wifi,
  tv: Tv,
  csomag: Package,
};

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div
      className={[
        "relative flex flex-col rounded-[20px] border bg-white p-5 transition-shadow",
        offer.best
          ? "border-[#B4FF00] shadow-[0_10px_34px_rgba(0,35,64,0.10)] ring-2 ring-[#B4FF00]"
          : "border-[#CDE0EA] hover:shadow-[0_8px_24px_rgba(0,35,64,0.08)]",
      ].join(" ")}
    >
      {offer.badge && (
        <span
          className={[
            "absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
            offer.best ? "bg-[#B4FF00] text-[#002340]" : "bg-[#E4F2F7] text-[#2D466C]",
          ].join(" ")}
        >
          {offer.best && <Sparkles className="h-3 w-3" />}
          {offer.badge}
        </span>
      )}

      <div className="mb-3">
        <h3 className="text-lg font-extrabold text-[#002340]">{offer.name}</h3>
        <p className="text-sm text-[#2D466C]">{offer.tagline}</p>
      </div>

      <div className="mb-4 flex items-end gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-[#002340]">{formatFt(offer.price)}</span>
        <span className="pb-1 text-sm text-[#2D466C]">/ hó</span>
        {offer.oldPrice && (
          <span className="pb-1 text-sm text-[#7E93B0] line-through">{formatFt(offer.oldPrice)}</span>
        )}
      </div>

      <ul className="mb-5 space-y-2">
        {offer.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[#2D466C]">
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#B4FF00]">
              <Check className="h-3 w-3 text-[#002340]" strokeWidth={3} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={[
          "mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors",
          offer.best
            ? "bg-[#002340] text-white hover:bg-[#001D36]"
            : "border border-[#CDE0EA] text-[#002340] hover:border-[#002340] hover:bg-[#E4F2F7]",
        ].join(" ")}
      >
        {offer.cta}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function OffersExplorer() {
  const [active, setActive] = useState<OfferCategory>("havidijas");

  return (
    <div>
      {/* Tab választó – nagyobb, ikonokkal kiemelve */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4" role="tablist" aria-label="Ajánlott csomagok">
        {OFFER_TABS.map((tab) => {
          const selected = tab.id === active;
          const Icon = TAB_ICONS[tab.id];
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.id)}
              className={[
                "group flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all",
                selected
                  ? "border-[#B4FF00] bg-[#B4FF00] text-[#002340] shadow-[0_8px_24px_rgba(180,255,0,0.45)]"
                  : "border-[#CDE0EA] bg-white text-[#002340] hover:-translate-y-0.5 hover:border-[#B4FF00] hover:shadow-[0_8px_24px_rgba(0,35,64,0.08)]",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors",
                  selected ? "bg-[#002340] text-[#B4FF00]" : "bg-[#B4FF00] text-[#002340]",
                ].join(" ")}
              >
                <Icon className="h-6 w-6" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-base font-extrabold leading-tight">{tab.label}</span>
                <span className={selected ? "block text-xs text-[#002340]/70" : "block text-xs text-[#2D466C]"}>
                  {tab.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Kártyák */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {OFFERS[active].map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>

      <p className="mt-5 text-xs text-[#7E93B0]">
        A feltüntetett árak online kedvezménnyel, tájékoztató jelleggel értendők. A pontos feltételekért nézd meg az
        adott csomag részleteit.
      </p>
    </div>
  );
}
