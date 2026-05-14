"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function resetPasswordAction(
  params: { code?: string; tokenHash?: string },
  password: string
): Promise<{ error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return { error: "Konfiguráció hiányzik." };
  if (!params.code && !params.tokenHash) return { error: "Hiányzó visszaállítási token." };

  // Temporary in-memory cookie store — never written to the browser
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
        cookiesToSet.forEach(({ name, value }) => tempCookies.set(name, value));
      },
    },
  });

  // Exchange the token/code to get a temporary server-side session
  if (params.tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: params.tokenHash,
      type: "recovery",
    });
    if (error) return { error: "Érvénytelen vagy lejárt visszaállítási link. Kérj újat." };
  } else if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) return { error: "Érvénytelen vagy lejárt visszaállítási link. Kérj újat." };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { error: "Hiba történt a jelszó mentésekor. Kérj új visszaállítási linket." };

  // Revoke the server-side session — browser never had it
  await supabase.auth.signOut();

  return {};
}
