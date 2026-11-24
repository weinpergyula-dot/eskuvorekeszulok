"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Sparkles } from "lucide-react";

const COOKIE_KEY = "ann_banner_dismissed";
const TEXT =
  "Az oldal fejlesztési fázisban van – a szolgáltatók regisztrációja aktívan zajlik, ezért egyes kategóriákban még kevés ajánlatot találsz. Hamarosan teljes kínálattal várunk!";

function getCookie(name: string) {
  return document.cookie.split("; ").some((c) => c.startsWith(name + "="));
}

function setCookie(name: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `${name}=1; expires=${expires.toUTCString()}; path=/`;
}

export function AnnouncementBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie(COOKIE_KEY)) setVisible(true);
  }, []);

  if (pathname !== "/") return null;

  if (!visible) return null;

  const dismiss = () => {
    setCookie(COOKIE_KEY);
    setVisible(false);
  };

  return (
    <div className="w-full px-3 pt-2 sm:px-5">
      <div className="glass relative mx-auto flex max-w-7xl items-start gap-2.5 rounded-2xl py-2 pl-3 pr-8 sm:justify-center">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#E8336A]" />
        <p className="text-[13px] leading-snug text-[#4A4360] sm:text-center">{TEXT}</p>
        <button
          onClick={dismiss}
          aria-label="Bezárás"
          className="absolute right-2 top-2 text-[#6B6480] hover:text-gray-900 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
