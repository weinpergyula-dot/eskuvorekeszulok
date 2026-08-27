"use client";

import { useEffect, useRef } from "react";

/**
 * PREMIUM extra: satírozott dátum. Először a betűk körvonala „rajzolódik
 * meg”, majd ferde vonalkás (ceruzával árnyékolt) kitöltést kap, végül egy
 * kézzel húzott aláhúzás fut végig alatta. Az animáció akkor indul, amikor a
 * felirat képernyőre kerül – a CSS `is-in` osztályhoz kötve.
 *
 * A textLength miatt a felirat a betűtípus betöltésétől függetlenül mindig
 * ugyanakkora, így nem ugrik meg a betöltés végén.
 */
export function SketchDate({ text, sub }: { text: string; sub?: string }) {
  const ref = useRef<HTMLDivElement>(null);

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
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto w-full max-w-xl">
      <svg viewBox="0 0 600 150" role="img" aria-label={text} className="w-full">
        <defs>
          {/* Ferde vonalkás satírozás – ez adja az árnyékolt kitöltést */}
          <pattern
            id="prm-hatch"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(38)"
          >
            <rect x="0" y="0" width="2.6" height="6" fill="#E8B4D4" />
          </pattern>
          {/* Keresztsatír a mélyebb tónusért */}
          <pattern
            id="prm-hatch-2"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-42)"
          >
            <rect x="0" y="0" width="1.6" height="8" fill="#C65EA5" />
          </pattern>
        </defs>

        {/* satírozott kitöltés (két rétegben) */}
        <g className="prm-sketch-fill">
          <text
            x="300"
            y="86"
            textAnchor="middle"
            textLength="520"
            lengthAdjust="spacingAndGlyphs"
            fill="url(#prm-hatch)"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 72, fontWeight: 600 }}
          >
            {text}
          </text>
          <text
            x="300"
            y="86"
            textAnchor="middle"
            textLength="520"
            lengthAdjust="spacingAndGlyphs"
            fill="url(#prm-hatch-2)"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 72, fontWeight: 600 }}
          >
            {text}
          </text>
        </g>

        {/* körvonal – ez „rajzolódik meg” elsőként */}
        <text
          x="300"
          y="86"
          textAnchor="middle"
          textLength="520"
          lengthAdjust="spacingAndGlyphs"
          fill="none"
          stroke="#F6EAF3"
          strokeWidth="1.1"
          className="prm-sketch-outline"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 72, fontWeight: 600 }}
        >
          {text}
        </text>

        {/* halvány, elcsúsztatott második körvonal – kézirajz-hatás */}
        <text
          x="301.6"
          y="87.4"
          textAnchor="middle"
          textLength="520"
          lengthAdjust="spacingAndGlyphs"
          fill="none"
          stroke="#C65EA5"
          strokeWidth="0.9"
          opacity="0.55"
          className="prm-sketch-outline"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 72, fontWeight: 600 }}
        >
          {text}
        </text>

        {/* kézzel húzott aláhúzás */}
        <path
          d="M78 108 C 180 100, 300 116, 430 104 C 470 100, 500 106, 522 110"
          fill="none"
          stroke="#C65EA5"
          strokeWidth="2.6"
          strokeLinecap="round"
          className="prm-sketch-underline"
        />

        {sub && (
          <text
            x="300"
            y="136"
            textAnchor="middle"
            fill="#C3A3C0"
            className="prm-sketch-fill"
            style={{
              fontFamily: "'Jost', ui-sans-serif, system-ui, sans-serif",
              fontSize: 15,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
            }}
          >
            {sub}
          </text>
        )}
      </svg>
    </div>
  );
}
