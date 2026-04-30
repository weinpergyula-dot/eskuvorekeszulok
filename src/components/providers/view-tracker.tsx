"use client";

import { useEffect } from "react";

export function ViewTracker({ providerId }: { providerId: string }) {
  useEffect(() => {
    const key = `viewed_${providerId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/providers/${providerId}/view`, { method: "POST" }).catch(() => {});
  }, [providerId]);

  return null;
}
