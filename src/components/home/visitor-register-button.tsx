"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function VisitorRegisterButton() {
  const router = useRouter();
  const supabase = createClient();
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setMessage("Már be vagy jelentkezve! A profilodat a Profilom oldalon éred el.");
      return;
    }
    router.push("/auth/register?type=visitor");
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        size="lg"
        onClick={handleClick}
        className="bg-transparent text-white border border-white hover:bg-white/10 hover:text-white px-6"
      >
        Regisztrálok látogatónak
      </Button>
      {message && (
        <p className="text-sm text-white/90 bg-white/15 rounded-lg px-3 py-2 max-w-xs">
          {message}{" "}
          <button
            onClick={() => router.push("/profil")}
            className="underline font-medium cursor-pointer"
          >
            Profilom →
          </button>
        </p>
      )}
    </div>
  );
}
