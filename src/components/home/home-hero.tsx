"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, ArrowRight, MapPin, Sparkles, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, type Provider, type ServiceCategory } from "@/lib/types";
import { CATEGORY_LUCIDE_ICONS } from "@/lib/category-icons";
import { displayCount, orderedCategories } from "@/lib/categories";

/* ── Főoldali hero az új (alkonyati, üveghatású) dizájnban ──────────────
   kereső → ikonos kategória-chipek → „Fedezd fel” vízszintes sáv.
   A kereső és a chipek a lenti listát szűrik (ugyanazokkal az
   eseményekkel, amiket a ProvidersContent figyel). */

const SHORT_LABELS: Partial<Record<ServiceCategory, string>> = {
  "fotosok-videosok": "Fotós",
  "elo-zene-dj": "Zene, DJ",
  vofely: "Vőfély",
  szertartasvezeto: "Szertartás",
  "torta-sutemeny": "Torta",
  "menyasszonyi-ruha": "Ruha",
  "oltonya-szmoking": "Öltöny",
  "dekor-kellek": "Dekor",
  "fodrasz-borbely": "Fodrász",
  kormos: "Köröm",
  "koszonto-ajandek": "Ajándék",
  "pedikur-manikur": "Manikűr",
  kozmetika: "Kozmetika",
  ekszer: "Ékszer",
  meghivo: "Meghívó",
  "auto-hinto": "Autó",
  tanckoktatas: "Tánc",
  helyszin: "Helyszín",
  virag: "Virág",
};

function coverOf(p: Provider): string | undefined {
  return p.gallery_urls?.[0] ?? p.avatar_url ?? undefined;
}

function scrollToList() {
  const el = document.getElementById("szolgaltatok");
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior: "smooth" });
}

export function HomeHero({
  providers,
  categoryCounts,
}: {
  providers: Provider[];
  categoryCounts: Record<string, number>;
}) {
  const discover = useMemo(() => providers.filter(coverOf).slice(0, 10), [providers]);

  const categories = useMemo(
    () => orderedCategories(categoryCounts).filter((c) => displayCount(c, categoryCounts) > 0),
    [categoryCounts]
  );

  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");

  /* A lista felől érkező kategóriaváltást is tükrözzük a chipeken. */
  useEffect(() => {
    const h = (e: Event) => setCategory((e as CustomEvent<string>).detail ?? "");
    window.addEventListener("eskuvo:category", h);
    return () => window.removeEventListener("eskuvo:category", h);
  }, []);

  const pickCategory = (c: string) => {
    window.dispatchEvent(new CustomEvent("eskuvo:set-category", { detail: c }));
    setCategory(c);
    scrollToList();
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement | null)?.blur();
    window.dispatchEvent(new CustomEvent("eskuvo:set-query", { detail: query.trim() }));
    scrollToList();
  };

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8">
        <div className="max-w-3xl">
          <p className="hidden sm:inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-sm text-[#9C1846]">
            <Sparkles className="h-4 w-4" /> Minden esküvői szolgáltató egy helyen
          </p>
          <h1 className="mt-1 sm:mt-4 font-heading font-extrabold tracking-tight text-[#1F1A2E] text-[31px] leading-[1.08] sm:text-5xl lg:text-6xl">
            Tervezzük meg <span className="bg-gradient-to-r from-[#F2507F] to-[#A855C9] bg-clip-text text-transparent">a nagy napot</span>
          </h1>
          <p className="hidden sm:block mt-4 max-w-xl text-lg text-[#6B6480]">
            Fotósok, zenészek, helyszínek, torták és még sok más – kérj ajánlatot egyszerre több szolgáltatótól.
          </p>

          {/* Kereső – a mező 16px-es, hogy iOS-en fókuszáláskor ne nagyítson rá az oldal */}
          <form onSubmit={submitSearch} className="glass-strong mt-4 sm:mt-7 flex items-center gap-3 rounded-full py-2 pl-5 pr-2">
            <Search className="h-5 w-5 shrink-0 text-[#1F1A2E]" strokeWidth={2.2} />
            <label className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-[#1F1A2E] leading-tight">Mit keresel?</span>
              <input
                type="search"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Fotós, helyszín, torta, megye…"
                className="w-full bg-transparent text-[16px] leading-tight text-[#6B6480] placeholder:text-[#8F87A3] outline-none [&::-webkit-search-cancel-button]:hidden"
              />
            </label>
            <button type="submit" aria-label="Keresés" className="rose-cta flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
              <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
            </button>
          </form>
        </div>

        {/* Kategória-chipek */}
        <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-2 scrollbar-none lg:mx-0 lg:px-0 lg:overflow-visible">
          <div className="flex gap-2.5 lg:flex-wrap">
            <CategoryChip label="Mind" Icon={LayoutGrid} active={category === ""} onClick={() => pickCategory("")} />
            {categories.map((c) => (
              <CategoryChip
                key={c}
                label={SHORT_LABELS[c] ?? CATEGORY_LABELS[c]}
                title={CATEGORY_LABELS[c]}
                Icon={CATEGORY_LUCIDE_ICONS[c]}
                active={category === c}
                onClick={() => pickCategory(c)}
              />
            ))}
          </div>
        </div>

        {/* ── Fedezd fel ── */}
        {discover.length > 0 && (
          <div className="mt-5 sm:mt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-[20px] sm:text-2xl text-[#1F1A2E]">Fedezd fel <span aria-hidden>✨</span></h2>
              <button onClick={() => pickCategory("")} className="glass inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#1F1A2E]">
                Mind <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-3 scrollbar-none">
              <div className="flex gap-3 sm:gap-4">
                {discover.map((p) => (
                  <Link
                    key={p.id}
                    href={`/providers/${p.id}`}
                    className="group relative h-[150px] w-[140px] sm:h-[220px] sm:w-[200px] shrink-0 overflow-hidden rounded-[22px] ring-1 ring-white/70 shadow-[0_14px_30px_-18px_rgba(90,20,60,0.6)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverOf(p)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 p-2.5 text-white">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold leading-tight">{p.full_name}</p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-white/85">
                          <MapPin className="h-3 w-3 shrink-0" />{(p.counties ?? [])[0]}
                        </p>
                      </div>
                      <span className="glass-dark flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryChip({
  label,
  title,
  Icon,
  active,
  onClick,
}: {
  label: string;
  title?: string;
  Icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center gap-1 rounded-[20px] text-[11.5px] font-semibold transition-all",
        active
          ? "bg-[#FDE3EC]/90 text-[#E8336A] ring-1 ring-[#E8336A]/30 shadow-[0_8px_20px_-10px_rgba(232,51,106,0.6)]"
          : "glass text-[#4A4360] hover:bg-white/80"
      )}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
      <span className="max-w-full truncate px-1">{label}</span>
    </button>
  );
}
