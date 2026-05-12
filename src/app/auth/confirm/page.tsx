"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function handleConfirm() {
      // Read tokens from URL hash (#access_token=...&refresh_token=...)
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) {
          router.replace("/auth/verified");
          return;
        }
      }

      // Fallback: session may already be set (e.g. page revisit)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/auth/verified");
      }
    }

    handleConfirm();
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-gray-500 text-lg">Megerősítés folyamatban…</p>
    </div>
  );
}
