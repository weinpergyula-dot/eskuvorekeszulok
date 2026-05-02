"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  providerId,
  initialLiked,
  onUnlike,
  hideTextOnMobile = false,
}: {
  providerId: string;
  initialLiked: boolean;
  onUnlike?: (id: string) => void;
  hideTextOnMobile?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const [showMsg, setShowMsg] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_id: providerId }),
      });
      if (res.status === 401) {
        setShowMsg(true);
        setTimeout(() => setShowMsg(false), 3000);
        return;
      }
      const data = await res.json();
      const added = data.action === "added";
      setLiked(added);
      if (!added) onUnlike?.(providerId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-flex">
      <button
        onClick={handleClick}
        aria-label="Kedvenc"
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white/80 hover:bg-[#FAF0F7] transition-colors cursor-pointer disabled:cursor-default"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              liked ? "fill-[#F06C6C] text-[#F06C6C]" : "text-gray-400"
            )}
          />
        )}
        <span className={cn("text-sm text-gray-700", hideTextOnMobile && !liked ? "hidden sm:inline" : "")}>
          {liked ? "Kedvenc" : "Kedvencnek jelölöm"}
        </span>
      </button>
      {showMsg && (
        <div className="absolute bottom-full left-0 mb-2 w-max max-w-[220px] text-xs bg-gray-900 text-white px-2.5 py-1.5 rounded-lg z-10">
          A funkció használatához jelentkezz be!
        </div>
      )}
    </div>
  );
}
