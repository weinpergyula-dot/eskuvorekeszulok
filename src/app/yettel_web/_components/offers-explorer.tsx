"use client";

import { useEffect, useState } from "react";
import { Check, ArrowRight, Sparkles, Zap } from "lucide-react";
import { OFFERS, OFFER_TABS, CATEGORY_META, formatFt, type OfferCategory, type Offer } from "../_data/offers";

// A menü/csempe hash-ei ↔ a tarifakategóriák.
const HASH_TO_CAT: Record<string, OfferCategory> = {
  havidijas: "havidijas",
  ajanlatok: "havidijas",
  internet: "net",
  tv: "tv",
};

function OfferCard({ offer }: { offer: Offer }) {
  const isFast = offer.badge === "Leggyorsabb";
  return (
    <div
      className={[
        "relative flex flex-col rounded-[20px] border bg-white p-5 transition-shadow",
        offer.best
          ? "border-[#B4FF00] shadow-[0_10px_34px_rgba(0,35,64,0.10)] ring-2 ring-[#B4FF00]"
          : isFast
            ? "border-[#002340] shadow-[0_10px_34px_rgba(0,35,64,0.10)] ring-2 ring-[#002340]"
            : "border-[#CDE0EA] hover:shadow-[0_8px_24px_rgba(0,35,64,0.08)]",
      ].join(" ")}
    >
      {offer.badge && (
        <span
          className={[
            "absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold",
            offer.best
              ? "border-[#B4FF00] bg-[#B4FF00] text-[#002340]"
              : isFast
                ? "border-[#002340] bg-[#002340] text-[#B4FF00]"
                : "border-[#E4F2F7] bg-[#E4F2F7] text-[#2D466C]",
          ].join(" ")}
        >
          {offer.best && <Sparkles className="h-3 w-3" />}
          {isFast && !offer.best && <Zap className="h-3 w-3" />}
          {offer.badge}
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-2xl font-extrabold text-[#002340]">{offer.name}</h3>
        <p className="text-base text-[#2D466C]">{offer.tagline}</p>
      </div>

      <div className="mb-4 border-t border-[#CDE0EA]" />

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
  // A kategóriát a felső csempék / menü választja ki (hash alapján); alapból "havidijas".
  const [active, setActive] = useState<OfferCategory>("havidijas");
  const activeTab = OFFER_TABS.find((t) => t.id === active);
  const meta = CATEGORY_META[active];

  useEffect(() => {
    function fromHash() {
      const cat = HASH_TO_CAT[window.location.hash.slice(1)];
      if (cat) setActive(cat);
    }
    // A csempékről görgetés nélkül érkező váltás.
    function onSection(e: Event) {
      const cat = HASH_TO_CAT[(e as CustomEvent<string>).detail];
      if (cat) setActive(cat);
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("yettel:section", onSection);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener("yettel:section", onSection);
    };
  }, []);

  return (
    <div>
      {/* Dinamikus fejléc – a felül kiválasztott kategória + rövid marketing szöveg */}
      <div className="mb-8 max-w-2xl">
        <span className="text-base font-extrabold uppercase tracking-[0.06em] text-[#2D466C]">
          Tarifák és szolgáltatások
        </span>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#002340] sm:text-3xl">{meta.title}</h2>
        <p className="mt-2 text-base text-[#2D466C]">{meta.blurb}</p>
      </div>

      {/* Kártyák vagy "hamarosan" állapot */}
      {activeTab?.soon ? (
        <div className="flex flex-col items-center rounded-[20px] border border-dashed border-[#B4FF00] bg-white px-6 py-12 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#002340] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B4FF00]">
            <Sparkles className="h-3.5 w-3.5" /> Hamarosan
          </span>
          <h3 className="text-xl font-extrabold text-[#002340]">Internet + TV csomagok hamarosan</h3>
          <p className="mt-2 max-w-md text-sm text-[#2D466C]">
            Dolgozunk a kombinált Internet + TV ajánlatokon, hogy mindent egy számlán, kedvezményesen kaphass meg.
            Iratkozz fel, és elsőként értesítünk, amint elérhető.
          </p>
          <a
            href="#belepes"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#002340] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#001D36]"
          >
            Értesítést kérek <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS[active].map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-[#7E93B0]">
        A feltüntetett árak online kedvezménnyel, tájékoztató jelleggel értendők. A pontos feltételekért nézd meg az
        adott csomag részleteit.
      </p>
    </div>
  );
}
