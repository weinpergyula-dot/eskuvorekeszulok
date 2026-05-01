"use client";

import { useState } from "react";
import { Heart, Eye, Phone, Mail, Globe, MessageSquare, Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface ProviderCardProps {
  provider: Provider;
  showStatus?: boolean;
  initialLiked?: boolean;
  onUnlike?: (id: string) => void;
}

export function ProviderCard({ provider, showStatus = false, initialLiked = false, onUnlike }: ProviderCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [showLoginMsg, setShowLoginMsg] = useState(false);

  const rating = provider.average_rating ?? 0;
  const reviewCount = provider.review_count ?? 0;
  const viewCount = provider.view_count ?? 0;

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id: provider.id }),
    });
    if (res.status === 401) {
      setShowLoginMsg(true);
      setTimeout(() => setShowLoginMsg(false), 3000);
      return;
    }
    const data = await res.json();
    if (data.action === "added") {
      setLiked(true);
    } else {
      setLiked(false);
      onUnlike?.(provider.id);
    }
  };

  return (
    <a
      href={`/providers/${provider.id}`}
      className="bg-[#FCFCFC] rounded-xl border border-gray-200 shadow-sm hover:border-[#84AAA6] hover:shadow-md transition-all flex flex-col overflow-hidden cursor-pointer group"
    >
      {/* Header – matches provider profile hero */}
      <div className="flex flex-col items-center pt-6 px-5 pb-4" style={{ backgroundColor: "#F0F6F5" }}>
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
        <h3 className="font-bold text-gray-900 text-center mb-2 group-hover:text-[#84AAA6] transition-colors" style={{ fontSize: "22px" }}>
          {provider.full_name}
        </h3>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1.5">
          {(provider.categories ?? []).slice(0, 2).map((cat) => (
            <Badge key={cat} variant="outline" className="text-base">
              {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
            </Badge>
          ))}
          {(provider.categories ?? []).length > 2 && (
            <Badge variant="outline" className="text-base">
              +{(provider.categories ?? []).length - 2}
            </Badge>
          )}
        </div>
        {/* Counties */}
        <div className="flex flex-wrap items-center justify-center gap-1 mb-2">
          <MapPin className="h-3.5 w-3.5 text-[#84AAA6] shrink-0" />
          <span className="text-base text-gray-900">
            {(provider.counties ?? []).slice(0, 2).join(", ")}
            {(provider.counties ?? []).length > 2 && ` +${(provider.counties ?? []).length - 2}`}
          </span>
        </div>

        {/* Rating */}
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
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mx-5" />

      {/* Contact info */}
      <div className="px-5 py-4 space-y-2 flex-1">
        <ContactRow icon={<Phone className="h-4 w-4 text-[#84AAA6]" />} value={provider.phone} />
        <ContactRow icon={<Mail className="h-4 w-4 text-[#84AAA6]" />} value={provider.email} />
        {provider.website && (
          <ContactRow
            icon={<Globe className="h-4 w-4 text-[#84AAA6]" />}
            value={provider.website}
            isLink
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

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={handleHeartClick}
            className="text-gray-900 hover:text-[#F06C6C] transition-colors cursor-pointer"
            aria-label="Kedvenc"
          >
            <Heart
              className={cn("h-4 w-4", liked && "fill-[#F06C6C] text-[#F06C6C]")}
            />
          </button>
          {showLoginMsg && (
            <div className="absolute bottom-full left-0 mb-2 w-max max-w-[220px] text-xs bg-gray-900 text-white px-2.5 py-1.5 rounded-lg whitespace-normal leading-tight z-10">
              A funkció használatához jelentkezz be!
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-900 text-base">
          <Eye className="h-3.5 w-3.5" />
          <span>{viewCount}</span>
        </div>
      </div>
    </a>
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
