"use server";

import { createAdminClient } from "@/lib/supabase/admin";

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

/**
 * Returns a pre-signed upload URL so the browser can upload a file to
 * Supabase Storage without needing an authenticated session.
 */
export async function getSignedUploadUrlAction(
  bucket: string,
  path: string
): Promise<{ signedUrl: string; token: string; path: string } | { error: string }> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
    if (error) return { error: error.message };
    return data;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Signed URL hiba." };
  }
}

interface ProviderData {
  full_name: string;
  email: string;
  phone: string;
  counties: string[];
  categories: string[];
  description: string;
  detailed_description: string | null;
  website: string | null;
  avatar_url: string | null;
  gallery_urls: string[];
}

/**
 * Inserts the provider record and marks profiles TOS acceptance using the
 * admin client so it works even before the user confirms their email.
 */
export async function createProviderProfileAction(
  userId: string,
  providerData: ProviderData
): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();

    const { error: providerError } = await admin.from("providers").insert({
      user_id: userId,
      ...providerData,
      approval_status: "pending",
    });

    if (providerError) return { error: providerError.message };

    const now = new Date().toISOString();
    await admin.from("profiles").update({
      accepted_tos_at: now,
      accepted_privacy_at: now,
    }).eq("user_id", userId);

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ismeretlen szerverhiba (provider)." };
  }
}

/**
 * Updates profiles TOS acceptance for visitor registrations using admin client.
 */
export async function acceptTosAction(userId: string): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();
    await admin.from("profiles").update({
      accepted_tos_at: now,
      accepted_privacy_at: now,
    }).eq("user_id", userId);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ismeretlen szerverhiba (TOS)." };
  }
}
