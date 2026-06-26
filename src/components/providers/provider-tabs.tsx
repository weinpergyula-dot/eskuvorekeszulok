"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, Globe, MessageCircle, FileText } from "lucide-react";
import { GalleryLightbox } from "@/components/providers/gallery-lightbox";
import { cn } from "@/lib/utils";
import { ReviewSection } from "@/components/providers/review-section";
import type { Provider } from "@/lib/types";

type Tab = "about" | "gallery" | "message" | "reviews" | "pricing";

function ContactItem({
  icon,
  value,
  href,
  external = false,
}: {
  icon: React.ReactNode;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <div className="flex gap-3 items-center">
      <span className="shrink-0">{icon}</span>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="text-base text-gray-900 hover:text-[#84AAA6] break-all cursor-pointer"
      >
        {value}
      </a>
    </div>
  );
}

const HASH_TO_TAB: Record<string, Tab> = {
  gallery: "gallery",
  message: "message",
  messages: "message",
  reviews: "reviews",
  about: "about",
  pricing: "pricing",
  arak: "pricing",
};

export function ProviderTabs({ provider }: { provider: Provider }) {
  const [active, setActive] = useState<Tab>("about");

  const reviewCount = provider.review_count ?? 0;
  const hasGallery = (provider.gallery_urls ?? []).length > 0;

  // Switch to tab based on URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const tab = HASH_TO_TAB[hash];
    if (tab) setActive(tab);
  }, []);

  const hasPricing = !!(provider.pricing_pdf_url || provider.pricing_text);

  const tabs: { id: Tab; label: string; desktopOnly?: boolean }[] = [
    { id: "about",   label: "Bemutatkozás" },
    ...(hasGallery ? [{ id: "gallery" as Tab, label: "Galéria", desktopOnly: true }] : []),
    ...(hasPricing ? [{ id: "pricing" as Tab, label: "Árak" }] : []),
    { id: "message", label: "Chat" },
    { id: "reviews", label: reviewCount > 0 ? `Értékelések (${reviewCount})` : "Értékelések" },
  ];

  return (
    <div className="px-8 pb-8 pt-2">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-8 -mx-8 px-0 sm:px-8 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex-1 sm:flex-none px-2 sm:px-4 py-3 text-sm sm:text-base font-extrabold border-b-2 transition-colors cursor-pointer -mb-px whitespace-nowrap [font-family:'BloomSpeakBody']",
              tab.desktopOnly ? "hidden sm:block" : "",
              active === tab.id
                ? "border-[#84AAA6] text-[#84AAA6]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bemutatkozás */}
      {active === "about" && (
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">
            {(provider.detailed_description || provider.description) ? (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Bemutatkozás</h2>
                <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                  {provider.detailed_description || provider.description}
                </p>
              </section>
            ) : (
              <p className="text-gray-400 text-base italic">Nincs bemutatkozó szöveg.</p>
            )}

            {/* Gallery: mobile only — desktop has its own tab */}
            {provider.gallery_urls && provider.gallery_urls.length > 0 && (
              <section className="sm:hidden">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Galéria</h2>
                <GalleryLightbox urls={provider.gallery_urls} alt="Galéria" />
              </section>
            )}
          </div>

          {/* Kapcsolat kártya */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4 sticky top-24">
              <h2 className="text-base font-semibold text-gray-900">Elérhetőségek</h2>
              <div className="space-y-3">
                {provider.phone && (
                  <ContactItem
                    icon={<Phone className="h-4 w-4 text-[#84AAA6]" />}
                    value={provider.phone}
                    href={`tel:${provider.phone}`}
                  />
                )}
                {provider.email && (
                  <ContactItem
                    icon={<Mail className="h-4 w-4 text-[#84AAA6]" />}
                    value={provider.email}
                    href={`mailto:${provider.email}`}
                  />
                )}
                {provider.website && (
                  <ContactItem
                    icon={<Globe className="h-4 w-4 text-[#84AAA6]" />}
                    value={provider.website}
                    href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`}
                    external
                  />
                )}
              </div>
              <a
                href={`/profil?tab=chat&with=${provider.user_id}`}
                className="w-full flex items-center justify-center gap-2 bg-[#84AAA6] hover:bg-[#6B8E8A] text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                Chat indítása
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Galéria tab – desktop only */}
      {active === "gallery" && (
        <GalleryLightbox urls={provider.gallery_urls ?? []} alt="Galéria" />
      )}

      {/* Chat tab */}
      {active === "message" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <MessageCircle className="h-14 w-14 text-[#84AAA6]" strokeWidth={1} />
          <div>
            <p className="text-base font-semibold text-gray-900 mb-1">Chat {provider.full_name} nevű szolgáltatóval</p>
            <p className="text-sm text-gray-500">A chat a profilodon belüli Chat menüpontban folytatódik.</p>
          </div>
          <a
            href={`/profil?tab=chat&with=${provider.user_id}`}
            className="flex items-center gap-2 bg-[#84AAA6] hover:bg-[#6B8E8A] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            Chat indítása
          </a>
        </div>
      )}

      {/* Értékelések tab */}
      {active === "reviews" && (
        <ReviewSection providerId={provider.id} providerUserId={provider.user_id} />
      )}

      {/* Árak tab */}
      {active === "pricing" && (
        <div className="space-y-6">
          {provider.pricing_text && (
            <div className="prose prose-gray max-w-none">
              {/* mobilon 4px-el kisebb betűméret (17px -> 13px), desktopon változatlan */}
              <p className="text-gray-900 leading-relaxed whitespace-pre-line text-[13px] sm:text-[17px]">{provider.pricing_text}</p>
            </div>
          )}
          {provider.pricing_pdf_url && (
            <div className="space-y-3">
              {/* Desktop: embedded PDF */}
              <div className="hidden sm:block w-full rounded-xl border border-gray-200 overflow-hidden" style={{ height: "80vh" }}>
                <embed
                  src={provider.pricing_pdf_url}
                  type="application/pdf"
                  className="w-full h-full"
                />
              </div>
              {/* Mobile: download link fallback */}
              <div className="sm:hidden flex flex-col items-center justify-center py-12 gap-4 text-center">
                <FileText className="h-12 w-12 text-[#84AAA6]" strokeWidth={1} />
                <div>
                  <p className="text-base font-semibold text-gray-900 mb-1">Árlista PDF</p>
                  <p className="text-sm text-gray-500">Nyisd meg a PDF-et az árlistáért.</p>
                </div>
                <a
                  href={provider.pricing_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#84AAA6] hover:bg-[#6B8E8A] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                >
                  <FileText className="h-4 w-4" strokeWidth={1.5} />
                  PDF megnyitása
                </a>
              </div>
            </div>
          )}
          {!provider.pricing_text && !provider.pricing_pdf_url && (
            <p className="text-gray-400 text-base italic">Nincs árlista feltöltve.</p>
          )}
        </div>
      )}
    </div>
  );
}
