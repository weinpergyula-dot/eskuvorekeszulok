"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";

/**
 * A /meghivo banner. A diák 5 másodpercenként váltakoznak: balra egy megdöntött
 * telefonon a meghívó-minta képe, jobbra a marketing szöveg – a főoldali banner
 * tipográfiájával (teal + szürke, vastag verzál). A háttér az oldal animált
 * teal gradiense (.teal-shift-bg). A vetítés pause gombbal megállítható, és
 * csökkentett mozgás esetén alapból áll.
 */

const INTERVAL_MS = 5000;

type Slide = {
  key: string;
  lead: string;
  accent: string;
  blurb: string;
  note: string;
  img: string;
  alt: string;
};

const SLIDES: Slide[] = [
  {
    key: "basic",
    lead: "MEGHÍVÓ,",
    accent: "AMIT NEM DOBNAK KI",
    blurb:
      "A ti nevetekkel, a ti történetetekkel – egyetlen linken, ami a vendégek telefonján bármikor ott van.",
    note: "Visszaszámláló · program · dress code",
    img: "/meghivo/slide-basic.webp",
    alt: "BASIC meghívó-minta telefonon",
  },
  {
    key: "silver",
    lead: "GALÉRIA,",
    accent: "ZENE, VENDÉGKÖNYV",
    blurb:
      "A SILVER csomagban a közös képeitek, a kedvenc dalotok és a vendégek üzenetei is helyet kapnak.",
    note: "Fotógaléria · háttérzene · térkép",
    img: "/meghivo/slide-silver.webp",
    alt: "SILVER meghívó-minta telefonon",
  },
  {
    key: "program",
    lead: "MINDEN INFÓ",
    accent: "EGY HELYEN",
    blurb:
      "Óráról órára a nap programja, helyszínek térképpel, szállás – a vendégeitek nem fognak kérdezősködni.",
    note: "RSVP · menüválasztás · szállásinfó",
    img: "/meghivo/slide-program.webp",
    alt: "A meghívó programja telefonon",
  },
];

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function HeroSlides() {
  const [index, setIndex] = useState(0);
  // Csökkentett mozgás esetén a vetítés alapból áll; a gombbal így is
  // elindítható (a felhasználói döntés felülírja az alapértelmezést).
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? reduced;
  const toggle = useCallback(() => setOverride(!paused), [paused]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [paused, index]);

  const slide = SLIDES[index];

  return (
    <section className="teal-shift-bg relative overflow-hidden">
      {/* lebegő fényfoltok a mélységért */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[#2D5854]/25 blur-3xl"
      />

      <div
        key={slide.key}
        className="mgh-slide-in relative mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:grid-cols-[minmax(0,44%)_minmax(0,1fr)] md:gap-12 lg:px-8"
      >
        {/* Megdöntött telefon a meghívó-minta képével */}
        <div className="mx-auto w-[190px] sm:w-[220px] md:mx-0 md:w-full md:max-w-[260px]">
          <div className="mgh-tilt relative rounded-[2.2rem] bg-gray-900 p-2 shadow-[0_36px_70px_-24px_rgba(20,45,42,0.75)] ring-1 ring-white/20">
            <div className="relative overflow-hidden rounded-[1.7rem] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.img}
                alt={slide.alt}
                width={390}
                height={844}
                className="block h-auto w-full"
              />
              {/* kamera-sziget */}
              <span
                className="absolute left-1/2 top-2 h-3.5 w-16 -translate-x-1/2 rounded-full bg-gray-900"
                aria-hidden
              />
              {/* finom üvegcsillanás */}
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/25"
                aria-hidden
              />
            </div>
          </div>
        </div>

        {/* Marketing szöveg – a főoldali banner tipográfiájával */}
        <div className="text-center md:text-left">
          <h2 className="leading-[1.05]" style={{ fontWeight: 950 }}>
            <span
              className="block text-white"
              style={{ fontSize: "clamp(26px, 5.2vw, 52px)" }}
            >
              {slide.lead}
            </span>
            <span
              className="block text-[#2D5854]"
              style={{ fontSize: "clamp(26px, 5.2vw, 52px)" }}
            >
              {slide.accent}
            </span>
          </h2>

          <div className="mx-auto mt-5 h-px w-full max-w-md bg-white/40 md:mx-0" />

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/95 sm:text-lg md:mx-0">
            {slide.blurb}
          </p>
          <p className="mt-3 text-sm font-semibold text-white/75">{slide.note}</p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
            <a
              href="#basic"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-bold text-[#2D5854] shadow-md transition-colors hover:bg-white/90"
            >
              Megnézem a csomagokat
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/kapcsolat"
              className="inline-flex items-center rounded-full border border-white/70 px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-white/15"
            >
              Ajánlatot kérek
            </Link>
          </div>
        </div>
      </div>

      {/* Vetítésvezérlő */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20">
        <div className="mx-auto flex max-w-6xl justify-center px-5 sm:px-6 lg:px-8">
          <div className="pointer-events-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggle}
              aria-label={paused ? "Vetítés indítása" : "Vetítés megállítása"}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/60 bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
            <div className="flex items-center gap-1">
              {SLIDES.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${i + 1}. dia`}
                  aria-current={i === index ? "true" : undefined}
                  className="px-0.5 py-1.5"
                >
                  <span
                    className="block h-1.5 rounded-full bg-white transition-all duration-300"
                    style={{ width: i === index ? 20 : 6, opacity: i === index ? 1 : 0.45 }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
