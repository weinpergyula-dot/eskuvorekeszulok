"use client";

import { useState } from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { OFFERS, OFFER_TABS, formatFt, type OfferCategory, type Offer } from "../_data/offers";

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div
      className={[
        "relative flex flex-col rounded-[20px] border bg-white p-5 transition-shadow",
        offer.best
          ? "border-[#C6F24E] shadow-[0_10px_34px_rgba(20,36,94,0.10)] ring-2 ring-[#C6F24E]"
          : "border-[#E6EAF2] hover:shadow-[0_8px_24px_rgba(20,36,94,0.08)]",
      ].join(" ")}
    >
      {offer.badge && (
        <span
          className={[
            "absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
            offer.best ? "bg-[#C6F24E] text-[#14245E]" : "bg-[#F1F5FC] text-[#4F7A00]",
          ].join(" ")}
        >
          {offer.best && <Sparkles className="h-3 w-3" />}
          {offer.badge}
        </span>
      )}

      <div className="mb-3">
        <h3 className="text-lg font-extrabold text-[#14245E]">{offer.name}</h3>
        <p className="text-sm text-[#5B6684]">{offer.tagline}</p>
      </div>

      <div className="mb-4 flex items-end gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-[#14245E]">{formatFt(offer.price)}</span>
        <span className="pb-1 text-sm text-[#5B6684]">/ hó</span>
        {offer.oldPrice && (
          <span className="pb-1 text-sm text-[#9AA3BC] line-through">{formatFt(offer.oldPrice)}</span>
        )}
      </div>

      <ul className="mb-5 space-y-2">
        {offer.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[#3A4A6B]">
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#C6F24E]">
              <Check className="h-3 w-3 text-[#14245E]" strokeWidth={3} />
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
            ? "bg-[#14245E] text-white hover:bg-[#0B1330]"
            : "border border-[#C7D0E4] text-[#14245E] hover:border-[#14245E] hover:bg-[#F1F5FC]",
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
                  ? "border-[#C6F24E] bg-[#C6F24E] text-[#14245E]"
                  : "border-[#E6EAF2] bg-white text-[#14245E] hover:border-[#C6F24E]",
              ].join(" ")}
            >
              <span className="text-sm font-bold">{tab.label}</span>
              <span className={selected ? "text-xs text-[#14245E]/70" : "text-xs text-[#5B6684]"}>{tab.hint}</span>
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

      <p className="mt-5 text-xs text-[#9AA3BC]">
        A feltüntetett árak online kedvezménnyel, tájékoztató jelleggel értendők. A pontos feltételekért nézd meg az
        adott csomag részleteit.
      </p>
    </div>
  );
}
