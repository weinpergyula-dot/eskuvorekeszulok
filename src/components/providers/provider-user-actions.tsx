"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FavoriteButton } from "./favorite-button";

interface Props {
  providerId: string;
  providerUserId: string;
  /** Desktop vs. mobile layout */
  variant: "desktop" | "mobile";
}

/**
 * Renders user-specific actions (owner edit button or favorite button)
 * after client-side auth check — allows the parent page to be ISR cached.
 */
export function ProviderUserActions({ providerId, providerUserId, variant }: Props) {
  const [state, setState] = useState<"loading" | "owner" | "liked" | "guest">("loading");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setState("guest"); return; }

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setState("guest"); return; }
      if (user.id === providerUserId) { setState("owner"); return; }

      const { data: fav } = await supabase
        .from("favorites")
        .select("provider_id")
        .eq("user_id", user.id)
        .eq("provider_id", providerId)
        .maybeSingle();
      setState(fav ? "liked" : "guest");
    });
  }, [providerId, providerUserId]);

  if (state === "loading") {
    // Same size as the rendered button so layout doesn't shift
    return variant === "mobile"
      ? <div className="w-8 h-8" />
      : <div className="w-[120px] h-8" />;
  }

  if (state === "owner") {
    return variant === "mobile" ? (
      <a
        href="/profil?tab=provider"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 border border-gray-200 text-[#84AAA6] hover:text-[#6B8E8A]"
      >
        <Pencil className="h-4 w-4" />
      </a>
    ) : (
      <a
        href="/profil?tab=provider"
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 hover:bg-[#84AAA6]/10 transition-colors px-3 py-1.5"
      >
        <Pencil className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-700">Profil szerkesztés</span>
      </a>
    );
  }

  // guest or liked
  return variant === "mobile" ? (
    <FavoriteButton providerId={providerId} initialLiked={state === "liked"} hideTextOnMobile />
  ) : (
    <FavoriteButton providerId={providerId} initialLiked={state === "liked"} />
  );
}
