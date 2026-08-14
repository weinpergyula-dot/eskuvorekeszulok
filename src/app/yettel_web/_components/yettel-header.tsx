"use client";

import { useState } from "react";
import { Menu, X, ShoppingCart, User, MapPin } from "lucide-react";

const NAV = [
  { label: "Mobil", href: "#havidijas" },
  { label: "Internet", href: "#internet" },
  { label: "TV", href: "#tv" },
  { label: "Készülékek", href: "#keszulekek" },
  { label: "Ajánlatok", href: "#ajanlatok" },
  { label: "Ügyfélszolgálat", href: "#ugyfelszolgalat" },
];

function Logo() {
  return (
    <a href="#top" className="flex items-baseline gap-0.5" aria-label="Yettel főoldal">
      <span className="text-xl font-extrabold tracking-tight text-[#14245E]">Yettel</span>
      {/* Yettel jellegű kis háromszög-akcentus */}
      <span
        aria-hidden
        className="inline-block h-0 w-0 border-x-[5px] border-b-[8px] border-x-transparent border-b-[#C6F24E]"
      />
    </a>
  );
}

export function YettelHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header id="top" className="sticky top-0 z-50 border-b border-[#E6EAF2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Fő menü">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-[#5B6684] transition-colors hover:text-[#14245E]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="#ugyfelszolgalat"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#5B6684] hover:bg-[#F1F5FC] sm:inline-flex"
          >
            <MapPin className="h-4 w-4" />
            Üzletek
          </a>
          <a
            href="#belepes"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#14245E] hover:bg-[#F1F5FC]"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Belépés</span>
          </a>
          <a
            href="#ajanlatok"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C6F24E] px-3 py-2 text-sm font-bold text-[#14245E] transition-colors hover:bg-[#b6e63a]"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Vásárlás</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#14245E] hover:bg-[#F1F5FC] lg:hidden"
            aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      {open && (
        <nav className="border-t border-[#E6EAF2] bg-white lg:hidden" aria-label="Mobil menü">
          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2 py-2.5 text-sm font-semibold text-[#14245E] hover:bg-[#F1F5FC]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
