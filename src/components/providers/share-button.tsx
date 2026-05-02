"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title, iconOnly = false }: { title: string; iconOnly?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled – do nothing
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Megosztás"
      className={`flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 hover:bg-[#84AAA6]/10 transition-colors cursor-pointer ${iconOnly ? "p-1.5" : "px-3 py-1.5"}`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-[#84AAA6]" />
      ) : (
        <Share2 className="h-4 w-4 text-gray-400" />
      )}
      {!iconOnly && <span className="text-sm text-gray-700">{copied ? "Másolva!" : "Megosztás"}</span>}
    </button>
  );
}
