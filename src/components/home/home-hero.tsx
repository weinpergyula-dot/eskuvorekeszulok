"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowRight, MapPin, Star, Heart, Sparkles, LayoutGrid, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, type Provider, type ServiceCategory } from "@/lib/types";
import { CATEGORY_LUCIDE_ICONS } from "@/lib/category-icons";
import { displayCount, orderedCategories } from "@/lib/categories";

/* ── Főoldali hero az új (alkonyati, üveghatású) dizájnban ──────────────
   A videós referencia felépítését követi:
   kereső → ikonos kategória-chipek → nagy, lapozható kiemelt kártya
   (váltáskor homályból élesedő képpel) → „Fedezd fel” vízszintes sáv.
   A kereső és a chipek a lenti listát szűrik (ugyanazokkal az
   eseményekkel, amiket a ProvidersContent figyel). */

const ROTATE_MS = 6000;

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
  /* Kiemeltek elöl (arany → ezüst → teal), utána a legjobbra értékeltek. */
  const spotlight = useMemo(() => {
    const rank = (p: Provider) => (p.featured === "gold" ? 3 : p.featured === "silver" ? 2 : p.featured === "teal" ? 1 : 0);
    return [...providers]
      .filter(coverOf)
      .sort((a, b) => rank(b) - rank(a) || (b.average_rating ?? 0) - (a.average_rating ?? 0) || (b.review_count ?? 0) - (a.review_count ?? 0))
      .slice(0, 5);
  }, [providers]);

  const discover = useMemo(
    () => providers.filter((p) => coverOf(p) && !spotlight.includes(p)).slice(0, 10),
    [providers, spotlight]
  );

  const categories = useMemo(
    () => orderedCategories(categoryCounts).filter((c) => displayCount(c, categoryCounts) > 0),
    [categoryCounts]
  );

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (paused || spotlight.length < 2) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % spotlight.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [active, paused, spotlight.length]);

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
    window.dispatchEvent(new CustomEvent("eskuvo:set-query", { detail: query.trim() }));
    scrollToList();
  };

  /* Ujjal lapozható kiemelt kártya */
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40 && spotlight.length > 1) {
      setActive((i) => (i + (dx < 0 ? 1 : -1) + spotlight.length) % spotlight.length);
    }
    setPaused(false);
  };

  const current = spotlight[active];

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-10 lg:items-center">
          {/* ── Bal oldal (desktopon): cím, kereső, chipek ── */}
          <div>
            <p className="hidden sm:inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-sm text-[#9C1846]">
              <Sparkles className="h-4 w-4" /> Minden esküvői szolgáltató egy helyen
            </p>
            <h1 className="mt-1 sm:mt-4 font-heading font-extrabold tracking-tight text-[#1F1A2E] text-[31px] leading-[1.08] sm:text-5xl lg:text-6xl">
              Tervezzük meg <span className="bg-gradient-to-r from-[#F2507F] to-[#A855C9] bg-clip-text text-transparent">a nagy napot</span>
            </h1>
            <p className="hidden sm:block mt-4 max-w-xl text-lg text-[#6B6480]">
              Fotósok, zenészek, helyszínek, torták és még sok más – kérj ajánlatot egyszerre több szolgáltatótól.
            </p>

            {/* Kereső */}
            <form onSubmit={submitSearch} className="glass-strong mt-4 sm:mt-7 flex items-center gap-3 rounded-full py-2 pl-5 pr-2">
              <Search className="h-5 w-5 shrink-0 text-[#1F1A2E]" strokeWidth={2.2} />
              <label className="flex-1 min-w-0">
                <span className="block text-[15px] font-semibold text-[#1F1A2E] leading-tight">Mit keresel?</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Fotós, helyszín, torta, megye…"
                  className="w-full bg-transparent text-[13px] text-[#6B6480] placeholder:text-[#8F87A3] outline-none"
                />
              </label>
              <button type="submit" aria-label="Keresés" className="rose-cta flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </form>

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

          {/* ── Kiemelt kártya ── */}
          {current && (
            <div className="mt-3 lg:mt-0">
              <div
                className="relative overflow-hidden rounded-[30px] shadow-[0_30px_60px_-25px_rgba(90,20,60,0.55)] ring-1 ring-white/70 aspect-[4/4.3] sm:aspect-[16/11]"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={current.id} src={coverOf(current)} alt={current.full_name} className="blur-in absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0b1e]/85 via-[#1a0b1e]/10 to-transparent" />

                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span className="glass-strong inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#1F1A2E]">
                    {current.featured ? (
                      <><Flame className="h-4 w-4 text-[#E8336A] fill-[#E8336A]" /> Kiemelt</>
                    ) : (
                      <><Star className="h-4 w-4 text-[#E8336A] fill-[#E8336A]" /> Népszerű</>
                    )}
                  </span>
                  <Link href={`/providers/${current.id}`} aria-label="Kedvencnek jelölöm" className="glass-dark flex h-10 w-10 items-center justify-center rounded-full text-white">
                    <Heart className="h-5 w-5" />
                  </Link>
                </div>

                <div key={`t-${current.id}`} className="sheet-up absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6 text-white">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/75">
                      {(current.categories ?? []).map((c) => CATEGORY_LABELS[c]).slice(0, 2).join(" · ")}
                    </p>
                    <h2 className="mt-1 font-heading font-bold text-[24px] sm:text-[30px] leading-tight line-clamp-2">{current.full_name}</h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-white/90">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{(current.counties ?? [])[0]}</span>
                      {(current.review_count ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-4 w-4 fill-white" />
                          {(current.average_rating ?? 0).toFixed(1)} ({current.review_count})
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/providers/${current.id}`}
                    className="glass-dark flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 text-[14px] font-semibold"
                  >
                    Megnézem
                    <span className="rose-cta flex h-9 w-9 items-center justify-center rounded-full">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>

              {spotlight.length > 1 && (
                <div className="mt-3 flex justify-center gap-1.5">
                  {spotlight.map((p, i) => (
                    <button
                      key={p.id}
                      aria-label={`${i + 1}. kiemelt szolgáltató`}
                      onClick={() => setActive(i)}
                      className={cn("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-[#E8336A]" : "w-1.5 bg-[#E8336A]/30")}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Fedezd fel ── */}
        {discover.length > 0 && (
          <div className="mt-6 sm:mt-10">
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
