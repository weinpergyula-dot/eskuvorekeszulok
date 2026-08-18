"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, ArrowRight, Sparkles, Zap, Crown, ChevronRight, X } from "lucide-react";
import { formatFt, type Offer } from "../_data/offers";
import { EKomfortModal } from "./ekomfort-info";

// Egységes tarifakártya – ugyanez jelenik meg a főoldali "Otthoni internet"
// szekcióban (címkeresés előtt) és az igénylési folyamat ajánlatok lépésében
// (címkeresés után). Csak a gomb szövege térhet el (ctaLabel).
export function OfferCard({
  offer,
  onOrder,
  ctaLabel,
  secondaryCtaLabel,
  onSecondary,
  className = "",
  body,
}: {
  offer: Offer;
  onOrder?: () => void;
  ctaLabel?: string;
  /** Opcionális második CTA (pl. "Készülékkel kérem"); ha van, két gomb jelenik meg. */
  secondaryCtaLabel?: string;
  onSecondary?: () => void;
  className?: string;
  /** Ha meg van adva, a jellemző-lista helyett ezt rendereli (pl. mobil grafikus keret). */
  body?: ReactNode;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ekOpen, setEkOpen] = useState(false);
  const isPremium = !!offer.premium;
  const isFast = offer.badge === "Leggyorsabb";
  // Az ár mögötti egység a kategóriától függ (pl. "hó" vagy "feltöltés").
  const priceUnit = offer.unit.replace(/^Ft\s*\/\s*/, "").trim() || "hó";
  const cta = ctaLabel ?? offer.cta;
  return (
    <div
      className={[
        // A kártyák alja mindenhol (mobilon és weben is) kap egy finom vetett árnyékot,
        // hogy elemelkedjenek a háttértől.
        "relative flex flex-col rounded-[20px] bg-white transition-shadow",
        // Az árnyék mindhárom változatnál azonosan visszafogott – a keretes
        // (prémium/kiemelt) kártyákat a lime keret emeli ki, nem az árnyék.
        "shadow-[0_10px_18px_-12px_rgba(0,35,64,0.30)] sm:shadow-[0_12px_24px_-14px_rgba(0,35,64,0.30)]",
        isPremium || offer.best
          ? "border-2 border-[#B4FF00]"
          : "border border-[#CDE0EA] sm:hover:shadow-[0_16px_30px_-14px_rgba(0,35,64,0.38)]",
        className,
      ].join(" ")}
    >
      {offer.badge && (
        <span
          className={[
            "absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold",
            offer.best
              ? "border-[#B4FF00] bg-[#B4FF00] text-[#002340]"
              : isPremium
                ? "border-[#002340] bg-[#002340] text-[#B4FF00]"
                : "border-[#E4F2F7] bg-[#E4F2F7] text-[#2D466C]",
          ].join(" ")}
        >
          {offer.best && <Sparkles className="h-3 w-3" />}
          {isPremium && (isFast ? <Zap className="h-3 w-3" /> : <Crown className="h-3 w-3" />)}
          {offer.badge}
        </span>
      )}

      {/* Fejléc – prémiumnál lime háttér az e-Komfort alatti dividerig */}
      <div
        className={[
          "px-5 pt-6 pb-5",
          isPremium ? "rounded-t-[18px] bg-[linear-gradient(160deg,#CBFF4D_0%,#B4FF00_60%,#9BE000_100%)]" : "",
        ].join(" ")}
      >
        <h3 className="text-[1.375rem] font-extrabold text-[#002340] sm:text-2xl">{offer.name}</h3>
        <p className={["mt-0.5 text-[0.625rem] sm:text-xs", isPremium ? "text-[#0A3A24]" : "text-[#2D466C]"].join(" ")}>
          {offer.tagline.includes("e-Komfort") ? (
            <>
              {offer.tagline.split("e-Komfort")[0]}
              <button
                type="button"
                onClick={() => setEkOpen(true)}
                className="font-bold text-[#002340] underline decoration-dotted underline-offset-2 hover:decoration-solid"
              >
                e-Komfort
              </button>
              {offer.tagline.split("e-Komfort")[1]}
            </>
          ) : (
            offer.tagline
          )}
        </p>
      </div>

      <div className="border-t border-[#CDE0EA]" />

      {/* Törzs – fehér */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        {/* Az akciós ár külön sorban, hogy keskeny kártyán se törjön szét a főár. */}
        <div className="mb-5">
          <div className="flex items-end gap-2 whitespace-nowrap">
            <span className="text-[1.75rem] font-extrabold tracking-tight text-[#002340] sm:text-3xl">
              {formatFt(offer.price)}
            </span>
            <span className="pb-1 text-xs text-[#2D466C] sm:text-sm">/ {priceUnit}</span>
          </div>
          {offer.oldPrice && (
            <p className="text-xs text-[#7E93B0] sm:text-sm">
              <span className="line-through">{formatFt(offer.oldPrice)}</span> helyett
            </p>
          )}
        </div>

        {body ? (
          <div className="mb-5">{body}</div>
        ) : (
          <ul className="mb-5 space-y-3">
            {offer.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-xs text-[#2D466C] sm:text-sm">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#B4FF00]">
                  <Check className="h-3 w-3 text-[#002340]" strokeWidth={3} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="inline-flex items-center justify-center gap-1 text-xs font-bold text-[#002340] hover:underline sm:text-sm"
          >
            Részletek <ChevronRight className="h-4 w-4" />
          </button>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onOrder}
              className={[
                "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors sm:text-sm",
                // Két CTA esetén a fő gomb mindig sötét, hogy legyen hierarchia
                offer.best || isPremium || secondaryCtaLabel
                  ? "bg-[#002340] text-white hover:bg-[#001D36]"
                  : "border border-[#CDE0EA] text-[#002340] hover:border-[#002340] hover:bg-[#E4F2F7]",
              ].join(" ")}
            >
              {cta}
              <ArrowRight className="h-4 w-4" />
            </button>
            {secondaryCtaLabel && (
              <button
                type="button"
                onClick={onSecondary}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#CDE0EA] px-4 py-2.5 text-xs font-bold text-[#002340] transition-colors hover:border-[#002340] hover:bg-[#E4F2F7] sm:text-sm"
              >
                {secondaryCtaLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {detailsOpen && <OfferDetailsModal offer={offer} priceUnit={priceUnit} onClose={() => setDetailsOpen(false)} />}
      {ekOpen && <EKomfortModal onClose={() => setEkOpen(false)} />}
    </div>
  );
}

// Részletek felugró ablak a tarifa tulajdonságaival.
export function OfferDetailsModal({
  offer,
  priceUnit,
  onClose,
}: {
  offer: Offer;
  priceUnit: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const items = offer.details ?? offer.features;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#002340]/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${offer.name} részletei`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_30px_80px_rgba(0,35,64,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-[#002340]">{offer.name}</h3>
            <p className="text-sm text-[#2D466C]">{offer.tagline}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#2D466C] transition-colors hover:bg-[#E4F2F7]"
            aria-label="Bezárás"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex items-end gap-2 border-y border-[#CDE0EA] py-3">
          <span className="text-2xl font-extrabold tracking-tight text-[#002340]">{formatFt(offer.price)}</span>
          <span className="pb-0.5 text-sm text-[#2D466C]">/ {priceUnit}</span>
          {offer.oldPrice && (
            <span className="pb-0.5 text-sm text-[#7E93B0] line-through">{formatFt(offer.oldPrice)}</span>
          )}
        </div>

        <ul className="mt-4 space-y-2.5">
          {items.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-[#2D466C]">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#B4FF00]">
                <Check className="h-3 w-3 text-[#002340]" strokeWidth={3} />
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs text-[#7E93B0]">
          A feltüntetett ár online kedvezménnyel, tájékoztató jelleggel értendő. A pontos feltételekért keresd
          ügyfélszolgálatunkat.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#002340] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#001D36]"
        >
          Értem
        </button>
      </div>
    </div>
  );
}
