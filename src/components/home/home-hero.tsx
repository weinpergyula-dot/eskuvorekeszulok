"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ArrowRight, Sparkles, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { CATEGORY_LUCIDE_ICONS } from "@/lib/category-icons";
import { displayCount, orderedCategories } from "@/lib/categories";

/* ── Főoldali hero az új (alkonyati, üveghatású) dizájnban ──────────────
   kereső → ikonos kategória-chipek.
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

function scrollToList() {
  const el = document.getElementById("szolgaltatok");
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior: "smooth" });
}

export function HomeHero({
  categoryCounts,
}: {
  categoryCounts: Record<string, number>;
}) {
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
