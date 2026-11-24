"use client";

import { useRef, useState } from "react";
import { MapPin, Star, MessageCircle, ArrowRight, Flame, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, type Provider } from "@/lib/types";
import { FavoriteButton } from "@/components/providers/favorite-button";
import { ChatLink } from "@/components/providers/masked-contact";

/* ── Képközpontú szolgáltatói kártya (új dizájn) ─────────────────────────
   Nagy, ujjal lapozható galéria lekerekített sarkokkal, rajta üveg
   címkék (Kiemelt, kedvenc), alatta név, hely, értékelés és a két
   művelet. A rácsnézet ezt használja; a listanézet és a profil-előnézet
   továbbra is a ProviderCard-ot. */

const FEATURED_LABEL: Record<string, string> = {
  gold: "Arany partner",
  silver: "Ezüst partner",
  teal: "Kiemelt",
};

export function ProviderTile({
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
  const detailHref = backHref ? `/providers/${provider.id}?from=${encodeURIComponent(backHref)}` : `/providers/${provider.id}`;

  const images = [...(provider.gallery_urls ?? [])];
  if (images.length === 0 && provider.avatar_url) images.push(provider.avatar_url);
  const shown = images.slice(0, 6);

  const [idx, setIdx] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  };

  const rating = provider.average_rating ?? 0;
  const reviews = provider.review_count ?? 0;
  const counties = provider.counties ?? [];
  const cats = provider.categories ?? [];

  return (
    <article id={anchorId} className="group scroll-mt-24 flex h-full flex-col rounded-[28px] bg-white/80 p-2 ring-1 ring-white shadow-[0_18px_40px_-24px_rgba(90,20,60,0.45)] transition-shadow hover:shadow-[0_24px_50px_-22px_rgba(90,20,60,0.55)]">
      {/* Galéria */}
      <div className="relative overflow-hidden rounded-[22px] bg-[#F6E4EC] aspect-[4/3]">
        {shown.length > 0 ? (
          <div
            ref={stripRef}
            onScroll={onScroll}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scrollbar-none"
          >
            {shown.map((src, i) => (
              <a key={src + i} href={detailHref} className="relative h-full w-full shrink-0 snap-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={i === 0 ? provider.full_name : ""} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              </a>
            ))}
          </div>
        ) : (
          <a href={detailHref} className="flex h-full items-center justify-center font-heading text-5xl font-bold text-[#E8336A]/50">
            {provider.full_name.charAt(0)}
          </a>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          {provider.featured ? (
            <span className="glass-strong inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-[#1F1A2E]">
              <Flame className="h-3.5 w-3.5 fill-[#E8336A] text-[#E8336A]" />
              {FEATURED_LABEL[provider.featured] ?? "Kiemelt"}
            </span>
          ) : <span />}
          {!isOwner && (
            <div className="glass-strong rounded-full">
              <FavoriteButton providerId={provider.id} initialLiked={false} iconOnly />
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between">
          <span className="glass-dark inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white">
            <Eye className="h-3.5 w-3.5" /> {provider.view_count ?? 0}
          </span>
          {shown.length > 1 && (
            <span className="flex gap-1">
              {shown.map((_, i) => (
                <span key={i} className={cn("h-1.5 rounded-full bg-white transition-all", i === idx ? "w-4" : "w-1.5 opacity-60")} />
              ))}
            </span>
          )}
        </div>
      </div>

      {/* Szöveg */}
      <div className="flex flex-1 flex-col px-2.5 pb-1.5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <a href={detailHref} className="min-w-0">
            <h3 className="font-heading text-[18px] font-bold leading-snug text-[#1F1A2E] line-clamp-1 group-hover:text-[#E8336A] transition-colors">
              {provider.full_name}
            </h3>
          </a>
          <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold text-[#1F1A2E]">
            <Star className="h-4 w-4 fill-[#1F1A2E]" />
            {rating > 0 ? rating.toFixed(2).replace(/0$/, "") : "Új"}
            {reviews > 0 && <span className="font-normal text-[#6B6480]">({reviews})</span>}
          </span>
        </div>

        {counties.length > 0 && (
          <p className="mt-0.5 flex items-center gap-1 text-[14px] text-[#6B6480]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{counties[0]}{counties.length > 1 && ` +${counties.length - 1}`}</span>
          </p>
        )}

        {cats.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {cats.slice(0, 2).map((c) => (
              <span key={c} className="rounded-full bg-[#FDEEF3] px-2.5 py-0.5 text-[12px] font-medium text-[#B3264F]">
                {CATEGORY_LABELS[c] ?? c}
              </span>
            ))}
            {cats.length > 2 && <span className="text-[12px] font-medium text-[#B3264F]">+{cats.length - 2}</span>}
          </div>
        )}

        {provider.description && (
          <p className="mt-2 text-[14px] leading-snug text-[#4A4360] line-clamp-2">{provider.description}</p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3">
          <ChatLink
            href={`/profil?tab=chat&with=${provider.user_id}`}
            aria-label="Chat indítása"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDEEF3] text-[#E8336A] transition-colors hover:bg-[#FBD9E5]"
          >
            <MessageCircle className="h-5 w-5" />
          </ChatLink>
          <a href={detailHref} className="rose-cta flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-semibold">
            Részletek <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
