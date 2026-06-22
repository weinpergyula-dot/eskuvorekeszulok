"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A kategória-oldal "Csoportos / Egyéni ajánlatkérés" sora. A navbar alá tapad
 * (sticky), és amikor ténylegesen odatapad (scrollozás közben), a háttere a
 * headerhez hasonlóan minimálisan áttetszővé + elmosottá válik.
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

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      // A navbar magasságánál (max 64px) vagy ez alatt már odatapadt.
      setStuck(el.getBoundingClientRect().top <= 65);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className={`sticky z-40 w-full border-b border-white/20 transition-all duration-300 ${stuck ? "backdrop-blur-md" : ""}`}
      style={{ top: "var(--nav-h, 4rem)", backgroundColor: stuck ? `${bgColor}D9` : bgColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-center">
        <a
          href={href}
          className="inline-flex items-center px-5 py-2 rounded-full border border-white/70 text-white text-sm font-medium hover:bg-white/15 transition-colors"
        >
          {label}
        </a>
      </div>
    </div>
  );
}
