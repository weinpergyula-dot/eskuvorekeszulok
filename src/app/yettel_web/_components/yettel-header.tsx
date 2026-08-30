"use client";

import { useEffect, useState } from "react";
import { Menu, X, User, MapPin, ChevronDown } from "lucide-react";

type NavLink = { label: string; href: string };
/** Menüpont: vagy közvetlen link, vagy legördülő al-linkekkel. */
type NavEntry = { label: string; href?: string; items?: NavLink[] };

const NAV: NavEntry[] = [
  {
    label: "Mobil",
    items: [
      { label: "Havidíjas", href: "#havidijas" },
      { label: "Feltöltőkártyás", href: "#feltoltokartya" },
    ],
  },
  {
    label: "Otthoni",
    items: [
      { label: "Internet", href: "#internet" },
      { label: "Yettel TV", href: "#tv" },
    ],
  },
  { label: "Készülékek", href: "#keszulekek" },
  { label: "Ügyintézés", href: "#ugyfelszolgalat" },
];

// Ügyfélszegmensek a fejléc fölötti vékony sávban. A mockup a lakossági
// oldalt mutatja, ezért az van kiemelve; a másik kettő egyelőre placeholder.
const SEGMENTS: { label: string; href: string; current?: boolean }[] = [
  { label: "Lakossági", href: "#top", current: true },
  { label: "Kisvállalkozói", href: "#" },
  { label: "Vállalati", href: "#" },
];

function Logo() {
  return (
    <a href="#top" className="flex items-end gap-1" aria-label="Yettel főoldal">
      <span className="text-2xl font-extrabold leading-none tracking-tight text-[#002340]">Yettel</span>
      {/* Yettel jellegű lime pont-akcentus */}
      <span aria-hidden className="mb-0.5 inline-block h-2.5 w-2.5 rounded-full bg-[#B4FF00]" />
    </a>
  );
}

export function YettelHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  // Aktív menüpont: a hash-ből és a fülváltásból (yettel:section esemény).
  useEffect(() => {
    const fromHash = () => setActive(window.location.hash.slice(1));
    const onSection = (e: Event) => setActive((e as CustomEvent<string>).detail);
    fromHash();
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("yettel:section", onSection);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener("yettel:section", onSection);
    };
  }, []);

  const isLinkActive = (href: string) => active === href.slice(1);
  // Legördülős menüpont akkor aktív, ha bármelyik al-linkje az.
  const isEntryActive = (entry: NavEntry) =>
    entry.href ? isLinkActive(entry.href) : !!entry.items?.some((i) => isLinkActive(i.href));

  return (
    <>
      {/* Szegmensválasztó: a fejléc magasságának kb. harmada, jobbra zárva.
          Szándékosan a sticky fejlécen kívül van, így felgörgetéskor eltűnik
          és nem eszi a helyet – a fejléc eltolásai (banner, anchor) sem
          csúsznak el tőle. */}
      <div className="border-b border-[#CDE0EA] bg-[#E4F2F7]">
        <div className="mx-auto flex h-5 max-w-6xl items-center justify-end gap-4 px-4 sm:px-6">
          {SEGMENTS.map((seg) => (
            <a
              key={seg.label}
              href={seg.href}
              aria-current={seg.current ? "page" : undefined}
              className={`text-[11px] leading-none transition-colors ${
                seg.current
                  ? "font-bold text-[#002340]"
                  : "font-medium text-[#2D466C] hover:text-[#002340]"
              }`}
            >
              {seg.label}
            </a>
          ))}
        </div>
      </div>

    {/* A fejléc maga átlátszó: a fehér sáv két lekerekített alsó sarkán mindig
        az látszik át, ami épp alatta gördül – így a sarkok színe automatikusan
        követi az aktuális szekció hátterét. */}
    <header id="top" className="sticky top-0 z-50">
      <div className="rounded-b-[24px] border-b border-[#CDE0EA] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Fő menü">
              {NAV.map((entry) => {
                const entryActive = isEntryActive(entry);
                const underline = (
                  <span
                    className={`pointer-events-none absolute -bottom-1 left-0 h-0.5 w-full rounded bg-[#B4FF00] transition-opacity ${
                      entryActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                );

                // Sima menüpont (Készülékek, Ügyintézés)
                if (!entry.items) {
                  return (
                    <a
                      key={entry.label}
                      href={entry.href}
                      aria-current={entryActive ? "page" : undefined}
                      className={`relative text-sm font-semibold transition-colors ${
                        entryActive ? "text-[#002340]" : "text-[#2D466C] hover:text-[#002340]"
                      }`}
                    >
                      {entry.label}
                      {underline}
                    </a>
                  );
                }

                // Legördülős menüpont (Mobil, Otthoni) – hoverre és fókuszra nyílik.
                return (
                  <div key={entry.label} className="group relative">
                    <button
                      type="button"
                      aria-haspopup="true"
                      className={`relative inline-flex items-center gap-1 text-sm font-semibold transition-colors ${
                        entryActive ? "text-[#002340]" : "text-[#2D466C] group-hover:text-[#002340]"
                      }`}
                    >
                      {entry.label}
                      <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                      {underline}
                    </button>
                    {/* A felső térköz "híd", hogy a menü ne csukódjon be lefelé mozgó kurzornál. */}
                    <div className="invisible absolute left-1/2 top-full z-10 -translate-x-1/2 pt-3 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <div className="min-w-[200px] rounded-2xl border border-[#CDE0EA] bg-white p-2 shadow-[0_18px_40px_-18px_rgba(0,35,64,0.45)]">
                        {entry.items.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            aria-current={isLinkActive(item.href) ? "page" : undefined}
                            className={`block rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                              isLinkActive(item.href)
                                ? "bg-[#E4F2F7] text-[#002340]"
                                : "text-[#2D466C] hover:bg-[#E4F2F7] hover:text-[#002340]"
                            }`}
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="#ugyfelszolgalat"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#2D466C] hover:bg-[#E4F2F7] sm:inline-flex"
            >
              <MapPin className="h-4 w-4" />
              Üzletek
            </a>
            <a
              href="#belepes"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#B4FF00] px-3 py-2 text-sm font-bold text-[#002340] transition-colors hover:bg-[#9BE000]"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Belépés</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#002340] hover:bg-[#E4F2F7] lg:hidden"
              aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobil menü – a legördülős menüpontok csoportcímmel, alatta az al-linkek. */}
        {open && (
          <nav className="rounded-b-[24px] border-t border-[#CDE0EA] bg-white lg:hidden" aria-label="Mobil menü">
            <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
              {NAV.map((entry) => {
                const link = (item: NavLink) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isLinkActive(item.href) ? "page" : undefined}
                    className={`block rounded-lg border-l-4 px-2 py-2.5 text-sm font-semibold text-[#002340] ${
                      isLinkActive(item.href)
                        ? "border-[#B4FF00] bg-[#E4F2F7]"
                        : "border-transparent hover:bg-[#E4F2F7]"
                    }`}
                  >
                    {item.label}
                  </a>
                );

                if (!entry.items) return link({ label: entry.label, href: entry.href! });

                return (
                  <div key={entry.label} className="pt-1">
                    <p className="px-2 pb-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#7E93B0]">
                      {entry.label}
                    </p>
                    <div className="pl-2">{entry.items.map(link)}</div>
                  </div>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
    </>
  );
}
