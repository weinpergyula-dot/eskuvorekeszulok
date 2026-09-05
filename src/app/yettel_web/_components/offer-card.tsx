"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Check,
  ChevronRight,
  CreditCard,
  Gift,
  Globe,
  PhoneCall,
  Shield,
  Signal,
  Smartphone,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";
import { formatFt, type FeatureItem, type Offer } from "../_data/offers";
import { EKomfortModal } from "./ekomfort-info";

/** A jellemzők ikonkészlete – az adatfájl `icon` kulcsai képezik le ide. */
const FEATURE_ICONS: Record<FeatureItem["icon"], LucideIcon> = {
  net: Globe,
  call: PhoneCall,
  speed: Signal,
  gift: Gift,
  shield: Shield,
  loyalty: Star,
  sim: CreditCard,
  device: Smartphone,
};

/** A fejléc három változata: lime kiemelés, sötétkék, vagy alap fehér. */
type Theme = "promo" | "dark" | "plain";

function resolveTheme(offer: Offer): Theme {
  if (offer.theme) return offer.theme;
  if (offer.premium) return "dark";
  if (offer.best) return "promo";
  return "plain";
}

// Egységes tarifakártya – ugyanez jelenik meg a főoldali "Otthoni internet"
// szekcióban (címkeresés előtt) és az igénylési folyamat ajánlatok lépésében
// (címkeresés után). Csak a gomb szövege térhet el (ctaLabel).
//
// Felépítés a yettel.hu tarifakártyái szerint: színes fejléc (címke + név +
// ár + apróbetű), alatta fehér törzs ikonos jellemzőkkel, végül a "Részletek"
// hivatkozás és a teljes szélességű pirula gomb.
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
  /** Ha meg van adva, a jellemző-lista helyett ezt rendereli (pl. TV grafikus keret). */
  body?: ReactNode;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [ekOpen, setEkOpen] = useState(false);

  const theme = resolveTheme(offer);
  const onDark = theme === "dark";
  // Az ár mögötti egység a kategóriától függ (pl. "hó" vagy "feltöltés").
  const priceUnit = offer.unit.replace(/^Ft\s*\/\s*/, "").trim() || "hó";
  const cta = ctaLabel ?? offer.cta;
  // A sötét fejlécű (prémium) kártyán kontúros a fő gomb, mint a yettel.hu-n.
  const ctaOutline = offer.ctaOutline ?? onDark;

  // Az ár fölötti sor: kézzel megadott, vagy az áthúzott árból képzett.
  const priceLead = offer.priceLead ?? (offer.oldPrice ? `${formatFt(offer.oldPrice)} / ${priceUnit} helyett` : null);
  // Az ár alatti apróbetű: kézzel megadott, vagy a tagline vesszőnként bontva.
  const priceNotes = offer.priceNotes ?? offer.tagline.split(", ");

  return (
    <div
      className={[
        "relative flex flex-col overflow-hidden rounded-[20px] bg-white transition-shadow",
        "shadow-[0_10px_18px_-12px_rgba(0,35,64,0.30)] sm:shadow-[0_12px_24px_-14px_rgba(0,35,64,0.30)]",
        theme === "plain"
          ? "border border-[#CDE0EA] sm:hover:shadow-[0_16px_30px_-14px_rgba(0,35,64,0.38)]"
          : "border border-transparent",
        className,
      ].join(" ")}
    >
      {/* ── Fejléc: címke, név, ár, apróbetű ── */}
      <div
        className={[
          "px-5 pb-5 pt-5",
          theme === "promo" ? "bg-[#C7F534]" : onDark ? "bg-[#002340]" : "bg-white",
        ].join(" ")}
      >
        {/* A címke a fejléc jobb felső sarkában ül – a kártya kerete fölé
            lógó régi buborék helyett, ahogy a yettel.hu-n is. Címke nélkül
            nem tartunk fenn helyet, hogy ne maradjon üres sáv a név fölött. */}
        {offer.badge && (
          <div className="mb-2 flex justify-end">
            <span
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                theme === "promo"
                  ? "bg-white text-[#002340]"
                  : onDark
                    ? "bg-[#C7F534] text-[#002340]"
                    : "bg-[#E4F2F7] text-[#2D466C]",
              ].join(" ")}
            >
              {offer.badge}
            </span>
          </div>
        )}

        <h3 className={`text-[1.375rem] font-extrabold sm:text-2xl ${onDark ? "text-white" : "text-[#002340]"}`}>
          {offer.name}
        </h3>

        {priceLead && (
          <p className={`mt-2 text-xs sm:text-sm ${onDark ? "text-[#BBD3E4]" : "text-[#2D466C]"}`}>{priceLead}</p>
        )}

        <div className="mt-1 flex items-end whitespace-nowrap">
          <span
            className={`text-[1.75rem] font-extrabold tracking-tight sm:text-[2rem] ${onDark ? "text-white" : "text-[#002340]"}`}
          >
            {formatFt(offer.price)}
          </span>
          <span className={`pb-1 text-sm font-bold ${onDark ? "text-white" : "text-[#002340]"}`}>/{priceUnit}</span>
        </div>

        {priceNotes.length > 0 && (
          <div className={`mt-1.5 space-y-0.5 text-xs ${onDark ? "text-[#BBD3E4]" : "text-[#2D466C]"}`}>
            {priceNotes.map((note) => (
              <p key={note}>
                {note.includes("e-Komfort") ? (
                  <>
                    {note.split("e-Komfort")[0]}
                    <button
                      type="button"
                      onClick={() => setEkOpen(true)}
                      className={`font-bold underline decoration-dotted underline-offset-2 hover:decoration-solid ${onDark ? "text-white" : "text-[#002340]"}`}
                    >
                      e-Komfort
                    </button>
                    {note.split("e-Komfort")[1]}
                  </>
                ) : (
                  note
                )}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── Törzs: opcionális pirula, jellemzők, részletek, gombok ── */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        {offer.bodyBadge && (
          <span className="mb-5 inline-flex self-start rounded-full bg-[#002340] px-3 py-1.5 text-xs font-bold text-white">
            {offer.bodyBadge}
          </span>
        )}

        {body ? (
          <div className="mb-6">{body}</div>
        ) : offer.featureItems ? (
          <ul className="mb-6 space-y-4">
            {offer.featureItems.map((f) => {
              const Icon = FEATURE_ICONS[f.icon];
              return (
                <li key={f.title} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-[#002340]" strokeWidth={1.6} />
                  <span>
                    <span className="block text-sm font-bold leading-snug text-[#002340]">{f.title}</span>
                    {f.desc && <span className="mt-0.5 block text-xs leading-snug text-[#7E93B0]">{f.desc}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="mb-6 space-y-3">
            {offer.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-[#2D466C]">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#C7F534]">
                  <Check className="h-3 w-3 text-[#002340]" strokeWidth={3} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="inline-flex items-center justify-center gap-0.5 text-sm font-bold text-[#002340] underline underline-offset-4 hover:no-underline"
          >
            Részletek <ChevronRight className="h-4 w-4" />
          </button>
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onOrder}
              className={[
                "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition-colors",
                ctaOutline
                  ? "border-2 border-[#002340] text-[#002340] hover:bg-[#002340] hover:text-white"
                  : "bg-[#002340] text-white hover:bg-[#001D36]",
              ].join(" ")}
            >
              {cta}
            </button>
            {secondaryCtaLabel && (
              <button
                type="button"
                onClick={onSecondary}
                className="inline-flex items-center justify-center rounded-full border border-[#CDE0EA] px-5 py-3 text-sm font-bold text-[#002340] transition-colors hover:border-[#002340] hover:bg-[#E4F2F7]"
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
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#C7F534]">
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
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#002340] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#001D36]"
        >
          Értem
        </button>
      </div>
    </div>
  );
}
