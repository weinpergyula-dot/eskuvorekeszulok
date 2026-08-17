"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { OFFERS, OFFER_TABS, CATEGORY_META, type OfferCategory } from "../_data/offers";
import { OfferCard } from "./offer-card";
import { MobileTariffs } from "./mobile-tariffs";
import { TvQuotas } from "./quota-bars";

// Az igénylési folyamatok indítása (hash-vezérelt, teljes oldalas – lásd
// internet-flow.tsx). Az internet és a TV külön hash-bázison fut.
function startFlow(service: OfferCategory) {
  const base = service === "tv" ? "yettel-tv" : "otthoni-internet";
  window.location.hash = `${base}/cim`;
}

// A menü/csempe hash-ei ↔ a tarifakategóriák.
const HASH_TO_CAT: Record<string, OfferCategory> = {
  havidijas: "havidijas",
  ajanlatok: "havidijas",
  internet: "net",
  tv: "tv",
  feltoltokartya: "feltolto",
};

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
      <div className="mb-6 max-w-2xl">
        <span className="text-sm font-extrabold uppercase tracking-[0.06em] text-[#2D466C]">
          Tarifák és szolgáltatások
        </span>
        <h2 className="mt-1 text-[1.375rem] font-extrabold tracking-tight text-[#002340] sm:text-[1.75rem]">
          {meta.title}
        </h2>
        <p className="mt-2 text-base text-[#2D466C]">{meta.blurb}</p>
      </div>

      {/* Kártyák vagy "hamarosan" állapot */}
      {active === "havidijas" ? (
        <MobileTariffs />
      ) : activeTab?.soon ? (
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
        <div className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto pt-3 pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pt-0 sm:pb-0 lg:grid-cols-3">
          {/* Balról jobbra ár szerint csökkenő sorrend; mobilon oldalra swipe-olható */}
          {[...OFFERS[active]]
            .sort((a, b) => b.price - a.price)
            .map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onOrder={active === "net" || active === "tv" ? () => startFlow(active) : undefined}
                body={active === "tv" ? <TvQuotas offer={offer} /> : undefined}
                className="min-w-[82%] shrink-0 snap-start sm:min-w-0 sm:shrink"
              />
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
