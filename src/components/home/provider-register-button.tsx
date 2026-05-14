"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ProviderRegisterButton() {
  const router = useRouter();
  const supabase = createClient();
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/register?type=provider");
      return;
    }
    // Check if already a provider
    const { data: providerData } = await supabase
      .from("providers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (providerData) {
      setMessage("Már van szolgáltatói profilod! A profilodat a Profilom oldalon éred el.");
    } else {
      router.push("/auth/register?type=provider");
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        size="lg"
        onClick={handleClick}
        className="bg-transparent text-white border border-white hover:bg-white/10 hover:text-white px-6"
      >
        Regisztrálok szolgáltatónak
      </Button>
      {message && (
        <p className="text-sm text-white/90 bg-white/15 rounded-lg px-3 py-2 max-w-xs">
          {message}{" "}
          <button
            onClick={() => router.push("/profil?tab=provider")}
            className="underline font-medium cursor-pointer"
          >
            Profilom →
          </button>
        </p>
      )}
    </div>
  );
}
