export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, CATEGORY_SEO_DESCRIPTIONS, COUNTIES, type ServiceCategory } from "@/lib/types";
import { CATEGORY_LUCIDE_ICONS } from "@/lib/category-icons";
import { CategoryContent } from "@/components/providers/category-content";
import { PageHeader } from "@/components/layout/page-header";
import { notFound } from "next/navigation";
import type { Provider } from "@/lib/types";

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ county?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const label = CATEGORY_LABELS[category as ServiceCategory];
  if (!label) return { title: "Nem található" };
  return { title: `${label} – Esküvőre Készülök` };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const { county } = await searchParams;

  const label = CATEGORY_LABELS[category as ServiceCategory];
  if (!label) notFound();

  let providers: Provider[] = [];

  try {
    const supabase = await createClient();

    let query = supabase
      .from("providers")
      .select("*")
      .contains("categories", [category])
      .eq("approval_status", "approved")
      .neq("active", false)
      .order("created_at", { ascending: false });

    if (county) {
      query = query.contains("counties", [county]);
    }

    const { data, error } = await query;
    if (error) console.error("providers query error:", error);
    const raw = (data as Provider[]) ?? [];

    // Compute live review aggregates
    const ids = raw.map((p) => p.id);
    const { data: reviewRows } = ids.length > 0
      ? await supabase.from("reviews").select("provider_id, rating").in("provider_id", ids)
      : { data: [] };

    const statsMap: Record<string, { count: number; sum: number }> = {};
    for (const r of reviewRows ?? []) {
      if (!statsMap[r.provider_id]) statsMap[r.provider_id] = { count: 0, sum: 0 };
      statsMap[r.provider_id].count++;
      statsMap[r.provider_id].sum += r.rating;
    }

    providers = raw.map((p) => {
      const s = statsMap[p.id];
      return s
        ? { ...p, review_count: s.count, average_rating: Math.round((s.sum / s.count) * 10) / 10 }
        : { ...p, review_count: 0, average_rating: 0 };
    });
  } catch (e) {
    console.error("Supabase error:", e);
  }

  return (
    <div>
      <PageHeader
        icon={CATEGORY_LUCIDE_ICONS[category as ServiceCategory]}
        title={label}
        breadcrumb={[{ label: "Szolgáltatók", href: "/services" }]}
        description={CATEGORY_SEO_DESCRIPTIONS[category as ServiceCategory]}
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <CategoryContent
        providers={providers}
        counties={COUNTIES as unknown as string[]}
        selected={county}
        category={category}
        label={label}
      />
    </div>
    </div>
  );
}
