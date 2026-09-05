"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Globe, PhoneCall, Shield, Pause, Play, type LucideIcon } from "lucide-react";
import { HERO_BANNERS, formatFt } from "../_data/offers";

const PERK_ICONS: Record<"net" | "call" | "shield", LucideIcon> = {
  net: Globe,
  call: PhoneCall,
  shield: Shield,
};

const INTERVAL_MS = 5000;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Figyeli, hogy a látogató kevesebb mozgást kért-e a rendszerében.
 * useSyncExternalStore-ral, hogy a szerveren rendered érték (false) és a
 * kliensé ne térjen el, és ne kelljen effektből state-et állítani.
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * Mobil hero: a Yettel Prime kampánybannerek (XXL → L → M) váltakozva.
 *
 * A banner nem egy kész kép, hanem rétegekből áll: sötét háttér + kivágott
 * fotó + a ferde lime panel + a szöveg. Így a tipográfia minden telefonon
 * éles marad, a szöveg felolvasható és kereshető, a kampányárat pedig elég
 * az adatfájlban átírni.
 *
 * A méretek cqw-ben (a banner szélességének százalékában) vannak megadva,
 * ezért a kreatív aránya kicsi és nagy telefonon is pontosan ugyanaz.
 */
export function HeroBanners() {
  const [index, setIndex] = useState(0);
  // null = a látogató még nem nyúlt a gombhoz, ilyenkor a rendszerbeállítás dönt.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const paused = userPaused ?? reducedMotion;
  const setPaused = (next: boolean) => setUserPaused(next);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % HERO_BANNERS.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [paused, index]);

  const banner = HERO_BANNERS[index];

  return (
    /* A negatív felső margó a fejléc mögé húzza a bannert (a pt tartja helyén
       a tartalmat), az alsó ív pedig elválasztja a következő sávtól – ugyanaz
       a keret, mint a HeroSlides-nál, hogy a váltás észrevétlen legyen. */
    <section className="relative z-10 -mt-14 overflow-hidden rounded-b-[32px] bg-[#14181C] pt-14">
      <div className="yettel-banner relative w-full" style={{ containerType: "inline-size" }}>
        <a
          key={banner.id}
          href={banner.href}
          aria-label={`Yettel ${banner.title} – ${formatFt(banner.price)} / hó`}
          className="yettel-slide-in relative block aspect-square w-full overflow-hidden"
        >
          {/* Fotó: jobbra igazítva, a sötét háttérbe olvadva. A kivágott
              (átlátszó hátterű) képek így is a helyükön maradnak. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.photo}
            alt={banner.photoAlt}
            fetchPriority="high"
            className="absolute bottom-0 right-0 h-[92%] w-auto max-w-[62%] object-contain object-bottom"
          />
          {/* Finom sötétítés a fotó bal oldalán, hogy a főcím mindig olvasható
              legyen, bármilyen kampányfotó kerül alá. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,24,28,0.92)_0%,rgba(20,24,28,0.55)_45%,rgba(20,24,28,0)_72%)]"
          />

          {/* A ferde lime panel: egy elforgatott, túlméretezett téglalap, ami
              bal oldalon és alul kilóg a banner alól, így nem marad rés. */}
          <span
            aria-hidden
            className="absolute bg-[#C7F534]"
            style={{
              left: "-12cqw",
              right: "34cqw",
              top: "23cqw",
              bottom: "-14cqw",
              transform: "rotate(4.6deg)",
              transformOrigin: "0% 100%",
            }}
          />

          {/* Főcím – a fotó fölött, a lime panel felett */}
          <h1
            className="absolute font-extrabold leading-[1.05] tracking-tight text-[#C7F534]"
            style={{ left: "6cqw", top: "6cqw", fontSize: "8.2cqw" }}
          >
            Yettel {banner.title}
          </h1>

          {/* A lime panel tartalma – nem forog együtt a panellel, hogy a szöveg
              vízszintes maradjon. Egy oszlopba folyik (nem külön pozicionált
              elemek), így 2 és 3 jellemzős kreatívnál sem csúszik egymásra,
              az apróbetűs sort pedig a mt-auto tolja az aljára. */}
          <div
            className="absolute flex flex-col text-[#002340]"
            style={{ left: "6cqw", right: "33cqw", top: "34cqw", bottom: "5cqw" }}
          >
            <p className="font-semibold" style={{ fontSize: "3.6cqw" }}>
              {banner.priceLead}
            </p>
            <p className="font-extrabold leading-none tracking-tight" style={{ fontSize: "9.4cqw" }}>
              {formatFt(banner.price)}
              <span className="font-bold" style={{ fontSize: "4cqw" }}>
                /hó
              </span>
            </p>

            <ul style={{ marginTop: "3cqw" }}>
              {banner.perks.map((perk) => (
                <li
                  key={perk.strong + perk.rest}
                  className="flex items-center"
                  style={{ gap: "3cqw", marginTop: "2.6cqw" }}
                >
                  {(() => {
                    const Icon = PERK_ICONS[perk.icon];
                    return <Icon strokeWidth={1.6} style={{ width: "6.2cqw", height: "6.2cqw", flexShrink: 0 }} />;
                  })()}
                  <span className="leading-tight" style={{ fontSize: "4.1cqw" }}>
                    <strong className="font-extrabold">{perk.strong}</strong>
                    {perk.rest ? <> {perk.rest}</> : null}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-auto" style={{ fontSize: "3.4cqw", paddingTop: "2.5cqw", marginRight: "-11cqw" }}>
              {banner.footnote} <strong className="font-extrabold">{banner.footnoteStrong}</strong>
            </p>
          </div>

          {/* Yettel logó – a kreatívok jobb alsó sarkában */}
          <span
            aria-hidden
            className="absolute font-extrabold tracking-tight text-[#C7F534]"
            style={{ right: "5cqw", bottom: "5cqw", fontSize: "7.6cqw" }}
          >
            Yettel<span className="text-white">.</span>
          </span>
        </a>
      </div>

      {/* Vetítésvezérlő: pause/play és a pöttyök – a banner alatt, sötét sávon. */}
      <div className="flex items-center justify-center gap-2.5 py-3">
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Vetítés indítása" : "Vetítés megállítása"}
          className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-md"
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
        <div className="flex items-center gap-1">
          {HERO_BANNERS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}. ajánlat`}
              aria-current={i === index ? "true" : undefined}
              className="cursor-pointer px-0.5 py-1.5"
            >
              <span
                className="block h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 18 : 6,
                  backgroundColor: i === index ? "#C7F534" : "rgba(255,255,255,0.35)",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
