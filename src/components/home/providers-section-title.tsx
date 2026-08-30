"use client";

import { useEffect, useState } from "react";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";

/**
 * A szolgáltatói szekció címe a főoldalon: a gyorskategória-csempéken
 * kiválasztott kategóriát tükrözi ("Összes szolgáltató", vagy a kategória
 * neve). A ProvidersContent az "eskuvo:category" eseménnyel jelzi a
 * mindenkori szűrőt.
 */
export function ProvidersSectionTitle() {
  const [category, setCategory] = useState("");

  useEffect(() => {
    const h = (e: Event) => setCategory((e as CustomEvent<string>).detail ?? "");
    window.addEventListener("eskuvo:category", h);
    return () => window.removeEventListener("eskuvo:category", h);
  }, []);

  const label = CATEGORY_LABELS[category as ServiceCategory];

  return (
    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
      {label ?? "Összes szolgáltató"}
    </h2>
  );
}
