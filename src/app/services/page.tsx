import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <PageHeader title="Szolgáltatások" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-gray-900">
          Válassz kategóriát és böngészd az elérhető szolgáltatókat!
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {ALL_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/services/${category}`}
            className="flex flex-col items-center text-center bg-white border border-gray-200 rounded-xl p-5 hover:border-[#2a9d8f] hover:shadow-md transition-all group"
          >
            <span className="text-3xl mb-3">{CATEGORY_ICONS[category]}</span>
            <h3 className="font-semibold text-gray-900 text-lg mb-1 leading-tight">
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
