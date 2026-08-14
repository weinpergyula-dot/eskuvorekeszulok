"use client";

import { useState } from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { OFFERS, OFFER_TABS, formatFt, type OfferCategory, type Offer } from "../_data/offers";

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div
      className={[
        "relative flex flex-col rounded-2xl border bg-white p-5 transition-shadow",
        offer.best
          ? "border-[#00a868] shadow-[0_8px_30px_rgba(0,168,104,0.14)] ring-1 ring-[#00a868]/20"
          : "border-gray-200 hover:shadow-md",
      ].join(" ")}
    >
      {offer.badge && (
        <span
          className={[
            "absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
            offer.best ? "bg-[#00a868] text-white" : "bg-[#e8f7f0] text-[#00875a]",
          ].join(" ")}
        >
          {offer.best && <Sparkles className="h-3 w-3" />}
          {offer.badge}
        </span>
      )}

      <div className="mb-3">
        <h3 className="text-lg font-bold text-gray-900">{offer.name}</h3>
        <p className="text-sm text-gray-500">{offer.tagline}</p>
      </div>

      <div className="mb-4 flex items-end gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-gray-900">{formatFt(offer.price)}</span>
        <span className="pb-1 text-sm text-gray-500">/ hó</span>
        {offer.oldPrice && (
          <span className="pb-1 text-sm text-gray-400 line-through">{formatFt(offer.oldPrice)}</span>
        )}
      </div>

      <ul className="mb-5 space-y-2">
        {offer.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00a868]" strokeWidth={2.5} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={[
          "mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
          offer.best
            ? "bg-[#00a868] text-white hover:bg-[#00875a]"
            : "border border-gray-300 text-gray-800 hover:border-[#00a868] hover:text-[#00875a]",
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
      {/* Tab választó */}
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Ajánlott csomagok">
        {OFFER_TABS.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.id)}
              className={[
                "group flex flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-colors",
                selected
                  ? "border-[#00a868] bg-[#00a868] text-white"
                  : "border-gray-200 bg-white text-gray-800 hover:border-[#00a868]",
              ].join(" ")}
            >
              <span className="text-sm font-semibold">{tab.label}</span>
              <span className={selected ? "text-xs text-white/80" : "text-xs text-gray-500"}>{tab.hint}</span>
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

      <p className="mt-5 text-xs text-gray-400">
        A feltüntetett árak online kedvezménnyel, tájékoztató jelleggel értendők. A pontos feltételekért nézd meg az
        adott csomag részleteit.
      </p>
    </div>
  );
}
