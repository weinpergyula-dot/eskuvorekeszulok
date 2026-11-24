export const revalidate = 60;

import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { notFound } from "next/navigation";
import { MapPin, Star, Eye, User, Send, MessageCircle } from "lucide-react";
import { CATEGORY_LUCIDE_ICONS } from "@/lib/category-icons";
import { quoteHrefFor } from "@/lib/quote-href";
import { ChatLink, LoginGateLink } from "@/components/providers/masked-contact";
import { ProviderHero } from "@/components/providers/provider-hero";
import type { Provider } from "@/lib/types";
import { ViewTracker } from "@/components/providers/view-tracker";
import { PageHeader } from "@/components/layout/page-header";
import { ProviderTabs } from "@/components/providers/provider-tabs";
import { ProviderUserActions } from "@/components/providers/provider-user-actions";
import { ShareButton } from "@/components/providers/share-button";

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
  const categories = (provider.categories ?? []) as ServiceCategory[];
  const counties = provider.counties ?? [];
  const firstCategory = categories[0];
  const quoteHref = quoteHrefFor(provider);
  const nationwide = counties.includes("Országosan");

  const stats = [
    { Icon: Star, value: rating > 0 ? rating.toFixed(1) : "Új", label: reviewCount > 0 ? `${reviewCount} értékelés` : "értékelés" },
    { Icon: Eye, value: String(viewCount), label: "megtekintés" },
    { Icon: MapPin, value: nationwide ? "Országos" : String(counties.length || "–"), label: nationwide ? "lefedettség" : "megye" },
  ];

  /* A lista kártyáinak megjelenése: nagy, lapozó fotós kártya, alatta
     fehér, lekerekített blokkok; mobilon alul rögzített ajánlatkérő sáv,
     desktopon ragadós ajánlatkérő kártya. */
  return (
    <div className="pb-28 md:pb-12">
      <PageHeader
        icon={User}
        title="Szolgáltatói profil"
        /* A Vissza gomb a listázás `from` paraméterét követi (a szűrőkkel
           együtt); ha nincs, a szolgáltató kategóriájára nyitott főoldalra visz. */
        backFallbackHref={firstCategory ? `/?category=${firstCategory}#szolgaltatok` : "/#szolgaltatok"}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        <ViewTracker providerId={provider.id} />

        <div className="md:grid md:grid-cols-[minmax(0,1fr)_340px] md:gap-8 md:items-start">
          <div className="space-y-4">
            <ProviderHero
              provider={provider}
              actions={
                <>
                  <span className="glass-strong rounded-full p-0.5"><ShareButton title={provider.full_name} iconOnly /></span>
                  <span className="glass-strong rounded-full p-0.5">
                    <ProviderUserActions providerId={provider.id} providerUserId={provider.user_id} variant="mobile" />
                  </span>
                </>
              }
            />

            {/* Számok */}
            <div className="grid grid-cols-3 gap-2.5">
              {stats.map(({ Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center rounded-[22px] bg-white px-2 py-3 text-center ring-1 ring-black/5 shadow-[0_14px_30px_-22px_rgba(20,45,42,0.5)]">
                  <Icon className="h-5 w-5 text-[#84AAA6]" strokeWidth={1.8} />
                  <span className="mt-1 text-[16px] font-bold text-gray-900 leading-tight">{value}</span>
                  <span className="text-[12px] text-gray-500">{label}</span>
                </div>
              ))}
            </div>

            {/* Mit kínál */}
            {categories.length > 0 && (
              <section className="rounded-[26px] bg-white p-4 sm:p-5 ring-1 ring-black/5 shadow-[0_14px_30px_-22px_rgba(20,45,42,0.5)]">
                <h2 className="text-[18px] font-bold text-gray-900">Mit kínál</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const Icon = CATEGORY_LUCIDE_ICONS[cat];
                    return (
                      <div key={cat} className="flex items-center gap-2.5 rounded-2xl bg-[#F0F6F5] px-3 py-2.5 text-[14px] text-gray-900">
                        {Icon && <Icon className="h-4 w-4 shrink-0 text-[#6B8E8A]" strokeWidth={1.8} />}
                        <span className="leading-tight">{CATEGORY_LABELS[cat] ?? cat}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Bemutatkozás, galéria, árak, chat, értékelések */}
            <div className="rounded-[26px] bg-white p-4 sm:p-6 ring-1 ring-black/5 shadow-[0_14px_30px_-22px_rgba(20,45,42,0.5)]">
              <ProviderTabs provider={provider} />
            </div>
          </div>

          {/* Desktop: ragadós ajánlatkérő kártya */}
          <aside className="hidden md:block sticky top-24">
            <div className="rounded-[28px] bg-white p-6 ring-1 ring-black/5 shadow-[0_24px_50px_-30px_rgba(20,45,42,0.55)]">
              <p className="text-[22px] font-bold text-gray-900 leading-tight [font-family:var(--font-heading)]">Kérj ajánlatot</p>
              <p className="mt-1 text-[15px] text-gray-500">
                Írd meg a dátumot és az elképzeléseidet – {provider.full_name} közvetlenül neked válaszol.
              </p>
              {provider.pricing_text && (
                <p className="mt-4 rounded-2xl bg-[#F0F6F5] p-3 text-[14px] text-gray-900 line-clamp-3 whitespace-pre-line">{provider.pricing_text}</p>
              )}
              <LoginGateLink
                href={quoteHref}
                message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
                className="tile-cta mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold"
              >
                <Send className="h-4 w-4" /> Ajánlatot kérek
              </LoginGateLink>
              <ChatLink
                href={`/profil?tab=chat&with=${provider.user_id}`}
                className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#F0F6F5] text-[16px] font-semibold text-[#5C8480] hover:bg-[#E3EFED]"
              >
                <MessageCircle className="h-4 w-4" /> Chat indítása
              </ChatLink>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobil: rögzített alsó ajánlatkérő sáv */}
      <div className="mobile-bottom-bar md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="glass-strong flex items-center justify-between gap-3 rounded-[26px] py-2.5 pl-5 pr-2.5 shadow-[0_18px_40px_-18px_rgba(20,45,42,0.45)]">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[16px] font-bold text-gray-900">
              <Star className="h-4 w-4 fill-gray-900" />
              {rating > 0 ? rating.toFixed(1) : "Új"}
              {reviewCount > 0 && <span className="font-normal text-gray-500 text-[14px]">({reviewCount})</span>}
            </p>
            <p className="truncate text-[13px] text-gray-500">
              {provider.pricing_text ? provider.pricing_text.split("\n")[0] : "Ajánlatkérés pár perc alatt"}
            </p>
          </div>
          <LoginGateLink
            href={quoteHref}
            message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
            className="tile-cta flex h-12 shrink-0 items-center justify-center rounded-full px-6 text-[16px] font-semibold"
          >
            Ajánlatot kérek
          </LoginGateLink>
        </div>
      </div>
    </div>
  );
}
