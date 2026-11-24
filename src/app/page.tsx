import { Suspense } from "react";
import { ProvidersContent } from "@/components/providers/providers-content";
import { ProvidersSectionTitle } from "@/components/home/providers-section-title";
import { HomeHero } from "@/components/home/home-hero";
import { VisitTracker } from "@/components/home/visit-tracker";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Provider } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  let providers: Provider[] = [];
  const categoryCounts: Record<string, number> = {};
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("providers")
      .select("*")
      .eq("approval_status", "approved")
      .or("active.is.null,active.eq.true")
      .order("created_at", { ascending: false });

    const raw = (data as Provider[]) ?? [];
    for (const p of raw) {
      for (const c of (p.categories as string[] | undefined) ?? []) {
        categoryCounts[c] = (categoryCounts[c] ?? 0) + 1;
      }
    }

    const ids = raw.map((p) => p.id);
    const { data: reviewRows } = ids.length > 0
      ? await supabase.from("reviews").select("provider_id, rating").in("provider_id", ids)
      : { data: [] };
    const statsMap: Record<string, { count: number; sum: number }> = {};
    for (const r of reviewRows ?? []) {
      if (!statsMap[r.provider_id]) statsMap[r.provider_id] = { count: 0, sum: 0 };
      statsMap[r.provider_id].count++;
      statsMap[r.provider_id].sum += r.rating;
    }
    providers = raw.map((p) => {
      const s = statsMap[p.id];
      return s
        ? { ...p, review_count: s.count, average_rating: Math.round((s.sum / s.count) * 10) / 10 }
        : { ...p, review_count: 0, average_rating: 0 };
    });
  } catch (e) {
    console.error("Home providers error:", e);
  }

  return (
    <>
      {/* Látogatás rögzítése (napi/heti egyedi IP statisztika az adminban) */}
      <VisitTracker path="/" />

      {/* Új hero: kereső, kategória-chipek, kiemelt kártya, Fedezd fel */}
      <HomeHero providers={providers} categoryCounts={categoryCounts} />

      {/* Teljes szolgáltatói lista – üveg panelen, az alkonyati háttér előtt */}
      <section id="szolgaltatok" className="scroll-mt-20 pt-6 pb-10 sm:pb-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="glass rounded-[30px] px-3 pt-5 pb-6 sm:px-6 sm:pt-7">
            <ProvidersSectionTitle />
            <Suspense>
              <ProvidersContent providers={providers} categoryCounts={categoryCounts} hideCategoryPills />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
