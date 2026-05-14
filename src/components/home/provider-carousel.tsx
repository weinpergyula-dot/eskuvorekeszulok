"use client";

import { useRef } from "react";
import type { Provider } from "@/lib/types";
import { ProviderCard } from "@/components/providers/provider-card";

const DURATION = 35; // seconds for one full loop

interface ProviderCarouselProps {
  providers: Provider[];
}

export function ProviderCarousel({ providers }: ProviderCarouselProps) {
  if (providers.length === 0) return null;

  // Duplicate cards for seamless infinite loop
  const doubled = [...providers, ...providers];

  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const frozenX = useRef<number>(0);

  /** Snapshot the current CSS-animated translateX */
  const getComputedX = (): number => {
    if (!trackRef.current) return 0;
    const matrix = new DOMMatrix(window.getComputedStyle(trackRef.current).transform);
    return matrix.m41;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const track = trackRef.current;
    if (!track) return;
    touchStartX.current = e.touches[0].clientX;
    frozenX.current = getComputedX();
    // Freeze animation at current position
    track.style.animation = "none";
    track.style.transform = `translateX(${frozenX.current}px)`;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const track = trackRef.current;
    if (touchStartX.current === null || !track) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    track.style.transform = `translateX(${frozenX.current + dx}px)`;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const track = trackRef.current;
    if (!track || touchStartX.current === null) return;

    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const endX = frozenX.current + dx;

    // Map endX back to a valid animation progress using negative delay trick
    const halfWidth = track.scrollWidth / 2;
    // Normalise into [-halfWidth, 0]
    let nx = endX % halfWidth;
    if (nx > 0) nx -= halfWidth;

    const progress = nx / -halfWidth; // 0..1
    const delaySec = -(progress * DURATION);

    track.style.transform = "";
    track.style.animation = `carousel-scroll ${DURATION}s ${delaySec.toFixed(3)}s linear infinite`;
    touchStartX.current = null;
  };

  return (
    <section className="sm:hidden bg-white pt-2 pb-10 overflow-hidden">
      <div className="px-4 mb-5">
        <h2 className="text-2xl font-bold text-gray-900">Kiemelt szolgáltatók</h2>
      </div>

      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className="carousel-track flex gap-3"
          style={{ width: "max-content" }}
        >
          {doubled.map((provider, i) => (
            <div
              key={`${provider.id}-${i}`}
              style={{ width: "calc(50vw - 20px)", flexShrink: 0 }}
            >
              <ProviderCard provider={provider} nameFontSize="18px" inCarousel />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
