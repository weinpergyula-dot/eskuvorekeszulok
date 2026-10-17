"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { preload } from "react-dom";
import { ArrowDown, ArrowRight, Pause, Play } from "lucide-react";
import { useIsLoggedIn } from "@/components/providers/masked-contact";

/**
 * A főoldal bannere. A felépítés, a méretezés és a megjelenítő elemek
 * (ajánlatkártya, képkeret, vetítésvezérlő, beúszó mozgás) a /yettel_web
 * bannerének mintájára készültek – csak a színek és a tartalom mások.
 *
 * Két dia váltakozik: a szolgáltatói köszöntő (kivágott menyasszony) és a
 * digitális meghívó ajánlója (legyezőbe rendezett telefonok), mindkettő az
 * ezüstös bannerháttéren. Mindkettőn átfut egy fénycsík; a szövegek és a
 * gombok színét a dia témája adja.
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
    cta: "#84AAA6",
    ctaHover: "#6B8E8A",
    ctrl: "border-[#456965]/25 bg-white/70 text-[#456965]",
    dotActive: "#456965",
    dotIdle: "rgba(69,105,101,0.28)",
  },
  /* 2. dia: ugyanaz az ezüstös háttér, a digitális meghívó promókártyájának
     rózsaszín színeivel (.hero-meghivo: a fényfolt színe, globals.css) */
  pink: {
    bg: "hero-silver hero-meghivo",
    lead: "text-[#B5677D]",
    accent: "text-gray-400",
    blurb: "text-gray-700",
    ink: "#945365",
    inkSoft: "#6B7280",
    inkFaint: "#9CA3AF",
    cta: "#B5677D",
    ctaHover: "#9A5267",
    ctrl: "border-[#B5677D]/30 bg-white/70 text-[#945365]",
    dotActive: "#945365",
    dotIdle: "rgba(181,103,125,0.3)",
  },
  /* 3. dia (fotósok): ugyanaz a vándorló háttér meleg pezsgő árnyalatban
     (.hero-foto, globals.css), arany kiemelésekkel */
  gold: {
    bg: "hero-silver hero-foto",
    lead: "text-[#A9824B]",
    accent: "text-gray-400",
    blurb: "text-gray-700",
    ink: "#8A6A3B",
    inkSoft: "#6B7280",
    inkFaint: "#9CA3AF",
    cta: "#B8925A",
    ctaHover: "#9E7A45",
    ctrl: "border-[#B8925A]/30 bg-white/70 text-[#8A6A3B]",
    dotActive: "#8A6A3B",
    dotIdle: "rgba(184,146,90,0.32)",
  },
  /* 4. dia (cukrászok): a vándorló háttér halvány zsálya–rózsaszín
     árnyalatban (.hero-torta, globals.css), a torta zsályazöldjével */
  sage: {
    bg: "hero-silver hero-torta",
    lead: "text-[#7E9A82]",
    accent: "text-gray-400",
    blurb: "text-gray-700",
    ink: "#5E7762",
    inkSoft: "#6B7280",
    inkFaint: "#9CA3AF",
    cta: "#7A957C",
    ctaHover: "#66806A",
    ctrl: "border-[#7A957C]/30 bg-white/70 text-[#5E7762]",
    dotActive: "#5E7762",
    dotIdle: "rgba(122,149,124,0.32)",
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
    /** Ha meg van adva, a gomb erre a kategóriára szűri a főoldali listát. */
    category?: string;
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
      href: "#kategoriak",
    },
    secondaryCta: true,
  },
  {
    key: "meghivo",
    theme: "pink",
    lead: "DIGITÁLIS",
    accent: "MEGHÍVÓK",
    blurb:
      "Ti nevetekkel és történetetekkel – egyetlen linken, ami a vendégek telefonján bármikor ott van.",
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
  {
    key: "fotos",
    theme: "gold",
    lead: "PILLANATOK",
    accent: "ÖRÖKRE",
    blurb:
      "Az első pillantástól a hajnali táncig – találd meg a fotóst, aki a ti stílusotokban meséli el a nagy napot.",
    alt: "Esküvői fotók: koszorúslányok, menyasszonyi frizura, menyasszony",
    offer: {
      badge: "Fotósok, videósok",
      headline: "Esküvői fotósok és videósok egy helyen",
      packages: "Kreatív fotó · jegyesfotózás · esküvői film",
      short: "Fotósok és videósok egy helyen",
      cta: "Megnézem",
      href: "#szolgaltatok",
      category: "fotosok-videosok",
    },
  },
  {
    key: "torta",
    theme: "sage",
    lead: "ÉDES",
    accent: "KEZDET",
    blurb:
      "A torta a nagy nap egyik legszebb pillanata – találd meg a cukrászt, aki megálmodja és elkészíti.",
    alt: "Emeletes esküvői torta rózsákkal",
    offer: {
      badge: "Torták, sütemények",
      headline: "Esküvői torták és sütemények egy helyen",
      packages: "Emeletes torta · sütibár · macaron",
      short: "Cukrászok egy helyen",
      cta: "Megnézem",
      href: "#szolgaltatok",
      category: "torta-sutemeny",
    },
  },
];

/** A 4. dia tortafotója (előtöltéshez is). */
const HERO_CAKE_IMAGE = "/meghivo-silver/g3.webp";

/** A 3. dia előhívott fotói (előtöltéshez is). */
const HERO_PHOTO_IMAGES = [
  "/meghivo-silver/g2.webp",
  "/meghivo-silver/g6.webp",
  "/meghivo-silver/g5.webp",
];

/** Egy előhívott, polaroidszerű fotó a 3. dián (alul szélesebb fehér sávval). */
function PhotoPrint({ src, alt, className = "", pinned = false }: { src: string; alt: string; className?: string; pinned?: boolean }) {
  return (
    <div className={`relative shrink-0 bg-white p-[4%] pb-[16%] shadow-[0_24px_40px_-18px_rgba(60,40,20,0.55)] ring-1 ring-black/5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} decoding="sync" className="block aspect-[4/5] w-full object-cover" />
      {/* Rajzszög a fotó tetején, középen: fényes arany fej árnyékkal */}
      {pinned && (
        <span
          aria-hidden
          className="absolute -top-2 left-1/2 z-10 h-4 w-4 -translate-x-1/2 rounded-full shadow-[1px_3px_4px_rgba(60,40,20,0.45)]"
          style={{ background: "radial-gradient(circle at 35% 30%, #FFF4DC 0%, #D9B26F 35%, #A9824B 70%, #7A5A2E 100%)" }}
        />
      )}
    </div>
  );
}

const INTERVAL_MS = 6000;

/** A 2. dia telefonjaiban megjelenő minták (előtöltéshez is). */
const HERO_PHONE_IMAGES = [
  "/meghivo/slide-basic.webp",
  "/meghivo/slide-silver.webp",
  "/meghivo/slide-premium.webp",
];

/* A banner összes gombja (mindkét dián) ugyanakkora: azonos magasság,
   szélesség és betűméret. Mobilon a magasság és a betűméret a csoportos
   ajánlatkérés gombjáéval egyezik. */
const CTA_SIZE =
  "inline-flex h-12 w-[170px] items-center justify-center gap-1.5 rounded-xl text-[15px] font-bold transition-colors md:h-11 md:w-[200px] md:text-base";

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
          <img src={src} alt={alt} width={390} height={844} decoding="sync" className="block h-auto w-full" />
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
  /* A banner képei ne várjanak: a menyasszony (az 1. dia, rögtön látszik)
     magas prioritással, a 2. dia telefonjainak képei pedig már most
     töltődjenek, ne csak a diaváltáskor. A preload a szerveren renderelt
     HTML fejlécébe kerül. */
  preload("/hero-bride-cut.webp", { as: "image", fetchPriority: "high", media: "(min-width: 768px)" });
  for (const src of [...HERO_PHONE_IMAGES, ...HERO_PHOTO_IMAGES, HERO_CAKE_IMAGE]) preload(src, { as: "image", fetchPriority: "low", media: "(min-width: 768px)" });

  const [index, setIndex] = useState(0);
  // Kevesebb mozgás esetén a vetítés alapból áll, de a play gombbal
  // elindítható (az override felülírja a rendszerbeállítást).
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false
  );
  const [override, setOverride] = useState<boolean | null>(null);
  // A Regisztráció gomb csak kijelentkezett látogatónak jelenik meg.
  const loggedIn = useIsLoggedIn();
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

  /* Mobilon a banner a teljes telefonképernyőt kitölti, ezért tudnia kell,
     mekkora sáv van fölötte (figyelmeztető csík + fejléc). A szekció saját
     dokumentumbeli pozíciója pont ezt adja meg – a méret változását (a
     csík megjelenése, eltüntetése, elforgatás) figyeljük. */
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    /* Csak a lap tetején mérünk: lejjebb görgetve a fejléc összehúzódik,
       az abból számolt magasság pedig görgetés közben ugráltatná a bannert. */
    const publish = () => {
      if (window.scrollY > 0) return;
      el.style.setProperty("--hero-top", `${Math.max(el.getBoundingClientRect().top, 0)}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(document.body);
    window.addEventListener("resize", publish);
    window.addEventListener("scroll", publish, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publish);
      window.removeEventListener("scroll", publish);
    };
  }, []);

  /* A horgonyra mutató gomb (1. dia: „Megnézem" → #kategoriak) ne ugorjon,
     hanem gördüljön oda. A célelem scroll-mt-20-at visel, így a ragadós
     fejléc nem takarja el a szekció címét. A /meghivo-ra mutató gombnál a
     függvény nem csinál semmit, marad a szokásos navigáció. */
  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string, category?: string) => {
    if (!href.startsWith("#")) return;
    /* A 3. dia gombja előbb a fotós kategóriára szűri a listát (ugyanúgy,
       mint a gyorskategória-csempék). */
    if (category) window.dispatchEvent(new CustomEvent("eskuvo:set-category", { detail: category }));
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const slide = SLIDES[index];
  const t = THEMES[slide.theme];
  const silver = slide.theme === "silver";

  /* Egy dia tartalma. Mind a négy dia folyamatosan az oldalon van,
     ugyanabban a rácscellában (így a banner a legmagasabb dia magasságát
     veszi fel, és diaváltáskor nem ugrik meg alatta az oldal); csak az
     aktív látszik. A diák – és a képeik – váltáskor NEM jönnek létre újra:
     az iOS Safari az eldobott képelemeket újra dekódolja, és addig a kép
     helye üres, a szöveg után villan be. A beúszó animáció attól indul újra,
     hogy az aktív dia megkapja a .hero-slide-in osztályt. */
  const renderSlide = (s: Slide, sizer: boolean) => {
    const offer = s.offer;
    const t = THEMES[s.theme];
    const silver = s.theme === "silver";
    return (
          <div
            key={s.key}
            aria-hidden={sizer || undefined}
            inert={sizer || undefined}
            /* Mobilon mindkét dián a kép abszolút pozícióban ül (nem az húzza a
               magasságot), ezért a dia magasságát alsó korlát adja. Álló
               telefonon ez a képernyő magassága a banner fölötti sáv nélkül
               (.hero-slide-fullscreen), így betöltéskor csak a banner látszik;
               fekvőben marad a szélességhez kötött érték. A szöveg mellette,
               függőlegesen középen fut. */
            className={`${sizer ? "pointer-events-none opacity-0" : "hero-slide-in z-[1]"} grid hero-slide-fullscreen relative mx-auto [grid-area:1/1] w-full min-h-[calc(84vw+150px)] max-w-6xl items-end gap-3 px-4 pt-8 sm:px-6 md:min-h-0 md:grid-cols-2 md:gap-8 md:pt-10`}
          >
            <div
              className={`max-w-[54%] self-center md:max-w-none ${
                silver ? "md:-translate-y-8 md:translate-x-10" : "md:self-auto md:pb-10"
              }`}
            >
              {/* A cím és a leírás a képre kerül, ha átfednek */}
              <div className="relative z-10">
                <h1
                  className={`hero-title font-heading leading-tight tracking-tight sm:text-[2.725rem] md:text-[4.6rem] ${
                    silver ? "text-[2.3125rem]" : "hero-title-boost text-[2.0625rem]"
                  }`}
                  style={{
                    fontWeight: 950,
                    // Mobilon ebből az alapméretből számol a .hero-title szabály
                    ["--hero-title-base" as string]: silver ? "2.3125rem" : "2.0625rem",
                  }}
                >
                  {/* Desktopon a két szó mindig külön sorban áll (a rövidebb
                      címeknél is), így minden dia ugyanúgy tagolódik. */}
                  <span className={`${t.lead} md:block`}>{s.lead}</span>{" "}
                  <span className={`${t.accent} md:block`}>{s.accent}</span>
                </h1>
                <p className={`mt-3 max-w-md text-base sm:text-[1.125rem] ${t.blurb}`}>{s.blurb}</p>

                {/* Az 1. dián nincs ajánlatkártya: a szöveg alatt két gomb áll –
                    mobilon egymás alatt (a keskeny hasábnál kicsit szélesebben),
                    weben egymás mellett. A színek mindkét méretben azonosak. */}
                {s.secondaryCta && (
                  <div className="mt-5 flex w-fit flex-col gap-2.5 md:mt-8 md:w-auto md:flex-row md:items-start md:gap-3">
                    {loggedIn === false && (
                      <Link
                        href="/auth/register"
                        className={`${CTA_SIZE} border border-white/70 bg-white/60 text-[#B5677D] shadow-[0_18px_50px_rgba(20,45,42,0.18)] backdrop-blur-xl hover:bg-white/80`}
                      >
                        Regisztráció
                      </Link>
                    )}
                    <Link
                      href={offer.href}
                      onClick={(e) => scrollToAnchor(e, offer.href)}
                      className={`hero-offer-cta ${CTA_SIZE} text-white`}
                      style={{ ["--cta" as string]: t.cta, ["--cta-hover" as string]: t.ctaHover }}
                    >
                      {offer.cta}
                      {/* Az 1. dián a gomb lefelé, a kategóriákhoz gördít */}
                      <ArrowDown className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* A kiemelt ajánlat – csak a 2. dián. Mindig közvetlenül az alcím
                  alatt áll; mobilon szélesebb a szövegoszlopnál, így ha odaér,
                  rálóg a jobbra igazított képre (z-10 miatt a kép előtt). */}
              {!silver && (
                <div
                  className={`hero-offer-card relative z-10 mt-[1.375rem] w-[13.5rem] rounded-[18px] border border-white/70 bg-white/60 p-3 shadow-[0_18px_50px_rgba(20,45,42,0.18)] backdrop-blur-xl md:static md:mt-6 md:w-full md:max-w-[320px] md:rounded-[20px] md:p-4 ${
                    /* A 4. dián mobilon kicsit lejjebb és jobbra áll, a nagy
                       tortakép bal alsó sarkára */
                    s.key === "torta" ? "max-md:translate-x-4 max-md:translate-y-8" : ""
                  }`}
                >
                  {/* Mobilon csak egyetlen ajánlatsor fér el, weben a badge, az
                      ajánlat és alatta a csomagok felsorolása */}
                  <p className="text-[15px] font-extrabold leading-snug md:hidden" style={{ color: t.ink }}>
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
                    onClick={(e) => scrollToAnchor(e, offer.href, offer.category)}
                    className={`hero-offer-cta mt-2.5 md:mt-4 ${CTA_SIZE} text-white`}
                    style={{ ["--cta" as string]: t.cta, ["--cta-hover" as string]: t.ctaHover }}
                  >
                    {offer.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Kép: a háttér már a teljes banneren fut, itt csak a kivágott
                menyasszony, ill. a megdöntött telefonok ülnek. A keret mindkét
                töréspontnál fix arányú, hogy a diák bannermagassága azonos legyen
                (különben az alsó szélre igazított ajánlatkártya elmozdulna); a
                telefonok szándékosan lelógnak az alsó élen. */}
            <div className={`w-full self-end ${silver ? "" : "md:self-center md:pb-10"}`}>
              <div
                className={
                  /* Az 1. dián mobilon a keret a saját hasábjában marad (a
                     menyasszony így nem lóg ki a képernyő jobb szélén), csak
                     magasabb arányú; a 2. dián a telefon kifut jobbra. */
                  silver
                    ? "hero-art absolute inset-y-0 right-[6%] w-[74%] md:static md:-mr-6 md:ml-0 md:aspect-[620/461] md:w-[112%] md:max-w-none md:translate-x-4 lg:-mr-10 lg:translate-x-8"
                    : "hero-art absolute inset-y-0 -right-[14%] w-[62%] md:relative md:inset-auto md:aspect-[620/461] md:w-full md:max-w-none xl:w-[106%] xl:translate-x-4"
                }
              >
                {s.key === "meghivo" ? (
                  /* Mindhárom csomag mintája úgy látszik, mint a digitális
                     meghívó promókártyáján: legyezőben, középen legelöl a
                     PREMIUM, két oldalt megdöntve a BASIC és a SILVER.
                     Mobilon csak egy fér el: a PREMIUM, térben megdöntve. */
                  <>
                    <div className="hero-duo absolute inset-x-0 bottom-[calc(-14%+50px)] top-0 flex items-end justify-center md:hidden">
                      <Phone
                        className="hero-duo-front w-[78%]"
                        src="/meghivo/slide-premium.webp"
                        alt={s.alt}
                      />
                    </div>
                    {/* Desktopon a három telefon függőlegesen középen áll,
                        egymástól kicsit távolabb, alattuk a csomag nevével
                        (a promókártya címkéinek stílusában). */}
                    <div className="absolute inset-0 hidden items-center justify-center md:flex">
                      {(
                        [
                          { src: "/meghivo/slide-basic.webp", label: "Basic", color: "#6E9995", alt: "BASIC digitális esküvői meghívó telefonon", cls: "z-0 -mr-[2%] mt-[6%] w-[29%] -rotate-[9deg]" },
                          { src: "/meghivo/slide-premium.webp", label: "Premium", color: "#994E64", alt: s.alt, cls: "z-10 w-[33%]" },
                          { src: "/meghivo/slide-silver.webp", label: "Silver", color: "#77828F", alt: "SILVER digitális esküvői meghívó telefonon", cls: "z-0 -ml-[2%] mt-[6%] w-[29%] rotate-[9deg]" },
                        ] as const
                      ).map((ph) => (
                        <div key={ph.label} className={`relative flex min-w-0 shrink-0 flex-col items-center ${ph.cls}`}>
                          <Phone className="w-full" src={ph.src} alt={ph.alt} />
                          {/* A címke a csomag saját színét viseli (mint a /meghivo oldalon) */}
                          <span
                            className="mt-3 rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm ring-1 backdrop-blur-sm"
                            style={{ color: ph.color, ["--tw-ring-color" as string]: `${ph.color}55` }}
                          >
                            {ph.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : s.key === "fotos" ? (
                  /* Három előhívott fotó: desktopon legyezőben, mintha épp
                     kiterítették volna őket (középen, legelöl a menyasszony);
                     mobilon egymás alatt, rajzszöggel kitűzve. */
                  <>
                    {/* Mobilon a fotók egymás alatt, enyhén elcsúsztatva és
                        megdöntve, mindegyik egy rajzszöggel kitűzve. Az egész
                        csoport kicsit balra-lejjebb tolva (a .hero-art 1,2–1,3×
                        nagyítása miatt a 25px kb. 30–32px a képernyőn). */}
                    <div className="absolute bottom-[2%] left-[4%] right-[24%] top-[10%] flex -translate-x-[25px] translate-y-[25px] flex-col items-center justify-center md:hidden">
                      <PhotoPrint pinned className="z-0 -mb-[6%] w-[42%] -translate-x-[18%] -rotate-[6deg]" src="/meghivo-silver/g6.webp" alt="Mosolygó menyasszony" />
                      <PhotoPrint pinned className="z-10 -mb-[6%] w-[42%] translate-x-[16%] rotate-[5deg]" src="/meghivo-silver/g2.webp" alt="Koszorúslányok csokrokkal" />
                      <PhotoPrint pinned className="z-20 w-[42%] -translate-x-[10%] -rotate-[3deg]" src="/meghivo-silver/g5.webp" alt="Menyasszonyi frizura virágokkal" />
                    </div>
                    <div className="absolute inset-0 hidden items-center justify-center md:flex">
                      <PhotoPrint
                        className="z-0 -mr-[10%] mb-[6%] w-[34%] -rotate-[10deg]"
                        src="/meghivo-silver/g2.webp"
                        alt="Koszorúslányok csokrokkal"
                      />
                      <PhotoPrint
                        className="z-10 w-[38%] rotate-[2deg]"
                        src="/meghivo-silver/g6.webp"
                        alt="Mosolygó menyasszony"
                      />
                      <PhotoPrint
                        className="z-0 -ml-[10%] mb-[6%] w-[34%] rotate-[11deg]"
                        src="/meghivo-silver/g5.webp"
                        alt="Menyasszonyi frizura virágokkal"
                      />
                    </div>
                  </>
                ) : s.key === "torta" ? (
                  /* A torta egy cukrászdai vitrin boltíves keretében, mellette
                     kézírásos „Kóstolj bele!" matrica. Mindkét nézetben
                     függőlegesen középen; mobilon nagyobb (a gombos rész
                     ráérhet), desktopon magasabb arányú. */
                  <div className="absolute inset-x-0 bottom-0 top-[14%] flex items-center justify-center md:top-0">
                    <div className="relative w-[82%] [container-type:inline-size] md:w-[50%]">
                      <div className="overflow-hidden rounded-t-full border-[6px] border-white bg-white shadow-[0_28px_50px_-20px_rgba(50,70,52,0.55)] ring-1 ring-black/5 md:border-[10px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={HERO_CAKE_IMAGE} alt={s.alt} decoding="sync" className="block aspect-[3/5] w-full object-fill md:aspect-[5/7] md:object-cover" />
                      </div>
                      <span
                        aria-hidden
                        className="absolute -left-[10%] top-[8%] grid aspect-square w-[46%] rotate-[-12deg] place-items-center rounded-full bg-[#F6E3E6] text-center font-['Great_Vibes'] text-[11cqw] leading-[0.95] text-[#9A5267] shadow-[0_10px_20px_-8px_rgba(120,60,80,0.5)] ring-2 ring-white md:-left-[22%] md:bottom-[14%] md:top-auto md:w-[40%] md:text-[10.5cqw]"
                      >
                        Kóstolj
                        <br />
                        bele!
                      </span>
                    </div>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src="/hero-bride-cut.webp"
                    alt={s.alt}
                    fetchPriority="high"
                    decoding="sync"
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
    );
  };


  return (
    /* A háttér a fejléc mögé bújik (negatív felső margó), a két alsó sarok
       lekerekített, alul 1px fehér elválasztóval. Mindkét dia ezüstös hátterű,
       és mindkettőn átfut egy fénycsík. */
    <section
      ref={sectionRef}
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

      {/* Diaváltáskor a dia (a képekkel együtt) újra létrejön. Az iOS Safari
          a már nem használt kép dekódolt változatát eldobja, és az új
          elemnél újra dekódolja – addig a kép helye üres, a szöveg után
          villan be. Ezért a banner összes képe láthatatlanul végig az
          oldalon marad, a dián lévő képek pedig szinkron dekódolódnak. */}
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0">
        {["/hero-bride-cut.webp", ...HERO_PHONE_IMAGES, ...HERO_PHOTO_IMAGES, HERO_CAKE_IMAGE].map((src) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={src} src={src} alt="" decoding="sync" />
        ))}
      </div>

      {/* A dia teljes tartalma egyben úszik be jobbról – a szöveg, az ajánlat
          és a kép együtt mozog, így semmi nem ugrál külön. A vetítésvezérlő
          kívül marad, az helyben áll. */}
      <div className="grid">
        {SLIDES.map((s) => renderSlide(s, s.key !== slide.key))}
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
