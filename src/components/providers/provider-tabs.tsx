"use client";

import { useState } from "react";
import { Phone, Mail, Globe } from "lucide-react";
import { GalleryLightbox } from "@/components/providers/gallery-lightbox";
import { cn } from "@/lib/utils";
import { MessageForm } from "@/components/providers/message-form";
import { ReviewSection } from "@/components/providers/review-section";
import type { Provider } from "@/lib/types";

type Tab = "about" | "message" | "reviews";

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

export function ProviderTabs({ provider }: { provider: Provider }) {
  const [active, setActive] = useState<Tab>("about");

  const reviewCount = provider.review_count ?? 0;

  const tabs: { id: Tab; label: string }[] = [
    { id: "about",   label: "Bemutatkozás" },
    { id: "message", label: "Üzenetküldés" },
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
            {provider.description ? (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Bemutatkozás</h2>
                <p className="text-gray-900 leading-relaxed whitespace-pre-line">{provider.description}</p>
              </section>
            ) : (
              <p className="text-gray-400 text-base italic">Nincs bemutatkozó szöveg.</p>
            )}

            {provider.gallery_urls && provider.gallery_urls.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Galéria</h2>
                <GalleryLightbox urls={provider.gallery_urls} alt="Galéria" />
              </section>
            )}
          </div>

          {/* Kapcsolat kártya */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4 sticky top-24">
              <h2 className="text-base font-semibold text-gray-900">Elérhetőség</h2>
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
                href={`mailto:${provider.email}`}
                className="hidden sm:block w-full text-center bg-[#C65EA5] hover:bg-[#A84D8B] text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
              >
                Kapcsolatfelvétel
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Üzenet tab */}
      {active === "message" && (
        <div className="max-w-lg">
          <MessageForm recipientId={provider.user_id} providerId={provider.id} />
        </div>
      )}

      {/* Értékelések tab */}
      {active === "reviews" && (
        <ReviewSection providerId={provider.id} providerUserId={provider.user_id} />
      )}
    </div>
  );
}
