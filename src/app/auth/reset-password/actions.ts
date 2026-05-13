"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function resetPasswordAction(
  code: string,
  password: string
): Promise<{ error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return { error: "Konfiguráció hiányzik." };

  // Temporary cookie store — we deliberately do NOT persist these to the browser
  const tempCookies = new Map<string, string>();
  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return [
          ...cookieStore.getAll(),
          ...Array.from(tempCookies.entries()).map(([name, value]) => ({ name, value })),
        ];
      },
      setAll(cookiesToSet) {
        // Store in memory only — never written to the browser response
        cookiesToSet.forEach(({ name, value }) => tempCookies.set(name, value));
      },
    },
  });

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return { error: "Érvénytelen vagy lejárt visszaállítási link. Kérj újat." };

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { error: "Hiba történt a jelszó mentésekor. Kérj új visszaállítási linket." };

  // Sign out server-side — tokens in tempCookies are revoked on Supabase's side
  await supabase.auth.signOut();

  return {};
}
