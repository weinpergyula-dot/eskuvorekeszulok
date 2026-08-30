import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

type AdminGuardResult =
  | { error: NextResponse; user: null; supabase: null }
  | { error: null; user: User; supabase: ServerClient };

/**
 * Admin-ellenőrzés az /api/admin végpontokhoz.
 *
 * Minden admin route ugyanazt a három lépést végezte el kézzel (kliens,
 * bejelentkezett felhasználó, profiles.role === "admin"); ez az egy helyre
 * összevont változat. A hívó a bejelentkezett felhasználót és a már
 * létrehozott klienst is visszakapja, hogy ne kelljen újra elkészíteni:
 *
 *     const { error, user, supabase } = await requireAdmin();
 *     if (error) return error;
 *
 * Hiba esetén kész választ ad: 401, ha nincs bejelentkezve, 403, ha be van,
 * de nem admin.
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null, supabase: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null, supabase: null };
  }

  return { error: null, user, supabase };
}
