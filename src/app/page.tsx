import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CategorySearch } from "@/components/home/category-search";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.png')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
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
      </section>

      {/* Services section */}
      <section className="bg-gradient-to-b from-[#2a9d8f]/8 via-[#2a9d8f]/5 to-transparent">
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
