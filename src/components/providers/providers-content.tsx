"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, SearchX, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ProviderCard } from "./provider-card";
import type { Provider, ServiceCategory } from "@/lib/types";
import { CATEGORY_LABELS, COUNTIES } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SortOption = "default" | "rating" | "reviews" | "views";

const tier = (f: Provider["featured"]) => (f === "gold" ? 3 : f === "teal" ? 2 : f === "silver" ? 1 : 0);

// ── Small dropdown ──────────────────────────────────────────────────────────
function FilterSelect({
  value, onChange, options, placeholder, fullWidthMobile = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  fullWidthMobile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const selected = options.find((o) => o.value === value);
  return (
    <div ref={ref} className={cn("relative", fullWidthMobile && "w-full sm:w-auto")}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-base text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer",
          fullWidthMobile && "w-full justify-between",
        )}
      >
        <span className={cn("truncate", selected ? "text-[#84AAA6]" : "")}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className={cn(
          "absolute right-0 top-full mt-1 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30",
          fullWidthMobile ? "left-0 w-full" : "w-60",
        )}>
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className={cn("w-full text-left px-4 py-2.5 text-base transition-colors", !value ? "text-[#84AAA6] bg-[#84AAA6]/10 font-medium" : "text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]")}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn("w-full text-left px-4 py-2.5 text-base transition-colors", value === opt.value ? "text-[#84AAA6] bg-[#84AAA6]/10 font-medium" : "text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sort dropdown ───────────────────────────────────────────────────────────
function SortDropdown({ sortBy, setSortBy, fill = false }: { sortBy: SortOption; setSortBy: (s: SortOption) => void; fill?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const label = sortBy === "default" ? "Alapértelmezett" : sortBy === "rating" ? "Értékelés alapján" : sortBy === "reviews" ? "Értékelések száma alapján" : "Látogatottság alapján";
  return (
    <div ref={ref} className={cn("relative", fill && "min-w-0")}>
      <button onClick={() => setOpen((o) => !o)} className={cn("flex h-full items-center gap-2 px-3 py-1.5 text-base text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer", fill && "w-full justify-between")}>
        <span className={cn(fill && "truncate")}>{label}</span>
        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30">
          {([
            { value: "default", label: "Alapértelmezett" },
            { value: "rating",  label: "Értékelés alapján" },
            { value: "reviews", label: "Értékelések száma alapján" },
            { value: "views",   label: "Látogatottság alapján" },
          ] as { value: SortOption; label: string }[]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-base transition-colors ${sortBy === opt.value ? "text-[#84AAA6] bg-[#84AAA6]/10 font-medium" : "text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PageSizeSelect({ pageSize, setPageSize }: { pageSize: number; setPageSize: (n: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex h-full items-center gap-2 px-3 py-1.5 text-base text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
        {pageSize} / oldal
        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30">
          {[10, 50, 100].map((n) => (
            <button
              key={n}
              onClick={() => { setPageSize(n); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-base transition-colors ${pageSize === n ? "text-[#84AAA6] bg-[#84AAA6]/10 font-medium" : "text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]"}`}
            >
              {n} / oldal
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ViewToggle({ viewMode, setViewMode }: { viewMode: "grid" | "list"; setViewMode: (v: "grid" | "list") => void }) {
  // items-stretch on the parent makes these buttons match the sort button's height.
  return (
    <div className="flex items-stretch rounded-xl border border-gray-200 overflow-hidden">
      <button onClick={() => setViewMode("grid")} className={`px-2.5 flex items-center transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#84AAA6] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`} aria-label="Csempés nézet">
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button onClick={() => setViewMode("list")} className={`px-2.5 flex items-center transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#84AAA6] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`} aria-label="Listás nézet">
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Providers list ──────────────────────────────────────────────────────────
export function ProvidersContent({
  providers,
  categoryCounts,
  hideCategoryPills = false,
}: {
  providers: Provider[];
  categoryCounts: Record<string, number>;
  /** A főoldalon a kategóriaszűrés a gyorskategória-csempékről történik,
      ott a desktop pill-sor rejtve marad. */
  hideCategoryPills?: boolean;
}) {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string>(searchParams.get("category") ?? "");
  const [county, setCounty] = useState<string>(searchParams.get("county") ?? "");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [countyQuery, setCountyQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  // A főoldali gyorskategória-csempék felől érkező szűrés fogadása, és a
  // mindenkori kategória visszajelzése a csempéknek (kiemeléshez).
  useEffect(() => {
    const h = (e: Event) => setCategory((e as CustomEvent<string>).detail ?? "");
    window.addEventListener("eskuvo:set-category", h);
    return () => window.removeEventListener("eskuvo:set-category", h);
  }, []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("eskuvo:category", { detail: category }));
  }, [category]);

  // Reset to first page when the result set or page size changes.
  useEffect(() => { setCurrentPage(1); }, [category, county, sortBy, pageSize]);

  const categoryOptions = useMemo(
    () =>
      (Object.keys(CATEGORY_LABELS) as ServiceCategory[])
        .filter((c) => (categoryCounts[c] ?? 0) > 0)
        .sort((a, b) => (categoryCounts[b] ?? 0) - (categoryCounts[a] ?? 0))
        .map((c) => ({ value: c, label: `${CATEGORY_LABELS[c]} (${categoryCounts[c] ?? 0})` })),
    [categoryCounts],
  );

  const geoCounties = useMemo(() => (COUNTIES as readonly string[]).filter((c) => c !== "Országosan"), []);

  // Providers matching the category filter (used for county counts + county filtering).
  const byCategory = useMemo(
    () => (category ? providers.filter((p) => (p.categories ?? []).includes(category as ServiceCategory)) : providers),
    [providers, category],
  );

  // County counts within the current category selection (Országosan counts everywhere).
  const countyCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of byCategory) {
      const cos = (p.counties ?? []) as string[];
      if (cos.includes("Országosan")) {
        for (const c of geoCounties) m[c] = (m[c] ?? 0) + 1;
      } else {
        for (const c of cos) if (geoCounties.includes(c)) m[c] = (m[c] ?? 0) + 1;
      }
    }
    return m;
  }, [byCategory, geoCounties]);

  const countyList = countyQuery.trim()
    ? geoCounties.filter((c) => c.toLowerCase().includes(countyQuery.trim().toLowerCase()))
    : geoCounties;

  const filtered = useMemo(() => {
    if (!county) return byCategory;
    return byCategory.filter((p) => (p.counties ?? []).includes(county) || (p.counties ?? []).includes("Országosan"));
  }, [byCategory, county]);

  const featured = useMemo(() => filtered.filter((p) => p.featured).sort((a, b) => tier(b.featured) - tier(a.featured)), [filtered]);
  const normal = useMemo(() => filtered.filter((p) => !p.featured), [filtered]);
  const shuffledNormal = useMemo(() => [...normal].sort(() => Math.random() - 0.5), [normal]);
  const sortedNormal = sortBy === "default"
    ? shuffledNormal
    : [...normal].sort((a, b) =>
        sortBy === "rating" ? (b.average_rating ?? 0) - (a.average_rating ?? 0)
        : sortBy === "reviews" ? (b.review_count ?? 0) - (a.review_count ?? 0)
        : (b.view_count ?? 0) - (a.view_count ?? 0),
      );

  const countyOptions = geoCounties.map((c) => ({ value: c, label: `${c} (${countyCounts[c] ?? 0})` }));
  const gridCls = viewMode === "list" ? "flex flex-col gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-5";

  // Pagination counts featured + normal together; featured stay at the front.
  const combined = [...featured, ...sortedNormal];
  const totalPages = Math.max(1, Math.ceil(combined.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageItems = combined.slice((page - 1) * pageSize, page * pageSize);
  const pageFeatured = pageItems.filter((p) => p.featured);
  const pageNormal = pageItems.filter((p) => !p.featured);
  const pageNumbers = ((): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  })();

  const pillCls = (active: boolean) =>
    cn(
      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer",
      active ? "bg-[#84AAA6] text-white border-[#84AAA6]" : "bg-white text-gray-700 border-gray-300 hover:border-[#84AAA6] hover:text-[#84AAA6]",
    );

  return (
    <div>
      <p className="text-base text-gray-700 mb-5">Válassz kategóriát és szűrj megyék szerint</p>
      <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
      {/* Desktop county sidebar (left, full height) */}
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
          <div className="space-y-0.5">
            <button
              onClick={() => setCounty("")}
              className={cn("w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg text-base transition-colors", !county ? "bg-[#84AAA6] text-white font-medium" : "text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]")}
            >
              Összes megye
            </button>
            {countyList.map((c) => (
              <button
                key={c}
                onClick={() => setCounty(county === c ? "" : c)}
                className={cn("w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg text-base transition-colors", county === c ? "bg-[#84AAA6] text-white font-medium" : "text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]")}
              >
                <span className="truncate">{c}</span>
                <span className={cn("text-sm shrink-0 ml-2", county === c ? "text-white/80" : "text-gray-400")}>({countyCounts[c] ?? 0})</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0">
        {/* Desktop category filter — all categories visible & selectable (pills). */}
        {!hideCategoryPills && (
          <div className="hidden lg:flex flex-wrap gap-2 mb-5">
            <button onClick={() => setCategory("")} className={pillCls(!category)}>Összes kategória</button>
            {categoryOptions.map((opt) => (
              <button key={opt.value} onClick={() => setCategory(category === opt.value ? "" : opt.value)} className={pillCls(category === opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Controls ── */}
        <div className="mb-6">
          {/* Desktop: count left, page size + view + sort right */}
          <div className="hidden lg:flex items-center justify-between gap-3">
            <p className="text-lg text-gray-900">{filtered.length} szolgáltató</p>
            <div className="flex items-stretch gap-2">
              <PageSizeSelect pageSize={pageSize} setPageSize={setPageSize} />
              <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
              <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
            </div>
          </div>

          {/* Mobile: category (full), county (full), then view + sort + page size filling one row */}
          <div className="lg:hidden space-y-2">
            <FilterSelect value={category} onChange={setCategory} options={categoryOptions} placeholder="Összes kategória" fullWidthMobile />
            <FilterSelect value={county} onChange={setCounty} options={countyOptions} placeholder="Összes megye" fullWidthMobile />
            <div className="grid grid-cols-[auto_1fr_auto] items-stretch gap-2">
              <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
              <SortDropdown sortBy={sortBy} setSortBy={setSortBy} fill />
              <PageSizeSelect pageSize={pageSize} setPageSize={setPageSize} />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <SearchX className="h-12 w-12 text-[#84AAA6] mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nincs találat</h3>
            <p className="text-gray-900 text-lg">A kiválasztott szűrőkre egyelőre nincs szolgáltató.</p>
          </div>
        ) : (
          <>
            {/* Mobile: result count above the list */}
            <p className="lg:hidden text-lg text-gray-900 mb-4">{filtered.length} szolgáltató</p>
            {/* Featured (on this page) on top */}
            {pageFeatured.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  Kiemelt szolgáltatók
                </h2>
                <div className={gridCls}>
                  {pageFeatured.map((p) => (
                    <ProviderCard key={p.id} provider={p} isOwner={!!currentUserId && currentUserId === p.user_id} listView={viewMode === "list"} />
                  ))}
                </div>
              </section>
            )}

            {pageFeatured.length > 0 && pageNormal.length > 0 && (
              <div className="border-t border-gray-200 mt-2 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mt-6">További szolgáltatók</h2>
              </div>
            )}

            {pageNormal.length > 0 && (
              <div className={gridCls}>
                {pageNormal.map((p) => (
                  <ProviderCard key={p.id} provider={p} isOwner={!!currentUserId && currentUserId === p.user_id} listView={viewMode === "list"} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      aria-label="Előző oldal"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {pageNumbers.map((n, i) =>
                      n === "…" ? (
                        <span key={`e-${i}`} className="px-2 text-gray-400 select-none">…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setCurrentPage(n)}
                          className={`min-w-[36px] h-9 px-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${page === n ? "bg-[#84AAA6] border-[#84AAA6] text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                        >
                          {n}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      aria-label="Következő oldal"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
