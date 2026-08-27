"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { HeroProvidersButton } from "./hero-providers-button";
import { ProviderRegisterButton } from "./provider-register-button";

/**
 * A főoldal bannere két diával: a köszöntő (menyasszonyos fotóval) és a
 * digitális meghívó ajánlója (megdöntött telefonon egy valódi meghívóval).
 *
 * A diaváltást a haladásjelző csík animációjának vége indítja (nem külön
 * időzítő), így a csík mindig pontosan mutatja, mennyi van hátra az adott
 * diából, és a pause gomb egyszerűen megállítja. Mobilon húzással is
 * lapozható; a diák egy rácscellába vannak rétegezve, hogy a banner
 * magassága ne ugráljon.
 */

const SLIDE_COUNT = 2;
const SLIDE_MS = 6000;

/** A mobil diák tartalma – rövid, kétszínű cím, leírás és egy üveghatású
    ajánlat (a /yettel_web mobil bannerének felépítése). */
const MOBILE_SLIDES = [
  {
    key: "koszonto",
    lead: "ESKÜVŐRE",
    accent: "KÉSZÜLSZ?",
    blurb: "Fotós, zenekar, vőfély vagy helyszín – minden szolgáltató egy helyen.",
    badge: "Ingyenes",
    offer: "Több száz szolgáltató",
    offerSub: "Kategóriák és megyék szerint",
    cta: "Megnézem",
    href: "#szolgaltatok",
  },
  {
    key: "meghivo",
    lead: "DIGITÁLIS",
    accent: "MEGHÍVÓK",
    blurb: "A ti nevetekkel, egyetlen linken – a vendégek telefonján bármikor.",
    badge: "Új",
    offer: "Csomagok már 14 900 Ft-tól",
    offerSub: "Élő minták, online visszajelzéssel",
    cta: "Megnézem a mintákat",
    href: "/meghivo",
  },
] as const;

/** Egy készülék a banneren: keret + a meghívó-minta képe. */
function Phone({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={`rounded-[1.5rem] bg-gray-900 p-1.5 shadow-[0_30px_55px_-20px_rgba(20,45,42,0.85)] ring-1 ring-white/20 ${className}`}
    >
      <div className="relative overflow-hidden rounded-[1.15rem] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={390} height={844} className="block h-auto w-full" />
        <span
          className="absolute left-1/2 top-1.5 h-2.5 w-11 -translate-x-1/2 rounded-full bg-gray-900"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/25"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((i: number) => setCurrent((i + SLIDE_COUNT) % SLIDE_COUNT), []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    touchStartX.current = null;
  };

  /** Egy dia burka: ugyanabban a rácscellában, láthatóság szerint úsztatva. */
  const slideCls = (i: number) =>
    `[grid-area:1/1] transition-opacity duration-700 ${
      i === current ? "opacity-100" : "pointer-events-none opacity-0"
    }`;

  return (
    <section
      className="relative z-20 -mt-6 overflow-hidden rounded-b-3xl border-b border-white"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Főoldali banner"
    >
      {/* ── Mobil: a /yettel_web bannerének felépítése – felül kétszínű
             rövid cím és leírás, alul balra üveghatású ajánlatkártya,
             jobbra a kicsinyített kép, ami a banner alsó élénél kifut. ── */}
      <div className="grid sm:hidden" style={{ aspectRatio: "5/6" }}>
        {MOBILE_SLIDES.map((slide, i) => (
          <div
            key={slide.key}
            className={`${slideCls(i)} teal-shift-bg relative overflow-hidden`}
            aria-hidden={current !== i}
            data-slide-active={current === i}
          >
            {/* fehér fátyol, hogy világosabb legyen a gradiens */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 80% at 25% 0%, rgba(255,255,255,0.34), rgba(255,255,255,0) 62%)",
              }}
            />

            {/* Kép: jobbra igazítva, az alsó élnél szándékosan kifut – a
                banner overflow-hidden-je vágja el. */}
            <div className={`absolute bottom-0 right-0 ${slide.key === "meghivo" ? "w-[42%]" : "w-[56%]"}`}>
              {slide.key === "meghivo" ? (
                <div className="hero-duo relative -mb-9 -mr-3">
                  <Phone
                    className="hero-duo-front"
                    src="/meghivo/slide-basic.webp"
                    alt="Digitális esküvői meghívó telefonon"
                  />
                  <span className="hero-float-shadow" aria-hidden />
                </div>
              ) : (
                <div className="-mb-4 -mr-2 overflow-hidden rounded-tl-[1.6rem] shadow-[0_26px_50px_-20px_rgba(20,45,42,0.7)] ring-1 ring-white/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/hero-bride-mobile.webp"
                    alt="Menyasszony csokorral"
                    className="block aspect-[5/8] w-full object-cover object-top"
                  />
                </div>
              )}
            </div>

            <div className="relative flex h-full flex-col px-5 pt-7">
              <h2 className="leading-[1.05]" style={{ fontWeight: 950 }}>
                <span className="text-white" style={{ fontSize: 32 }}>
                  {slide.lead}{" "}
                </span>
                <span className="text-[#2D5854]" style={{ fontSize: 32 }}>
                  {slide.accent}
                </span>
              </h2>
              <p className="mt-2.5 max-w-[17rem] text-[15px] leading-snug text-white/95">
                {slide.blurb}
              </p>

              {/* Üveghatású ajánlat a bal alsó sarokban, a képre lógva */}
              <div className="hero-bubble absolute bottom-16 left-5 z-10 w-[54%] max-w-[192px] rounded-[18px] border border-white/60 bg-white/35 p-3 shadow-[0_18px_40px_-18px_rgba(20,45,42,0.55)] backdrop-blur-md">
                <span className="inline-flex items-center rounded-full bg-[#2D5854] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {slide.badge}
                </span>
                <p className="mt-1.5 text-sm font-extrabold leading-tight text-[#2D5854]">
                  {slide.offer}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-[#2D5854]/80">{slide.offerSub}</p>
                <Link
                  href={slide.href}
                  className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#2D5854] shadow-sm"
                >
                  {slide.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: a két dia egymásra rétegezve ── */}
      <div className="hidden sm:grid">
        {/* 1. dia – köszöntő a menyasszonyos fotóval */}
        <div className={`${slideCls(0)} relative`} aria-hidden={current !== 0}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero.png"
            alt="Esküvői háttérkép"
            className="block h-[400px] w-full object-cover lg:h-auto lg:object-center"
            style={{ objectPosition: "75% center" }}
          />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="ml-[15px] flex w-[42%] flex-col items-center text-center sm:ml-0 sm:w-[40%] lg:ml-[8%] lg:w-fit">
                <h1 className="mb-4 leading-tight lg:whitespace-nowrap" style={{ fontWeight: 950 }}>
                  <span className="block text-[#84AAA6] lg:inline" style={{ fontSize: "clamp(28px, 8vw, 65px)" }}>
                    ESKÜVŐRE{" "}
                  </span>
                  <span className="block lg:inline" style={{ fontSize: "clamp(28px, 8vw, 65px)", color: "#7F7F7F" }}>
                    KÉSZÜLSZ?
                  </span>
                </h1>
                <div className="mb-4 h-px w-full lg:w-[calc(100%+3rem)]" style={{ backgroundColor: "#7F7F7F" }} />
                <p className="mb-6 max-w-xs text-center text-base text-gray-900 sm:mb-8 sm:text-lg lg:max-w-lg">
                  Böngészd az elérhető szolgáltatókat, vagy ha szolgáltatóként
                  látogattál el hozzánk, akkor regisztrálj!
                </p>
                {/* Gombok a 2. dia pill-stílusában, az 1. dia színeivel */}
                <div className="flex flex-col items-center justify-center gap-3 lg:flex-row">
                  <HeroProvidersButton className="rounded-full bg-[#84AAA6] px-6 py-3 text-[15px] font-bold text-white shadow-md hover:bg-[#6B8E8A] hover:text-white sm:text-base" />
                  <ProviderRegisterButton className="rounded-full border border-[#C65EA5] bg-transparent px-6 py-3 text-[15px] font-bold text-[#C65EA5] hover:bg-[#C65EA5]/10 hover:text-[#C65EA5] sm:text-base" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. dia – digitális meghívó */}
        <div className={`${slideCls(1)} teal-shift-bg relative`} aria-hidden={current !== 1}>
          {/* extra fehér fátyol a gradiens fölött, hogy világosabb legyen */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 30% 0%, rgba(255,255,255,0.34), rgba(255,255,255,0) 62%), radial-gradient(90% 70% at 85% 100%, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/25 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[#2D5854]/20 blur-3xl"
          />
          <div className="relative mx-auto grid h-full max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-[minmax(0,42%)_minmax(0,1fr)] lg:px-8">
            {/* Telefonpár: elöl-jobbra a BASIC, mögötte balra-lent a SILVER */}
            <div className="hero-duo relative mx-auto h-[360px] w-full max-w-[330px]">
              <div className="absolute bottom-0 left-0 w-[44%]">
                <div className="relative">
                  <Phone
                    className="hero-duo-back"
                    src="/meghivo/slide-silver.webp"
                    alt="SILVER meghívó-minta telefonon"
                  />
                  <span className="hero-float-shadow" aria-hidden />
                </div>
              </div>
              <div className="absolute right-0 top-0 w-[52%]">
                <div className="relative">
                  <Phone
                    className="hero-duo-front"
                    src="/meghivo/slide-basic.webp"
                    alt="BASIC meghívó-minta telefonon"
                  />
                  <span className="hero-float-shadow" aria-hidden />
                </div>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h2 className="leading-[1.05]" style={{ fontWeight: 950 }}>
                <span className="block text-white" style={{ fontSize: "clamp(26px, 4.6vw, 50px)" }}>
                  DIGITÁLIS MEGHÍVÓ,
                </span>
                <span className="block text-[#2D5854]" style={{ fontSize: "clamp(26px, 4.6vw, 50px)" }}>
                  AMIT NEM DOBNAK KI
                </span>
              </h2>
              <div className="mx-auto mt-4 h-px w-full max-w-md bg-white md:mx-0" />
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/95 md:mx-0">
                A ti nevetekkel, a ti történetetekkel – egyetlen linken, ami a
                vendégek telefonján bármikor ott van.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                <Link
                  href="/meghivo"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-bold text-[#2D5854] shadow-md transition-colors hover:bg-white/90"
                >
                  Megnézem a mintákat
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <HeroProvidersButton className="border border-white/70 bg-transparent px-6 text-[15px] font-bold text-white hover:bg-white/15 hover:text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Vetítésvezérlő: haladásjelző csíkok + pause gomb ── */}
      <div className="absolute inset-x-0 bottom-5 flex justify-start px-5 sm:justify-center sm:px-0">
        <div className="flex items-center gap-3 rounded-full border border-white/60 bg-[#E7ECEC]/85 px-3 py-2 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Vetítés indítása" : "Vetítés megállítása"}
            className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full border border-[#2D5854]/40 text-[#2D5854] transition-colors hover:bg-white/70"
          >
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: SLIDE_COUNT }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}. dia`}
                aria-current={i === current ? "true" : undefined}
                className="cursor-pointer py-1"
              >
                <span className="block h-1.5 w-12 overflow-hidden rounded-full bg-white/80">
                  {i === current && (
                    <span
                      key={current}
                      className="hero-progress-fill block h-full w-full rounded-full bg-[#2D5854]"
                      style={{
                        animationPlayState: paused ? "paused" : "running",
                        ["--hero-slide-ms" as string]: `${SLIDE_MS}ms`,
                      }}
                      onAnimationEnd={() => goTo(current + 1)}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
