import { PageHeader } from "@/components/layout/page-header";
import { CategorySearch } from "@/components/home/category-search";

export default function ServicesPage() {
  return (
    <div>
      <PageHeader
        title="Szolgáltatások"
        description="Válassz kategóriát és böngészd az elérhető esküvői szolgáltatókat! Minden kategóriában gondosan válogatott szakembereket találsz – fotósoktól és zenészektől kezdve a virágkötőkig és helyszínekig –, hogy a nagy napod minden részlete tökéletes legyen."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategorySearch />
      </div>
    </div>
  );
}
