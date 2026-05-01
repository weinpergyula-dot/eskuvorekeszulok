export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { notFound } from "next/navigation";
import { MapPin, Star, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/types";
import { ViewTracker } from "@/components/providers/view-tracker";
import { PageHeader } from "@/components/layout/page-header";
import { ProviderTabs } from "@/components/providers/provider-tabs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("providers")
      .select("full_name, categories")
      .eq("id", id)
      .eq("approval_status", "approved")
      .single();
    if (!data) return { title: "Szolgáltató" };
    const firstCat = (data.categories as ServiceCategory[])?.[0];
    const label = firstCat ? CATEGORY_LABELS[firstCat] : "Szolgáltató";
    return { title: `${data.full_name} – ${label} | Esküvőre Készülök` };
  } catch {
    return { title: "Szolgáltató" };
  }
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const { id } = await params;

  let provider: Provider | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .eq("id", id)
      .eq("approval_status", "approved")
      .single();
    if (error || !data) notFound();
    provider = data as Provider;
  } catch {
    notFound();
  }

  if (!provider) notFound();

  const rating = provider.average_rating ?? 0;
  const reviewCount = provider.review_count ?? 0;
  const viewCount = provider.view_count ?? 0;
  const firstCategory = (provider.categories ?? [])[0] as ServiceCategory | undefined;
  const firstCategoryLabel = firstCategory ? CATEGORY_LABELS[firstCategory] ?? firstCategory : "Szolgáltatások";

  return (
    <div>
      <PageHeader
        title="Szolgáltatói profil"
        breadcrumb={[
          { label: "Szolgáltatások", href: "/services" },
          ...(firstCategory ? [{ label: firstCategoryLabel, href: `/services/${firstCategory}` }] : []),
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ViewTracker providerId={provider.id} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Hero section */}
        <div className="px-8 py-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start" style={{ backgroundColor: "#F0F6F5" }}>
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center shrink-0">
            {provider.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={provider.avatar_url}
                alt={provider.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-gray-900">
                {provider.full_name.charAt(0)}
              </span>
            )}
          </div>

          {/* Name & meta */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {provider.full_name}
            </h1>

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
              {(provider.categories ?? []).map((cat) => (
                <Badge key={cat} variant="outline" className="text-lg">
                  {CATEGORY_LABELS[cat as ServiceCategory] ?? cat}
                </Badge>
              ))}
              {(provider.counties ?? []).length > 0 && (
                <span className="flex items-center gap-1 text-lg text-gray-900">
                  <MapPin className="h-4 w-4" />
                  {(provider.counties ?? []).join(", ")}
                </span>
              )}
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">
                {rating > 0 ? rating.toFixed(1) : "–"}
              </span>
              {reviewCount > 0 && (
                <span className="text-lg text-gray-900">
                  ({reviewCount} értékelés)
                </span>
              )}
              <span className="ml-4 flex items-center gap-1 text-lg text-gray-900">
                <Eye className="h-4 w-4" />
                {viewCount} megtekintés
              </span>
            </div>
          </div>
        </div>

        <ProviderTabs provider={provider} />
      </div>
      </div>
    </div>
  );
}
