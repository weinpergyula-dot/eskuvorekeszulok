"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * PREMIUM extra: a nap programja időegyenesen. Amikor a szekció képernyőre
 * kerül, előbb az időtengely „húzódik meg” felülről lefelé, majd sorban,
 * egymás után úsznak be az események – mindegyik mellé egy pont pattan ki a
 * tengelyen.
 */

export type TimelineItem = {
  time: string;
  title: string;
  desc: string;
  /* Kész elem, nem komponens: szerver oldalról csak így adható át. */
  icon: ReactNode;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <ol ref={ref} className="prm-timeline">
      {items.map(({ time, title, desc, icon }, i) => {
        // A tengely rajzolása után indulnak az események, egyesével.
        const delay = `${420 + i * 170}ms`;
        return (
          <li key={time} className="prm-tl-item" style={{ transitionDelay: delay }}>
            <span className="prm-tl-dot" style={{ animationDelay: delay }} aria-hidden />
            <div className="prm-card px-5 py-4 sm:px-6">
              <div className="flex items-start gap-4">
                <span className="prm-icon-ring shrink-0">{icon}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="prm-serif text-xl text-[var(--prm-rose)]">{time}</span>
                    <h3 className="prm-serif text-lg">{title}</h3>
                  </div>
                  <p className="prm-muted mt-1 text-[15px] leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
