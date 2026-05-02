import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Briefcase } from "lucide-react";
import { CategorySearch } from "@/components/home/category-search";
import { MobileHeroSlideshow } from "@/components/home/mobile-hero-slideshow";

export default function HomePage() {
  return (
    <>
      {/* Mobile hero slideshow */}
      <div className="sm:hidden">
        <MobileHeroSlideshow />
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
                  className="text-gray-700 block lg:inline"
                  style={{ fontSize: "clamp(28px, 8vw, 65px)" }}
                >
                  KÉSZÜLSZ?
                </span>
              </h1>
              <div className="w-full lg:w-[calc(100%+3rem)] h-px bg-[#84AAA6] mb-4" />
              <p className="text-base sm:text-lg text-gray-900 mb-6 sm:mb-8">
                Találj meg mindent egy helyen a nagy napodra!
              </p>
              <div className="flex justify-center">
                <Link href="/informaciok">
                  <Button size="lg" className="text-[13px] sm:text-base px-5 bg-[#C65EA5] hover:bg-[#A84D8B]">Tudj meg többet az oldalról!</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services header – two-column */}
      <div className="w-full border-t border-b border-white/20" style={{ backgroundColor: "#84AAA6" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            {/* Left – visitors */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-2.5">
                <Users className="h-6 w-6 text-white/80 shrink-0" strokeWidth={1.5} />
                Látogatóknak
              </h2>
              <hr className="border-white/30 mb-3" />
              <p className="text-base text-white leading-relaxed mb-5">
                Böngészd át az esküvői szakemberek és helyszínek széles kínálatát! Fotósoktól, zenészektől kezdve a tortakészítőkig és virágkötőkig megtalálsz mindenkit, aki a nagy napod tökéletessé varázsolhat. Olvass értékeléseket, és jelöld kedvenceidet, hogy könnyebben dönthess.
              </p>
              <Link href="#kategoriak">
                <Button size="lg" className="bg-transparent text-white border border-white hover:bg-white/10 hover:text-white px-6">
                  Megnézem a kínálatot
                </Button>
              </Link>
            </div>

            {/* Right – providers */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 flex items-center gap-2.5">
                <Briefcase className="h-6 w-6 text-white/80 shrink-0" strokeWidth={1.5} />
                Szolgáltatóknak
              </h2>
              <hr className="border-white/30 mb-3" />
              <p className="text-base text-white leading-relaxed mb-5">
                Mutatkozz be több ezer leendő párnak! Hozz létre ingyenes szolgáltatói profilt, töltsd fel képeidet, és kezeld elérhetőségeidet egy helyen. Az adminisztrátori jóváhagyás után profilod azonnal megjelenik az érdeklődőknek.
              </p>
              <Link href="/auth/register?type=provider">
                <Button size="lg" className="bg-transparent text-white border border-white hover:bg-white/10 hover:text-white px-6">
                  Regisztrálok szolgáltatónak
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services section */}
      <section id="kategoriak" className="bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Kategóriák</h2>
          <CategorySearch />
        </div>
      </section>
    </>
  );
}
