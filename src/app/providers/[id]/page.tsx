export const revalidate = 60;

import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { notFound } from "next/navigation";
import { MapPin, Star, Eye, Flame, Send, MessageCircle } from "lucide-react";
import { CATEGORY_LUCIDE_ICONS } from "@/lib/category-icons";
import { quoteHrefFor } from "@/lib/quote-href";
import { BackLink } from "@/components/layout/back-link";
import { ChatLink, LoginGateLink } from "@/components/providers/masked-contact";
import type { Provider } from "@/lib/types";
import { ViewTracker } from "@/components/providers/view-tracker";
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
  const categories = (provider.categories ?? []) as ServiceCategory[];
  const counties = provider.counties ?? [];
  const firstCategory = categories[0];
  const gallery = provider.gallery_urls ?? [];
  const cover = gallery[0] ?? provider.avatar_url ?? null;
  const backFallback = firstCategory ? `/?category=${firstCategory}#szolgaltatok` : "/#szolgaltatok";
  const quoteHref = quoteHrefFor(provider);
  const featuredLabel = provider.featured === "gold" ? "Arany partner" : provider.featured === "silver" ? "Ezüst partner" : provider.featured ? "Kiemelt partner" : null;

  const stats = [
    { Icon: Star, value: rating > 0 ? rating.toFixed(1) : "Új", label: reviewCount > 0 ? `${reviewCount} értékelés` : "értékelés" },
    { Icon: Eye, value: String(viewCount), label: "megtekintés" },
    { Icon: MapPin, value: counties.includes("Országosan") ? "Országos" : String(counties.length || "–"), label: counties.includes("Országosan") ? "lefedettség" : "megye" },
  ];

  /* ── Új dizájn: teljes szélességű fotó, rá felcsúszó lap, alul rögzített
     ajánlatkérő sáv (mobilon) / ragadós üveg foglaló-kártya (desktopon). */
  return (
    <div className="pb-32 md:pb-16">
      <ViewTracker providerId={provider.id} />

      {/* Borítókép – mobilon a lebegő fejléc mögé is befut */}
      <div className="relative -mt-[68px] md:mt-0 md:max-w-7xl md:mx-auto md:px-6 lg:px-8 md:pt-6">
        <div className="relative h-[54vh] min-h-[340px] max-h-[560px] overflow-hidden bg-[#F6E4EC] md:h-[480px] md:rounded-[32px] md:ring-1 md:ring-white/70 md:shadow-[0_30px_60px_-30px_rgba(90,20,60,0.5)]">
          {cover ? (
            <div className="absolute inset-0 md:grid md:grid-cols-[2fr_1fr] md:gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={provider.full_name} className="blur-in h-full w-full object-cover" />
              {gallery.length > 2 && (
                <div className="hidden md:grid h-full min-h-0 grid-rows-2 gap-2">
                  {gallery.slice(1, 3).map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" className="h-full min-h-0 w-full object-cover" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-heading text-8xl font-bold text-[#E8336A]/40">
              {provider.full_name.charAt(0)}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/30" />

          <div className="absolute inset-x-4 top-[84px] md:top-5 md:inset-x-5 flex items-center justify-between">
            <BackLink fallbackHref={backFallback} round />
            <div className="flex items-center gap-2">
              <div className="glass-strong rounded-full p-0.5">
                <ShareButton title={provider.full_name} iconOnly />
              </div>
              <div className="glass-strong rounded-full p-0.5">
                <ProviderUserActions providerId={provider.id} providerUserId={provider.user_id} variant="mobile" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-8 md:mt-8 max-w-7xl mx-auto md:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_360px] md:gap-8 md:items-start">
          {/* Lap */}
          <div className="sheet-up glass-strong rounded-t-[32px] md:rounded-[32px] px-5 pt-3 pb-6 sm:px-8 sm:pt-8">
            <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[#1F1A2E]/15 md:hidden" aria-hidden />

            {featuredLabel && (
              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#FDEEF3] px-2.5 py-1 text-[12px] font-semibold text-[#B3264F]">
                <Flame className="h-3.5 w-3.5 fill-[#E8336A] text-[#E8336A]" /> {featuredLabel}
              </span>
            )}
            <h1 className="font-heading font-extrabold tracking-tight text-[#1F1A2E] text-[27px] sm:text-[36px] leading-tight">
              {provider.full_name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-[#1F1A2E]">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-[#1F1A2E]" />
                {rating > 0 ? rating.toFixed(2).replace(/0$/, "") : "Új"}
              </span>
              {reviewCount > 0 && <span className="text-[#6B6480]">· {reviewCount} értékelés</span>}
              {counties.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[#6B6480]">· <MapPin className="h-3.5 w-3.5" />{counties.slice(0, 3).join(", ")}{counties.length > 3 && ` +${counties.length - 3}`}</span>
              )}
            </div>

            {/* Számok */}
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {stats.map(({ Icon, value, label }) => (
                <div key={label} className="flex flex-col items-center rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-[#1F1A2E]/5 shadow-[0_8px_20px_-14px_rgba(90,20,60,0.35)]">
                  <Icon className="h-5 w-5 text-[#E8336A]" strokeWidth={1.8} />
                  <span className="mt-1 text-[16px] font-bold text-[#1F1A2E] leading-tight">{value}</span>
                  <span className="text-[12px] text-[#6B6480]">{label}</span>
                </div>
              ))}
            </div>

            {/* Kapcsolattartó */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#FDEEF3]/70 p-3">
              <AvatarLightbox src={provider.avatar_url} name={provider.full_name} size="w-12 h-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-[#1F1A2E]">{provider.full_name}</p>
                <p className="text-[13px] text-[#6B6480]">Esküvőre Készülök szolgáltató</p>
              </div>
              <ChatLink
                href={`/profil?tab=chat&with=${provider.user_id}`}
                className="shrink-0 rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-[#1F1A2E] shadow-sm"
              >
                Üzenet
              </ChatLink>
            </div>

            {/* Mit kínál */}
            {categories.length > 0 && (
              <section className="mt-6">
                <h2 className="font-heading text-[19px] font-bold text-[#1F1A2E]">Mit kínál</h2>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {categories.map((cat) => {
                    const Icon = CATEGORY_LUCIDE_ICONS[cat];
                    return (
                      <div key={cat} className="flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2.5 text-[14px] text-[#1F1A2E] ring-1 ring-[#1F1A2E]/5">
                        {Icon && <Icon className="h-4 w-4 shrink-0 text-[#E8336A]" strokeWidth={1.8} />}
                        <span className="leading-tight">{CATEGORY_LABELS[cat] ?? cat}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="mt-6">
              <ProviderTabs provider={provider} />
            </div>
          </div>

          {/* Desktop: ragadós foglaló-kártya */}
          <aside className="hidden md:block sticky top-24">
            <div className="glass-strong rounded-[28px] p-6">
              <p className="font-heading text-[22px] font-bold text-[#1F1A2E] leading-tight">Kérj ajánlatot</p>
              <p className="mt-1 text-[15px] text-[#6B6480]">
                Írd meg a dátumot és az elképzeléseidet – {provider.full_name} közvetlenül neked válaszol.
              </p>
              {provider.pricing_text && (
                <p className="mt-4 rounded-2xl bg-white/80 p-3 text-[14px] text-[#1F1A2E] line-clamp-3 whitespace-pre-line">{provider.pricing_text}</p>
              )}
              <LoginGateLink
                href={quoteHref}
                message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
                className="rose-cta mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold"
              >
                <Send className="h-4 w-4" /> Ajánlatot kérek
              </LoginGateLink>
              <ChatLink
                href={`/profil?tab=chat&with=${provider.user_id}`}
                className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[16px] font-semibold text-[#1F1A2E] ring-1 ring-[#1F1A2E]/10 hover:bg-[#FDEEF3]"
              >
                <MessageCircle className="h-4 w-4" /> Chat indítása
              </ChatLink>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobil: rögzített alsó ajánlatkérő sáv */}
      <div className="mobile-bottom-bar md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="glass-strong flex items-center justify-between gap-3 rounded-[26px] py-2.5 pl-5 pr-2.5">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[16px] font-bold text-[#1F1A2E]">
              <Star className="h-4 w-4 fill-[#1F1A2E]" />
              {rating > 0 ? rating.toFixed(1) : "Új"}
              {reviewCount > 0 && <span className="font-normal text-[#6B6480] text-[14px]">({reviewCount})</span>}
            </p>
            <p className="truncate text-[13px] text-[#6B6480]">
              {provider.pricing_text ? provider.pricing_text.split("\n")[0] : "Ajánlatkérés pár perc alatt"}
            </p>
          </div>
          <LoginGateLink
            href={quoteHref}
            message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
            className="rose-cta flex h-12 shrink-0 items-center justify-center rounded-full px-6 text-[16px] font-semibold"
          >
            Ajánlatot kérek
          </LoginGateLink>
        </div>
      </div>
    </div>
  );
}
