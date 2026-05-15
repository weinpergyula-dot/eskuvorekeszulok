import { PageHeader } from "@/components/layout/page-header";
import { CategorySearch } from "@/components/home/category-search";
import { createClient } from "@/lib/supabase/server";

export default async function ServicesPage() {
  let categoryCounts: Record<string, number> = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("providers")
      .select("categories")
      .eq("approval_status", "approved");
    for (const p of data ?? []) {
      for (const cat of (p.categories ?? []) as string[]) {
        categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
      }
    }
  } catch { /* non-critical */ }

  return (
    <div>
      <PageHeader
        title="Kategóriák"
        description="Válassz kategóriát és böngészd az elérhető esküvői szolgáltatókat! Minden kategóriában gondosan válogatott szakembereket találsz – fotósoktól és zenészektől kezdve a virágkötőkig és helyszínekig –, hogy a nagy napod minden részlete tökéletes legyen."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <CategorySearch counts={categoryCounts} />
      </div>
    </div>
  );
}
