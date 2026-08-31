export const revalidate = 60;

import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { notFound } from "next/navigation";
import { MapPin, Star, Eye, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/types";
import { ViewTracker } from "@/components/providers/view-tracker";
import { PageHeader } from "@/components/layout/page-header";
import { ProviderTabs } from "@/components/providers/provider-tabs";
import { ProviderUserActions } from "@/components/providers/provider-user-actions";
import { ShareButton } from "@/components/providers/share-button";
import { AvatarLightbox } from "@/components/providers/avatar-lightbox";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("providers")
      .select("full_name, categories, description, avatar_url")
      .eq("id", id)
      .eq("approval_status", "approved")
      .or("active.is.null,active.eq.true")
      .single();
    if (!data) return { title: "Szolgáltató" };
    const firstCat = (data.categories as ServiceCategory[])?.[0];
    const label = firstCat ? CATEGORY_LABELS[firstCat] : "Szolgáltató";
    const title = `${data.full_name} – ${label} | Esküvőre Készülök`;
    const description = data.description
      ? data.description.slice(0, 155) + (data.description.length > 155 ? "…" : "")
      : `${data.full_name} esküvői ${label.toLowerCase()} – Esküvőre Készülök`;
    const images = data.avatar_url
      ? [{ url: data.avatar_url, width: 400, height: 400, alt: data.full_name }]
      : [{ url: "/og-image.png", width: 1200, height: 630, alt: "Esküvőre Készülök" }];
    return {
      title,
      description,
      openGraph: { title, description, images, type: "profile" },
      twitter: { card: "summary", title, description, images: [images[0].url] },
      alternates: { canonical: `https://eskuvorekeszulok.hu/providers/${id}` },
    };
  } catch {
    return { title: "Szolgáltató" };
  }
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const { id } = await params;

  let provider: Provider | null = null;
  try {
    const admin = createAdminClient();
    const [{ data, error }, { data: reviewRows }] = await Promise.all([
      admin.from("providers").select("*").eq("id", id).eq("approval_status", "approved").or("active.is.null,active.eq.true").single(),
      admin.from("reviews").select("rating").eq("provider_id", id),
    ]);
    if (error || !data) notFound();
    const reviewCount = reviewRows?.length ?? 0;
    const avgRating = reviewCount > 0
      ? Math.round((reviewRows!.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
      : 0;
    provider = { ...data as Provider, review_count: reviewCount, average_rating: avgRating };
  } catch {
    notFound();
  }

  if (!provider) notFound();

  const rating = provider.average_rating ?? 0;
  const reviewCount = provider.review_count ?? 0;
  const viewCount = provider.view_count ?? 0;
  const firstCategory = (provider.categories ?? [])[0] as ServiceCategory | undefined;

  return (
    <div>
      <PageHeader
        icon={User}
        title="Szolgáltatói profil"
        /* A Vissza gomb a listázás `from` paraméterét követi (a szűrőkkel
           együtt); ha nincs, a szolgáltató kategóriájára nyitott főoldalra visz. */
        backFallbackHref={firstCategory ? `/?category=${firstCategory}#szolgaltatok` : "/#szolgaltatok"}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ViewTracker providerId={provider.id} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Hero section */}
        <div className="relative" style={{ backgroundColor: "#F0F6F5" }}>
          {/* Action buttons — desktop */}
          <div className="absolute top-3 right-3 hidden sm:flex items-center gap-2">
            <ShareButton title={provider.full_name} />
            <ProviderUserActions providerId={provider.id} providerUserId={provider.user_id} variant="desktop" />
          </div>

          {/* ── Mobile: kompakt vízszintes fejléc ── */}
          <div className="sm:hidden relative px-4 pt-10 pb-4">
            {/* Gombok belül, ugyanúgy mint a csempe nézetben */}
            <div className="absolute top-2 left-2 z-10">
              <ProviderUserActions providerId={provider.id} providerUserId={provider.user_id} variant="mobile" />
            </div>
            <div className="absolute top-2 right-2 z-10">
              <ShareButton title={provider.full_name} iconOnly />
            </div>
            <div className="flex items-center gap-3">
              <div className="ml-1">
                <AvatarLightbox src={provider.avatar_url} name={provider.full_name} size="w-16 h-16" />
              </div>
              <div className="flex-1 min-w-0 pr-10">
                <h1 className="font-bold text-gray-900 text-[18px] leading-snug truncate">
                  {provider.full_name}
                </h1>
                {(provider.counties ?? []).length > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-[#84AAA6] shrink-0" />
                    <span className="text-sm text-gray-900 leading-snug">
                      {(provider.counties ?? []).join(", ")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={cn("h-3.5 w-3.5", star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")} />
                  ))}
                  <span className="text-sm font-semibold text-gray-900 ml-0.5">
                    {rating > 0 ? rating.toFixed(1) : "–"}
                  </span>
                  {reviewCount > 0 && (
                    <span className="text-sm text-gray-500">({reviewCount})</span>
                  )}
                </div>
              </div>
            </div>
            {/* Kategóriák a fejlécsor alatt, balra zártan */}
            {(provider.categories ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(provider.categories as ServiceCategory[]).map((cat) => (
                  <span key={cat} className="text-xs font-medium px-2.5 py-1 rounded-full border border-[#84AAA6]/40 text-[#5C8480] bg-[#EDF4F3]">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Desktop: eredeti elrendezés ── */}
          <div className="hidden sm:flex px-8 py-10 flex-row gap-6 items-start">
            <AvatarLightbox src={provider.avatar_url} name={provider.full_name} size="w-28 h-28" />
            <div className="flex-1 text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {provider.full_name}
              </h1>
              {(provider.counties ?? []).length > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-base text-gray-900">
                    {(provider.counties ?? []).join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={cn("h-5 w-5", star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")} />
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
                <span className="ml-4 flex items-center gap-1 text-lg text-gray-900">
                  <Eye className="h-4 w-4" />
                  {viewCount} megtekintés
                </span>
              </div>
            </div>
          </div>
        </div>

        <ProviderTabs provider={provider} />
      </div>
      </div>
    </div>
  );
}
