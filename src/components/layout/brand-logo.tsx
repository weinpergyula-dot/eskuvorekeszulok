import { cn } from "@/lib/utils";

/* Az új dizájn szöveges logója: rózsaszín gyűrű-jel + kétszínű név.
   (A régi /logo.png az e-mailekben és az OG-képen marad.) */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("shrink-0", className)}>
      <defs>
        <linearGradient id="bm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2507F" />
          <stop offset="1" stopColor="#C21E56" />
        </linearGradient>
      </defs>
      {/* Két egymásba fonódó karikagyűrű */}
      <circle cx="12" cy="18" r="8" fill="none" stroke="url(#bm-g)" strokeWidth="3" />
      <circle cx="20" cy="18" r="8" fill="none" stroke="url(#bm-g)" strokeWidth="3" />
      <path d="M20 4.5l1.6 2.1-1.6 2.1-1.6-2.1z" fill="#F2507F" />
    </svg>
  );
}

export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <BrandMark className={compact ? "h-7 w-7" : "h-8 w-8"} />
      <span
        className={cn(
          "font-heading font-extrabold tracking-tight leading-none whitespace-nowrap",
          compact ? "text-[17px]" : "text-[19px]"
        )}
      >
        <span className="text-[#E8336A]">esküvőre</span>{" "}
        <span className="text-[#1F1A2E]">készülök</span>
      </span>
    </span>
  );
}
