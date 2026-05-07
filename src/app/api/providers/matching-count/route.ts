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
  const { data } = await admin
    .from("providers")
    .select("id, user_id, full_name, average_rating")
    .eq("approval_status", "approved")
    .contains("categories", [category])
    .overlaps("counties", searchCounties);

  // Deduplicate by user_id (same user may have multiple provider records)
  const seenUserIds = new Set<string>();
  const unique = (data ?? []).filter((p) => {
    if (!p.user_id || seenUserIds.has(p.user_id)) return false;
    seenUserIds.add(p.user_id);
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
