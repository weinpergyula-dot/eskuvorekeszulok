"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type ServiceCategory,
} from "@/lib/types";
import { CATEGORY_LUCIDE_ICONS } from "@/lib/category-icons";

const ALL_CATEGORIES: ServiceCategory[] = [
  "fotosok-videosok",
  "elo-zene-dj",
  "vofely",
  "torta-sutemeny",
  "menyasszonyi-ruha",
  "oltonya-szmoking",
  "dekor-kellek",
  "smink",
  "fodrasz-borbely",
  "kormos",
  "koszonto-ajandek",
  "pedikur-manikur",
  "kozmetika",
  "ekszer",
  "meghivo",
  "auto-hinto",
  "tanckoktatas",
  "catering",
  "helyszin",
  "virag",
];

export function CategorySearch() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? ALL_CATEGORIES.filter((cat) =>
        CATEGORY_LABELS[cat].toLowerCase().includes(query.toLowerCase()) ||
        CATEGORY_DESCRIPTIONS[cat].toLowerCase().includes(query.toLowerCase())
      )
    : ALL_CATEGORIES;

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-900 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Keresés a kategóriák között..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#84AAA6] focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-900 text-base">Nincs találat a keresésre.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((category) => (
            <Link
              key={category}
              href={`/services/${category}`}
              className="flex flex-col items-center text-center bg-[#FCFCFC] border border-gray-200 rounded-xl p-5 hover:border-[#84AAA6] hover:shadow-md transition-all group"
            >
              {(() => { const Icon = CATEGORY_LUCIDE_ICONS[category]; return <Icon className="h-9 w-9 mb-3 text-[#84AAA6]" strokeWidth={1.5} />; })()}
              <h3 className="font-semibold text-gray-900 mb-1 leading-tight group-hover:text-[#84AAA6] transition-colors text-[20px] sm:text-[22px]">
                {CATEGORY_LABELS[category]}
              </h3>
              <div className="w-8 h-0.5 bg-gray-300 group-hover:bg-[#84AAA6] transition-colors mb-2" />
              <p className="text-base text-gray-900 line-clamp-2">
                {CATEGORY_DESCRIPTIONS[category]}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
