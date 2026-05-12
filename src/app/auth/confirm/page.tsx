"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    // Email confirmation is already done server-side by Supabase.
    // We intentionally skip setSession so the user is NOT logged in automatically.
    router.replace("/auth/verified");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-gray-500 text-lg">Megerősítés folyamatban…</p>
    </div>
  );
}
