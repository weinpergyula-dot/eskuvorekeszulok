import { Suspense } from "react";
import { MobileHeroSlideshow } from "@/components/home/mobile-hero-slideshow";
import { ProvidersContent } from "@/components/providers/providers-content";
import { HomeProvidersCta } from "@/components/home/home-providers-cta";
import { HeroProvidersButton } from "@/components/home/hero-providers-button";
import { ProviderRegisterButton } from "@/components/home/provider-register-button";
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
      {/* Mobile hero slideshow */}
      <div className="sm:hidden relative z-20 -mt-6">
        <MobileHeroSlideshow />
      </div>

      {/* Hero – desktop only */}
      <section className="relative z-20 -mt-6 overflow-hidden rounded-b-3xl hidden sm:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.png"
          alt="Esküvői háttérkép"
          className="w-full h-[480px] sm:h-[400px] lg:h-auto object-cover lg:object-center block"
          style={{ objectPosition: "75% center" }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-[42%] sm:w-[40%] lg:w-fit ml-[15px] sm:ml-0 lg:ml-[8%] flex flex-col items-center text-center">
              <h1 className="mb-4 leading-tight lg:whitespace-nowrap" style={{ fontWeight: 950 }}>
                <span
                  className="text-[#84AAA6] block lg:inline"
                  style={{ fontSize: "clamp(28px, 8vw, 65px)" }}
                >
                  ESKÜVŐRE{" "}
                </span>
                <span
                  className="block lg:inline"
                  style={{ fontSize: "clamp(28px, 8vw, 65px)", color: "#7F7F7F" }}
                >
                  KÉSZÜLSZ?
                </span>
              </h1>
              <div className="w-full lg:w-[calc(100%+3rem)] h-px mb-4" style={{ backgroundColor: "#7F7F7F" }} />
              <p className="text-base sm:text-lg text-gray-900 mb-6 sm:mb-8 max-w-xs lg:max-w-lg text-center">
                Böngészd az elérhető szolgáltatókat, vagy ha szolgáltatóként
                látogattál el hozzánk, akkor regisztrálj!
              </p>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-3">
                <HeroProvidersButton />
                <ProviderRegisterButton className="text-[15px] sm:text-[18px] px-5 bg-transparent text-[#C65EA5] border border-[#C65EA5] hover:bg-[#C65EA5]/10 hover:text-[#C65EA5]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rövid marketing sáv – mit talál a látogató lejjebb */}
      <div className="teal-shift-bg w-full relative -mt-6">
        <div className="max-w-3xl mx-auto px-5 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-9 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Az összes esküvői szolgáltató egy helyen
          </h2>
          <p className="mt-2 text-[15px] md:text-base leading-relaxed text-white/90">
            Fotós, zenekar, vőfély, torta vagy helyszín? Lejjebb böngészhetsz köztük
            kategóriák és megyék szerint, és pár kattintással ajánlatot is kérhetsz.
          </p>
        </div>
        {/* Lefelé kerekedő átmenet a fehér tartalomba */}
        <div className="h-6 rounded-t-3xl bg-white" aria-hidden />
      </div>

      {/* Teljes szolgáltatói lista */}
      <section id="szolgaltatok" className="bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Szolgáltatók</h2>
          <Suspense>
            <ProvidersContent providers={providers} categoryCounts={categoryCounts} />
          </Suspense>
        </div>
      </section>

      {/* Úszó gomb: legördít a szolgáltatókhoz; a szekció elérésekor eltűnik */}
      <HomeProvidersCta />
    </>
  );
}
