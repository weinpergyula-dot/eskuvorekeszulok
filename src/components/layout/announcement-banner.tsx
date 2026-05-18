"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookie(COOKIE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setCookie(COOKIE_KEY);
    setVisible(false);
  };

  return (
    <div className="w-full bg-[#FEF9C3] border-b border-yellow-200 py-2 px-4">
      <div className="relative flex items-start justify-center gap-1.5 pr-6">
        <span className="shrink-0 font-black text-black leading-snug text-sm">!</span>
        <p className="text-sm text-gray-900 text-center">{TEXT}</p>
        <button
          onClick={dismiss}
          aria-label="Bezárás"
          className="absolute right-0 top-0 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
