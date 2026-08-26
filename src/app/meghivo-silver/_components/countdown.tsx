"use client";

import { useEffect, useState } from "react";

// A szertartás kezdete – Balatonfüred, CEST (UTC+2)
const TARGET = new Date("2027-09-04T15:30:00+02:00").getTime();

type Parts = { d: number; h: number; m: number; s: number };

function partsUntil(now: number): Parts {
  const diff = Math.max(0, TARGET - now);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor(diff / 3_600_000) % 24,
    m: Math.floor(diff / 60_000) % 60,
    s: Math.floor(diff / 1_000) % 60,
  };
}

const UNITS: { key: keyof Parts; label: string }[] = [
  { key: "d", label: "nap" },
  { key: "h", label: "óra" },
  { key: "m", label: "perc" },
  { key: "s", label: "másodperc" },
];

export function Countdown() {
  // SSR alatt nincs érték – hidratálás után indul, hogy ne legyen mismatch.
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(partsUntil(Date.now()));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
      {UNITS.map(({ key, label }) => (
        <div key={key} className="slv-count-box w-[74px] rounded-xl px-2 py-3 sm:w-[92px] sm:py-4">
          <div className="slv-serif text-2xl leading-none sm:text-3xl" suppressHydrationWarning>
            {parts ? String(parts[key]).padStart(2, "0") : "––"}
          </div>
          <div className="slv-caps mt-2 text-[9px] sm:text-[10px]">{label}</div>
        </div>
      ))}
    </div>
  );
}
