import { Suspense } from "react";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProvidersContent } from "@/components/providers/providers-content";
import { CategoryQuickTiles } from "@/components/home/category-quick-tiles";
import { ProvidersSectionTitle } from "@/components/home/providers-section-title";
import { HomeProvidersCta } from "@/components/home/home-providers-cta";
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
      {/* Banner: köszöntő és digitális meghívó diák */}
      <HeroCarousel />

      {/* Kategóriaválasztó – a banner lekerekített alja alá bújva */}
      <div className="teal-shift-bg-deep w-full relative -mt-6">
        <div className="max-w-7xl mx-auto px-5 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
          <h2 className="text-center text-xl md:text-2xl font-bold text-white">
            Válassz kategóriát!
          </h2>
          <CategoryQuickTiles categoryCounts={categoryCounts} />
        </div>
        {/* Lefelé kerekedő átmenet a fehér tartalomba */}
        <div className="h-6 rounded-t-3xl bg-white" aria-hidden />
      </div>

      {/* Teljes szolgáltatói lista */}
      <section id="szolgaltatok" className="bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pb-16">
          <ProvidersSectionTitle />
          <Suspense>
            <ProvidersContent providers={providers} categoryCounts={categoryCounts} hideCategoryPills />
          </Suspense>
        </div>
      </section>

      {/* Úszó gomb: legördít a szolgáltatókhoz; a szekció elérésekor eltűnik */}
      <HomeProvidersCta />
    </>
  );
}
