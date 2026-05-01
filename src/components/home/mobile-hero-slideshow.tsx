"use client";

import { useState, useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";

const IMAGES = [
  "/bride_full_1banner_mobile.webp",
  "/fodraszok_mobil.webp",
  "/meghivok_mobil.webp",
  "/ruhak_csokrok_mobil.webp",
  "/tortak_mobil.webp",
];

export function MobileHeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused]);

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

      {/* Dots + pause */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
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
        <button
          onClick={() => setPaused((v) => !v)}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-black/30 text-white cursor-pointer"
          aria-label={paused ? "Lejátszás" : "Szünet"}
        >
          {paused ? <Play className="h-3.5 w-3.5 ml-0.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
