"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A kategória-oldal "Csoportos / Egyéni ajánlatkérés" sora. A navbar alá tapad
 * (sticky), és a háttere mindig az Instagram alsó sávjához hasonló matt üveg
 * (frosted glass): ~80% fedettség + erős backdrop-blur — függetlenül attól, hogy
 * fent vagyunk-e. Lefelé scrollozáskor — a headerrel együtt — kicsit zsugorodik.
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
  const [shrink, setShrink] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      // Csak mobilon (<md) zsugorodjon, a navbarral azonos logikával.
      const y = window.scrollY;
      if (window.innerWidth >= 768) { setShrink(false); lastScrollY.current = y; return; }
      if (y < 80) setShrink(false);
      else if (y > lastScrollY.current + 4) setShrink(true);
      else if (y < lastScrollY.current - 4) setShrink(false);
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="sticky z-40 w-full transition-all duration-300"
      style={{ top: "calc(var(--nav-h, 4rem) + 12px)" }}
      data-color={bgColor}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center transition-all duration-300 ${shrink ? "py-1.5" : "py-3"}`}>
        <a
          href={href}
          className={`inline-flex items-center rounded-full rose-cta font-semibold transition-all duration-300 ${shrink ? "px-4 py-1 text-xs" : "px-5 py-2 text-sm"}`}
        >
          {label}
        </a>
      </div>
    </div>
  );
}
