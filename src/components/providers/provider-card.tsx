"use client";

import { useState } from "react";
import { Eye, Phone, Mail, Globe, MessageSquare, Star, MapPin, Pencil, Images, ChevronDown, ChevronUp } from "lucide-react";
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
}

export function ProviderCard({ provider, showStatus = false, initialLiked = false, onUnlike, hideCategories = false, disableLink = false, isOwner = false, nameFontSize = "22px", inCarousel = false }: ProviderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const rating = provider.average_rating ?? 0;
  const reviewCount = provider.review_count ?? 0;
  const viewCount = provider.view_count ?? 0;
  const hasGallery = (provider.gallery_urls ?? []).length > 0;

  const Wrapper = disableLink ? "div" : "a";
  const wrapperProps = disableLink ? {} : { href: `/providers/${provider.id}` };

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "bg-[#FCFCFC] rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden",
        disableLink ? "cursor-default" : "hover:border-[#84AAA6] hover:shadow-md transition-all cursor-pointer group"
      )}
    >
      {/* Header */}
      <div className="relative flex flex-col items-center pt-6 px-5 pb-4" style={{ backgroundColor: "#F0F6F5" }}>
        {/* Top-left: edit (owner) or favorite — hidden in carousel */}
        {!inCarousel && !disableLink && (
          <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
            {isOwner ? (
              <a href="/profil?tab=provider" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 border border-gray-200 text-[#84AAA6] hover:text-[#6B8E8A]">
                <Pencil className="h-4 w-4" />
              </a>
            ) : (
              <FavoriteButton providerId={provider.id} initialLiked={initialLiked} onUnlike={onUnlike} hideTextOnMobile iconOnly />
            )}
          </div>
        )}

        {/* Top-right: view count — hidden in carousel */}
        {!inCarousel && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 text-sm text-gray-700 px-2.5 py-1.5 rounded-full border border-gray-200 bg-white/80">
              <Eye className="h-3.5 w-3.5" />
              {viewCount}
            </span>
          </div>
        )}

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 bg-gray-100 flex items-center justify-center shrink-0">
          {provider.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.avatar_url}
              alt={provider.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-900">
              {provider.full_name.charAt(0)}
            </span>
          )}
        </div>

        {/* Name */}
        <h3
          className={cn(
            "font-bold text-gray-900 text-center mb-2 group-hover:text-[#84AAA6] transition-colors",
            inCarousel && "line-clamp-2 leading-snug w-full"
          )}
          style={{
            fontSize: nameFontSize,
            ...(inCarousel ? { height: "calc(2 * 1.35 * 18px)", overflow: "hidden" } : {}),
          }}
        >
          {provider.full_name}
        </h3>

        {/* Categories */}
        {!hideCategories && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1.5">
            {(provider.categories ?? []).slice(0, 2).map((cat) => (
              <Badge key={cat} variant="outline" className="text-sm sm:text-base">
                {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
              </Badge>
            ))}
            {(provider.categories ?? []).length > 2 && (
              <Badge variant="outline" className="text-sm sm:text-base">
                +{(provider.categories ?? []).length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Counties */}
        <div className="flex flex-wrap items-center justify-center gap-1 mb-2">
          <MapPin className="h-3.5 w-3.5 text-[#84AAA6] shrink-0" />
          <span className="text-sm sm:text-base text-gray-900">
            {(provider.counties ?? []).slice(0, 2).join(", ")}
            {(provider.counties ?? []).length > 2 && ` +${(provider.counties ?? []).length - 2}`}
          </span>
        </div>

        {/* Rating – both mobile and desktop */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= Math.round(rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-200"
              )}
            />
          ))}
          <span className="text-base font-semibold text-gray-900 ml-1">
            {rating > 0 ? rating.toFixed(1) : "–"}
          </span>
          {reviewCount > 0 && (
            <span className="text-base text-gray-900">({reviewCount})</span>
          )}
        </div>

        {/* Admin status badge */}
        {showStatus && (
          <Badge
            variant={
              provider.approval_status === "approved"
                ? "approved"
                : provider.approval_status === "rejected"
                ? "rejected"
                : "pending"
            }
            className="mt-2 text-base"
          >
            {provider.approval_status === "approved"
              ? "Jóváhagyva"
              : provider.approval_status === "rejected"
              ? "Elutasítva"
              : "Jóváhagyásra vár"}
          </Badge>
        )}

        {/* Mobile expand/collapse toggle — hidden in carousel mode */}
        {!inCarousel && (
          <div className="sm:hidden flex justify-center w-full mt-3">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded((v) => !v); }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm text-[#84AAA6] hover:text-[#6B8E8A] transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        )}

        {/* Carousel mode: category badge(s) at bottom */}
        {inCarousel && (provider.categories ?? []).length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {(provider.categories ?? []).slice(0, 2).map((cat) => (
              <Badge key={cat} variant="outline" className="text-xs">
                {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Contact info — hidden in carousel mode */}
      {!inCarousel && (
        <div className={cn("px-5 py-4 space-y-2 flex-1", expanded ? "block" : "hidden sm:block")}>
          <ContactRow icon={<Phone className="h-4 w-4 text-[#84AAA6]" />} value={provider.phone} />
          <ContactRow icon={<Mail className="h-4 w-4 text-[#84AAA6]" />} value={provider.email} />
          {provider.website && (
            <ContactRow
              icon={<Globe className="h-4 w-4 text-[#84AAA6]" />}
              value={provider.website}
              isLink={!disableLink}
            />
          )}
          {provider.description && (
            <div className="flex gap-2.5">
              <MessageSquare className="h-4 w-4 text-[#84AAA6] shrink-0 mt-0.5" />
              <p className="text-base text-gray-900 line-clamp-3 leading-relaxed">
                {provider.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer action bar — hidden in carousel mode */}
      {!inCarousel && !disableLink && (
        <div className={cn("border-t border-gray-100 px-4 py-3 items-center justify-between gap-2", expanded ? "flex" : "hidden sm:flex")}>
          {/* Left: Üzenetküldés */}
          <a
            href={`/providers/${provider.id}#message`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-sm font-medium text-[#84AAA6] border border-[#84AAA6]/50 bg-[#84AAA6]/10 hover:bg-[#84AAA6]/20 transition-colors px-3 py-1.5 rounded-full whitespace-nowrap"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Üzenetküldés
          </a>

          {/* Center: Galéria (only if gallery exists) */}
          {hasGallery && (
            <a
              href={`/providers/${provider.id}#gallery`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm font-medium text-[#84AAA6] border border-[#84AAA6]/50 bg-[#84AAA6]/10 hover:bg-[#84AAA6]/20 transition-colors px-3 py-1.5 rounded-full whitespace-nowrap"
            >
              <Images className="h-3.5 w-3.5" />
              Galéria
            </a>
          )}

          {/* Right: Részletek */}
          <a
            href={`/providers/${provider.id}`}
            onClick={(e) => e.stopPropagation()}
            className="ml-auto flex items-center gap-1.5 text-sm font-medium text-white bg-[#84AAA6] hover:bg-[#6B8E8A] transition-colors px-3 py-1.5 rounded-full whitespace-nowrap"
          >
            Részletek
          </a>
        </div>
      )}
    </Wrapper>
  );
}

function ContactRow({
  icon,
  value,
  isLink = false,
}: {
  icon: React.ReactNode;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="shrink-0 mt-0.5">{icon}</span>
      {isLink ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base text-[#84AAA6] hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className="text-base text-gray-900 break-all">{value}</span>
      )}
    </div>
  );
}
