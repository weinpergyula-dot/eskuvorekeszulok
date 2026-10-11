"use client";

import { useEffect, useState } from "react";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";

/**
 * A szolgáltatói szekció címe a főoldalon: a gyorskategória-csempéken
 * kiválasztott kategóriát tükrözi ("Összes szolgáltató", vagy a kategória
 * neve), mögötte zárójelben a találatok számával. A ProvidersContent az
 * "eskuvo:category" eseménnyel a mindenkori szűrőt, az "eskuvo:count"
 * eseménnyel a darabszámot jelzi.
 */
export function ProvidersSectionTitle() {
  const [category, setCategory] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const h = (e: Event) => setCategory((e as CustomEvent<string>).detail ?? "");
    window.addEventListener("eskuvo:category", h);
    const c = (e: Event) => setCount((e as CustomEvent<number>).detail);
    window.addEventListener("eskuvo:count", c);
    return () => {
      window.removeEventListener("eskuvo:category", h);
      window.removeEventListener("eskuvo:count", c);
    };
  }, []);

  const label = CATEGORY_LABELS[category as ServiceCategory];

  return (
    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
      {label ?? "Összes szolgáltató"}
      {count !== null && <span className="font-semibold text-gray-500"> ({count})</span>}
    </h2>
  );
}
