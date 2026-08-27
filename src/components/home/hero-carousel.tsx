"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { ProviderRegisterButton } from "./provider-register-button";

/**
 * A főoldal bannere. A felépítés, a méretezés és a megjelenítő elemek
 * (ajánlatkártya, képkeret, vetítésvezérlő, beúszó mozgás) a /yettel_web
 * bannerének mintájára készültek – csak a színek és a tartalom mások.
 *
 * Két dia váltakozik: a szolgáltatói köszöntő (kivágott menyasszony) és a
 * digitális meghívó ajánlója (megdöntött telefon a BASIC mintával). Mindkét
 * kép mögött ugyanaz az ezüstös, fénycsíkos háttérlap fut.
 */

type Slide = {
  key: string;
  /** Kétszínű főcím: az első fele fehér, a második a sötét teal. */
  lead: string;
  accent: string;
  blurb: string;
  note: string;
  alt: string;
  offer: {
    badge: string;
    name: string;
    sub: string;
    price: string;
    priceUnit: string;
    priceNote: string;
    cta: string;
    href: string;
  };
};

const SLIDES: Slide[] = [
  {
    key: "szolgaltatok",
    lead: "ESKÜVŐRE",
    accent: "KÉSZÜLSZ?",
    blurb:
      "Böngészd az elérhető szolgáltatókat, vagy ha szolgáltatóként látogattál el hozzánk, akkor regisztrálj!",
    note: "Ingyenes böngészés · Kategóriák és megyék szerint",
    alt: "Menyasszony csokorral",
    offer: {
      badge: "Egy helyen",
      name: "Több száz szolgáltató",
      sub: "Fotós · zenekar · vőfély · helyszín",
      price: "Ingyenes",
      priceUnit: "",
      priceNote: "böngészés és kapcsolatfelvétel",
      cta: "Megnézem",
      href: "#szolgaltatok",
    },
  },
  {
    key: "meghivo",
    lead: "DIGITÁLIS",
    accent: "MEGHÍVÓK",
    blurb:
      "A ti nevetekkel, a ti történetetekkel – egyetlen linken, ami a vendégek telefonján bármikor ott van.",
    note: "Élő minták · Online visszajelzés a vendégektől",
    alt: "Digitális esküvői meghívó telefonon",
    offer: {
      badge: "Új",
      name: "Digitális meghívó",
      sub: "Visszaszámláló · program · RSVP",
      price: "14 900 Ft",
      priceUnit: "-tól",
      priceNote: "BASIC csomag",
      cta: "Megnézem a mintákat",
      href: "/meghivo",
    },
  },
];

const INTERVAL_MS = 6000;

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

/** Figyeli, hogy a látogató kevesebb mozgást kért-e (media query). */
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  // Kevesebb mozgás esetén a vetítés alapból áll, de a play gombbal
  // elindítható (az override felülírja a rendszerbeállítást).
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? reduced;
  const setPaused = (v: boolean) => setOverride(v);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [paused, index]);

  const slide = SLIDES[index];
  const { offer } = slide;

  return (
    /* A mozgó teal gradiens a fejléc mögé bújik (negatív felső margó), a két
       alsó sarok lekerekített, alul 1px fehér elválasztóval. */
    <section
      className="teal-shift-bg relative z-20 -mt-6 overflow-hidden rounded-b-[32px] border-b border-white pt-6"
      aria-roledescription="carousel"
      aria-label="Főoldali banner"
    >
      <span aria-hidden className="hero-blob hero-blob-1" />
      <span aria-hidden className="hero-blob hero-blob-2" />

      {/* A dia teljes tartalma egyben úszik be jobbról – a szöveg, az ajánlat
          és a kép együtt mozog, így semmi nem ugrál külön. A vetítésvezérlő
          kívül marad, az helyben áll. */}
      <div
        key={slide.key}
        className="hero-slide-in relative mx-auto grid max-w-6xl items-end gap-3 px-4 pt-8 sm:px-6 md:grid-cols-2 md:gap-8 md:pt-10"
      >
        <div className="pb-0 md:pb-10">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.6rem]">
            <span className="text-white">{slide.lead}</span>{" "}
            <span className="text-[#2D5854]">{slide.accent}</span>
          </h1>
          <p className="mt-3 max-w-md text-base text-white/95">{slide.blurb}</p>

          {/* A kiemelt ajánlat. Mobilon kiemeljük a szövegfolyamból: a banner
              bal alsó sarkába kerül, a jobbra igazított képre lógva (z-10
              miatt a kép fölött). Weben (md-től) visszatér a szöveg alá. */}
          <div className="absolute bottom-12 left-4 z-10 w-[52%] max-w-[188px] rounded-[18px] border border-white/60 bg-white/25 p-3 shadow-[0_18px_50px_rgba(20,45,42,0.18)] backdrop-blur-[3px] sm:left-6 md:static md:mt-6 md:w-full md:max-w-[320px] md:rounded-[20px] md:border-white/70 md:bg-white/60 md:p-4 md:backdrop-blur-xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2D5854] px-2.5 py-0.5 text-[0.625rem] font-bold text-white md:px-3 md:py-1 md:text-xs">
              {offer.badge}
            </span>
            <h2 className="mt-1.5 text-sm font-extrabold text-[#2D5854] md:mt-2 md:text-base">
              {offer.name}
            </h2>
            <p className="text-[0.625rem] text-[#3F6A66] md:text-xs">{offer.sub}</p>
            <div className="mt-1.5 flex items-baseline gap-1.5 whitespace-nowrap md:mt-2">
              <span className="shrink-0 text-xl font-extrabold tracking-tight text-[#2D5854] md:text-2xl">
                {offer.price}
              </span>
              {offer.priceUnit && (
                <span className="shrink-0 text-[0.625rem] text-[#3F6A66] md:text-xs">
                  {offer.priceUnit}
                </span>
              )}
            </div>
            <p className="text-[0.625rem] text-[#6D8E8A] md:text-xs">{offer.priceNote}</p>
            <Link
              href={offer.href}
              className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2D5854] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#24463F] md:mt-4 md:rounded-xl md:px-5 md:py-3 md:text-sm"
            >
              {offer.cta}
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Link>
            {/* Szolgáltatói regisztráció – csak weben, a kártya alján */}
            {slide.key === "szolgaltatok" && (
              <div className="mt-2 hidden md:block">
                <ProviderRegisterButton className="w-full cursor-pointer rounded-xl border border-[#2D5854]/40 bg-transparent px-5 py-3 text-sm font-bold text-[#2D5854] hover:bg-[#2D5854]/10 hover:text-[#2D5854]" />
              </div>
            )}
          </div>
          <p className="mt-3 mb-2 text-xs font-semibold text-white/75 sm:mt-4 md:mb-0">
            {slide.note}
          </p>
        </div>

        {/* Kép: ezüstös, fénycsíkos háttérlapon a kivágott menyasszony, ill. a
            megdöntött telefon. A keret mindkét töréspontnál fix arányú, hogy a
            diák bannermagassága azonos legyen (különben az alsó szélre
            igazított ajánlatkártya elmozdulna). */}
        <div className="w-full self-end">
          <div className="relative -mr-4 ml-auto aspect-[461/570] w-[62%] md:-mr-6 md:ml-0 md:aspect-[620/461] md:w-[112%] md:max-w-none md:translate-x-4 lg:-mr-10 lg:translate-x-8">
            <div
              aria-hidden
              className="hero-silver absolute bottom-0 left-0 right-[-100%] top-6 overflow-hidden rounded-tl-[2rem] border-l border-t border-white/60 md:top-4 md:rounded-tl-[2.5rem]"
            />
            {slide.key === "meghivo" ? (
              /* Mobilon egy készülék, weben a BASIC + SILVER páros – a méret
                 úgy van megszabva, hogy a megdöntött készülék a keret
                 magasságába beleférjen. */
              <div className="hero-duo absolute inset-0 flex items-end justify-center pb-[7%] md:pb-[9%]">
                <Phone
                  className="hero-duo-back hidden w-[24%] md:block"
                  src="/meghivo/slide-silver.webp"
                  alt="SILVER digitális esküvői meghívó telefonon"
                />
                <Phone
                  className="hero-duo-front w-[45%] md:-ml-[9%] md:w-[26%]"
                  src="/meghivo/slide-basic.webp"
                  alt={slide.alt}
                />
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/hero-bride-cut.webp"
                alt={slide.alt}
                className="absolute inset-x-0 bottom-0 mx-auto block h-full w-auto max-w-none object-contain object-bottom"
              />
            )}
          </div>
        </div>
      </div>

      {/* Vetítésvezérlő: pause/play és a pöttyök, amik mutatják, melyik dián
          állunk. A banner alján: mobilon a tartalom bal széléhez igazítva,
          md-től középre zárva. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20">
        <div className="mx-auto flex max-w-6xl px-4 sm:px-6 md:justify-center">
          <div className="pointer-events-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPaused(!paused)}
              aria-label={paused ? "Vetítés indítása" : "Vetítés megállítása"}
              className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border border-white/70 bg-white/60 text-[#2D5854] backdrop-blur-md"
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
                  className="cursor-pointer px-0.5 py-1.5"
                >
                  <span
                    className="block h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === index ? 18 : 6,
                      backgroundColor: i === index ? "#2D5854" : "rgba(255,255,255,0.5)",
                    }}
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
