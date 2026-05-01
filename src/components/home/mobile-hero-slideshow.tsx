"use client";

import { useState, useEffect } from "react";

const IMAGES = [
  "/bride_full_1banner_mobile.webp",
  "/fodraszok_mobil.webp",
  "/meghivok_mobil.webp",
  "/ruhak_csokrok_mobil.webp",
  "/tortak_mobil.webp",
];

export function MobileHeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/4" }}>
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
    </div>
  );
}
