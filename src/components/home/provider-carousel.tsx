"use client";

import type { Provider } from "@/lib/types";
import { ProviderCard } from "@/components/providers/provider-card";

interface ProviderCarouselProps {
  providers: Provider[];
}

export function ProviderCarousel({ providers }: ProviderCarouselProps) {
  if (providers.length === 0) return null;

  // Duplicate cards for seamless infinite loop
  const doubled = [...providers, ...providers];

  return (
    <section className="sm:hidden bg-white pt-2 pb-10 overflow-hidden">
      <div className="px-4 mb-5">
        <h2 className="text-2xl font-bold text-gray-900">Kiemelt szolgáltatók</h2>
      </div>

      {/* Carousel track — CSS infinite scroll */}
      <div className="overflow-hidden">
        <div
          className="carousel-track flex gap-3"
          style={{ width: "max-content" }}
        >
          {doubled.map((provider, i) => (
            <div
              key={`${provider.id}-${i}`}
              // Each card occupies slightly less than half the viewport so 2 are visible
              style={{ width: "calc(50vw - 20px)", flexShrink: 0 }}
            >
              <ProviderCard provider={provider} hideCategories nameFontSize="18px" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
