import Link from "next/link";
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_DESCRIPTIONS,
  type ServiceCategory,
} from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";

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

export default function ServicesPage() {
  return (
    <div>
      <PageHeader
        title="Szolgáltatások"
        description="Válassz kategóriát és böngészd az elérhető esküvői szolgáltatókat! Minden kategóriában gondosan válogatott szakembereket találsz – fotósoktól és zenészektől kezdve a virágkötőkig és helyszínekig –, hogy a nagy napod minden részlete tökéletes legyen."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ALL_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/services/${category}`}
            className="flex flex-col items-center text-center bg-[#FCFCFC] border border-gray-200 rounded-xl p-5 hover:border-[#2a9d8f] hover:shadow-md transition-all group"
          >
            <span className="text-3xl mb-3">{CATEGORY_ICONS[category]}</span>
            <h3 className="font-semibold text-gray-900 mb-1 leading-tight" style={{ fontSize: "22px" }}>
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="w-8 h-0.5 bg-gray-300 group-hover:bg-[#2a9d8f] transition-colors mb-2" />
            <p className="text-base text-gray-900 line-clamp-2">
              {CATEGORY_DESCRIPTIONS[category]}
            </p>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
