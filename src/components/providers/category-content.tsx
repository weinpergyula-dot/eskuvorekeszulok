"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CountyFilter } from "./county-filter";
import { ProviderCard } from "./provider-card";
import type { Provider } from "@/lib/types";

interface CategoryContentProps {
  providers: Provider[];
  counties: string[];
  selected?: string;
  category: string;
  label: string;
}

export function CategoryContent({
  providers,
  counties,
  selected,
  category,
  label,
}: CategoryContentProps) {
  const [countyQuery, setCountyQuery] = useState("");

  const cq = countyQuery.trim().toLowerCase();

  const filteredCounties = cq
    ? counties.filter((c) => c.toLowerCase().includes(cq))
    : counties;

  const filteredProviders = providers;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Sidebar */}
      <aside className="lg:w-64 shrink-0 w-full">
        {/* Desktop sticky card */}
        <div className="hidden lg:block bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
          <h2 className="font-semibold text-gray-900 mb-3">Szűrés megye szerint</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={countyQuery}
              onChange={(e) => setCountyQuery(e.target.value)}
              placeholder="Megye keresése..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#84AAA6] focus:border-transparent"
            />
          </div>
          <CountyFilter counties={filteredCounties} selected={selected} category={category} />
        </div>
        {/* Mobile collapsible */}
        <div className="lg:hidden">
          <CountyFilter counties={counties} selected={selected} category={category} />
        </div>
      </aside>

      {/* Provider grid */}
      <div className="flex-1 min-w-0">
        {filteredProviders.length > 0 ? (
          <>
            <p className="text-lg text-gray-900 mb-4">
              {filteredProviders.length} szolgáltató található
              {selected ? ` – ${selected}` : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nincs találat</h3>
            <p className="text-gray-900 text-lg">
              {selected
                ? `${selected} megyében egyelőre nincs elérhető ${label.toLowerCase()} szolgáltató.`
                : `Egyelőre nincs elérhető ${label.toLowerCase()} szolgáltató.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
