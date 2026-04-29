"use client";

import { useState } from "react";
import { Heart, Eye, Phone, Mail, Globe, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface ProviderCardProps {
  provider: Provider;
  showStatus?: boolean;
}

export function ProviderCard({ provider, showStatus = false }: ProviderCardProps) {
  const [liked, setLiked] = useState(false);

  const rating = provider.average_rating ?? 0;
  const reviewCount = provider.review_count ?? 0;
  const viewCount = provider.view_count ?? 0;

  return (
    <a
      href={`/providers/${provider.id}`}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-[#2a9d8f] hover:shadow-md transition-all flex flex-col overflow-hidden cursor-pointer group"
    >
      {/* Header with avatar */}
      <div className="flex flex-col items-center pt-6 px-5 pb-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 mb-3 bg-gray-100 flex items-center justify-center shrink-0">
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
        <h3 className="font-bold text-gray-900 text-center text-lg mb-1 group-hover:text-[#2a9d8f] transition-colors">
          {provider.full_name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-1">
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
          <span className="text-lg font-semibold text-gray-900 ml-1">
            {rating > 0 ? rating.toFixed(1) : "–"}
          </span>
          {reviewCount > 0 && (
            <span className="text-lg text-gray-900">({reviewCount})</span>
          )}
        </div>

        {/* Category badge */}
        <Badge variant="secondary" className="text-base mt-1">
          {CATEGORY_LABELS[provider.category as keyof typeof CATEGORY_LABELS] ?? provider.category}
        </Badge>

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
        <ContactRow icon={<Phone className="h-4 w-4 text-gray-900" />} value={provider.phone} />
        <ContactRow icon={<Mail className="h-4 w-4 text-gray-900" />} value={provider.email} />
        {provider.website && (
          <ContactRow
            icon={<Globe className="h-4 w-4 text-gray-900" />}
            value={provider.website}
            isLink
          />
        )}
        {provider.description && (
          <div className="flex gap-2.5">
            <MessageSquare className="h-4 w-4 text-gray-900 shrink-0 mt-0.5" />
            <p className="text-base text-gray-900 line-clamp-3 leading-relaxed">
              {provider.description}
            </p>
          </div>
        )}
        <p className="text-base text-gray-900">{provider.county}</p>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="text-gray-900 hover:text-red-500 transition-colors cursor-pointer"
          aria-label="Kedvenc"
        >
          <Heart
            className={cn("h-4 w-4", liked && "fill-red-500 text-red-500")}
          />
        </button>
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
          className="text-base text-[#2a9d8f] hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className="text-base text-gray-900 break-all">{value}</span>
      )}
    </div>
  );
}
