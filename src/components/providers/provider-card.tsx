"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Eye, Phone, Mail, Globe, MessageCircle, Star, MapPin, Pencil, Images, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { FavoriteButton } from "@/components/providers/favorite-button";

interface ProviderCardProps {
  provider: Provider;
  showStatus?: boolean;
  initialLiked?: boolean;
  onUnlike?: (id: string) => void;
  hideCategories?: boolean;
  disableLink?: boolean;
  isOwner?: boolean;
  nameFontSize?: string;
  /** Carousel mode: fixed name height, no collapsible content, Részletek button */
  inCarousel?: boolean;
  /** List row mode: horizontal compact layout */
  listView?: boolean;
}

export function ProviderCard({ provider, showStatus = false, initialLiked = false, onUnlike, hideCategories = false, disableLink = false, isOwner = false, nameFontSize = "22px", inCarousel = false, listView = false }: ProviderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [catExpanded, setCatExpanded] = useState(false);
  const [countyExpanded, setCountyExpanded] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  // Swipe tracking for gallery lightbox
  const swipeStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const rating = provider.average_rating ?? 0;
  const reviewCount = provider.review_count ?? 0;
  const viewCount = provider.view_count ?? 0;
  const galleryUrls = provider.gallery_urls ?? [];
  const hasGallery = galleryUrls.length > 0;

  // Keyboard navigation for gallery lightbox
  useEffect(() => {
    if (!galleryOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setGalleryIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setGalleryIndex((i) => Math.min(galleryUrls.length - 1, i + 1));
      if (e.key === "Escape") setGalleryOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [galleryOpen, galleryUrls.length]);

  const tc = provider.featured === "gold"
    ? { text: "text-amber-600", textHover: "hover:text-amber-700", groupHover: "group-hover:text-amber-600", border50: "border-amber-300", bg10: "bg-amber-50", hoverBg20: "hover:bg-amber-100", bgFill: "bg-amber-400", hoverBgFill: "hover:bg-amber-500", buttonText: "text-amber-950", borderBase: "border-amber-200", borderHover: "hover:border-amber-400", badgeClass: "border-amber-300 text-amber-700 bg-amber-50", featuredBadgeClass: "bg-amber-50 text-amber-700 border-amber-300" }
    : provider.featured === "silver"
    ? { text: "text-slate-500", textHover: "hover:text-slate-600", groupHover: "group-hover:text-slate-500", border50: "border-slate-300", bg10: "bg-slate-50", hoverBg20: "hover:bg-slate-100", bgFill: "bg-slate-500", hoverBgFill: "hover:bg-slate-600", buttonText: "text-white", borderBase: "border-slate-200", borderHover: "hover:border-slate-400", badgeClass: "border-slate-300 text-slate-500 bg-slate-50", featuredBadgeClass: "bg-slate-100 text-slate-600 border-slate-300" }
    : provider.featured === "teal"
    ? { text: "text-[#84AAA6]", textHover: "hover:text-[#6B8E8A]", groupHover: "group-hover:text-[#84AAA6]", border50: "border-[#84AAA6]/50", bg10: "bg-[#84AAA6]/10", hoverBg20: "hover:bg-[#84AAA6]/20", bgFill: "bg-[#84AAA6]", hoverBgFill: "hover:bg-[#6B8E8A]", buttonText: "text-white", borderBase: "border-[#84AAA6]/40", borderHover: "hover:border-[#84AAA6]", badgeClass: "border-[#84AAA6]/40 text-[#5C8480] bg-[#EDF4F3]", featuredBadgeClass: "bg-[#EDF4F3] text-[#5C8480] border-[#84AAA6]/40" }
    : { text: "text-[#84AAA6]", textHover: "hover:text-[#6B8E8A]", groupHover: "group-hover:text-[#84AAA6]", border50: "border-[#84AAA6]/50", bg10: "bg-[#84AAA6]/10", hoverBg20: "hover:bg-[#84AAA6]/20", bgFill: "bg-[#84AAA6]", hoverBgFill: "hover:bg-[#6B8E8A]", buttonText: "text-white", borderBase: "border-gray-200", borderHover: "hover:border-[#84AAA6]", badgeClass: "", featuredBadgeClass: "" };

  // ── List row mode ──────────────────────────────────────────────────────────
  if (listView && !disableLink) {
    return (
      <div className={cn("flex items-center gap-3 bg-[#FCFCFC] rounded-xl border shadow-sm hover:shadow-md transition-all px-4 py-3", tc.borderBase, tc.borderHover)}>
        {/* Avatar */}
        <button
          type="button"
          onClick={() => provider.avatar_url && setAvatarOpen(true)}
          className={cn(
            "w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center shrink-0",
            provider.avatar_url ? "cursor-zoom-in" : "cursor-default"
          )}
        >
          {provider.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={provider.avatar_url ?? ""} alt={provider.full_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-gray-900">{provider.full_name.charAt(0)}</span>
          )}
        </button>

        {avatarOpen && provider.avatar_url && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 cursor-zoom-out" onClick={() => setAvatarOpen(false)}>
            <button type="button" onClick={() => setAvatarOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 bg-black/30 hover:bg-black/60 rounded-full transition-colors">
              <X className="h-7 w-7" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={provider.avatar_url} alt={provider.full_name} onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl select-none" />
          </div>,
          document.body
        )}

        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate" style={{ fontSize: "16px" }}>{provider.full_name}</div>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <MapPin className={`h-3 w-3 ${tc.text} shrink-0`} />
            <span className="truncate">
              {(provider.counties ?? []).slice(0, 2).join(", ")}
              {(provider.counties ?? []).length > 2 && ` +${(provider.counties ?? []).length - 2}`}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={cn("h-3 w-3", star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")} />
            ))}
            <span className="text-sm font-semibold text-gray-900 ml-0.5">{rating > 0 ? rating.toFixed(1) : "–"}</span>
            {reviewCount > 0 && <span className="text-sm text-gray-500">({reviewCount})</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a href={`/profil?tab=chat&with=${provider.user_id}`} className={`hidden sm:flex items-center gap-1.5 text-sm font-medium ${tc.text} border ${tc.border50} ${tc.bg10} ${tc.hoverBg20} transition-colors px-3 py-1.5 rounded-full whitespace-nowrap`}>
            <MessageCircle className="h-3.5 w-3.5" />
            Chat indítása
          </a>
          <a href={`/providers/${provider.id}`} className={`flex items-center gap-1.5 text-sm font-medium ${tc.buttonText} ${tc.bgFill} ${tc.hoverBgFill} transition-colors px-3 py-1.5 rounded-full whitespace-nowrap`}>
            Részletek
          </a>
        </div>
      </div>
    );
  }

  // ── Rating content helper ────────────────────────────────────────────────
  const ratingContent = (
    <>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            inCarousel ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4",
            star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
      <span className={cn(inCarousel ? "text-sm sm:text-base" : "text-base", "font-semibold text-gray-900 ml-1")}>{rating > 0 ? rating.toFixed(1) : "–"}</span>
      {reviewCount > 0 && <span className={cn(inCarousel ? "text-sm sm:text-base" : "text-base", "text-gray-900")}>({reviewCount})</span>}
    </>
  );

  const showFeaturedBadge = !!provider.featured;
  const headerBg = provider.featured === "gold" ? "#FFFBEB" : provider.featured === "silver" ? "#F8FAFC" : provider.featured === "teal" ? "#EDF4F3" : "#F0F6F5";

  return (
    <div className={cn("relative h-full", (!inCarousel || showFeaturedBadge) && "pt-3.5")}>
      {showFeaturedBadge && (
        <span className={cn(
          "absolute top-3.5 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap border",
          tc.featuredBadgeClass
        )}>
          Kiemelt szolgáltató
        </span>
      )}
    <div
      className={cn(
        "bg-[#FCFCFC] rounded-xl border shadow-sm flex flex-col overflow-hidden h-full",
        tc.borderBase,
        !disableLink && `${tc.borderHover} hover:shadow-md transition-all group`
      )}
    >
      {/* ── CAROUSEL mode: stacked centered header ─────────────────────── */}
      {inCarousel && (
        <div className="relative flex flex-col items-center pt-8 px-7 pb-6" style={{ backgroundColor: headerBg }}>
          {/* Avatar */}
          <div
            className={cn(
              "w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 bg-gray-100 flex items-center justify-center shrink-0",
              provider.avatar_url && "cursor-zoom-in"
            )}
            onClick={() => { window.location.href = `/providers/${provider.id}`; }}
          >
            {provider.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={provider.avatar_url ?? ""} alt={provider.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-gray-900">{provider.full_name.charAt(0)}</span>
            )}
          </div>

          {/* Name */}
          <h3
            className="font-bold text-gray-900 text-center mb-2 line-clamp-2 leading-snug w-full group-hover:text-[#84AAA6] transition-colors text-[18px] sm:text-[20px]"
            style={{ height: "calc(2 * 1.35 * 20px)", overflow: "hidden" }}
          >
            {provider.full_name}
          </h3>

          {!hideCategories && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1.5">
              {(catExpanded ? provider.categories ?? [] : (provider.categories ?? []).slice(0, 1)).map((cat) => (
                <Badge key={cat} variant="outline" className={cn("text-[9px] sm:text-[13px]", tc.badgeClass)}>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}</Badge>
              ))}
              {(provider.categories ?? []).length > 1 && !catExpanded && (
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCatExpanded(true); }} className={cn("text-[9px] sm:text-[13px] font-medium underline underline-offset-2", tc.text)}>
                  +{(provider.categories ?? []).length - 1} több
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-1 mb-2">
            <MapPin className={`h-3.5 w-3.5 shrink-0 ${tc.text}`} />
            <span className="text-xs sm:text-sm text-gray-900 text-center">
              {countyExpanded ? (provider.counties ?? []).join(", ") : ((provider.counties ?? [])[0] ?? "")}
            </span>
            {(provider.counties ?? []).length > 1 && !countyExpanded && (
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCountyExpanded(true); }} className={cn("text-xs sm:text-sm font-medium underline underline-offset-2", tc.text)}>
                +{(provider.counties ?? []).length - 1} több
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">{ratingContent}</div>
        </div>
      )}

      {/* ── REGULAR card: compact horizontal header ──────────────────────── */}
      {!inCarousel && (
        <div className="relative flex items-center gap-3 px-4 pt-10 pb-3" style={{ backgroundColor: headerBg }}>
          {/* Absolute action buttons */}
          {!disableLink && (
            <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
              {isOwner ? (
                <a href="/profil?tab=provider" className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/80 border border-gray-200 ${tc.text} ${tc.textHover}`}>
                  <Pencil className="h-4 w-4" />
                </a>
              ) : (
                <FavoriteButton providerId={provider.id} initialLiked={initialLiked} onUnlike={onUnlike} hideTextOnMobile iconOnly />
              )}
            </div>
          )}
          <div className="absolute top-2 right-2 z-10">
            <span className="flex items-center gap-1 text-sm text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-200 bg-white/80">
              <Eye className="h-3.5 w-3.5" />
              {viewCount}
            </span>
          </div>

          {/* Avatar */}
          <div
            className={cn(
              "w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center shrink-0 ml-1",
              provider.avatar_url && "cursor-zoom-in"
            )}
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation();
              if (provider.avatar_url) setAvatarOpen(true);
            }}
          >
            {provider.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={provider.avatar_url ?? ""} alt={provider.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-gray-900">{provider.full_name.charAt(0)}</span>
            )}
          </div>

          {/* Info: name, counties, stars */}
          <div className="flex-1 min-w-0 pr-14">
            <h3 className={`font-bold text-gray-900 truncate text-[18px] leading-snug transition-colors ${tc.groupHover}`}>
              {provider.full_name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <MapPin className={`h-3.5 w-3.5 shrink-0 ${tc.text}`} />
              <span className="text-sm text-gray-900 truncate">
                {countyExpanded ? (provider.counties ?? []).join(", ") : ((provider.counties ?? [])[0] ?? "")}
              </span>
              {(provider.counties ?? []).length > 1 && !countyExpanded && (
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCountyExpanded(true); }} className={cn("text-sm font-medium underline underline-offset-2", tc.text)}>
                  +{(provider.counties ?? []).length - 1} több
                </button>
              )}
            </div>
            {!disableLink ? (
              <a href={`/providers/${provider.id}#reviews`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 mt-0.5 hover:opacity-70 transition-opacity">
                {ratingContent}
              </a>
            ) : (
              <div className="flex items-center gap-1 mt-0.5">{ratingContent}</div>
            )}
            {showStatus && (
              <Badge
                variant={provider.approval_status === "approved" ? "approved" : provider.approval_status === "rejected" ? "rejected" : "pending"}
                className="mt-1.5 text-xs"
              >
                {provider.approval_status === "approved" ? "Jóváhagyva" : provider.approval_status === "rejected" ? "Elutasítva" : "Jóváhagyásra vár"}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* ── Gallery strip — slowly scrolling right→left (non-carousel only) */}
      {hasGallery && !inCarousel && (
        <div className="overflow-hidden border-t border-b border-gray-200" style={{ height: "84px", backgroundColor: "white" }}>
          {galleryUrls.length === 1 ? (
            <button
              type="button"
              className="w-full h-full overflow-hidden focus:outline-none"
              onClick={() => { setGalleryIndex(0); setGalleryOpen(true); }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={galleryUrls[0]} alt="Galéria" className="w-full h-full object-cover" draggable={false} />
            </button>
          ) : (
            <div
              className="flex"
              style={{
                width: "max-content",
                animation: `carousel-scroll ${galleryUrls.length * 5 + 10}s linear infinite`,
              }}
            >
              {[...galleryUrls, ...galleryUrls].map((url, i) => (
                <button
                  key={i}
                  type="button"
                  className="h-[84px] flex-shrink-0 overflow-hidden focus:outline-none px-[2.5px] py-[5px]"
                  style={{ aspectRatio: "4/3" }}
                  onClick={(e) => { e.stopPropagation(); setGalleryIndex(i % galleryUrls.length); setGalleryOpen(true); }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile expand/collapse row */}
      {!inCarousel && (
        <div className="sm:hidden flex items-center justify-center py-2.5 bg-white border-b border-gray-100">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); setExpanded((v) => !v); }}
            className={`flex items-center gap-1.5 text-sm font-semibold ${tc.text} ${tc.textHover} transition-colors`}
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            <span>{expanded ? "Bezár" : "Több infó"}</span>
          </button>
        </div>
      )}

      {/* Contact info */}
      {!inCarousel && (
        <div className={cn("px-5 py-4 space-y-2 flex-1", expanded ? "block" : "hidden sm:block")}>
          <ContactRow icon={<Phone className={`h-4 w-4 ${tc.text}`} />} value={provider.phone} />
          <ContactRow icon={<Mail className={`h-4 w-4 ${tc.text}`} />} value={provider.email} />
          {provider.website && (
            <ContactRow icon={<Globe className={`h-4 w-4 ${tc.text}`} />} value={provider.website} isLink={!disableLink} linkColor={tc.text} />
          )}
          {provider.description && (
            <div className="flex gap-2.5">
              <MessageCircle className={`h-4 w-4 ${tc.text} shrink-0 mt-0.5`} />
              <p className="text-base text-gray-900 leading-relaxed">
                {!descExpanded && provider.description.length > 200
                  ? provider.description.slice(0, 200) + "…"
                  : provider.description}
                {provider.description.length > 200 && (
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDescExpanded(v => !v); }} className={`${tc.text} hover:underline font-medium ml-1 text-sm`}>
                    {descExpanded ? "kevesebb" : "több..."}
                  </button>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {!inCarousel && !disableLink && (
        <div className={cn("border-t border-gray-100 px-4 py-3 items-center gap-2", expanded ? "flex" : "hidden sm:flex")}>
          {/* Category badges — desktop only, left side */}
          {!hideCategories && (
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
              {(catExpanded ? provider.categories ?? [] : (provider.categories ?? []).slice(0, 1)).map((cat) => (
                <Badge key={cat} variant="outline" className={cn("text-xs", tc.badgeClass)}>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}</Badge>
              ))}
              {(provider.categories ?? []).length > 1 && !catExpanded && (
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCatExpanded(true); }} className={cn("text-xs font-medium underline underline-offset-2", tc.text)}>
                  +{(provider.categories ?? []).length - 1} több
                </button>
              )}
            </div>
          )}
          {/* Chat + Részletek grouped — always pushed to right */}
          <div className="flex items-center gap-2 ml-auto">
            <a href={`/profil?tab=chat&with=${provider.user_id}`} onClick={(e) => e.stopPropagation()} className={`flex items-center gap-1.5 text-sm font-medium ${tc.text} border ${tc.border50} ${tc.bg10} ${tc.hoverBg20} transition-colors px-3 py-1.5 rounded-full whitespace-nowrap`}>
              <MessageCircle className="h-3.5 w-3.5" />
              Chat indítása
            </a>
            <a href={`/providers/${provider.id}`} onClick={(e) => e.stopPropagation()} className={`flex items-center gap-1.5 text-sm font-medium ${tc.buttonText} ${tc.bgFill} ${tc.hoverBgFill} transition-colors px-3 py-1.5 rounded-full whitespace-nowrap`}>
              Részletek
            </a>
          </div>
        </div>
      )}

      {/* ── Gallery lightbox — tap image or backdrop to close, swipe to navigate */}
      {galleryOpen && hasGallery && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={(e) => {
            if (didSwipe.current) { didSwipe.current = false; return; }
            setGalleryOpen(false);
          }}
          onTouchStart={(e) => { swipeStartX.current = e.touches[0].clientX; didSwipe.current = false; }}
          onTouchEnd={(e) => {
            if (swipeStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - swipeStartX.current;
            if (Math.abs(dx) > 45) {
              didSwipe.current = true;
              if (dx < 0 && galleryIndex < galleryUrls.length - 1) setGalleryIndex((i) => i + 1);
              else if (dx > 0 && galleryIndex > 0) setGalleryIndex((i) => i - 1);
            }
            swipeStartX.current = null;
          }}
        >
          {galleryIndex > 0 && (
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-black/30 hover:bg-black/60 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); setGalleryIndex((i) => i - 1); }}
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setGalleryOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 bg-black/30 hover:bg-black/60 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={galleryUrls[galleryIndex]}
            alt={`Galéria ${galleryIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg select-none"
            onClick={(e) => e.stopPropagation()}
          />

          {galleryIndex < galleryUrls.length - 1 && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 bg-black/30 hover:bg-black/60 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); setGalleryIndex((i) => i + 1); }}
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          )}

          {galleryUrls.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full pointer-events-none">
              {galleryIndex + 1} / {galleryUrls.length}
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Avatar lightbox */}
      {!inCarousel && avatarOpen && provider.avatar_url && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center" onClick={() => setAvatarOpen(false)}>
          <button type="button" onClick={() => setAvatarOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 bg-black/30 hover:bg-black/60 rounded-full transition-colors">
            <X className="h-7 w-7" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={provider.avatar_url} alt={provider.full_name} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl select-none" />
        </div>,
        document.body
      )}
    </div>
    </div>
  );
}

function ContactRow({
  icon,
  value,
  isLink = false,
  linkColor = "text-[#84AAA6]",
}: {
  icon: React.ReactNode;
  value: string;
  isLink?: boolean;
  linkColor?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="shrink-0 mt-0.5">{icon}</span>
      {isLink ? (
        <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className={`text-base ${linkColor} hover:underline break-all`}>
          {value}
        </a>
      ) : (
        <span className="text-base text-gray-900 break-all">{value}</span>
      )}
    </div>
  );
}
