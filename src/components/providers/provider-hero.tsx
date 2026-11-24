"use client";

import { MapPin, Star, Eye, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, type Provider } from "@/lib/types";
import { FEATURED_COLOR, FEATURED_LABEL, SlideBars, useSlideshow } from "@/components/providers/provider-tile";

/* ── A szolgáltatói profil nagy fotós kártyája ──────────────────────────
   Ugyanaz a megjelenés, mint a listák kártyáján (ProviderTile), csak
   nagyobban: magától lapozó galéria töltődő csíkokkal, felül a kiemelt
   címke és a műveletek, alul avatar + kategória / név / megye / értékelés. */
export function ProviderHero({
  provider,
  actions,
}: {
  provider: Provider;
  /** Jobb felső sarok: megosztás, kedvenc / szerkesztés. */
  actions?: React.ReactNode;
}) {
  const images = [...(provider.gallery_urls ?? [])];
  if (images.length === 0 && provider.avatar_url) images.push(provider.avatar_url);
  const shown = images.slice(0, 10);
  const { stripRef, cardRef, idx, onScroll, playing, holdHandlers } = useSlideshow(shown.length);

  const rating = provider.average_rating ?? 0;
  const reviews = provider.review_count ?? 0;
  const counties = provider.counties ?? [];
  const cats = provider.categories ?? [];

  return (
    <div
      ref={cardRef}
      {...holdHandlers}
      className="relative overflow-hidden rounded-[30px] bg-[#EEF3F2] aspect-[4/4.6] sm:aspect-[16/10] ring-1 ring-white/70 shadow-[0_30px_50px_-28px_rgba(20,45,42,0.6)]"
    >
      {shown.length > 0 ? (
        <div ref={stripRef} onScroll={onScroll} className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scrollbar-none">
          {shown.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src + i} src={src} alt={i === 0 ? provider.full_name : ""} className="h-full w-full shrink-0 snap-center object-cover" />
          ))}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center font-heading text-8xl font-bold text-[#84AAA6]/40">
          {provider.full_name.charAt(0)}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f1a19]/90 via-[#0f1a19]/10 to-black/15" />

      <div className="pointer-events-none absolute inset-x-3.5 top-3.5 flex items-start justify-between gap-2">
        {provider.featured ? (
          <span className="glass-strong inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#262626]">
            <Flame className={cn("h-4 w-4", FEATURED_COLOR[provider.featured])} />
            {FEATURED_LABEL[provider.featured] ?? "Kiemelt"}
          </span>
        ) : <span />}
        {actions && <div className="pointer-events-auto flex items-center gap-2">{actions}</div>}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white">
        <SlideBars count={shown.length} idx={idx} playing={playing} className="mb-3.5" />
        <div className="flex items-center gap-3.5">
          <span className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 ring-2 ring-white/90 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]">
            {provider.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={provider.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-heading text-2xl font-bold">{provider.full_name.charAt(0)}</span>
            )}
          </span>
          <div className="min-w-0">
            {cats.length > 0 && (
              <p className="truncate text-[11px] sm:text-xs uppercase tracking-[0.14em] text-white/75">
                {cats.slice(0, 3).map((c) => CATEGORY_LABELS[c] ?? c).join(" · ")}
              </p>
            )}
            <h1 className="mt-0.5 font-heading text-[24px] sm:text-[34px] font-bold leading-tight line-clamp-2">{provider.full_name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] sm:text-[15px] text-white/90">
              {counties.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />{counties.slice(0, 2).join(", ")}{counties.length > 2 && ` +${counties.length - 2}`}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-white" />
                {rating > 0 ? rating.toFixed(1) : "Új"}{reviews > 0 && ` (${reviews})`}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-4 w-4" />{provider.view_count ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
