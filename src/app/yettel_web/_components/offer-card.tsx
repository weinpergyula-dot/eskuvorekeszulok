"use client";

import { Check, ArrowRight, Sparkles, Zap, Crown } from "lucide-react";
import { formatFt, type Offer } from "../_data/offers";

// Egységes tarifakártya – ugyanez jelenik meg a főoldali "Otthoni internet"
// szekcióban (címkeresés előtt) és az igénylési folyamat ajánlatok lépésében
// (címkeresés után). Csak a gomb szövege térhet el (ctaLabel).
export function OfferCard({
  offer,
  onOrder,
  ctaLabel,
}: {
  offer: Offer;
  onOrder?: () => void;
  ctaLabel?: string;
}) {
  const isPremium = !!offer.premium;
  const isFast = offer.badge === "Leggyorsabb";
  // Az ár mögötti egység a kategóriától függ (pl. "hó" vagy "feltöltés").
  const priceUnit = offer.unit.replace(/^Ft\s*\/\s*/, "").trim() || "hó";
  const cta = ctaLabel ?? offer.cta;
  return (
    <div
      className={[
        "relative flex flex-col rounded-[20px] border p-5 transition-shadow",
        isPremium
          ? "border-[#9BE000] bg-[linear-gradient(160deg,#CBFF4D_0%,#B4FF00_52%,#9BE000_100%)] shadow-[0_14px_40px_rgba(0,35,64,0.20)]"
          : offer.best
            ? "border-[#B4FF00] bg-white shadow-[0_10px_34px_rgba(0,35,64,0.10)] ring-2 ring-[#B4FF00]"
            : "border-[#CDE0EA] bg-white hover:shadow-[0_8px_24px_rgba(0,35,64,0.08)]",
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

      <div className="mb-4">
        <h3 className="text-2xl font-extrabold text-[#002340]">{offer.name}</h3>
        <p className={["text-base", isPremium ? "text-[#0A3A24]" : "text-[#2D466C]"].join(" ")}>{offer.tagline}</p>
      </div>

      <div className={["mb-4 border-t", isPremium ? "border-[#002340]/20" : "border-[#CDE0EA]"].join(" ")} />

      <div className="mb-4 flex items-end gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-[#002340]">{formatFt(offer.price)}</span>
        <span className={["pb-1 text-sm", isPremium ? "text-[#0A3A24]" : "text-[#2D466C]"].join(" ")}>/ {priceUnit}</span>
        {offer.oldPrice && (
          <span className="pb-1 text-sm text-[#7E93B0] line-through">{formatFt(offer.oldPrice)}</span>
        )}
      </div>

      <ul className="mb-5 space-y-2">
        {offer.features.map((f) => (
          <li
            key={f}
            className={["flex items-start gap-2 text-sm", isPremium ? "text-[#0A3A24]" : "text-[#2D466C]"].join(" ")}
          >
            <span
              className={[
                "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full",
                isPremium ? "bg-[#002340]" : "bg-[#B4FF00]",
              ].join(" ")}
            >
              <Check className={isPremium ? "h-3 w-3 text-[#B4FF00]" : "h-3 w-3 text-[#002340]"} strokeWidth={3} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onOrder}
        className={[
          "mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors",
          offer.best || isPremium
            ? "bg-[#002340] text-white hover:bg-[#001D36]"
            : "border border-[#CDE0EA] text-[#002340] hover:border-[#002340] hover:bg-[#E4F2F7]",
        ].join(" ")}
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
