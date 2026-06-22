"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A kategória-oldal "Csoportos / Egyéni ajánlatkérés" sora. A navbar alá tapad
 * (sticky). Amikor odatapad, a háttere az Instagram alsó sávjához hasonló matt
 * üveg (frosted glass) hatást kap: ~80% fedettség + erős backdrop-blur. Lefelé
 * scrollozáskor — a headerrel együtt — kicsit össze is zsugorodik.
 */
export function StickyCta({
  label,
  href,
  bgColor,
}: {
  label: string;
  href: string;
  bgColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [shrink, setShrink] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (el) setStuck(el.getBoundingClientRect().top <= 65);
      // Ugyanaz a logika, mint a navbarnál, hogy együtt zsugorodjanak.
      const y = window.scrollY;
      if (y < 80) setShrink(false);
      else if (y > lastScrollY.current + 4) setShrink(true);
      else if (y < lastScrollY.current - 4) setShrink(false);
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className={`sticky z-40 w-full border-b border-white/20 transition-all duration-300 ${stuck ? "backdrop-blur-xl" : ""}`}
      style={{ top: "var(--nav-h, 4rem)", backgroundColor: stuck ? `${bgColor}CC` : bgColor }}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center transition-all duration-300 ${shrink ? "py-1.5" : "py-3"}`}>
        <a
          href={href}
          className={`inline-flex items-center rounded-full border border-white/70 text-white font-medium hover:bg-white/15 transition-all duration-300 ${shrink ? "px-4 py-1 text-xs" : "px-5 py-2 text-sm"}`}
        >
          {label}
        </a>
      </div>
    </div>
  );
}
