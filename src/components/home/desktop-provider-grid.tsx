"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Provider } from "@/lib/types";
import { ProviderCard } from "@/components/providers/provider-card";
import { Pause, Play, ChevronRight } from "lucide-react";

interface DesktopProviderGridProps {
  providers: Provider[];
}

const CARDS_COUNT = 3;
const INTERVAL_MS = 8000;
const FADE_MS = 450;
const STAGGER_MS = 90;

function randomSubset(arr: Provider[], n: number): Provider[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export function DesktopProviderGrid({ providers }: DesktopProviderGridProps) {
  // SSR-safe: start with first N, randomise on client after mount
  const [cards, setCards] = useState<Provider[]>(
    providers.slice(0, Math.min(CARDS_COUNT, providers.length))
  );
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const pausedRef = useRef(false);

  // Randomise on first client render to avoid hydration mismatch
  useEffect(() => {
    setCards(randomSubset(providers, CARDS_COUNT));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setCards(randomSubset(providers, CARDS_COUNT));
      setVisible(true);
    }, FADE_MS);
  }, [providers]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) advance();
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [advance]);

  const handlePausePlay = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
  };

  if (providers.length === 0) return null;

  return (
    <section className="bg-white pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Kiemelt szolgáltatók
        </h2>

        {/* Cards — staggered fade + slide on change */}
        <div className="grid grid-cols-3 gap-4">
          {cards.map((provider, idx) => (
            <div
              key={idx}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(14px)",
                transition: `opacity ${FADE_MS}ms ease-in-out ${visible ? idx * STAGGER_MS : 0}ms, transform ${FADE_MS}ms ease-in-out ${visible ? idx * STAGGER_MS : 0}ms`,
              }}
            >
              <ProviderCard key={provider.id} provider={provider} />
            </div>
          ))}
        </div>

        {/* Controls */}

        <div className="flex items-center justify-center gap-6 mt-5">
          <button
            type="button"
            onClick={handlePausePlay}
            aria-label={paused ? "Lejátszás" : "Megállítás"}
            className="p-2.5 rounded-full bg-[#84AAA6]/10 text-[#84AAA6] hover:bg-[#84AAA6]/20 transition-colors"
          >
            {paused
              ? <Play className="h-5 w-5" strokeWidth={1.75} />
              : <Pause className="h-5 w-5" strokeWidth={1.75} />}
          </button>

          <button
            type="button"
            onClick={advance}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#84AAA6]/10 text-[#84AAA6] hover:bg-[#84AAA6]/20 transition-colors text-sm font-medium"
          >
            Következő
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </section>
  );
}
