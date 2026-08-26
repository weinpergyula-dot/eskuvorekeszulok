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
      className="relative z-20 -mt-6 overflow-hidden rounded-b-3xl"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Főoldali banner"
    >
      {/* ── Mobil: a menyasszonyos dia arányában (4/5) ── */}
      <div className="grid sm:hidden" style={{ aspectRatio: "4/5" }}>
        {/* 1. dia – köszöntő fotó (a felirat a képen van) */}
        <div className={slideCls(0)} aria-hidden={current !== 0}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero1_mobile.png" alt="Esküvőre készülsz?" className="h-full w-full object-cover" />
        </div>

        {/* 2. dia – digitális meghívó: jobbra a megdöntött telefon, balról
            beúszó fehér felirat-blokk (az 1. dia buborékjának mintájára) */}
        <div
          className={`${slideCls(1)} teal-shift-bg relative overflow-hidden`}
          aria-hidden={current !== 1}
          data-slide-active={current === 1}
        >
          {/* megdöntött telefon, jobbra tolva */}
          <div className="hero-phone-tilt absolute right-[-4%] top-1/2 w-[48%] -translate-y-1/2">
            <div className="rounded-[1.4rem] bg-gray-900 p-1.5 shadow-[0_26px_50px_-18px_rgba(20,45,42,0.85)] ring-1 ring-white/20">
              <div className="overflow-hidden rounded-[1.05rem] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/meghivo/slide-basic.webp"
                  alt="Digitális esküvői meghívó telefonon"
                  width={390}
                  height={844}
                  className="block h-auto w-full"
                />
              </div>
            </div>
          </div>

          {/* fehér felirat-blokk balról */}
          <div className="hero-bubble absolute left-0 top-[16%] max-w-[70%] rounded-r-[2rem] bg-white/95 py-5 pl-5 pr-7 shadow-[0_18px_40px_-18px_rgba(20,45,42,0.55)] backdrop-blur-sm">
            <p
              className="font-heading text-[#84AAA6]"
              style={{ fontWeight: 950, fontSize: 30, lineHeight: 1.05 }}
            >
              DIGITÁLIS
            </p>
            <p
              className="font-heading"
              style={{ fontWeight: 950, fontSize: 30, lineHeight: 1.05, color: "#7F7F7F" }}
            >
              MEGHÍVÓK
            </p>
            <Link
              href="/meghivo"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#2D5854] underline-offset-4 hover:underline"
            >
              Megnézem a mintákat
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
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
                <div className="flex flex-col items-center justify-center gap-3 lg:flex-row">
                  <HeroProvidersButton />
                  <ProviderRegisterButton className="border border-[#C65EA5] bg-transparent px-5 text-[15px] text-[#C65EA5] hover:bg-[#C65EA5]/10 hover:text-[#C65EA5] sm:text-[18px]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. dia – digitális meghívó */}
        <div className={`${slideCls(1)} teal-shift-bg relative`} aria-hidden={current !== 1}>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[#2D5854]/25 blur-3xl"
          />
          <div className="relative mx-auto grid h-full max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-[minmax(0,36%)_minmax(0,1fr)] lg:px-8">
            <div className="mx-auto w-[170px] md:mx-0 md:w-full md:max-w-[196px]">
              <div className="mgh-tilt relative rounded-[1.9rem] bg-gray-900 p-1.5 shadow-[0_36px_70px_-24px_rgba(20,45,42,0.75)] ring-1 ring-white/20">
                <div className="relative overflow-hidden rounded-[1.5rem] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/meghivo/slide-basic.webp"
                    alt="Digitális esküvői meghívó telefonon"
                    width={390}
                    height={844}
                    className="block h-auto w-full"
                  />
                  <span
                    className="absolute left-1/2 top-1.5 h-3 w-12 -translate-x-1/2 rounded-full bg-gray-900"
                    aria-hidden
                  />
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/25"
                    aria-hidden
                  />
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
      <div className="absolute inset-x-0 bottom-5 flex justify-center">
        <div className="flex items-center gap-3 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Vetítés indítása" : "Vetítés megállítása"}
            className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full border border-white/60 text-white transition-colors hover:bg-white/20"
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
                <span className="block h-1.5 w-12 overflow-hidden rounded-full bg-white/40">
                  {i === current && (
                    <span
                      key={current}
                      className="hero-progress-fill block h-full w-full rounded-full bg-white"
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
