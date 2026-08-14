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
    <a href="#top" className="flex items-center gap-1.5" aria-label="Yette főoldal">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#00a868] text-base font-black text-white">
        y
      </span>
      <span className="text-xl font-extrabold tracking-tight text-gray-900">yette</span>
    </a>
  );
}

export function YetteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header id="top" className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Fő menü">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-[#00875a]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="#ugyfelszolgalat"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:inline-flex"
          >
            <MapPin className="h-4 w-4" />
            Üzletek
          </a>
          <a
            href="#belepes"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Belépés</span>
          </a>
          <a
            href="#ajanlatok"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00a868] px-3 py-2 text-sm font-semibold text-white hover:bg-[#00875a]"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Vásárlás</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-50 lg:hidden"
            aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      {open && (
        <nav className="border-t border-gray-100 bg-white lg:hidden" aria-label="Mobil menü">
          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
