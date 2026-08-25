"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { OFFERS, formatFt } from "../_data/offers";

const NET = OFFERS.net.find((o) => o.id === "hipernet-l")!;
const MOBIL = OFFERS.havidijas.find((o) => o.id === "prime-plus")!;

/** Egy banner-dia: szöveg + a bal alsó sarokban kiemelt ajánlat + a hozzá tartozó kép. */
type Slide = {
  key: string;
  /** Sötétkék hátterű dia (világos szövegekkel, fehér elválasztóval alul). */
  dark?: boolean;
  /** Fehér és kiemelt felező a főcímben. */
  lead: string;
  accent: string;
  blurb: string;
  note: string;
  /** Mobil (portré) kivágat és md-től használt (fekvő) kivágat. */
  img: string;
  imgMd: string;
  /** A képre kerülő osztályok – diánként más, mert a kivágatok aránya eltér. */
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
    imgMd: "/yettel/hero-family.png",
    // A kivágat aránya pont a keretéé, így hézag nélkül kitölti.
    imgClass: "absolute inset-x-0 bottom-0 block w-full md:h-full md:object-contain md:object-bottom",
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
    dark: true,
    lead: "Korlátlan",
    accent: "mobilnet",
    blurb:
      "Korlátlan 5G net és beszélgetés egész hónapban – ajándék SIM-mel, díjmentes számhordozással, és bármikor válthatsz nagyobb csomagra.",
    note: "Ingyenes SIM · Bármikor válthatsz csomagot",
    img: "/yettel/hero-man1.webp",
    imgMd: "/yettel/hero-banner-family.webp",
    // Mobilon nagyobbra véve és jobbra tolva (a jobb szélen szándékosan kilóg);
    // md-től a keretbe illesztve, az aljára ülve.
    imgClass:
      "absolute bottom-0 -right-10 block w-[122%] max-w-none md:right-0 md:left-0 md:h-full md:w-full md:object-contain md:object-bottom",
    alt: "Yettel mobilos ügyfél",
    offer: {
      badge: "Legnépszerűbb tarifa",
      name: MOBIL.name,
      sub: `${MOBIL.dataLabel} net · ${MOBIL.voiceLabel} hívás`,
      price: MOBIL.price,
      priceNote: "e-Komfort csomaggal",
      mdNote: "Korlátlan net és beszélgetés egy díjban.",
      href: "#havidijas",
    },
  },
];

const INTERVAL_MS = 4000;

/**
 * A banner. A diák (otthoni internet ↔ havidíjas mobil) 4 másodpercenként
 * váltakoznak mobilon és weben is: a teljes tartalom egyben úszik be jobbról,
 * a pöttyök mutatják, melyiken állunk, a pause gombbal pedig megállítható.
 * A 2. dia sötétkék hátteret kap, alul fehér elválasztóval, hogy elkülönüljön
 * az alatta induló gyorsmenüs sávtól.
 */
export function HeroSlides() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Ha valaki kevesebb mozgást kért, a vetítés alapból áll (a play gombbal
    // így is elindítható).
    const start = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
    };
    start();
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [paused, index]);

  const slide = SLIDES[index];
  const { offer } = slide;
  const dark = slide.dark === true;

  return (
    /* A háttér a /yettel_light welcome képernyőjének mozgó gradiense (130°-os
       sweep + két lebegő, elmosott folt) – lásd globals.css; a sötét dián sima
       navy. A negatív felső margó a fejléc mögé húzza a hátteret (a tartalmat a
       vele azonos pt tartja a helyén). A két alsó sarok lekerekített: a z-10
       miatt a banner a következő szekció fölé rajzolódik, így a sarkoknál az
       alábújó gyorsikonos sötétkék háttér látszik ki. */
    <section
      className={[
        "relative z-10 -mt-14 overflow-hidden rounded-b-[32px] pt-14",
        dark ? "border-b border-white bg-[#002340]" : "yettel-hero-bg",
      ].join(" ")}
    >
      <span aria-hidden className="yettel-blob yettel-blob-1" />
      <span aria-hidden className="yettel-blob yettel-blob-2" />

      {/* A dia teljes tartalma egyben úszik be jobbról – a szöveg, az ajánlat
          és a kép együtt mozog, így semmi nem ugrál külön. A vetítésvezérlő
          kívül marad, az helyben áll. */}
      <div
        key={slide.key}
        className="yettel-slide-in relative mx-auto grid max-w-6xl items-end gap-3 px-4 pt-8 sm:px-6 md:grid-cols-2 md:gap-8 md:pt-10"
      >
        <div className="pb-0 md:pb-10">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.6rem]">
            <span className="text-white">{slide.lead}</span>{" "}
            <span className={dark ? "text-[#B4FF00]" : "text-[#002340]"}>{slide.accent}</span>
          </h1>
          <p className={`mt-3 max-w-md text-base ${dark ? "text-[#BBD3E4]" : "text-[#2D466C]"}`}>{slide.blurb}</p>

          {/* A kiemelt ajánlat. Mobilon kiemeljük a szövegfolyamból: a banner bal
              alsó sarkába kerül, a jobbra igazított képre lógva (z-10 miatt
              a kép fölött). Weben (md-től) visszatér a szöveg alá. */}
          <div
            className={[
              "absolute bottom-12 left-4 z-10 w-[52%] max-w-[188px] rounded-[18px] border p-3 shadow-[0_18px_50px_rgba(0,35,64,0.18)] backdrop-blur-[3px] sm:left-6",
              "md:static md:mt-6 md:w-full md:max-w-[320px] md:rounded-[20px] md:p-4",
              dark
                ? "border-white/25 bg-white/10 md:backdrop-blur-md"
                : "border-white/60 bg-white/25 md:border-white/70 md:bg-white/60 md:backdrop-blur-xl",
            ].join(" ")}
          >
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.625rem] font-bold md:px-3 md:py-1 md:text-xs",
                dark ? "bg-[#B4FF00] text-[#002340]" : "bg-[#002340] text-white",
              ].join(" ")}
            >
              {offer.badge}
            </span>
            <h2 className={`mt-1.5 text-sm font-extrabold md:mt-2 md:text-base ${dark ? "text-white" : "text-[#002340]"}`}>
              {offer.name}
            </h2>
            <p className={`text-[0.625rem] md:text-xs ${dark ? "text-[#BBD3E4]" : "text-[#2D466C]"}`}>{offer.sub}</p>
            <div className="mt-1.5 flex items-baseline gap-1.5 whitespace-nowrap md:mt-2">
              <span
                className={`shrink-0 text-xl font-extrabold tracking-tight md:text-2xl ${dark ? "text-white" : "text-[#002340]"}`}
              >
                {formatFt(offer.price)}
              </span>
              <span className={`shrink-0 text-[0.625rem] md:text-xs ${dark ? "text-[#BBD3E4]" : "text-[#2D466C]"}`}>
                / hó
              </span>
            </div>
            <p className={`text-[0.625rem] md:text-xs ${dark ? "text-[#9FB6CC]" : "text-[#7E93B0]"}`}>
              {offer.oldPrice !== undefined ? (
                <>
                  <span className="line-through">{formatFt(offer.oldPrice)}</span> helyett
                </>
              ) : (
                offer.priceNote
              )}
            </p>
            <p
              className={`mt-0.5 hidden text-[0.625rem] font-bold md:mt-1 md:block md:text-xs ${dark ? "text-[#BBD3E4]" : "text-[#2D466C]"}`}
            >
              {offer.mdNote}
            </p>
            <a
              href={offer.href}
              className={[
                "mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors md:mt-4 md:rounded-xl md:px-5 md:py-3 md:text-sm",
                dark
                  ? "bg-[#B4FF00] text-[#002340] hover:bg-[#C9FF4D]"
                  : "bg-[#002340] text-white hover:bg-[#001D36]",
              ].join(" ")}
            >
              Érdekel
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </a>
          </div>
          <p
            className={`mt-3 mb-2 text-xs font-semibold sm:mt-4 md:mb-0 ${dark ? "text-white/70" : "text-[#002340]/70"}`}
          >
            {slide.note}
          </p>
        </div>

        {/* Hero kép: mobilon a diához tartozó álló kivágat, md-től a szélesebb.
            A <picture> miatt a böngésző csak a szükséges fájlt tölti le. A keret
            mindkét töréspontnál fix arányú, hogy a diák bannermagassága azonos
            legyen (különben az alsó szélre igazított ajánlatkártya elmozdulna). */}
        <div className="w-full self-end">
          <div className="relative -mr-4 ml-auto aspect-[461/570] w-[62%] md:-mr-6 md:ml-0 md:aspect-[620/461] md:w-[118%] md:max-w-none md:translate-x-6 lg:-mr-14 lg:translate-x-12">
            <picture>
              <source media="(min-width: 768px)" srcSet={slide.imgMd} />
              <img src={slide.img} alt={slide.alt} className={slide.imgClass} />
            </picture>
          </div>
        </div>
      </div>

      {/* Vetítésvezérlő: pause/play és a pöttyök, amik mutatják, melyik dián
          állunk. A tartalom bal széléhez igazítva, a banner alján. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20">
        <div className="mx-auto flex max-w-6xl px-4 sm:px-6">
          <div className="pointer-events-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Vetítés indítása" : "Vetítés megállítása"}
              className={[
                "grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border backdrop-blur-md",
                dark ? "border-white/40 bg-white/15 text-white" : "border-white/70 bg-white/60 text-[#002340]",
              ].join(" ")}
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
                      backgroundColor: i === index
                        ? (dark ? "#B4FF00" : "#002340")
                        : (dark ? "rgba(255,255,255,0.35)" : "rgba(0,35,64,0.3)"),
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
