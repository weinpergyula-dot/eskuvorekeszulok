"use client";

import { useEffect, useState } from "react";
import { Menu, X, User, MapPin } from "lucide-react";

const NAV = [
  { label: "Mobil", href: "#havidijas" },
  { label: "Internet", href: "#internet" },
  { label: "TV", href: "#tv" },
  { label: "Készülékek", href: "#keszulekek" },
  { label: "Ügyintézés", href: "#ugyfelszolgalat" },
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

  return (
    // A fejléc maga átlátszó: a fehér sáv két lekerekített alsó sarkán mindig
    // az látszik át, ami épp alatta gördül – így a sarkok színe automatikusan
    // követi az aktuális szekció hátterét (sötétkék, világoskék, fehér, lime).
    <header id="top" className="sticky top-0 z-50">
      <div className="overflow-hidden rounded-b-[24px] border-b border-[#CDE0EA] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Fő menü">
              {NAV.map((item) => {
                const isActive = active === item.href.slice(1);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative text-sm font-semibold transition-colors ${
                      isActive ? "text-[#002340]" : "text-[#2D466C] hover:text-[#002340]"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`pointer-events-none absolute -bottom-1 left-0 h-0.5 w-full rounded bg-[#B4FF00] transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </a>
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

        {/* Mobil menü */}
        {open && (
          <nav className="border-t border-[#CDE0EA] bg-white lg:hidden" aria-label="Mobil menü">
            <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
              {NAV.map((item) => {
                const isActive = active === item.href.slice(1);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`block rounded-lg border-l-4 px-2 py-2.5 text-sm font-semibold text-[#002340] ${
                      isActive ? "border-[#B4FF00] bg-[#E4F2F7]" : "border-transparent hover:bg-[#E4F2F7]"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
