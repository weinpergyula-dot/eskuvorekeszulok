"use client";

import { useState, useSyncExternalStore } from "react";
import { Phone, Mail, Globe, MessageCircle, FileText, Send, UserRound, Contact, Banknote } from "lucide-react";
import { ReviewSection } from "@/components/providers/review-section";
import { ChatLink, LoginGateLink, MaskedContact } from "@/components/providers/masked-contact";
import { quoteHrefFor } from "@/lib/quote-href";
import { WebsiteLink } from "@/components/providers/website-link";
import type { Provider } from "@/lib/types";

type Tab = "about" | "message" | "reviews" | "pricing";

function ContactItem({
  icon,
  value,
  href,
  external = false,
  fullyHidden = false,
  website = false,
}: {
  icon: React.ReactNode;
  value: string;
  href: string;
  external?: boolean;
  fullyHidden?: boolean;
  /** Weboldal: egy sorban, a vége kipontozva; Instagram/Facebook névvel. */
  website?: boolean;
}) {
  return (
    <div className="flex gap-3 items-center min-w-0">
      <span className="shrink-0">{icon}</span>
      <MaskedContact value={value} fullyHidden={fullyHidden}>
        {website ? (
          <WebsiteLink value={value} className="min-w-0 truncate text-base text-gray-900 hover:text-[#84AAA6] cursor-pointer" />
        ) : (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-base text-gray-900 hover:text-[#84AAA6] break-all cursor-pointer"
        >
          {value}
        </a>
        )}
      </MaskedContact>
    </div>
  );
}

const HASH_TO_TAB: Record<string, Tab> = {
  gallery: "about",
  message: "message",
  elerhetosegek: "message",
  contact: "message",
  messages: "message",
  reviews: "reviews",
  about: "about",
  pricing: "pricing",
  arak: "pricing",
};

const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const hashTabSnapshot = () => HASH_TO_TAB[window.location.hash.replace("#", "")] ?? null;

export function ProviderTabs({ provider }: { provider: Provider }) {
  // The URL hash (#reviews, #arak…) picks the opening tab; once the user
  // clicks a tab, that choice wins. On the server there is no hash.
  const hashTab = useSyncExternalStore(subscribeHash, hashTabSnapshot, () => null);
  const [chosen, setActive] = useState<Tab | null>(null);
  const active: Tab = chosen ?? hashTab ?? "about";

  const reviewCount = provider.review_count ?? 0;

  const hasPricing = !!(provider.pricing_pdf_url || provider.pricing_text);

  const tabs: { id: Tab; label: string }[] = [
    { id: "about",   label: "Bemutatkozás" },
    ...(hasPricing ? [{ id: "pricing" as Tab, label: "Árak" }] : []),
    { id: "message", label: "Elérhetőségek" },
    { id: "reviews", label: reviewCount > 0 ? `Értékelések (${reviewCount})` : "Értékelések" },
  ];

  return (
    <div>
      {/* Tab bar – szegmentált kapszula */}
      <div className="seg-tabs mb-6 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            data-active={active === tab.id}
            className="seg-tab flex-1 px-3 sm:px-5 py-2 text-[13px] sm:text-[15px]"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bemutatkozás */}
      {active === "about" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><UserRound className="h-5 w-5 text-[#84AAA6]" />Bemutatkozás</h2>
          {(provider.detailed_description || provider.description) ? (
            /* Mobilon 2px-el kisebb betű. */
            <p className="text-gray-900 leading-relaxed whitespace-pre-line text-[15px] sm:text-[17px]">
              {provider.detailed_description || provider.description}
            </p>
          ) : (
            <p className="text-gray-400 text-base italic">Nincs bemutatkozó szöveg.</p>
          )}
        </section>
      )}

      {/* Elérhetőségek tab: telefon, e-mail, weboldal + Chat és Ajánlatkérés */}
      {active === "message" && (
        <section className="max-w-xl space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Contact className="h-5 w-5 text-[#84AAA6]" />Elérhetőségek</h2>
          <div className="space-y-3">
            {provider.phone && (
              <ContactItem
                icon={<Phone className="h-4 w-4 text-[#84AAA6]" />}
                value={provider.phone}
                href={`tel:${provider.phone}`}
                fullyHidden
              />
            )}
            {provider.email && (
              <ContactItem
                icon={<Mail className="h-4 w-4 text-[#84AAA6]" />}
                value={provider.email}
                href={`mailto:${provider.email}`}
                fullyHidden
              />
            )}
            {provider.website && (
              <ContactItem
                icon={<Globe className="h-4 w-4 text-[#84AAA6]" />}
                value={provider.website}
                href={provider.website.startsWith("http") ? provider.website : `https://${provider.website}`}
                external
                fullyHidden
                website
              />
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <ChatLink
              href={`/profil?tab=chat&with=${provider.user_id}`}
              className="btn-chat flex-1 min-w-0 flex h-11 items-center justify-center gap-1.5 text-[14px] font-semibold px-3 rounded-full transition-colors cursor-pointer whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </ChatLink>
            {/* Ajánlatkérés – ugyanúgy előtöltve, mint a szolgáltatói kártyáról */}
            <LoginGateLink
              href={quoteHrefFor(provider)}
              message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
              className="tile-cta flex-1 min-w-0 flex h-11 items-center justify-center gap-1.5 text-[14px] font-semibold px-3 rounded-full transition-colors cursor-pointer whitespace-nowrap"
            >
              <Send className="h-4 w-4" />
              Ajánlatkérés
            </LoginGateLink>
          </div>
        </section>
      )}

      {/* Értékelések tab */}
      {active === "reviews" && (
        /* A fülön belül nem kell a szekció saját felső térköze. */
        <div className="[&>section]:mt-0">
          <ReviewSection providerId={provider.id} providerUserId={provider.user_id} />
        </div>
      )}

      {/* Árak tab */}
      {active === "pricing" && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Banknote className="h-5 w-5 text-[#84AAA6]" />Árak</h2>
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
                  className="flex items-center gap-2 tile-cta text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
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
