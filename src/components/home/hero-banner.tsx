"use client";

import { HeroProvidersButton } from "./hero-providers-button";
import { ProviderRegisterButton } from "./provider-register-button";

/**
 * A főoldal bannere: balra perspektívával megdöntött telefonon egy valódi
 * digitális meghívó képe, jobbra a köszöntő szöveg és a két CTA. A háttér az
 * oldal animált teal gradiense (.teal-shift-bg), lebegő fényfoltokkal.
 */
export function HeroBanner() {
  return (
    <section className="teal-shift-bg relative z-20 -mt-6 overflow-hidden">
      {/* lebegő fényfoltok a mélységért */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[#2D5854]/25 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 pb-14 pt-14 sm:px-6 sm:pb-16 sm:pt-16 md:grid-cols-[minmax(0,42%)_minmax(0,1fr)] md:gap-12 lg:px-8">
        {/* Megdöntött telefon a meghívó-minta képével */}
        <div className="mx-auto w-[180px] sm:w-[210px] md:mx-0 md:w-full md:max-w-[250px]">
          <div className="mgh-tilt relative rounded-[2.2rem] bg-gray-900 p-2 shadow-[0_36px_70px_-24px_rgba(20,45,42,0.75)] ring-1 ring-white/20">
            <div className="relative overflow-hidden rounded-[1.7rem] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/meghivo/slide-basic.webp"
                alt="Digitális esküvői meghívó egy telefon képernyőjén"
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

        {/* Köszöntő szöveg és a két CTA */}
        <div className="text-center md:text-left">
          <h1 className="leading-[1.05]" style={{ fontWeight: 950 }}>
            <span className="block text-white" style={{ fontSize: "clamp(30px, 5.6vw, 60px)" }}>
              ESKÜVŐRE
            </span>
            <span className="block text-[#2D5854]" style={{ fontSize: "clamp(30px, 5.6vw, 60px)" }}>
              KÉSZÜLSZ?
            </span>
          </h1>

          <div className="mx-auto mt-5 h-px w-full max-w-md bg-white/40 md:mx-0" />

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/95 sm:text-lg md:mx-0">
            Böngészd az elérhető szolgáltatókat, vagy ha szolgáltatóként
            látogattál el hozzánk, akkor regisztrálj!
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
            <HeroProvidersButton className="bg-white px-6 text-[15px] font-bold text-[#2D5854] shadow-md hover:bg-white/90 sm:text-base" />
            <ProviderRegisterButton className="border border-white/70 bg-transparent px-6 text-[15px] font-bold text-white hover:bg-white/15 hover:text-white sm:text-base" />
          </div>
        </div>
      </div>
    </section>
  );
}
