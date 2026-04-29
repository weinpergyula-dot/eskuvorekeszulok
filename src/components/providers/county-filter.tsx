"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CountyFilterProps {
  counties: string[];
  selected?: string;
  category: string;
}

export function CountyFilter({ counties, selected, category }: CountyFilterProps) {
  const router = useRouter();

  const navigate = (county?: string) => {
    const path = `/services/${category}`;
    router.push(county ? `${path}?county=${encodeURIComponent(county)}` : path);
  };

  return (
    <div className="space-y-1">
      <button
        onClick={() => navigate()}
        className={cn(
          "w-full text-left px-3 py-2 rounded-sm text-sm transition-colors",
          !selected
            ? "bg-[#2a9d8f] text-white font-medium"
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
            "w-full text-left px-3 py-2 rounded-sm text-sm transition-colors",
            selected === county
              ? "bg-[#2a9d8f] text-white font-medium"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          {county}
        </button>
      ))}
    </div>
  );
}
