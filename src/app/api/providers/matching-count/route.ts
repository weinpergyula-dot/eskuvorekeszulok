import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const countiesParam = searchParams.get("counties");

  if (!category || !countiesParam) return NextResponse.json({ providers: [] });

  const counties = countiesParam.split(",").filter(Boolean);
  const searchCounties = [...counties, "Országosan"];

  const admin = createAdminClient();

  // Try with average_rating first; fall back without it if schema cache is stale
  let data: { id: string; user_id: string; full_name: string; average_rating?: number | null }[] | null = null;

  const res1 = await admin
    .from("providers")
    .select("id, user_id, full_name, average_rating")
    .eq("approval_status", "approved")
    .contains("categories", [category])
    .overlaps("counties", searchCounties);

  if (!res1.error) {
    data = res1.data;
  } else {
    // Fallback: select without average_rating
    const res2 = await admin
      .from("providers")
      .select("id, user_id, full_name")
      .eq("approval_status", "approved")
      .contains("categories", [category])
      .overlaps("counties", searchCounties);
    data = res2.data;
  }

  // Deduplicate by user_id; fall back to id if user_id is falsy
  const seenKeys = new Set<string>();
  const unique = (data ?? []).filter((p) => {
    const key = p.user_id || p.id;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  return NextResponse.json({
    providers: unique.map((p) => ({
      id: p.id,
      full_name: p.full_name ?? "Ismeretlen szolgáltató",
      average_rating: p.average_rating ? Number(p.average_rating) : null,
    })),
  });
}
