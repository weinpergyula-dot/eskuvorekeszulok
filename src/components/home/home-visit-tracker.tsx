"use client";

import { useEffect, useRef } from "react";

/**
 * A főoldal megnyitásakor küld egy jelzést a szervernek, ami az
 * IP-cím hash-ét rögzíti. Sütit nem használ, semmilyen azonosítót
 * nem tárol a böngészőben – az admin felület napi/heti egyedi IP
 * statisztikáját táplálja.
 */
export function HomeVisitTracker() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return; // React StrictMode dupla mountja ellen
    sent.current = true;
    fetch("/api/track/home-visit", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
