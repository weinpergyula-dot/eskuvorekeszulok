"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/* Állandó olvasási tempó (px/mp), a kezdő és a végső megállás (ms). */
const SPEED_PX_S = 35;
const START_HOLD_MS = 1000;
const END_HOLD_MS = 2000;

/**
 * Egysoros szöveg, ami – ha nem fér ki – lassan balra csúszik, hogy a vége
 * is elolvasható legyen. A végén 2 mp-et vár, aztán az elejéről újraindul.
 * Ha kifér, vagy a látogató csökkentett mozgást kér, sima levágott (…)
 * szövegként jelenik meg.
 */
export function MarqueeText({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | null = null;
    let alive = true;

    const update = () => {
      if (!alive) return;
      animation?.cancel();
      animation = null;
      const overflow = box.scrollWidth - box.clientWidth;
      const moving = overflow > 1 && !reduced.matches;
      box.dataset.marquee = moving ? "on" : "off";
      if (!moving) return;
      const move = (overflow / SPEED_PX_S) * 1000;
      const total = START_HOLD_MS + move + END_HOLD_MS;
      const startAt = START_HOLD_MS / total;
      const endAt = (START_HOLD_MS + move) / total;
      animation = text.animate(
        [
          { transform: "translateX(0)", offset: 0 },
          { transform: "translateX(0)", offset: startAt, easing: "ease-in-out" },
          { transform: `translateX(${-overflow}px)`, offset: endAt },
          { transform: `translateX(${-overflow}px)`, offset: 1 },
        ],
        { duration: total, iterations: Infinity },
      );
    };

    update();
    /* A betűtípus betöltése után újramérünk (addig más a szöveg szélessége). */
    document.fonts?.ready.then(update);
    const observer = new ResizeObserver(update);
    observer.observe(box);
    reduced.addEventListener("change", update);
    return () => {
      alive = false;
      observer.disconnect();
      reduced.removeEventListener("change", update);
      animation?.cancel();
    };
  }, [children]);

  return (
    <span ref={boxRef} data-marquee="off" className={cn("marquee-text block overflow-hidden whitespace-nowrap", className)} style={style}>
      <span ref={textRef}>
        {children}
      </span>
    </span>
  );
}
