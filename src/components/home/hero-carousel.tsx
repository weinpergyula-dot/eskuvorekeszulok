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
 * telefonok) a megszokott mozgó teal háttéren. Mindkettőn átfut egy
 * fénycsík.
 */

type Slide = {
  key: string;
  /** Ezüstös hátterű dia – ilyenkor a szövegek sötét tealre váltanak. */
  silver?: boolean;
  /** Kétszínű főcím: két, egymástól elütő teal árnyalat. */
  lead: string;
  accent: string;
  blurb: string;
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
    silver: true,
    lead: "ESKÜVŐRE",
    accent: "KÉSZÜLSZ?",
    blurb:
      "Böngészd az elérhető szolgáltatókat, vagy ha szolgáltatóként látogattál el hozzánk, akkor regisztrálj!",
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
    alt: "Digitális esküvői meghívó telefonon",
    offer: {
      badge: "Új",
      name: "Digitális meghívó",
      sub: "Visszaszámláló · program · RSVP",
      price: "14 900 Ft",
      priceUnit: "-tól",
      priceNote: "BASIC csomag",
      cta: "Megnézem",
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
  const silver = slide.silver === true;

  /* Ezüst háttéren sötét tealek, teal háttéren fehér + sötét teal. */
  const leadCls = silver ? "text-[#2D5854]" : "text-white";
  const accentCls = silver ? "text-[#84AAA6]" : "text-[#2D5854]";
  const blurbCls = silver ? "text-[#3F6A66]" : "text-white/95";
  const dotIdle = silver ? "rgba(45,88,84,0.28)" : "rgba(255,255,255,0.5)";

  return (
    /* A háttér a fejléc mögé bújik (negatív felső margó), a két alsó sarok
       lekerekített, alul 1px fehér elválasztóval. Az 1. dia ezüstös, a 2. a
       megszokott mozgó teal – mindkettőn átfut egy fénycsík. */
    <section
      className={`${silver ? "hero-silver" : "teal-shift-bg"} relative z-20 -mt-6 overflow-hidden rounded-b-[32px] border-b border-white pt-6`}
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
        className="hero-slide-in relative mx-auto grid max-w-6xl items-end gap-3 px-4 pt-8 sm:px-6 md:grid-cols-2 md:gap-8 md:pt-10"
      >
        <div className="pb-0 md:pb-10">
          <h1
            className="font-heading text-[2.0625rem] leading-tight tracking-tight sm:text-[2.725rem]"
            style={{ fontWeight: 950 }}
          >
            <span className={leadCls}>{slide.lead}</span>{" "}
            <span className={accentCls}>{slide.accent}</span>
          </h1>
          <p className={`mt-3 max-w-md text-[1.125rem] ${blurbCls}`}>{slide.blurb}</p>

          {/* A kiemelt ajánlat. Mobilon kiemeljük a szövegfolyamból: a banner
              bal alsó sarkába kerül, a jobbra igazított képre lógva (z-10
              miatt a kép fölött). Weben (md-től) visszatér a szöveg alá. */}
          <div className="absolute bottom-24 left-4 z-10 w-[52%] max-w-[188px] rounded-[18px] border border-white/60 bg-white/25 p-3 shadow-[0_18px_50px_rgba(20,45,42,0.18)] backdrop-blur-[3px] sm:left-6 md:static md:mt-6 md:w-full md:max-w-[320px] md:rounded-[20px] md:border-white/70 md:bg-white/60 md:p-4 md:backdrop-blur-xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#2D5854] px-2.5 py-0.5 text-xs font-bold text-white md:px-3 md:py-1 md:text-sm">
              {offer.badge}
            </span>
            <h2 className="mt-1.5 text-base font-extrabold text-[#2D5854] md:mt-2 md:text-[1.125rem]">
              {offer.name}
            </h2>
            <p className="text-xs text-[#3F6A66] md:text-sm">{offer.sub}</p>
            <div className="mt-1.5 flex items-baseline gap-1.5 whitespace-nowrap md:mt-2">
              <span className="shrink-0 text-[1.375rem] font-extrabold tracking-tight text-[#2D5854] md:text-[1.625rem]">
                {offer.price}
              </span>
              {offer.priceUnit && (
                <span className="shrink-0 text-xs text-[#3F6A66] md:text-sm">
                  {offer.priceUnit}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6D8E8A] md:text-sm">{offer.priceNote}</p>
            <Link
              href={offer.href}
              className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#2D5854] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#24463F] md:mt-4 md:rounded-xl md:px-5 md:py-3 md:text-base"
            >
              {offer.cta}
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Link>
            {/* Szolgáltatói regisztráció – csak weben, a kártya alján */}
            {slide.key === "szolgaltatok" && (
              <div className="mt-2 hidden md:block">
                <ProviderRegisterButton className="w-full cursor-pointer rounded-xl border border-[#2D5854]/40 bg-transparent px-5 py-3 text-base font-bold text-[#2D5854] hover:bg-[#2D5854]/10 hover:text-[#2D5854]" />
              </div>
            )}
          </div>
        </div>

        {/* Kép: a háttér már a teljes banneren fut, itt csak a kivágott
            menyasszony, ill. a megdöntött telefonok ülnek. A keret mindkét
            töréspontnál fix arányú, hogy a diák bannermagassága azonos legyen
            (különben az alsó szélre igazított ajánlatkártya elmozdulna); a
            telefonok szándékosan lelógnak az alsó élen. */}
        <div className="w-full self-end">
          <div className="relative -mr-8 ml-auto aspect-[461/570] w-[74%] md:-mr-6 md:ml-0 md:aspect-[620/520] md:w-[112%] md:max-w-none md:translate-x-4 lg:-mr-10 lg:translate-x-8">
            {slide.key === "meghivo" ? (
              <div className="hero-duo absolute inset-x-0 bottom-[-16%] top-0 flex items-end justify-center">
                <Phone
                  className="hero-duo-back hidden w-[34%] md:block"
                  src="/meghivo/slide-silver.webp"
                  alt="SILVER digitális esküvői meghívó telefonon"
                />
                <Phone
                  className="hero-duo-front w-[60%] md:-ml-[12%] md:w-[36%]"
                  src="/meghivo/slide-basic.webp"
                  alt={slide.alt}
                />
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/hero-bride-cut.webp"
                alt={slide.alt}
                className="absolute inset-x-0 bottom-0 mx-auto block h-full w-auto max-w-none object-contain object-bottom md:h-[108%]"
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
              className={`grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border text-[#2D5854] backdrop-blur-md ${silver ? "border-[#2D5854]/25 bg-white/70" : "border-white/70 bg-white/60"}`}
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
                      backgroundColor: i === index ? "#2D5854" : dotIdle,
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
