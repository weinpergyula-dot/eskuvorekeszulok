"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { ConfirmEmail } from "@/emails/confirm-email";
import { NewProviderRegistrationEmail } from "@/emails/new-provider-registration";
import React from "react";

const ADMIN_EMAIL = "weinper.gyula@gmail.com";

/** True for GoTrue's "this email is already taken" answer, whatever wording it uses. */
function isEmailTakenError(error: { code?: string; message: string }): boolean {
  if (error.code === "email_exists" || error.code === "user_already_exists") return true;
  return /already\s+(been\s+)?registered|already\s+exists/i.test(error.message);
}

/**
 * Creates a new user via the Supabase Admin API.
 * Using the admin client bypasses GoTrue's built-in email sending entirely,
 * so no confirmation email is triggered by Supabase — we handle that ourselves.
 *
 * A registration is several network round-trips (user creation, uploads, provider
 * insert, confirmation email). If one of them is lost on a flaky mobile connection
 * the user is left with an auth account that was never confirmed and never got a
 * confirmation email — retrying used to fail forever with "already registered".
 * So when the email is taken by an account that is still unconfirmed, we adopt it:
 * a never-confirmed account cannot be logged into, so nobody can lose access to it.
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
      if (isEmailTakenError(error)) {
        const adopted = await adoptUnconfirmedUser(email, password, userData);
        if (adopted) return { userId: adopted, error: null };
      }
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
 * Returns the id of an existing but never-confirmed account for `email` after
 * resetting its password and metadata, or null when the address belongs to a
 * confirmed (i.e. genuinely in-use) account.
 */
async function adoptUnconfirmedUser(
  email: string,
  password: string,
  userData: Record<string, unknown>
): Promise<string | null> {
  try {
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("user_id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    if (!profile?.user_id) return null;

    const { data: existing } = await admin.auth.admin.getUserById(profile.user_id);
    const user = existing?.user;
    // Megerősített fiók (pl. Google-belépés) sosem vehető át.
    if (!user || user.email_confirmed_at || user.confirmed_at) return null;

    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: userData,
    });
    if (updateError) return null;

    const profilePatch: Record<string, string> = {};
    if (typeof userData.full_name === "string") profilePatch.full_name = userData.full_name;
    if (typeof userData.role === "string") profilePatch.role = userData.role;
    if (Object.keys(profilePatch).length > 0) {
      await admin.from("profiles").update(profilePatch).eq("user_id", user.id);
    }

    console.log(`[signUpAction] félbemaradt regisztráció átvéve: ${email}`);
    return user.id;
  } catch (err) {
    console.error("[adoptUnconfirmedUser] hiba:", err);
    return null;
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

    const result = await sendEmail({
      to: email,
      subject: "Regisztráció megerősítése",
      template: React.createElement(ConfirmEmail, { confirmLink, name }),
    });

    if (!result.ok && !result.skipped) {
      console.error("[sendConfirmationEmail] sendEmail hiba:", result.error);
      return { error: "Hiba történt az email küldésekor." };
    }

    console.log(`[sendConfirmationEmail] email elküldve: ${email} (skipped=${result.skipped ?? false})`);
    return { error: null };
  } catch (err) {
    console.error("[sendConfirmationEmail] hiba:", err);
    return { error: "Hiba történt az email küldésekor." };
  }
}

/**
 * Returns a pre-signed upload URL so the browser can upload a file to
 * Supabase Storage without needing an authenticated session.
 *
 * upsert: a regisztráció fix útvonalakra tölt (`<userId>/avatar`, `<userId>/gallery-0`…),
 * ezért egy megismételt próbálkozás ugyanoda írna. Enélkül a Storage 409-cel
 * elutasítja ("The resource already exists"), és a regisztráció elakad.
 */
export async function getSignedUploadUrlAction(
  bucket: string,
  path: string
): Promise<{ signedUrl: string; token: string; path: string } | { error: string }> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert: true });
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
  pricing_text?: string | null;
  pricing_pdf_url?: string | null;
}

/**
 * Inserts the provider record and marks profiles TOS acceptance using the
 * admin client so it works even before the user confirms their email.
 *
 * upsert: providers.user_id egyedi, ezért egy megismételt (pl. megszakadt
 * hálózat utáni) próbálkozás egyedi-kulcs hibára futna insert esetén.
 */
export async function createProviderProfileAction(
  userId: string,
  providerData: ProviderData
): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();

    const { error: providerError } = await admin.from("providers").upsert({
      user_id: userId,
      ...providerData,
      approval_status: "pending",
      featured: null,
    }, { onConflict: "user_id" });

    if (providerError) return { error: providerError.message };

    const now = new Date().toISOString();
    await admin.from("profiles").update({
      accepted_tos_at: now,
      accepted_privacy_at: now,
    }).eq("user_id", userId);

    // Admin értesítő email — nem blokkolja a folyamatot ha sikertelen
    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Új szolgáltatói regisztráció: ${providerData.full_name}`,
        template: React.createElement(NewProviderRegistrationEmail, {
          name: providerData.full_name,
          email: providerData.email,
          categories: providerData.categories,
          counties: providerData.counties,
          pricingText: providerData.pricing_text ?? null,
          pricingPdfUrl: providerData.pricing_pdf_url ?? null,
        }),
      });
    } catch (emailErr) {
      console.error("[createProviderProfileAction] admin email hiba:", emailErr);
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ismeretlen szerverhiba (provider)." };
  }
}

/**
 * Deletes an auth user — used to roll back a partially completed provider registration
 * if any step after user creation fails (provider profile insert, email send, etc.).
 * The DB rows cascade from auth.users, but the uploaded files do not, so we sweep
 * the user's storage folders too.
 */
export async function deleteUserAction(userId: string): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    await removeUserStorage(admin, userId);
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Törlési hiba." };
  }
}

/** Best-effort removal of every file the registration uploaded for `userId`. */
async function removeUserStorage(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<void> {
  for (const bucket of ["avatars", "gallery"]) {
    for (const prefix of [userId, `${userId}/pricing`]) {
      try {
        const { data: files } = await admin.storage.from(bucket).list(prefix);
        const paths = (files ?? [])
          .filter((f) => f.id) // a mappákat (id === null) kihagyjuk
          .map((f) => `${prefix}/${f.name}`);
        if (paths.length > 0) await admin.storage.from(bucket).remove(paths);
      } catch (err) {
        console.error(`[deleteUserAction] storage takarítás hiba (${bucket}/${prefix}):`, err);
      }
    }
  }
}

/**
 * Updates profiles.avatar_url for the given userId using the admin client.
 */
export async function setProfileAvatarAction(
  userId: string,
  avatarUrl: string
): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", userId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ismeretlen szerverhiba (avatar)." };
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

/**
 * Finalises an OAuth (Google) registration: sets full_name, role, and TOS acceptance
 * on the profiles row and syncs role into auth user_metadata.
 * Called instead of signUpAction + sendConfirmationEmailAction for OAuth users.
 */
export async function updateOAuthProfileAction(
  userId: string,
  fullName: string,
  role: "visitor" | "provider"
): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { error: profileError } = await admin.from("profiles").update({
      full_name: fullName,
      role,
      accepted_tos_at: now,
      accepted_privacy_at: now,
    }).eq("user_id", userId);
    if (profileError) return { error: profileError.message };

    const { error: metaError } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role, full_name: fullName },
    });
    if (metaError) return { error: metaError.message };

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ismeretlen szerverhiba (OAuth)." };
  }
}
