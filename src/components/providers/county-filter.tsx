"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountyFilterProps {
  counties: string[];
  selected?: string;
  category: string;
}

export function CountyFilter({ counties, selected, category }: CountyFilterProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navigate = (county?: string) => {
    const path = `/services/${category}`;
    router.push(county ? `${path}?county=${encodeURIComponent(county)}` : path);
    setOpen(false);
  };

  const selectedLabel = selected ?? "Összes megye";

  const list = (
    <div className="space-y-1 pt-1">
      <button
        onClick={() => navigate()}
        className={cn(
          "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer",
          !selected
            ? "bg-[#5a8480] text-white font-medium"
            : "text-gray-600 hover:bg-gray-100"
        )}
      >
        Összes megye
      </button>
      {counties.map((county) => (
        <button
          key={county}
          onClick={() => navigate(county)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer",
            selected === county
              ? "bg-[#5a8480] text-white font-medium"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          {county}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile: collapsible toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#5a8480]" />
            Szűrés: <span className="text-[#5a8480]">{selectedLabel}</span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        {open && (
          <div className="mt-1 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            {list}
          </div>
        )}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden lg:block">{list}</div>
    </>
  );
}
