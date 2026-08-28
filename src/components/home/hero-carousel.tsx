"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { ProviderRegisterButton } from "./provider-register-button";

/**
 * A főoldal bannere. A felépítés, a méretezés és a megjelenítő elemek
 * (ajánlatkártya, képkeret, vetítésvezérlő, beúszó mozgás) a /yettel_web
 * bannerének mintájára készültek – csak a színek és a tartalom mások.
 *
 * Két dia váltakozik: a szolgáltatói köszöntő (kivágott menyasszony) az
 * ezüstös bannerháttéren, és a digitális meghívó ajánlója (megdöntött
 * telefonok) a mozgó teal világosabb változatán. Mindkettőn átfut egy
 * fénycsík; a szövegek és a gombok színét a dia témája adja.
 */

/** A dia színvilága – a háttérhez igazodó szövegek, gombok, pöttyök. */
type Theme = {
  /** A szekció háttérosztálya. */
  bg: string;
  /** A főcím két fele. */
  lead: string;
  accent: string;
  blurb: string;
  /** Az ajánlatkártya sötét szövegszínei (hex, inline stílushoz). */
  ink: string;
  inkSoft: string;
  inkFaint: string;
  /** A kártyán lévő elsődleges gomb. */
  cta: string;
  ctaHover: string;
  /** A vetítésvezérlő. */
  ctrl: string;
  dotActive: string;
  dotIdle: string;
};

const THEMES: Record<string, Theme> = {
  /* 1. dia: ezüstös háttér, sötét teal szövegekkel */
  silver: {
    bg: "hero-silver",
    lead: "text-[#456965]",
    accent: "text-[#84AAA6]",
    blurb: "text-[#4E736F]",
    ink: "#456965",
    inkSoft: "#5A807B",
    inkFaint: "#7C9C97",
    cta: "#456965",
    ctaHover: "#38564F",
    ctrl: "border-[#456965]/25 bg-white/70 text-[#456965]",
    dotActive: "#456965",
    dotIdle: "rgba(69,105,101,0.28)",
  },
  /* 2. dia: a mozgó teal világosabb változata, fehér + sötét teal szövegekkel */
  teal: {
    bg: "teal-shift-bg-light",
    lead: "text-white",
    accent: "text-[#456965]",
    blurb: "text-white/95",
    ink: "#456965",
    inkSoft: "#5A807B",
    inkFaint: "#7C9C97",
    cta: "#456965",
    ctaHover: "#38564F",
    ctrl: "border-white/70 bg-white/60 text-[#456965]",
    dotActive: "#456965",
    dotIdle: "rgba(255,255,255,0.5)",
  },
};

type Slide = {
  key: string;
  /** Melyik színvilágot használja (lásd THEMES). */
  theme: keyof typeof THEMES;
  /** Kétszínű főcím: két, egymástól elütő árnyalat. */
  lead: string;
  accent: string;
  blurb: string;
  alt: string;
  offer: {
    badge: string;
    /** A kártya fő állítása weben. */
    headline: string;
    /** A csomagok felsorolása, ponttal elválasztva. */
    packages: string;
    /** Mobilon ez az egyetlen sor jelenik meg a kártyán. */
    short: string;
    cta: string;
    href: string;
  };
  /** A dia melletti gombok (az 1. dián a kártya helyett ezek állnak). */
  secondaryCta?: boolean;
};

const SLIDES: Slide[] = [
  {
    key: "szolgaltatok",
    theme: "silver",
    lead: "ESKÜVŐRE",
    accent: "KÉSZÜLSZ?",
    blurb:
      "Böngészd az elérhető szolgáltatókat, vagy ha szolgáltatóként látogattál el hozzánk, akkor regisztrálj!",
    alt: "Menyasszony csokorral",
    offer: {
      badge: "Egy helyen",
      headline: "Több száz szolgáltató",
      packages: "Fotós · zenekar · vőfély · helyszín",
      short: "Több száz szolgáltató egy helyen",
      cta: "Megnézem",
      href: "#szolgaltatok",
    },
    secondaryCta: true,
  },
  {
    key: "meghivo",
    theme: "teal",
    lead: "DIGITÁLIS",
    accent: "MEGHÍVÓK",
    blurb:
      "A ti nevetekkel, a ti történetetekkel – egyetlen linken, ami a vendégek telefonján bármikor ott van.",
    alt: "Digitális esküvői meghívó telefonon",
    offer: {
      badge: "Új",
      headline: "Csomagok elérhetőek már 14\u00a0900\u00a0Ft\u2011tól",
      packages: "BASIC · SILVER · PREMIUM",
      short: "Csomagok már 14\u00a0900\u00a0Ft\u2011tól",
      cta: "Megnézem",
      href: "/meghivo",
    },
  },
];

const INTERVAL_MS = 6000;

/**
 * Egy készülék a banneren. A ház térbeli: a megdöntött telefonnak a
 * vastagsága (oldalkávája) is látszik – az előlap mögé rétegzett, azonos
 * lekerekítésű lapok adják a peremet.
 */
function Phone({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`hero-phone ${className}`}>
      {/* A ház vastagsága: az előlap mögé rétegzett, azonos lekerekítésű
          lapok – így a perem a sarkoknál is végig lekerekített marad. */}
      {[3, 6, 9, 12, 15].map((z) => (
        <span
          key={z}
          aria-hidden
          className="hero-phone-layer"
          style={{ transform: `translateZ(-${z}px)` }}
        />
      ))}

      <div className="hero-phone-face rounded-[1.5rem] bg-gray-900 p-1.5 shadow-[0_30px_55px_-20px_rgba(20,45,42,0.85)] ring-1 ring-white/20">
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

  /* Legyintéssel (swipe) is lapozható: a vízszintes elhúzás iránya dönt,
     40px alatti mozdulat még koppintásnak számít. */
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = start.x - e.changedTouches[0].clientX;
    const dy = start.y - e.changedTouches[0].clientY;
    // Függőleges görgetést ne értelmezzünk lapozásnak.
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    setIndex((i) => (i + (dx > 0 ? 1 : -1) + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [paused, index]);

  const slide = SLIDES[index];
  const { offer } = slide;
  const t = THEMES[slide.theme];
  const silver = slide.theme === "silver";

  return (
    /* A háttér a fejléc mögé bújik (negatív felső margó), a két alsó sarok
       lekerekített, alul 1px fehér elválasztóval. Az 1. dia ezüstös, a 2. a
       mozgó teal világosabb változata – mindkettőn átfut egy fénycsík. */
    <section
      className={`${t.bg} relative z-20 -mt-6 overflow-hidden rounded-b-[32px] border-b border-white pt-6`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Főoldali banner"
    >
      {!silver && (
        <>
          <span aria-hidden className="hero-blob hero-blob-1" />
          <span aria-hidden className="hero-blob hero-blob-2" />
        </>
      )}
      <span aria-hidden className="hero-sheen" />

      {/* A dia teljes tartalma egyben úszik be jobbról – a szöveg, az ajánlat
          és a kép együtt mozog, így semmi nem ugrál külön. A vetítésvezérlő
          kívül marad, az helyben áll. */}
      <div
        key={slide.key}
        /* Mobilon mindkét dián a kép abszolút pozícióban ül (nem az húzza a
           magasságot), ezért a dia magasságát ez az alsó korlát adja – épp
           annyi, hogy a menyasszony feje fölött maradjon egy kis levegő. A
           szöveg mellette, függőlegesen középen fut. */
        className="hero-slide-in relative mx-auto grid min-h-[calc(84vw+150px)] max-w-6xl items-end gap-3 px-4 pt-8 sm:px-6 md:min-h-0 md:grid-cols-2 md:gap-8 md:pt-10"
      >
        <div
          className={`max-w-[54%] self-center pb-0 md:max-w-none md:self-auto ${
            silver ? "md:translate-x-10 md:pb-4" : "pb-48 md:pb-10"
          }`}
        >
          {/* A cím és a leírás a képre kerül, ha átfednek */}
          <div className="relative z-10">
            <h1
              className={`font-heading text-[2.0625rem] leading-tight tracking-tight sm:text-[2.725rem] ${
                silver ? "md:text-[4.6rem]" : ""
              }`}
              style={{ fontWeight: 950 }}
            >
              <span className={t.lead}>{slide.lead}</span>{" "}
              <span className={t.accent}>{slide.accent}</span>
            </h1>
            <p className={`mt-3 max-w-md text-[1.125rem] ${t.blurb}`}>{slide.blurb}</p>

            {/* Az 1. dián nincs ajánlatkártya: a szöveg alatt két gomb áll –
                mobilon egymás alatt (a keskeny hasábnál kicsit szélesebben),
                weben egymás mellett. A színek mindkét méretben azonosak. */}
            {slide.secondaryCta && (
              <div className="mt-5 flex w-[58vw] max-w-[240px] flex-col gap-2.5 md:mt-8 md:w-auto md:max-w-none md:flex-row md:items-start md:gap-3">
                <Link
                  href={offer.href}
                  className="hero-offer-cta inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-4 text-[13px] font-bold text-white transition-colors md:h-11 md:px-8 md:text-base"
                  style={{ ["--cta" as string]: t.cta, ["--cta-hover" as string]: t.ctaHover }}
                >
                  {offer.cta}
                  <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Link>
                <ProviderRegisterButton className="h-10 w-full cursor-pointer rounded-xl border border-[#C65EA5] bg-transparent px-4 text-[13px] font-bold text-[#C65EA5] hover:bg-[#C65EA5]/10 hover:text-[#C65EA5] md:h-11 md:w-auto md:px-8 md:text-base" />
              </div>
            )}
          </div>

          {/* A kiemelt ajánlat – csak a 2. dián. Mobilon kiemeljük a
              szövegfolyamból: a banner bal alsó sarkába kerül, a jobbra
              igazított képre lógva (z-10 miatt a kép fölött). Weben (md-től)
              visszatér a szöveg alá. */}
          {!silver && (
            <div className="absolute bottom-[136px] left-4 z-10 w-[56%] max-w-[208px] rounded-[18px] border border-white/60 bg-white/25 p-3 shadow-[0_18px_50px_rgba(20,45,42,0.18)] backdrop-blur-[3px] sm:left-6 md:static md:mt-6 md:w-full md:max-w-[320px] md:rounded-[20px] md:border-white/70 md:bg-white/60 md:p-4 md:backdrop-blur-xl">
              {/* Mobilon csak egyetlen ajánlatsor fér el, weben a badge, az
                  ajánlat és alatta a csomagok felsorolása */}
              <p
                className="text-[15px] font-extrabold leading-snug md:hidden"
                style={{ color: t.ink }}
              >
                {offer.short}
              </p>

              <span
                className="hidden items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white md:inline-flex md:px-3 md:py-1 md:text-sm"
                style={{ backgroundColor: t.ink }}
              >
                {offer.badge}
              </span>
              <h2
                className="mt-1.5 hidden text-base font-extrabold leading-snug md:mt-2.5 md:block md:text-[1.125rem]"
                style={{ color: t.ink }}
              >
                {offer.headline}
              </h2>
              <p className="mt-1 hidden md:block md:text-sm" style={{ color: t.inkSoft }}>
                {offer.packages}
              </p>
              <Link
                href={offer.href}
                className="hero-offer-cta mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors md:mt-4 md:rounded-xl md:px-5 md:py-3 md:text-base"
                style={{ ["--cta" as string]: t.cta, ["--cta-hover" as string]: t.ctaHover }}
              >
                {offer.cta}
                <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Kép: a háttér már a teljes banneren fut, itt csak a kivágott
            menyasszony, ill. a megdöntött telefonok ülnek. A keret mindkét
            töréspontnál fix arányú, hogy a diák bannermagassága azonos legyen
            (különben az alsó szélre igazított ajánlatkártya elmozdulna); a
            telefonok szándékosan lelógnak az alsó élen. */}
        <div className="w-full self-end">
          <div
            className={
              /* Az 1. dián mobilon a keret a saját hasábjában marad (a
                 menyasszony így nem lóg ki a képernyő jobb szélén), csak
                 magasabb arányú; a 2. dián a telefon kifut jobbra. */
              silver
                ? "absolute inset-y-0 right-[6%] w-[74%] md:static md:-mr-6 md:ml-0 md:aspect-[620/461] md:w-[112%] md:max-w-none md:translate-x-4 lg:-mr-10 lg:translate-x-8"
                : "absolute inset-y-0 -right-[14%] w-[62%] md:static md:-mr-6 md:ml-0 md:aspect-[620/461] md:w-[112%] md:max-w-none md:translate-x-4 lg:-mr-10 lg:translate-x-8"
            }
          >
            {slide.key === "meghivo" ? (
              /* Weben mindhárom csomag mintája látszik, növekvő sorrendben:
                 a legkisebb a BASIC, a legnagyobb és legelöl a PREMIUM.
                 Mobilon csak a BASIC fér el. */
              <div className="hero-duo absolute inset-x-0 bottom-[calc(-14%+50px)] top-0 flex items-end justify-center md:bottom-[-16%]">
                <Phone
                  className="hero-duo-front w-[78%] md:w-[25%]"
                  src="/meghivo/slide-basic.webp"
                  alt={slide.alt}
                />
                <Phone
                  className="hero-duo-front hidden w-[31%] md:-ml-[5%] md:block"
                  src="/meghivo/slide-silver.webp"
                  alt="SILVER digitális esküvői meghívó telefonon"
                />
                <Phone
                  className="hero-duo-front hidden w-[38%] md:-ml-[5%] md:block"
                  src="/meghivo/slide-premium.webp"
                  alt="PREMIUM digitális esküvői meghívó telefonon"
                />
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/hero-bride-cut.webp"
                alt={slide.alt}
                className={`absolute bottom-0 block w-auto max-w-none object-contain object-bottom ${
                  silver
                    ? "right-0 h-[98vw] md:inset-x-0 md:mx-auto md:h-full"
                    : "inset-x-0 mx-auto h-full"
                }`}
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
              className={`grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border backdrop-blur-md ${t.ctrl}`}
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
                      backgroundColor: i === index ? t.dotActive : t.dotIdle,
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
