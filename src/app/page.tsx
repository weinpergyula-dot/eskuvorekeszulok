import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Briefcase, Check } from "lucide-react";
import { CategorySearch } from "@/components/home/category-search";
import { ProviderCarousel } from "@/components/home/provider-carousel";
import { MobileHeroSlideshow } from "@/components/home/mobile-hero-slideshow";
import { VisitorRegisterButton } from "@/components/home/visitor-register-button";
import { ProviderRegisterButton } from "@/components/home/provider-register-button";
import { createClient } from "@/lib/supabase/server";
import type { Provider } from "@/lib/types";

export default async function HomePage() {
  // Fetch approved providers: category counts + carousel picks in one query
  let carouselProviders: Provider[] = [];
  let categoryCounts: Record<string, number> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("providers")
      .select("*")
      .eq("approval_status", "approved")
      .or("active.is.null,active.eq.true")
      .limit(200);

    if (data && data.length > 0) {
      // Count per category
      for (const p of data) {
        for (const cat of (p.categories ?? []) as string[]) {
          categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
        }
      }

      // Featured providers first; fall back to shuffled if none
      const featured = (data as Provider[]).filter((p) => p.featured);
      if (featured.length > 0) {
        carouselProviders = featured;
      } else {
        const arr = [...data] as Provider[];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        carouselProviders = arr.slice(0, 6);
      }
    }
  } catch {
    // non-critical, silently ignore
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            {/* Left – visitors */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2.5">
                <Users className="h-6 w-6 text-white/80 shrink-0" strokeWidth={1.5} />
                Látogatóknak
              </h2>
              <p className="text-sm text-white/70 mb-3 mt-0.5">Ingyenes fiók</p>
              <hr className="border-white/30 mb-3" />
              <ul className="text-base text-white space-y-2 mb-5">
                {[
                  "Böngészd 20+ kategória kínálatát – fotóstól virágkötőig",
                  "Olvass valódi értékeléseket más pároktól",
                  "Jelöld kedvenceidet, térj vissza bármikor",
                  "Küldj ajánlatkérést egyszerre több szolgáltatónak",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-white/80" strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Link href="#kategoriak">
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
                Szolgáltatóknak
              </h2>
              <p className="text-sm text-white/70 mb-3 mt-0.5">Ingyenes profil</p>
              <hr className="border-white/30 mb-3" />
              <ul className="text-base text-white space-y-2 mb-5">
                {[
                  "Ingyenes profil képekkel, leírással és elérhetőséggel",
                  "Fogadj ajánlatkérést közvetlenül érdeklődő pároktól",
                  "Kezeld üzeneteidet és értékeléseidet egy helyen",
                  "Jelenj meg aktívan kereső párok előtt",
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

      {/* Featured providers carousel */}
      <ProviderCarousel providers={carouselProviders} />

      {/* Services section */}
      <section id="kategoriak" className="bg-gradient-to-b from-[#F0F6F5] to-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10 sm:pb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Kategóriák</h2>
          <CategorySearch counts={categoryCounts} />
        </div>
      </section>
    </>
  );
}
