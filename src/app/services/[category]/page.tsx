export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, CATEGORY_SEO_DESCRIPTIONS, COUNTIES, type ServiceCategory } from "@/lib/types";
import { ProviderCard } from "@/components/providers/provider-card";
import { CountyFilter } from "@/components/providers/county-filter";
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
      .eq("category", category)
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false });

    if (county) {
      query = query.eq("county", county);
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
      <div className="w-full bg-gradient-to-br from-[#2a9d8f]/20 to-[#2a9d8f]/5 border-b border-[#2a9d8f]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-lg text-[#2a9d8f]/80 mb-2">
            <a href="/services" className="hover:text-[#2a9d8f]">
              Szolgáltatások
            </a>{" "}
            / <span className="text-[#1e7268] font-medium">{label}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e7268]">{label}</h1>
        </div>
      </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {CATEGORY_SEO_DESCRIPTIONS[category as ServiceCategory] && (
        <p className="text-base text-gray-900 mb-8 max-w-3xl leading-relaxed">
          {CATEGORY_SEO_DESCRIPTIONS[category as ServiceCategory]}
        </p>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filter */}
        <aside className="lg:w-64 shrink-0">
          {/* Desktop card wrapper */}
          <div className="hidden lg:block bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Szűrés megye szerint</h2>
            <CountyFilter counties={COUNTIES as unknown as string[]} selected={county} category={category} />
          </div>
          {/* Mobile collapsible (no card wrapper, CountyFilter handles it) */}
          <div className="lg:hidden">
            <CountyFilter counties={COUNTIES as unknown as string[]} selected={county} category={category} />
          </div>
        </aside>

        {/* Provider grid */}
        <div className="flex-1">
          {providers && providers.length > 0 ? (
            <>
              <p className="text-lg text-gray-900 mb-4">
                {providers.length} szolgáltató található{county ? ` – ${county}` : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nincs találat
              </h3>
              <p className="text-gray-900 text-lg">
                {county
                  ? `${county} megyében egyelőre nincs elérhető ${label.toLowerCase()} szolgáltató.`
                  : `Egyelőre nincs elérhető ${label.toLowerCase()} szolgáltató.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
