"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { ConfirmEmail } from "@/emails/confirm-email";
import React from "react";

/**
 * Creates a new user via the Supabase Admin API.
 * Using the admin client bypasses GoTrue's built-in email sending entirely,
 * so no confirmation email is triggered by Supabase — we handle that ourselves.
 */
export async function signUpAction(
  email: string,
  password: string,
  _emailRedirectTo: string,
  userData: Record<string, unknown>
): Promise<{ userId: string | null; error: string | null }> {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // nem erősítjük meg azonnal — a saját emailünk végzi el
      user_metadata: userData,
    });

    if (error) {
      return { userId: null, error: error.message };
    }

    const userId = data?.user?.id ?? null;
    if (!userId) return { userId: null, error: "Ismeretlen hiba történt." };

    return { userId, error: null };
  } catch (err) {
    return { userId: null, error: err instanceof Error ? err.message : "Ismeretlen hiba." };
  }
}

/**
 * Generates a signup confirmation link and sends it via Resend.
 * Call this after signUpAction succeeds (when Supabase email is disabled).
 */
export async function sendConfirmationEmailAction(
  email: string,
  name: string,
  origin: string
): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (error || !data?.properties?.hashed_token) {
      console.error("[sendConfirmationEmail] generateLink error:", error?.message);
      return { error: "Nem sikerült a megerősítő email generálása." };
    }

    const confirmLink = `${origin}/auth/callback?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=magiclink`;

    await sendEmail({
      to: email,
      subject: "Regisztráció megerősítése – Esküvőre Készülök",
      template: React.createElement(ConfirmEmail, { confirmLink, name }),
    });

    return { error: null };
  } catch (err) {
    console.error("[sendConfirmationEmail] hiba:", err);
    return { error: "Hiba történt az email küldésekor." };
  }
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
