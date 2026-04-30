export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, CATEGORY_SEO_DESCRIPTIONS, COUNTIES, type ServiceCategory } from "@/lib/types";
import { CategoryContent } from "@/components/providers/category-content";
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
      {/* Full-width header */}
      <div className="w-full bg-gradient-to-br from-[#84AAA6]/20 to-[#84AAA6]/5 border-b border-[#84AAA6]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-lg text-[#84AAA6]/80 mb-2">
            <a href="/services" className="hover:text-[#84AAA6]">
              Szolgáltatások
            </a>{" "}
            / <span className="text-[#6B8E8A] font-medium">{label}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-[#6B8E8A]">{label}</h1>
          {CATEGORY_SEO_DESCRIPTIONS[category as ServiceCategory] && (
            <>
              <hr className="border-[#84AAA6]/20 mt-5 mb-4" />
              <p className="text-base text-gray-900 leading-relaxed">
                {CATEGORY_SEO_DESCRIPTIONS[category as ServiceCategory]}
              </p>
            </>
          )}
        </div>
      </div>

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
