import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CategorySearch } from "@/components/home/category-search";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <picture>
          <source media="(max-width: 639px)" srcSet="/hero-mobile.png" />
          <source media="(max-width: 1023px)" srcSet="/hero-tablet.png" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero.png" alt="Esküvői háttérkép" className="w-full h-auto block" />
        </picture>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <h1 className="text-gray-900 mb-4 leading-tight" style={{ fontWeight: 950, fontSize: "65px" }}>
                <span className="text-[#2a9d8f]">ESKÜVŐRE</span>{" "}
                <span className="text-gray-900">KÉSZÜLSZ?</span>
              </h1>
              <div className="w-16 h-0.5 bg-[#2a9d8f] mb-6" />
              <p className="text-lg text-gray-900 mb-8">
                Találj meg mindent egy helyen a nagy napodra!
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/services">
                  <Button size="lg">Megnézem a szolgáltatókat</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" size="lg">
                    Hirdetem a szolgáltatásom
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Szolgáltatások
            </h2>
            <p className="text-gray-900">
              Egy esküvő életünk egyik legfontosabb eseménye, ezért különösen
              lényeges, hogy a lehető legjobb szolgáltatókat válasszuk. A
              tapasztalt szakemberek – legyen szó fotósról, zenészről vagy
              vőfélyről – biztosítják, hogy minden gördülékenyen menjen, és a pár
              valóban átélhesse a pillanat varázsát. A minőségi szolgáltatások
              nemcsak a stresszt csökkentik, hanem hozzájárulnak ahhoz is, hogy az
              esküvő emléke hosszú távon is tökéletes maradjon.
            </p>
          </div>

          <CategorySearch />
        </div>
      </section>
    </>
  );
}
