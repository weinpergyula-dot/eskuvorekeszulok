"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, SearchX, ChevronDown, LayoutGrid, List, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { CountyFilter } from "./county-filter";
import { ProviderCard } from "./provider-card";
import type { Provider } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type SortOption = "default" | "rating" | "reviews" | "views";

interface CategoryContentProps {
  providers: Provider[];
  counties: string[];
  selected?: string;
  category: string;
  label: string;
  countyCountMap?: Record<string, number>;
}

export function CategoryContent({
  providers,
  counties,
  selected,
  category,
  label,
  countyCountMap,
}: CategoryContentProps) {
  const router = useRouter();
  const [countyQuery, setCountyQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const sortRef = useRef<HTMLDivElement>(null);

  // Restore saved county filter when returning without URL param
  useEffect(() => {
    if (!selected) {
      const saved = sessionStorage.getItem(`county_${category}`);
      if (saved) router.replace(`/services/${category}?county=${encodeURIComponent(saved)}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  // Featured providers (gold > teal > silver), shown above the main list
  const featuredProviders = useMemo(() =>
    [...providers.filter((p) => p.featured)].sort((a, b) =>
      (b.featured === "gold" ? 3 : b.featured === "teal" ? 2 : b.featured === "silver" ? 1 : 0) -
      (a.featured === "gold" ? 3 : a.featured === "teal" ? 2 : a.featured === "silver" ? 1 : 0)
    ),
  [providers]);

  // Regular (non-featured) providers for the main list
  const regularProviders = useMemo(() => providers.filter((p) => !p.featured), [providers]);

  const shuffled = useMemo(() => [...regularProviders].sort(() => Math.random() - 0.5), [regularProviders]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cq = countyQuery.trim().toLowerCase();

  const geoCounties = counties.filter((c) => c !== "Országosan");
  const filteredCounties = cq
    ? geoCounties.filter((c) => c.toLowerCase().includes(cq))
    : geoCounties;

  const filteredProviders = sortBy === "default"
    ? shuffled
    : [...regularProviders].sort((a, b) =>
        sortBy === "rating"
          ? (b.average_rating ?? 0) - (a.average_rating ?? 0)
          : sortBy === "reviews"
          ? (b.review_count ?? 0) - (a.review_count ?? 0)
          : (b.view_count ?? 0) - (a.view_count ?? 0)
      );

  return (
    <div>
      {/* ── Találati sor + rendezés – legfelül ────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <p className="text-lg text-gray-900">
          {providers.length} találat{selected ? ` – ${selected}` : ""}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#84AAA6] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              aria-label="Csempés nézet"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#84AAA6] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              aria-label="Listás nézet"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 text-base text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {sortBy === "default" ? "Alapértelmezett" : sortBy === "rating" ? "Értékelés alapján" : sortBy === "reviews" ? "Értékelések száma alapján" : "Látogatottság alapján"}
              <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-[200]">
                {([
                  { value: "default", label: "Alapértelmezett" },
                  { value: "rating",  label: "Értékelés alapján" },
                  { value: "reviews", label: "Értékelések száma alapján" },
                  { value: "views",   label: "Látogatottság alapján" },
                ] as { value: SortOption; label: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-base transition-colors ${
                      sortBy === opt.value
                        ? "text-[#84AAA6] bg-[#84AAA6]/10 font-medium"
                        : "text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Kiemelt szolgáltatók ──────────────────────────────────────────── */}
      {featuredProviders.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Kiemelt szolgáltatók
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {featuredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                hideCategories
                isOwner={!!currentUserId && currentUserId === provider.user_id}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Divider + "További szolgáltatók" ──────────────────────────────── */}
      {featuredProviders.length > 0 && (
        <div className="border-t border-gray-200 mt-2 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mt-6">További szolgáltatók</h2>
        </div>
      )}

      {/* ── Szűrő + lista ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0 w-full">
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
            <CountyFilter counties={filteredCounties} selected={selected} category={category} countByCounty={countyCountMap} />
          </div>
          <div className="lg:hidden">
            <CountyFilter counties={geoCounties} selected={selected} category={category} countByCounty={countyCountMap} />
          </div>
        </aside>

        {/* Lista */}
        <div className="flex-1 min-w-0">
          {filteredProviders.length > 0 ? (
            <div className={viewMode === "list" ? "flex flex-col gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-5"}>
              {filteredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} hideCategories isOwner={!!currentUserId && currentUserId === provider.user_id} listView={viewMode === "list"} />
              ))}
            </div>
          ) : featuredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SearchX className="h-12 w-12 text-[#84AAA6] mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nincs találat</h3>
              <p className="text-gray-900 text-lg">
                {selected
                  ? `${selected} megyében egyelőre nincs elérhető ${label.toLowerCase()} szolgáltató.`
                  : `Egyelőre nincs elérhető ${label.toLowerCase()} szolgáltató.`}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
