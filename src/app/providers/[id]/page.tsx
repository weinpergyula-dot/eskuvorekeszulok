export const revalidate = 60;

import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { notFound } from "next/navigation";
import { Star, Send, MessageCircle } from "lucide-react";
import { quoteHrefFor } from "@/lib/quote-href";
import { ChatLink, LoginGateLink } from "@/components/providers/masked-contact";
import { ProviderHero } from "@/components/providers/provider-hero";
import { RevealOnScrollDown } from "@/components/providers/reveal-on-scroll-down";
import type { Provider } from "@/lib/types";
import { ViewTracker } from "@/components/providers/view-tracker";
import { BackLink } from "@/components/layout/back-link";
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
  const firstCategory = (provider.categories ?? [])[0] as ServiceCategory | undefined;
  const quoteHref = quoteHrefFor(provider);


  const backFallback = firstCategory ? `/?category=${firstCategory}#szolgaltatok` : "/#szolgaltatok";

  /* Teljes szélességű, lapozó fotó (rajta a szolgáltató adataival), aminek
     az aljára felcsúszik a tartalom fehér lapja; mobilon alul rögzített
     ajánlatkérő sáv, desktopon ragadós ajánlatkérő kártya. */
  return (
    <div className="pb-6 md:pb-16">
      <ViewTracker providerId={provider.id} />

      {/* Borítókép – mobilon teljes szélességben, a fejléc lekerekített alja mögé fut */}
      <div className="relative -mt-6 md:mt-0 md:max-w-7xl md:mx-auto md:px-6 lg:px-8 md:pt-6">
        <ProviderHero
          provider={provider}
          bleed
          /* A Vissza gomb a listázás `from` paraméterét követi (a szűrőkkel
             együtt); ha nincs, a szolgáltató kategóriájára nyitott főoldalra visz. */
          back={<BackLink fallbackHref={backFallback} round />}
          actions={
            <>
              <span className="glass-strong rounded-full p-0.5"><ShareButton title={provider.full_name} iconOnly /></span>
              <span className="glass-strong rounded-full p-0.5">
                <ProviderUserActions providerId={provider.id} providerUserId={provider.user_id} variant="mobile" />
              </span>
            </>
          }
        />
      </div>

      <div className="relative -mt-8 md:mt-8 max-w-7xl mx-auto md:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_340px] md:gap-8 md:items-start">
          {/* Felcsúszó lap: bemutatkozás, galéria, árak, chat, értékelések */}
          <div className="sheet-up relative rounded-t-[32px] md:rounded-[32px] bg-white px-4 pt-3 pb-6 sm:px-8 sm:pt-8 md:ring-1 md:ring-black/5 md:shadow-[0_24px_50px_-30px_rgba(20,45,42,0.5)]">
            <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-gray-900/15 md:hidden" aria-hidden />
            <ProviderTabs provider={provider} />
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
                <Send className="h-4 w-4" /> Ajánlatkérés
              </LoginGateLink>
              <ChatLink
                href={`/profil?tab=chat&with=${provider.user_id}`}
                className="btn-chat mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold"
              >
                <MessageCircle className="h-4 w-4" /> Chat
              </ChatLink>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobil: rögzített alsó ajánlatkérő sáv */}
      {/* Csak az első lefelé görgetéskor csúszik be, onnantól végig látszik. */}
      <RevealOnScrollDown className="mobile-bottom-bar md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
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
            className="tile-cta flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-[16px] font-semibold"
          >
            <Send className="h-4 w-4" /> Ajánlatkérés
          </LoginGateLink>
        </div>
      </RevealOnScrollDown>
    </div>
  );
}
