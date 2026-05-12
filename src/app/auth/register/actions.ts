"use server";

/**
 * Signs up a new user via the Supabase REST API directly, without including a
 * PKCE code_challenge. This makes Supabase send a token_hash-based confirmation
 * email that can be verified from any browser or device.
 */
export async function signUpAction(
  email: string,
  password: string,
  emailRedirectTo: string,
  userData: Record<string, unknown>
): Promise<{ userId: string | null; error: string | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { userId: null, error: "Supabase nincs konfigurálva." };
  }

  // redirect_to must be a query parameter – passing it in the body is ignored by GoTrue
  const signupUrl = new URL(`${supabaseUrl}/auth/v1/signup`);
  signupUrl.searchParams.set("redirect_to", emailRedirectTo);

  const res = await fetch(signupUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      email,
      password,
      data: userData,
      // No code_challenge → Supabase sends OTP/implicit-flow email (works from any browser)
      gotrue_meta_security: {},
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    const msg: string = json?.msg ?? json?.error_description ?? json?.message ?? "Ismeretlen hiba.";
    return { userId: null, error: msg };
  }

  const userId: string | null = json?.id ?? null;
  if (!userId) return { userId: null, error: "Ismeretlen hiba történt." };

  return { userId, error: null };
}
