export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, CATEGORY_SEO_DESCRIPTIONS, COUNTIES, type ServiceCategory } from "@/lib/types";
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
    providers = (data as Provider[]) ?? [];
  } catch (e) {
    console.error("Supabase error:", e);
  }

  return (
    <div>
      <PageHeader
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
