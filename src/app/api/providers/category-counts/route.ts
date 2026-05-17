import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("providers")
    .select("categories")
    .eq("approval_status", "approved");
  const counts: Record<string, number> = {};
  for (const p of data ?? []) {
    for (const cat of (p.categories ?? []) as string[]) {
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
  }
  return NextResponse.json(counts);
}
