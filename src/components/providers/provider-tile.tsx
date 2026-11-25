"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Star, MessageCircle, ArrowRight, Flame, Eye, ChevronDown, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, type Provider } from "@/lib/types";
import { FavoriteButton } from "@/components/providers/favorite-button";
import { ChatLink, LoginGateLink } from "@/components/providers/masked-contact";
import { quoteHrefFor } from "@/lib/quote-href";

/* ── Szolgáltatói kártya (új dizájn) ─────────────────────────────────────
   Nagy, ujjal lapozható fotó, rajta üveg címkék és a név / hely /
   értékelés, jobbra lent a Megnézem gomb. A rövid bemutatkozás rejtve
   van: a „Bemutatkozás” gombra a kép alatt fehér panelen nyílik le. */

/* Ennyi ideig látszik egy kép a kártya slideshow-jában. */
const SLIDE_MS = 4000;

/* ── Közös slideshow: automatikus lapozás, amíg a fotó legalább félig a
   képernyőn van és a látogató nem fogja; kézi húzással is lapozható. */
export function useSlideshow(count: number) {
  const [idx, setIdx] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [holding, setHolding] = useState(false);
  const playing = visible && !holding && count > 1;

  const onScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    const el = cardRef.current;
    if (!el || count < 2) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting && e.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [count]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      const el = stripRef.current;
      if (!el) return;
      const next = (idx + 1) % count;
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [playing, idx, count]);

  const holdHandlers = {
    onPointerDown: () => setHolding(true),
    onPointerUp: () => setHolding(false),
    onPointerCancel: () => setHolding(false),
    onPointerLeave: () => setHolding(false),
  };

  return { stripRef, cardRef, idx, onScroll, playing, holdHandlers };
}

/* A slideshow kis, töltődő státuszcsíkjai. */
export function SlideBars({ count, idx, playing, className }: { count: number; idx: number; playing: boolean; className?: string }) {
  if (count < 2) return null;
  return (
    <div className={cn("flex justify-center gap-1", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="h-[3px] w-4 overflow-hidden rounded-full bg-white/35">
          <span
            key={i === idx ? `run-${idx}` : "still"}
            className={cn("block h-full rounded-full bg-white", i < idx ? "w-full" : i === idx ? "slide-progress" : "w-0")}
            style={i === idx ? { animationDuration: `${SLIDE_MS}ms`, animationPlayState: playing ? "running" : "paused" } : undefined}
          />
        </span>
      ))}
    </div>
  );
}

export const FEATURED_COLOR: Record<string, string> = {
  gold: "fill-[#B8925A] text-[#B8925A]",
  silver: "fill-slate-500 text-slate-500",
  teal: "fill-[#84AAA6] text-[#84AAA6]",
};

export const FEATURED_LABEL: Record<string, string> = {
  gold: "Arany partner",
  silver: "Ezüst partner",
  teal: "Kiemelt",
};

export function ProviderTile({
  provider,
  isOwner = false,
  initialLiked = false,
  onUnlike,
  backTo,
  disableLink = false,
}: {
  provider: Provider;
  isOwner?: boolean;
  initialLiked?: boolean;
  onUnlike?: (id: string) => void;
  backTo?: string;
  /** Előnézet (pl. a saját profil): a kártya nem visz a részletes oldalra. */
  disableLink?: boolean;
}) {
  const anchorId = backTo ? `provider-${provider.id}` : undefined;
  const backHref = backTo ? `${backTo.replace(/#.*$/, "")}#${anchorId}` : undefined;
  const detailHref = disableLink
    ? undefined
    : backHref
    ? `/providers/${provider.id}?from=${encodeURIComponent(backHref)}`
    : `/providers/${provider.id}`;

  const images = [...(provider.gallery_urls ?? [])];
  if (images.length === 0 && provider.avatar_url) images.push(provider.avatar_url);
  const shown = images.slice(0, 6);

  const [open, setOpen] = useState(false);
  const [viewerAt, setViewerAt] = useState<number | null>(null);
  const { stripRef, cardRef, idx, onScroll, playing, holdHandlers } = useSlideshow(shown.length);

  const rating = provider.average_rating ?? 0;
  const reviews = provider.review_count ?? 0;
  const counties = provider.counties ?? [];
  const cats = provider.categories ?? [];
  const intro = provider.description?.trim();

  return (
    <article id={anchorId} className="group scroll-mt-24 flex flex-col">
      {/* Fotó + ráírt adatok */}
      <div
        ref={cardRef}
        {...holdHandlers}
        className="relative z-10 overflow-hidden rounded-[30px] bg-[#EEF3F2] aspect-[4/4.4] sm:aspect-[4/4] ring-1 ring-white/70 shadow-[0_30px_50px_-28px_rgba(20,45,42,0.6)]">
        {shown.length > 0 ? (
          <div ref={stripRef} onScroll={onScroll} className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scrollbar-none">
            {shown.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setViewerAt(i)}
                aria-label="Képek megtekintése"
                className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={i === 0 ? provider.full_name : ""} loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center font-heading text-6xl font-bold text-[#84AAA6]/40">
            {provider.full_name.charAt(0)}
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f1a19]/90 via-[#0f1a19]/15 to-black/10" />

        {/* Felső sor: címke, galéria-pöttyök, kedvenc */}
        <div className="pointer-events-none absolute inset-x-3.5 top-3.5 flex items-start justify-between gap-2">
          {provider.featured ? (
            <span className="glass-strong inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#262626]">
              <Flame className={cn("h-4 w-4", FEATURED_COLOR[provider.featured])} />
              {FEATURED_LABEL[provider.featured] ?? "Kiemelt"}
            </span>
          ) : (
            <span className="glass-dark inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-white">
              <Eye className="h-3.5 w-3.5" /> {provider.view_count ?? 0}
            </span>
          )}
          {!isOwner && (
            <div className="pointer-events-auto glass-strong rounded-full">
              <FavoriteButton providerId={provider.id} initialLiked={initialLiked} onUnlike={onUnlike} iconOnly />
            </div>
          )}
        </div>

        {/* Alsó sáv: név, hely, értékelés, gombok */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white">
          <SlideBars count={shown.length} idx={idx} playing={playing} className="mb-3" />
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-2 ring-white/90 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]">
              {provider.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={provider.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-heading text-xl font-bold">{provider.full_name.charAt(0)}</span>
              )}
            </span>
            <div className="min-w-0">
              {cats.length > 0 && (
                <p className="truncate text-[11px] uppercase tracking-[0.14em] text-white/75">
                  {cats.slice(0, 2).map((c) => CATEGORY_LABELS[c] ?? c).join(" · ")}
                </p>
              )}
              <h3 className="mt-0.5 font-heading text-[21px] font-bold leading-tight line-clamp-2">{provider.full_name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-white/90">
                {counties.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />{counties[0]}{counties.length > 1 && ` +${counties.length - 1}`}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-white" />
                  {rating > 0 ? rating.toFixed(1) : "Új"}{reviews > 0 && ` (${reviews})`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="pointer-events-auto glass-dark inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold"
            >
              Bemutatkozás
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </button>
            {detailHref && (
              <a href={detailHref} className="pointer-events-auto glass-dark flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 text-[14px] font-semibold">
                Megnézem
                <span className="tile-cta flex h-8 w-8 items-center justify-center rounded-full">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Lenyíló fehér bemutatkozó panel – a kép alá csúszik */}
      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "-mt-8 grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className={cn("rounded-b-[30px] bg-white/85 backdrop-blur-xl px-5 pb-5 pt-12 ring-1 ring-black/[0.06] shadow-[inset_0_-3px_12px_rgba(20,45,42,0.10),inset_3px_0_10px_rgba(20,45,42,0.06),inset_-3px_0_10px_rgba(20,45,42,0.06)] transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}>
            {intro ? (
              <p className="text-[15px] leading-relaxed text-[#404040] whitespace-pre-line">{intro}</p>
            ) : (
              <p className="text-[15px] italic text-[#9ca3af]">Nincs még bemutatkozó szöveg.</p>
            )}
            {!isOwner && (
              <div className="mt-4 flex items-center gap-2">
                <ChatLink
                  href={`/profil?tab=chat&with=${provider.user_id}`}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#F0F6F5] text-[14px] font-semibold text-[#5C8480] ring-1 ring-[#84AAA6]/25 hover:bg-[#E3EFED]"
                >
                  <MessageCircle className="h-4 w-4" /> Chat
                </ChatLink>
                <LoginGateLink
                  href={quoteHrefFor(provider)}
                  message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
                  className="tile-cta flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold"
                >
                  <Send className="h-4 w-4" /> Ajánlatkérés
                </LoginGateLink>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewerAt !== null && (
        <GalleryViewer
          provider={provider}
          images={images}
          startAt={viewerAt}
          detailHref={detailHref}
          onClose={() => setViewerAt(null)}
        />
      )}
    </article>
  );
}

/* ── Listanézet sora (új dizájn) ─────────────────────────────────────────
   Bal oldalt lekerekített fotó (rajta a kiemelt jelzés), középen kategória,
   név, hely és értékelés, jobbra kedvenc és rózsaszín nyíl. A rövid
   bemutatkozás itt is a „Bemutatkozás” gombra nyílik le, fehér sávban. */
export function ProviderRow({
  provider,
  isOwner = false,
  backTo,
}: {
  provider: Provider;
  isOwner?: boolean;
  backTo?: string;
}) {
  const anchorId = backTo ? `provider-${provider.id}` : undefined;
  const backHref = backTo ? `${backTo.replace(/#.*$/, "")}#${anchorId}` : undefined;
  const detailHref = backHref
    ? `/providers/${provider.id}?from=${encodeURIComponent(backHref)}`
    : `/providers/${provider.id}`;
  const [open, setOpen] = useState(false);
  const [viewerAt, setViewerAt] = useState<number | null>(null);

  const cover = provider.gallery_urls?.[0] ?? provider.avatar_url;
  const rowImages = provider.gallery_urls?.length ? provider.gallery_urls : provider.avatar_url ? [provider.avatar_url] : [];
  const rating = provider.average_rating ?? 0;
  const reviews = provider.review_count ?? 0;
  const counties = provider.counties ?? [];
  const cats = provider.categories ?? [];
  const intro = provider.description?.trim();

  return (
    <article
      id={anchorId}
      className="scroll-mt-24 rounded-[26px] bg-white/85 p-2 ring-1 ring-white shadow-[0_16px_34px_-24px_rgba(20,45,42,0.5)]"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => rowImages.length > 0 && setViewerAt(0)}
          aria-label="Képek megtekintése"
          className={cn("relative h-[92px] w-[92px] sm:h-[104px] sm:w-[104px] shrink-0 overflow-hidden rounded-[20px] bg-[#EEF3F2]", rowImages.length > 0 && "cursor-zoom-in")}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={provider.full_name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center font-heading text-3xl font-bold text-[#84AAA6]/50">
              {provider.full_name.charAt(0)}
            </span>
          )}
          {provider.featured && (
            <span className="glass-strong absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full" title={FEATURED_LABEL[provider.featured]}>
              <Flame className={cn("h-3.5 w-3.5", FEATURED_COLOR[provider.featured])} />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1 py-1">
          {cats.length > 0 && (
            <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#5C8480]/80">
              {cats.slice(0, 2).map((c) => CATEGORY_LABELS[c] ?? c).join(" · ")}
            </p>
          )}
          <h3 className="mt-0.5 font-heading text-[17px] sm:text-[19px] font-bold leading-tight text-[#262626] line-clamp-1">
            {provider.full_name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[13px] text-[#6b7280]">
            {counties.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />{counties[0]}{counties.length > 1 && ` +${counties.length - 1}`}
              </span>
            )}
            <span className="inline-flex items-center gap-1 font-semibold text-[#262626]">
              <Star className="h-3.5 w-3.5 fill-[#262626]" />
              {rating > 0 ? rating.toFixed(1) : "Új"}
              {reviews > 0 && <span className="font-normal text-[#6b7280]">({reviews})</span>}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-[#84AAA6]"
          >
            Bemutatkozás
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 self-stretch justify-between py-1 pr-1">
          {!isOwner ? (
            <div className="rounded-full bg-[#F0F6F5]">
              <FavoriteButton providerId={provider.id} initialLiked={false} iconOnly />
            </div>
          ) : <span />}
          <a href={detailHref} aria-label="Megnézem" className="tile-cta flex h-10 w-10 items-center justify-center rounded-full">
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className={cn("mt-2 rounded-[20px] bg-white/85 backdrop-blur-xl px-4 py-3.5 ring-1 ring-black/[0.06] shadow-[inset_0_-3px_12px_rgba(20,45,42,0.10),inset_3px_0_10px_rgba(20,45,42,0.06),inset_-3px_0_10px_rgba(20,45,42,0.06)] transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}>
            {intro ? (
              <p className="text-[14.5px] leading-relaxed text-[#404040] whitespace-pre-line">{intro}</p>
            ) : (
              <p className="text-[14.5px] italic text-[#9ca3af]">Nincs még bemutatkozó szöveg.</p>
            )}
            {!isOwner && (
              <div className="mt-3 flex items-center gap-2">
                <ChatLink
                  href={`/profil?tab=chat&with=${provider.user_id}`}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#F0F6F5] text-[14px] font-semibold text-[#5C8480] ring-1 ring-[#84AAA6]/25 hover:bg-[#E3EFED]"
                >
                  <MessageCircle className="h-4 w-4" /> Chat
                </ChatLink>
                <LoginGateLink
                  href={quoteHrefFor(provider)}
                  message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
                  className="tile-cta flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[14px] font-semibold"
                >
                  <Send className="h-4 w-4" /> Ajánlatkérés
                </LoginGateLink>
              </div>
            )}
          </div>
        </div>
      </div>
      {viewerAt !== null && (
        <GalleryViewer
          provider={provider}
          images={rowImages}
          startAt={viewerAt}
          detailHref={detailHref}
          onClose={() => setViewerAt(null)}
        />
      )}
    </article>
  );
}


/* ── Képnézegető ─────────────────────────────────────────────────────────
   A kártya képére koppintva teljes képernyőn, egymás alatt, görgethetően
   mutatja a szolgáltató összes képét; a megérintett kép látszik elsőként.
   A részletes profilra csak a Megnézem gomb visz. */
function GalleryViewer({
  provider,
  images,
  startAt,
  detailHref,
  onClose,
}: {
  provider: Provider;
  images: string[];
  startAt: number;
  detailHref?: string;
  onClose: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  /* A szülő (lapozó slideshow) újrarajzolásai ne indítsák újra a hatást:
     a bezáró függvényt ref-ből olvassuk. */
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    /* A megérintett kép legyen elöl. */
    const target = listRef.current?.querySelector<HTMLElement>(`[data-idx="${startAt}"]`);
    target?.scrollIntoView({ block: "start" });
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [startAt]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0b1110]/95 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${provider.full_name} képei`}>
      <div className="flex items-center gap-3 px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))] text-white">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-2 ring-white/80">
          {provider.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={provider.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-heading font-bold">{provider.full_name.charAt(0)}</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight">{provider.full_name}</p>
          <p className="text-[12px] text-white/65">{images.length} kép</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Bezárás" className="glass-dark flex h-10 w-10 items-center justify-center rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-3 pb-28">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src + i} data-idx={i} src={src} alt="" className="w-full scroll-mt-2 rounded-[22px] object-cover" />
          ))}
        </div>
      </div>

      {detailHref && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-10 bg-gradient-to-t from-[#0b1110] to-transparent">
          <a href={detailHref} className="pointer-events-auto tile-cta flex h-12 items-center gap-2 rounded-full pl-6 pr-2 text-[16px] font-semibold">
            Megnézem
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25">
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      )}
    </div>,
    document.body
  );
}
