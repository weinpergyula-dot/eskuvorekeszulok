"use client";

import { useEffect, useState } from "react";

// A szertartás kezdete – Arad nyáron EEST (UTC+3)
const TARGET = new Date("2027-06-15T16:00:00+03:00").getTime();

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

export function Countdown() {
  // SSR alatt nincs érték – hidratálás után indul, hogy ne legyen mismatch
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(partsUntil(Date.now()));
    const first = setTimeout(tick, 0); // első frissítés aszinkron (hidratálás után)
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const items: { value: string; label: string }[] = [
    { value: parts ? String(parts.d) : "—", label: "nap" },
    { value: parts ? String(parts.h).padStart(2, "0") : "—", label: "óra" },
    { value: parts ? String(parts.m).padStart(2, "0") : "—", label: "perc" },
    { value: parts ? String(parts.s).padStart(2, "0") : "—", label: "mp" },
  ];

  return (
    <div className="flex items-stretch justify-center gap-3 sm:gap-5">
      {items.map((it) => (
        <div
          key={it.label}
          className="zs-count-box flex w-[72px] flex-col items-center rounded-xl px-2 py-3 sm:w-[92px] sm:py-4"
        >
          <span className="zs-serif text-3xl font-medium tabular-nums sm:text-4xl">
            {it.value}
          </span>
          <span className="zs-caps mt-1 text-[10px] sm:text-[11px]">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
