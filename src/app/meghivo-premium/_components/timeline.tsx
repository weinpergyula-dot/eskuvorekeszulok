"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * PREMIUM extra: a nap programja időegyenesen. Középen fut az időtengely,
 * balra az időpontok, jobbra maguk az események.
 *
 * Nem tölt be előre: minden esemény akkor úszik be (és akkor világít ki
 * mellette a tengelyszakasz), amikor a képernyő közepéig felér – így a
 * vonal görgetés közben, szakaszonként épül fel.
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
    const list = ref.current;
    if (!list) return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>(".prm-tl-item"));

    // A látómező alsó 45%-át levágjuk: egy sor akkor számít „megérkezettnek”,
    // amikor a teteje a képernyő közepe fölé ér.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -45% 0px", threshold: 0 }
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <ol ref={ref} className="prm-timeline">
      {items.map(({ time, title, desc, icon }) => (
        <li key={time} className="prm-tl-item">
          <div className="prm-tl-time">
            <span className="prm-serif">{time}</span>
          </div>

          <div className="prm-tl-axis">
            <span className="prm-tl-dot" aria-hidden />
          </div>

          <div className="prm-tl-body">
            <div className="prm-card px-4 py-4 sm:px-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="prm-icon-ring shrink-0">{icon}</span>
                <div className="min-w-0">
                  <h3 className="prm-serif text-lg leading-snug">{title}</h3>
                  <p className="prm-muted mt-1 text-[15px] leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
