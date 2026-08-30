"use client";

import { useEffect, useRef } from "react";

/**
 * Az oldal megnyitásakor küld egy jelzést a szervernek, ami az IP-cím
 * hash-ét rögzíti. Sütit nem használ, semmilyen azonosítót nem tárol a
 * böngészőben – az admin felület napi/heti egyedi IP statisztikáját
 * táplálja. A `path` a mért oldalak zárt listájából való.
 */
export function VisitTracker({ path }: { path: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return; // React StrictMode dupla mountja ellen
    sent.current = true;
    fetch("/api/track/visit", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => {});
  }, [path]);

  return null;
}
