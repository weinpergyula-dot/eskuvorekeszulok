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

  // Fetch matching providers
  const { data: rawProviders } = await admin
    .from("providers")
    .select("id, user_id, full_name")
    .eq("approval_status", "approved")
    .contains("categories", [category])
    .overlaps("counties", searchCounties);

  if (!rawProviders || rawProviders.length === 0) {
    return NextResponse.json({ providers: [] });
  }

  // Deduplicate by user_id (same user may have multiple provider records)
  const seenKeys = new Set<string>();
  const unique = rawProviders.filter((p) => {
    const key = p.user_id || p.id;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  // Fetch reviews for these providers and compute live average (same as listing page)
  const providerIds = unique.map((p) => p.id);
  const { data: reviews } = await admin
    .from("reviews")
    .select("provider_id, rating")
    .in("provider_id", providerIds);

  const ratingMap = new Map<string, { sum: number; count: number }>();
  (reviews ?? []).forEach((r) => {
    const curr = ratingMap.get(r.provider_id) ?? { sum: 0, count: 0 };
    ratingMap.set(r.provider_id, { sum: curr.sum + r.rating, count: curr.count + 1 });
  });

  return NextResponse.json({
    providers: unique.map((p) => {
      const agg = ratingMap.get(p.id);
      const avg = agg && agg.count > 0 ? Math.round((agg.sum / agg.count) * 10) / 10 : null;
      return {
        id: p.id,
        full_name: p.full_name ?? "Ismeretlen szolgáltató",
        average_rating: avg,
      };
    }),
  });
}
