import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { Users, Briefcase, Check } from "lucide-react";
import { MobileHeroSlideshow } from "@/components/home/mobile-hero-slideshow";
import { VisitorRegisterButton } from "@/components/home/visitor-register-button";
import { ProviderRegisterButton } from "@/components/home/provider-register-button";
import { ProvidersContent } from "@/components/providers/providers-content";
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
      {/* Mobile hero slideshow */}
      <div className="sm:hidden">
        <MobileHeroSlideshow />
        <div className="px-5 py-4 text-center">
          <p className="text-base text-gray-900 leading-relaxed">
            Itt megtalálsz mindent egy helyen a nagy napodra!
          </p>
        </div>
      </div>

      {/* Hero – desktop only */}
      <section className="relative overflow-hidden hidden sm:block">
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
              <p className="text-base sm:text-lg text-gray-900 mb-6 sm:mb-8 max-w-xs lg:max-w-none text-center">
                Ugye mennyivel egyszerűbb lenne, ha az esküvődre mindent egy helyen el tudnál intézni?{" "}
                <span className="block mt-1">A legjobb helyen jársz. Törekszünk arra, hogy a lehető legtöbb szolgáltató közül tudj választani.</span>
              </p>
              <div className="flex justify-center">
                <Link href="/informaciok">
                  <Button size="lg" className="text-[15px] sm:text-[18px] px-5 bg-transparent text-[#84AAA6] border border-[#84AAA6] hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]">Tudj meg többet az oldalról!</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services header – two-column */}
      <div className="w-full relative" style={{ backgroundColor: "#84AAA6" }}>
        {/* Pink bleed: center → right edge, desktop only */}
        <div className="hidden sm:block absolute inset-y-0 right-0 w-1/2 border-l border-white" style={{ backgroundColor: "#D07AB5" }} />
        {/* Teal sáv a kérdéssel — csak mobilon, fehér elválasztóval; átmenet
            #84AAA6 (felül) → #5C8480 (alul) */}
        <div className="sm:hidden relative z-10 border-b border-white" style={{ background: "linear-gradient(to bottom, #84AAA6, #5C8480)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center">Miért regisztrálj...?</h2>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            {/* Left – visitors */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2.5">
                <Users className="h-6 w-6 text-white/80 shrink-0" strokeWidth={1.5} />
                <span className="sm:hidden">Látogatónak</span>
                <span className="hidden sm:inline">Regisztrálj látogatónak</span>
              </h2>
              <p className="text-sm text-white/70 mb-3 mt-0.5">Ingyenes fiók</p>
              <hr className="border-white/30 mb-3" />
              <p className="text-base font-semibold text-white mb-2">Lehetőséged lesz...</p>
              <ul className="text-base text-white space-y-2 mb-5">
                {[
                  "Kedvencnek jelölni szolgáltatókat",
                  "Csoportos vagy egyéni ajánlatot kérni",
                  "Chatelni a kiválasztott szakemberrel",
                  "Értékelni, tapasztalatokat megosztani",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-white/80" strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Link href="#szolgaltatok">
                  <Button size="lg" className="bg-white text-[#84AAA6] hover:bg-white/90 px-6">
                    Megnézem a kínálatot
                  </Button>
                </Link>
                <VisitorRegisterButton />
              </div>
            </div>

            {/* Right – providers */}
            <div className="-mx-4 px-8 py-8 -mb-10 border-t border-white sm:mx-0 sm:px-0 sm:py-0 sm:mb-0 sm:border-t-0" style={{ backgroundColor: "#D07AB5" }}>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2.5">
                <Briefcase className="h-6 w-6 text-white/80 shrink-0" strokeWidth={1.5} />
                <span className="sm:hidden">Szolgáltatónak</span>
                <span className="hidden sm:inline">Regisztrálj szolgáltatónak</span>
              </h2>
              <p className="text-sm text-white/70 mb-3 mt-0.5">Ingyenes profil</p>
              <hr className="border-white/30 mb-3" />
              <p className="text-base font-semibold text-white mb-2">Lehetőséged lesz...</p>
              <ul className="text-base text-white space-y-2 mb-5">
                {[
                  "Ingyenes szolgáltatói profilt létrehozni",
                  "Ajánlatkéréseket fogadni a pároktól",
                  "Chatelni az érdeklődő párokkal",
                  "Értékeléseket kapni, válaszolni rájuk",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-white/80" strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <ProviderRegisterButton />
            </div>
          </div>
        </div>
      </div>

      {/* Teljes szolgáltatói lista */}
      <section id="szolgaltatok" className="bg-white border-t border-gray-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pb-16">
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
