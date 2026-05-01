"use client";

import { useState, useEffect, useRef } from "react";

const IMAGES = [
  "/bride_full_1banner_mobile.webp",
  "/fodraszok_mobil.webp",
  "/meghivok_mobil.webp",
  "/ruhak_csokrok_mobil.webp",
  "/tortak_mobil.webp",
];

export function MobileHeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (i: number) => setCurrent((i + IMAGES.length) % IMAGES.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "4/5" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {IMAGES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}

      {/* Dots */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="cursor-pointer"
            aria-label={`${i + 1}. kép`}
          >
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: i === current ? 20 : 8,
                height: 8,
                backgroundColor: i === current ? "#84AAA6" : "rgba(255,255,255,0.7)",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
