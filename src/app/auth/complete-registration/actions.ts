"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function completeOAuthRegistrationAction(
  userId: string,
  fullName: string,
  role: "visitor" | "provider"
): Promise<{ error: string | null }> {
  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { error } = await admin
      .from("profiles")
      .update({
        full_name: fullName,
        role,
        accepted_tos_at: now,
        accepted_privacy_at: now,
      })
      .eq("user_id", userId);

    if (error) return { error: error.message };

    // Szinkronizálja a role-t az auth user metadatájával is
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    });

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ismeretlen szerverhiba." };
  }
}
