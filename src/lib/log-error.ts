"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function logError(
  source: string,
  message: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("error_logs").insert({ source, message, details: details ?? null });
  } catch {
    // ne blokkolja az eredeti hibakezelőt
  }
}
