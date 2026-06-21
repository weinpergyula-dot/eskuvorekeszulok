"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, SearchX, ChevronDown, LayoutGrid, List, Star, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const pageSizeRef = useRef<HTMLDivElement>(null);

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
    supabase.auth.getUser().then(async ({ data }) => {
      const userId = data.user?.id ?? null;
      setCurrentUserId(userId);
      if (userId) {
        const { data: favRows } = await supabase
          .from("favorites")
          .select("provider_id")
          .eq("user_id", userId);
        setFavoriteIds(new Set((favRows ?? []).map((r: { provider_id: string }) => r.provider_id)));
      }
    });
  }, []);

  // Reset to page 1 when sort, county or page size changes
  useEffect(() => { setCurrentPage(1); }, [sortBy, selected, pageSize]);

  // Featured providers — default order is by tier (gold > teal > silver), but the
  // active sort (rating / reviews / views) applies within the featured block too.
  const featuredProviders = useMemo(() => {
    const featured = providers.filter((p) => p.featured);
    if (sortBy === "default") {
      return featured.sort((a, b) =>
        (b.featured === "gold" ? 3 : b.featured === "teal" ? 2 : b.featured === "silver" ? 1 : 0) -
        (a.featured === "gold" ? 3 : a.featured === "teal" ? 2 : a.featured === "silver" ? 1 : 0)
      );
    }
    return featured.sort((a, b) =>
      sortBy === "rating"
        ? (b.average_rating ?? 0) - (a.average_rating ?? 0)
        : sortBy === "reviews"
        ? (b.review_count ?? 0) - (a.review_count ?? 0)
        : (b.view_count ?? 0) - (a.view_count ?? 0)
    );
  }, [providers, sortBy]);

  // Regular (non-featured) providers
  const regularProviders = useMemo(() => providers.filter((p) => !p.featured), [providers]);

  const shuffled = useMemo(() => [...regularProviders].sort(() => Math.random() - 0.5), [regularProviders]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target as Node)) setPageSizeOpen(false);
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

  const totalPages = Math.ceil(filteredProviders.length / pageSize);
  const pagedProviders = filteredProviders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Page number list with ellipsis
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div>
      {/* ── Mobilon: megye szűrő legtetején ──────────────────────────────── */}
      <div className="lg:hidden mb-4">
        <CountyFilter counties={geoCounties} selected={selected} category={category} countByCounty={countyCountMap} />
      </div>

      {/* ── Fő elrendezés: sidebar bal + tartalom jobb ────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-start">

        {/* Sidebar – csak desktopon */}
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
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
        </aside>

        {/* Jobb oszlop */}
        <div className="flex-1 min-w-0">

          {/* ── Találati sor + rendezés + oldalméret ────────────────────── */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <p className="text-lg text-gray-900">
              {providers.length} találat{selected ? ` – ${selected}` : ""}
            </p>
            <div className="flex items-center gap-2">
              {/* Nézet váltó */}
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

              {/* Oldalméret */}
              <div ref={pageSizeRef} className="relative">
                <button
                  onClick={() => setPageSizeOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm sm:text-base text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {pageSize} / oldal
                  <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                </button>
                {pageSizeOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-[200]">
                    {[10, 50, 100].map((n) => (
                      <button
                        key={n}
                        onClick={() => { setPageSize(n); setPageSizeOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-base transition-colors ${
                          pageSize === n
                            ? "text-[#84AAA6] bg-[#84AAA6]/10 font-medium"
                            : "text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]"
                        }`}
                      >
                        {n} / oldal
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rendezés */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm sm:text-base text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
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

          {/* ── Kiemelt szolgáltatók ──────────────────────────────────────── */}
          {featuredProviders.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                Kiemelt szolgáltatók
              </h2>
              <div className={viewMode === "list" ? "flex flex-col gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-5"}>
                {featuredProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    hideCategories
                    initialLiked={favoriteIds.has(provider.id)}
                    isOwner={!!currentUserId && currentUserId === provider.user_id}
                    listView={viewMode === "list"}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Divider + "További szolgáltatók" ──────────────────────────── */}
          {featuredProviders.length > 0 && (
            <div className="border-t border-gray-200 mt-2 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mt-6">További szolgáltatók</h2>
            </div>
          )}

          {/* ── Főlista (lapozott) ────────────────────────────────────────── */}
          {pagedProviders.length > 0 ? (
            <>
              <div className={viewMode === "list" ? "flex flex-col gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-5"}>
                {pagedProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} hideCategories initialLiked={favoriteIds.has(provider.id)} isOwner={!!currentUserId && currentUserId === provider.user_id} listView={viewMode === "list"} />
                ))}
              </div>

              {/* Lapozó */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    aria-label="Előző oldal"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {pageNumbers.map((n, i) =>
                    n === "…" ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400 select-none">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setCurrentPage(n)}
                        className={`min-w-[36px] h-9 px-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                          currentPage === n
                            ? "bg-[#84AAA6] border-[#84AAA6] text-white"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    aria-label="Következő oldal"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
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
