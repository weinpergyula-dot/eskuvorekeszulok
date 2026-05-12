"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // The Supabase browser client auto-detects #access_token in the hash.
    // Listen for the resulting SIGNED_IN / USER_UPDATED event and redirect.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        subscription.unsubscribe();
        router.replace("/auth/verified");
      }
    });

    // If a session is already present (e.g. page re-visit), redirect immediately.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        router.replace("/auth/verified");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-gray-500 text-lg">Megerősítés folyamatban…</p>
    </div>
  );
}
