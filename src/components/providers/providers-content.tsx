"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { SearchX, ChevronDown, LayoutGrid, List } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ProviderCard } from "./provider-card";
import type { Provider, ServiceCategory } from "@/lib/types";
import { CATEGORY_LABELS, COUNTIES } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SortOption = "default" | "rating" | "reviews" | "views";

// ── Small dropdown ──────────────────────────────────────────────────────────
function FilterSelect({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 text-base text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className={selected ? "text-[#84AAA6]" : ""}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-60 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30">
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

// ── Providers list with category + county + sort filters ────────────────────
export function ProvidersContent({
  providers,
  categoryCounts,
}: {
  providers: Provider[];
  categoryCounts: Record<string, number>;
}) {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string>(searchParams.get("category") ?? "");
  const [county, setCounty] = useState<string>(searchParams.get("county") ?? "");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  // Category options sorted by provider count (descending), with the count shown.
  const categoryOptions = useMemo(
    () =>
      (Object.keys(CATEGORY_LABELS) as ServiceCategory[])
        .filter((c) => (categoryCounts[c] ?? 0) > 0)
        .sort((a, b) => (categoryCounts[b] ?? 0) - (categoryCounts[a] ?? 0))
        .map((c) => ({ value: c, label: `${CATEGORY_LABELS[c]} (${categoryCounts[c] ?? 0})` })),
    [categoryCounts],
  );

  const countyOptions = useMemo(
    () => COUNTIES.filter((c) => c !== "Országosan").map((c) => ({ value: c, label: c })),
    [],
  );

  const filtered = useMemo(() => {
    let list = providers;
    if (category) list = list.filter((p) => (p.categories ?? []).includes(category as ServiceCategory));
    if (county) list = list.filter((p) => (p.counties ?? []).includes(county) || (p.counties ?? []).includes("Országosan"));
    return list;
  }, [providers, category, county]);

  const shuffled = useMemo(() => [...filtered].sort(() => Math.random() - 0.5), [filtered]);

  const sorted = sortBy === "default"
    ? shuffled
    : [...filtered].sort((a, b) =>
        sortBy === "rating"
          ? (b.average_rating ?? 0) - (a.average_rating ?? 0)
          : sortBy === "reviews"
          ? (b.review_count ?? 0) - (a.review_count ?? 0)
          : (b.view_count ?? 0) - (a.view_count ?? 0),
      );

  const sortRef = useRef<HTMLDivElement>(null);
  const [sortOpen, setSortOpen] = useState(false);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div>
      {/* Filter row */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <p className="text-lg text-gray-900">{sorted.length} szolgáltató</p>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterSelect value={category} onChange={setCategory} options={categoryOptions} placeholder="Összes kategória" />
          <FilterSelect value={county} onChange={setCounty} options={countyOptions} placeholder="Összes megye" />

          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#84AAA6] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`} aria-label="Csempés nézet">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#84AAA6] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`} aria-label="Listás nézet">
              <List className="h-4 w-4" />
            </button>
          </div>

          <div ref={sortRef} className="relative">
            <button onClick={() => setSortOpen((o) => !o)} className="flex items-center gap-2 px-3 py-1.5 text-base text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              {sortBy === "default" ? "Alapértelmezett" : sortBy === "rating" ? "Értékelés alapján" : sortBy === "reviews" ? "Értékelések száma alapján" : "Látogatottság alapján"}
              <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30">
                {([
                  { value: "default", label: "Alapértelmezett" },
                  { value: "rating",  label: "Értékelés alapján" },
                  { value: "reviews", label: "Értékelések száma alapján" },
                  { value: "views",   label: "Látogatottság alapján" },
                ] as { value: SortOption; label: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-base transition-colors ${sortBy === opt.value ? "text-[#84AAA6] bg-[#84AAA6]/10 font-medium" : "text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {sorted.length > 0 ? (
        <div className={viewMode === "list" ? "flex flex-col gap-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"}>
          {sorted.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} isOwner={!!currentUserId && currentUserId === provider.user_id} listView={viewMode === "list"} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="h-12 w-12 text-[#84AAA6] mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nincs találat</h3>
          <p className="text-gray-900 text-lg">A kiválasztott szűrőkre egyelőre nincs szolgáltató.</p>
        </div>
      )}
    </div>
  );
}
