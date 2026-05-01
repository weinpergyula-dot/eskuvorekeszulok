import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CategorySearch } from "@/components/home/category-search";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
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
              <div className="w-full lg:w-[calc(100%+3rem)] h-0.5 bg-[#84AAA6] mb-4" />
              <p className="text-base sm:text-lg text-gray-900 mb-6 sm:mb-8">
                Találj meg mindent egy helyen a nagy napodra!
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                <Link href="/services">
                  <Button size="lg" className="w-full sm:w-auto text-[13px] sm:text-base">Megnézem a szolgáltatókat</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto text-[13px] sm:text-base bg-transparent text-[#C65EA5] border border-[#C65EA5] hover:bg-[#C65EA5] hover:text-white">
                    Hirdetem a szolgáltatásom
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services header */}
      <div className="w-full border-t border-b border-white/20" style={{ backgroundColor: "#84AAA6" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            Szolgáltatások
          </h2>
          <hr className="border-white/30 mb-4" />
          <p className="text-base text-white leading-relaxed">
            Egy esküvő életünk egyik legfontosabb eseménye, ezért különösen
            lényeges, hogy a lehető legjobb szolgáltatókat válasszuk. A
            tapasztalt szakemberek – legyen szó fotósról, zenészről vagy
            vőfélyről – biztosítják, hogy minden gördülékenyen menjen, és a pár
            valóban átélhesse a pillanat varázsát. A minőségi szolgáltatások
            nemcsak a stresszt csökkentik, hanem hozzájárulnak ahhoz is, hogy az
            esküvő emléke hosszú távon is tökéletes maradjon.
          </p>
        </div>
      </div>

      {/* Services section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          <CategorySearch />
        </div>
      </section>
    </>
  );
}
