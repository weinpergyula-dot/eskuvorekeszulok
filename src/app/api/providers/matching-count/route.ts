import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { filterReachableProviders } from "@/lib/quote-recipients";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const countiesParam = searchParams.get("counties");
  const userId = searchParams.get("userId");

  if (!category) return NextResponse.json({ providers: [] });

  const admin = createAdminClient();

  // No county filter → return all providers with counties for client-side count computation
  if (!countiesParam) {
    const { data } = await admin
      .from("providers")
      .select("id, user_id, full_name, counties")
      .eq("approval_status", "approved")
      .or("active.is.null,active.eq.true")
      .contains("categories", [category]);
    const seen = new Set<string>();
    const unique = (data ?? []).filter((p) => {
      const key = p.user_id || p.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    /* Csak az számít bele, aki ajánlatkérést is tud fogadni – különben a
       megyénkénti szám többet ígérne, mint ahány címzett valóban elérhető. */
    const reachable = await filterReachableProviders(admin, unique, "api/providers/matching-count", false);
    return NextResponse.json({ providers: reachable });
  }

  const counties = countiesParam.split(",").filter(Boolean);
  const nationwide = counties.includes("Országosan");

  // Fetch matching providers. "Országosan" means the visitor wants every provider
  // in the category regardless of county, so we skip the county overlap filter.
  let providersQuery = admin
    .from("providers")
    .select("id, user_id, full_name, avatar_url")
    .eq("approval_status", "approved")
    .or("active.is.null,active.eq.true")
    .contains("categories", [category]);
  if (!nationwide) {
    providersQuery = providersQuery.overlaps("counties", [...counties, "Országosan"]);
  }
  const { data: rawProviders } = await providersQuery;

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

  /* A címzettválasztó csak olyat kínálhat fel, akinek a címzett sora
     létre is jön – lásd filterReachableProviders. */
  const reachable = await filterReachableProviders(admin, unique, "api/providers/matching-count", false);
  if (reachable.length === 0) return NextResponse.json({ providers: [] });

  // Fetch reviews for these providers and compute live average (same as listing page)
  const providerIds = reachable.map((p) => p.id);
  const { data: reviews } = await admin
    .from("reviews")
    .select("provider_id, rating")
    .in("provider_id", providerIds);

  const ratingMap = new Map<string, { sum: number; count: number }>();
  (reviews ?? []).forEach((r) => {
    const curr = ratingMap.get(r.provider_id) ?? { sum: 0, count: 0 };
    ratingMap.set(r.provider_id, { sum: curr.sum + r.rating, count: curr.count + 1 });
  });

  // Fetch all favorites for the user, filter in JS
  let favoriteSet = new Set<string>();
  if (userId) {
    const { data: favRows } = await admin
      .from("favorites")
      .select("provider_id")
      .eq("user_id", userId);
    favoriteSet = new Set((favRows ?? []).map((f: { provider_id: string }) => f.provider_id));
  }

  return NextResponse.json({
    providers: reachable.map((p) => {
      const agg = ratingMap.get(p.id);
      const avg = agg && agg.count > 0 ? Math.round((agg.sum / agg.count) * 10) / 10 : null;
      return {
        id: p.id,
        full_name: p.full_name ?? "Ismeretlen szolgáltató",
        average_rating: avg,
        avatar_url: p.avatar_url ?? null,
        is_favorite: favoriteSet.has(p.id),
      };
    }),
  });
}
