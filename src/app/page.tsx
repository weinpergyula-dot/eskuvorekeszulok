import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  CATEGORY_ICONS,
  type ServiceCategory,
} from "@/lib/types";

const ALL_CATEGORIES: ServiceCategory[] = [
  "fotosok-videosok",
  "elo-zene-dj",
  "vofely",
  "torta-sutemeny",
  "menyasszonyi-ruha",
  "oltonya-szmoking",
  "dekor-kellek",
  "smink",
  "fodrasz-borbely",
  "kormos",
  "koszonto-ajandek",
  "pedikur-manikur",
  "kozmetika",
  "ekszer",
  "meghivo",
  "auto-hinto",
  "tanckoktatas",
  "catering",
  "helyszin",
  "virag",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-white via-gray-50 to-[#e8f7f5] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl text-gray-800 mb-4 leading-tight" style={{ fontWeight: 950 }}>
              <span className="text-[#2a9d8f]">ESKÜVŐRE</span>{" "}
              <span className="text-gray-700">KÉSZÜLSZ?</span>
            </h1>
            <div className="w-16 h-0.5 bg-[#2a9d8f] mb-6" />
            <p className="text-lg text-gray-500 mb-8">
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
        <div className="hidden md:block absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[#2a9d8f]/10 to-transparent" />
      </section>

      {/* Services section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Szolgáltatások
          </h2>
          <p className="text-gray-500">
            Egy esküvő életünk egyik legfontosabb eseménye, ezért különösen
            lényeges, hogy a lehető legjobb szolgáltatókat válasszuk. A
            tapasztalt szakemberek – legyen szó fotósról, zenészről vagy
            vőfélyről – biztosítják, hogy minden gördülékenyen menjen, és a pár
            valóban átélhesse a pillanat varázsát. A minőségi szolgáltatások
            nemcsak a stresszt csökkentik, hanem hozzájárulnak ahhoz is, hogy az
            esküvő emléke hosszú távon is tökéletes maradjon.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {ALL_CATEGORIES.map((category) => (
            <CategoryCard key={category} category={category} />
          ))}
        </div>
      </section>
    </>
  );
}

function CategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <div className="flex flex-col items-center text-center bg-white border border-gray-200 rounded-xl p-5 hover:border-[#2a9d8f] hover:shadow-md transition-all group">
      <span className="text-3xl mb-3">{CATEGORY_ICONS[category]}</span>
      <h3 className="font-semibold text-gray-800 text-sm mb-1 leading-tight">
        {CATEGORY_LABELS[category]}
      </h3>
      <div className="w-8 h-0.5 bg-gray-300 group-hover:bg-[#2a9d8f] transition-colors mb-2" />
      <p className="text-xs text-gray-500 mb-4 line-clamp-2">
        {CATEGORY_DESCRIPTIONS[category]}
      </p>
      <Link href={`/services/${category}`} className="mt-auto">
        <Button size="sm" className="text-xs px-4">
          Megnézem
        </Button>
      </Link>
    </div>
  );
}
