"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { OFFERS, formatFt } from "../_data/offers";

const NET = OFFERS.net.find((o) => o.id === "hipernet-l")!;
const MOBIL = OFFERS.havidijas.find((o) => o.id === "prime-plus")!;

/** Egy banner-dia: szöveg + a bal alsó sarokban kiemelt ajánlat + a hozzá tartozó kép. */
type Slide = {
  key: string;
  /** Fehér és sötétkék felező a főcímben. */
  lead: string;
  accent: string;
  blurb: string;
  note: string;
  /** Mobil (portré) kép; md-től mindkét dia a családi képet mutatja. */
  img: string;
  /** A képre kerülő osztályok – diánként más, mert a két kivágat aránya és
   *  a bannerbeli elhelyezése eltér. */
  imgClass: string;
  alt: string;
  offer: {
    badge: string;
    name: string;
    sub: string;
    price: number;
    /** Áthúzott ár – ha nincs, a helyére a priceNote kerül, hogy ne ugráljon a kártya. */
    oldPrice?: number;
    priceNote: string;
    /** Csak md-től látszó extra sor. */
    mdNote: string;
    href: string;
  };
};

const SLIDES: Slide[] = [
  {
    key: "internet",
    lead: "Szupergyors",
    accent: "internet",
    blurb:
      "1000 Mbit/s optikai net az egész családnak – ajándék WiFi 7 routerrel, díjmentes telepítéssel és az első 30 nappal díjmentesen.",
    note: "Ingyenes bekötés · 30 napos elállás",
    img: "/yettel/hero-man.png",
    // A kivágat aránya pont a kereté, így hézag nélkül kitölti.
    imgClass:
      "absolute inset-x-0 bottom-0 block w-full md:static md:ml-0 md:-mr-6 md:w-[118%] md:max-w-none md:translate-x-6 lg:-mr-14 lg:translate-x-12",
    alt: "Yettel ügyfél",
    offer: {
      badge: "A hét ajánlata",
      name: NET.name,
      sub: `${NET.features[0]} · optikai internet`,
      price: NET.price,
      oldPrice: NET.oldPrice,
      priceNote: "",
      mdNote: `Havi ${formatFt(NET.oldPrice! - NET.price)} megtakarítás.`,
      href: "#internet",
    },
  },
  {
    key: "havidijas",
    lead: "Korlátlan",
    accent: "mobilnet",
    blurb:
      "Korlátlan 5G net és beszélgetés egész hónapban – ajándék SIM-mel, díjmentes számhordozással, és bármikor válthatsz nagyobb csomagra.",
    note: "Ingyenes SIM · Bármikor válthatsz csomagot",
    img: "/yettel/hero-man1.webp",
    // Szélesebb (3/4-es) kivágat: a keret aljára ül, és kicsit jobbra tolva,
    // hogy a kezében lévő telefont ne takarja ki az ajánlatkártya.
    imgClass: "absolute bottom-0 -right-3 block w-[92%] max-w-none",
    alt: "Yettel mobilos ügyfél",
    offer: {
      badge: "Legnépszerűbb tarifa",
      name: MOBIL.name,
      sub: `${MOBIL.dataLabel} mobilnet · ${MOBIL.voiceLabel} beszélgetés`,
      price: MOBIL.price,
      priceNote: "e-Komfort csomaggal",
      mdNote: "Korlátlan net és beszélgetés egy díjban.",
      href: "#havidijas",
    },
  },
];

const INTERVAL_MS = 4000;

/**
 * A banner tartalma. Mobilon a két dia (otthoni internet ↔ havidíjas mobil)
 * 4 másodpercenként váltakozik; a pöttyök mutatják, melyiken állunk, és a
 * pause gombbal megállítható. md-től felfelé változatlanul az internetes dia
 * látszik a családi képpel, ott nincs is vetítés.
 */
export function HeroSlides() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    // Csak mobilon vetítünk; ha valaki kevesebb mozgást kért, alapból áll
    // (a play gombbal így is elindítható).
    const mq = window.matchMedia("(max-width: 767px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setRotating(mq.matches);
      if (!mq.matches) setIndex(0);
    };
    const init = () => {
      apply();
      if (reduce.matches) setPaused(true);
    };
    init();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!rotating || paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [rotating, paused, index]);

  const slide = SLIDES[index];
  const { offer } = slide;

  return (
    <div className="relative mx-auto grid max-w-6xl items-end gap-3 px-4 pt-8 sm:px-6 md:grid-cols-2 md:gap-8 md:pt-10">
      <div key={slide.key} className="yettel-fade pb-0 md:pb-10">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.6rem]">
          <span className="text-white">{slide.lead}</span> <span className="text-[#002340]">{slide.accent}</span>
        </h1>
        <p className="mt-3 max-w-md text-base text-[#2D466C]">{slide.blurb}</p>

        {/* A kiemelt ajánlat. Mobilon kiemeljük a szövegfolyamból: a banner bal
            alsó sarkába kerül, a jobbra igazított képre lógva (z-10 miatt
            a kép fölött). Weben (md-től) visszatér a szöveg alá. */}
        <div className="absolute bottom-12 left-4 z-10 w-[52%] max-w-[188px] rounded-[18px] border border-white/70 bg-white/55 p-3 shadow-[0_18px_50px_rgba(0,35,64,0.22)] backdrop-blur-xl sm:left-6 md:static md:mt-6 md:w-full md:max-w-[320px] md:rounded-[20px] md:bg-white/60 md:p-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#002340] px-2.5 py-0.5 text-[0.625rem] font-bold text-white md:px-3 md:py-1 md:text-xs">
            {offer.badge}
          </span>
          <h2 className="mt-1.5 text-sm font-extrabold text-[#002340] md:mt-2 md:text-base">{offer.name}</h2>
          <p className="text-[0.625rem] text-[#2D466C] md:text-xs">{offer.sub}</p>
          <div className="mt-1.5 flex items-baseline gap-1.5 whitespace-nowrap md:mt-2">
            <span className="shrink-0 text-xl font-extrabold tracking-tight text-[#002340] md:text-2xl">
              {formatFt(offer.price)}
            </span>
            <span className="shrink-0 text-[0.625rem] text-[#2D466C] md:text-xs">/ hó</span>
          </div>
          <p className="text-[0.625rem] text-[#7E93B0] md:text-xs">
            {offer.oldPrice !== undefined ? (
              <>
                <span className="line-through">{formatFt(offer.oldPrice)}</span> helyett
              </>
            ) : (
              offer.priceNote
            )}
          </p>
          <p className="mt-0.5 hidden text-[0.625rem] font-bold text-[#2D466C] md:mt-1 md:block md:text-xs">
            {offer.mdNote}
          </p>
          <a
            href={offer.href}
            className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#002340] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#001D36] md:mt-4 md:rounded-xl md:px-5 md:py-3 md:text-sm"
          >
            Érdekel
            <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </a>
        </div>
        <p className="mt-3 mb-2 text-xs font-semibold text-[#002340]/70 sm:mt-4 md:mb-0">{slide.note}</p>
      </div>

      {/* Vetítésvezérlő – csak mobilon, az ajánlatkártya alatt: pause/play és a
          pöttyök, amik mutatják, melyik dián állunk. */}
      <div className="absolute bottom-2 left-4 z-20 flex items-center gap-2.5 sm:left-6 md:hidden">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Vetítés indítása" : "Vetítés megállítása"}
          className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border border-white/70 bg-white/60 text-[#002340] backdrop-blur-md"
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
        <div className="flex items-center gap-1">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
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
                  backgroundColor: i === index ? "#002340" : "rgba(0,35,64,0.3)",
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Hero kép: mobilon a diához tartozó álló, kivágott portré, md-től a
          családi kép. A <picture> miatt a böngésző csak a szükséges fájlt tölti le.
          Mobilon a keret fix arányú, hogy a két dia bannermagassága azonos legyen
          (különben az alsó szélre igazított ajánlatkártya a szövegre csúszna). */}
      <div className="w-full self-end">
        <div className="relative -mr-4 ml-auto aspect-[461/570] w-[62%] md:mr-0 md:ml-0 md:aspect-auto md:w-full">
          <picture>
            <source media="(min-width: 768px)" srcSet="/yettel/hero-family.png" />
            <img
              key={slide.key}
              src={slide.img}
              alt={slide.alt}
              className={`yettel-fade ${slide.imgClass}`}
            />
          </picture>
        </div>
      </div>
    </div>
  );
}
