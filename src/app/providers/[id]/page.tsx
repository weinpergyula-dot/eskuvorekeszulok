export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { notFound } from "next/navigation";
import { MapPin, Star, Eye, User, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/types";
import { ViewTracker } from "@/components/providers/view-tracker";
import { PageHeader } from "@/components/layout/page-header";
import { ProviderTabs } from "@/components/providers/provider-tabs";
import { FavoriteButton } from "@/components/providers/favorite-button";
import { ShareButton } from "@/components/providers/share-button";

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
  let initialLiked = false;
  let isOwner = false;
  try {
    const supabase = await createClient();
    const [{ data, error }, { data: { user } }, { data: reviewRows }] = await Promise.all([
      supabase.from("providers").select("*").eq("id", id).eq("approval_status", "approved").single(),
      supabase.auth.getUser(),
      supabase.from("reviews").select("rating").eq("provider_id", id),
    ]);
    if (error || !data) notFound();
    const reviewCount = reviewRows?.length ?? 0;
    const avgRating = reviewCount > 0
      ? Math.round((reviewRows!.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : 0;
    provider = { ...data as Provider, review_count: reviewCount, average_rating: avgRating };
    isOwner = !!user && user.id === provider.user_id;
    if (user && !isOwner) {
      const { data: fav } = await supabase
        .from("favorites")
        .select("provider_id")
        .eq("user_id", user.id)
        .eq("provider_id", id)
        .maybeSingle();
      initialLiked = !!fav;
    }
  } catch {
    notFound();
  }

  if (!provider) notFound();

  const rating = provider.average_rating ?? 0;
  const reviewCount = provider.review_count ?? 0;
  const viewCount = provider.view_count ?? 0;
  const firstCategory = (provider.categories ?? [])[0] as ServiceCategory | undefined;
  const firstCategoryLabel = firstCategory ? CATEGORY_LABELS[firstCategory] ?? firstCategory : "Szolgáltatók";

  return (
    <div>
      <PageHeader
        icon={User}
        title="Szolgáltatói profil"
        breadcrumb={[
          { label: "Szolgáltatók", href: "/services" },
          ...(firstCategory ? [{ label: firstCategoryLabel, href: `/services/${firstCategory}` }] : []),
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ViewTracker providerId={provider.id} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Hero section */}
        <div className="relative px-5 py-5 sm:px-8 sm:py-10 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start" style={{ backgroundColor: "#F0F6F5" }}>
          {/* Top-left: edit (owner) or favorite (others) – mobile only */}
          <div className="absolute top-3 left-3 sm:hidden">
            {isOwner ? (
              <a href="/profil#provider" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 border border-gray-200 text-[#84AAA6] hover:text-[#6B8E8A]">
                <Pencil className="h-4 w-4" />
              </a>
            ) : (
              <FavoriteButton providerId={provider.id} initialLiked={initialLiked} hideTextOnMobile />
            )}
          </div>
          {/* Top-right: share + edit (owner) or share + favorite (others) – desktop */}
          <div className="absolute top-3 right-3 hidden sm:flex items-center gap-2">
            <ShareButton title={provider.full_name} />
            {isOwner ? (
              <a href="/profil#provider" className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 hover:bg-[#84AAA6]/10 transition-colors px-3 py-1.5">
                <Pencil className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">Profil szerkesztés</span>
              </a>
            ) : (
              <FavoriteButton providerId={provider.id} initialLiked={initialLiked} />
            )}
          </div>
          {/* Share – mobile only icon, top-right */}
          <div className="absolute top-3 right-3 sm:hidden">
            <ShareButton title={provider.full_name} iconOnly />
          </div>
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

            {/* Categories – desktop only */}
            <div className="hidden sm:flex flex-wrap gap-2 justify-start mb-1">
              {(provider.categories ?? []).map((cat) => (
                <Badge key={cat} variant="outline" className="text-base">
                  {CATEGORY_LABELS[cat as ServiceCategory] ?? cat}
                </Badge>
              ))}
            </div>
            {/* County – always visible */}
            {(provider.counties ?? []).length > 0 && (
              <div className="flex items-center gap-1 mb-3 justify-center sm:justify-start">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-base text-gray-900">
                  {(provider.counties ?? []).join(", ")}
                </span>
              </div>
            )}

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
                  ({reviewCount}<span className="hidden sm:inline"> értékelés</span>)
                </span>
              )}
              <span className="ml-4 hidden sm:flex items-center gap-1 text-lg text-gray-900">
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
