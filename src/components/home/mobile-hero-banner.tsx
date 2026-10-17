"use client";

import { memo, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { preload } from "react-dom";
import { ArrowDown, ArrowRight, Pause, Play } from "lucide-react";
import { useIsLoggedIn } from "@/components/providers/masked-contact";

/**
 * A főoldal bannere mobilon (md alatt): teljes képernyős fotós diák, a
 * képhez illő „prémium" kezeléssel – alsó sötétítés, sarokvilágítás,
 * matrica vagy fényképező-kereső keret –, rajta cím, rövid szöveg és gomb.
 * Desktopon a HeroCarousel marad.
 *
 * A diák (és a képeik) végig az oldalon vannak, váltáskor csak az
 * átlátszóságuk változik: így az iOS Safari nem dobja el és nem dekódolja
 * újra a képeket (különben a szöveg után villannának be).
 */

type Tone = "dark" | "light";

type MobileSlide = {
  key: string;
  /** A háttérfotó; ha nincs, a dia saját rajzolt jelenetet kap (overlay).
      Videós diánál ez a videó állóképe (poszter), ami betöltésig látszik. */
  img?: string;
  /** Háttérvideó (némítva, ismétlődve); az aktív dián az elejéről indul. */
  video?: string;
  alt: string;
  /** A kép kivágásának fókusza (object-position). */
  focus: string;
  /** A fotó animációja az aktív dián (alapból lassú ráközelítés). */
  zoomClass?: string;
  /** „Előtte” kép: a dián ebből fésüli át a fésű a kész (img) képre. */
  before?: string;
  /** Világos szöveg sötétített képen, vagy sötét szöveg világosított sarokban. */
  tone: Tone;
  /** A szövegblokk helye. */
  place: "top" | "bottom";
  eyebrow: string;
  lead: string;
  accent: string;
  blurb: string;
  cta: string;
  /** Erre a kategóriára szűri a listát; ha nincs, a kategóriákhoz görget. */
  category?: string;
  /** Ha meg van adva, a gomb erre az oldalra visz (pl. /meghivo). */
  href?: string;
  /** Kiemelő szín (cím második sora, gomb, pöttyök). */
  color: string;
  colorHover: string;
  /** A kép fölé kerülő rétegek. */
  overlay: "bottom-dark" | "corner-top-light" | "corner-bottom-light" | "viewfinder" | "envelope";
  sticker?: string;
};

const SLIDES: MobileSlide[] = [
  {
    key: "eskuvo",
    img: "/hero-m/eskuvo-video.webp",
    video: "/hero-m/eskuvo.mp4",
    alt: "Menyasszony hajdísszel és csokorral",
    focus: "50% 30%",
    tone: "dark",
    place: "bottom",
    eyebrow: "Minden egy helyen",
    lead: "ESKÜVŐRE",
    accent: "KÉSZÜLSZ?",
    blurb: "Böngészd az elérhető szolgáltatókat, vagy ha szolgáltató vagy, regisztrálj!",
    cta: "Megnézem",
    color: "#A9CFCB",
    colorHover: "#84AAA6",
    overlay: "bottom-dark",
  },
  {
    key: "meghivo",
    alt: "Prémium digitális esküvői meghívó: lila boríték viaszpecséttel",
    focus: "50% 50%",
    tone: "dark",
    place: "bottom",
    eyebrow: "Saját szolgáltatás · Premium",
    lead: "DIGITÁLIS",
    accent: "MEGHÍVÓK",
    blurb: "Egy linken elküldhető, mobilra szabott meghívó visszaszámlálóval és online visszajelzéssel – már 14\u00a0900\u00a0Ft-tól.",
    cta: "Megnézem",
    href: "/meghivo",
    color: "#F2A6CF",
    colorHover: "#C65EA5",
    overlay: "envelope",
  },
  {
    key: "fotos",
    img: "/hero-m/fotos.webp",
    alt: "Menyasszony az ablakban, sziluettben",
    focus: "50% 40%",
    /* Az eredeti kivágásból lefelé ráközelít, amíg a lány a REC keret
       közepére kerül; utána vaku, majd a kereten kívül elsötétül
       (globals.css .mobile-hero-zoom-fotos). */
    zoomClass: "mobile-hero-zoom-fotos",
    tone: "dark",
    place: "bottom",
    eyebrow: "Fotósok, videósok",
    lead: "PILLANATOK",
    accent: "ÖRÖKRE",
    blurb: "Az első pillantástól a hajnali táncig – találd meg a fotóst, aki a ti stílusotokban meséli el.",
    cta: "Fotósok",
    category: "fotosok-videosok",
    color: "#E2C38E",
    colorHover: "#C9A76E",
    overlay: "viewfinder",
  },
  {
    key: "fodrasz",
    img: "/hero-m/fodrasz.webp",
    alt: "Menyasszony virágkoszorúval, hosszú, hullámos hajjal, az ég előtt",
    before: "/hero-m/fodrasz-elotte.webp",
    focus: "75% 50%",
    tone: "light",
    place: "top",
    eyebrow: "Fodrászok, borbélyok",
    lead: "MINDEN TINCS",
    accent: "A HELYÉN",
    blurb: "Menyasszonyi frizura próbával – találd meg a fodrászodat a közeledben.",
    cta: "Fodrászok",
    category: "fodrasz-borbely",
    color: "#5E7FA3",
    colorHover: "#4A6889",
    overlay: "corner-top-light",
  },
  {
    key: "virag",
    img: "/hero-m/virag.webp",
    alt: "Menyasszony rózsaszín csokorral",
    focus: "40% 30%",
    tone: "dark",
    place: "bottom",
    eyebrow: "Virágok, dekoráció",
    lead: "VIRÁGBA",
    accent: "BORULVA",
    blurb: "Menyasszonyi csokor, asztaldísz, kapudísz – virágkötők egy helyen.",
    cta: "Virágkötők",
    category: "virag",
    color: "#F2B8C6",
    colorHover: "#E59BAE",
    overlay: "bottom-dark",
    sticker: "Csokor\n& dekor",
  },
  {
    key: "smink",
    img: "/hero-m/smink.webp",
    alt: "Menyasszonyi smink készül",
    focus: "45% 25%",
    tone: "dark",
    place: "bottom",
    eyebrow: "Sminkesek",
    lead: "RAGYOGJ",
    accent: "A NAGY NAPON",
    blurb: "Tartós, fotón is gyönyörű smink – próbasminkkel, akár a helyszínen.",
    cta: "Sminkesek",
    category: "smink",
    color: "#E8B4A0",
    colorHover: "#D69A84",
    overlay: "bottom-dark",
  },
  {
    key: "torta",
    img: "/hero-m/torta.webp",
    alt: "Emeletes esküvői torta rózsákkal",
    focus: "60% 50%",
    tone: "light",
    place: "bottom",
    eyebrow: "Torták, sütemények",
    lead: "ÉDES",
    accent: "KEZDET",
    blurb: "A torta a nagy nap egyik legszebb pillanata – találd meg a cukrászodat.",
    cta: "Cukrászok",
    category: "torta-sutemeny",
    color: "#B5677D",
    colorHover: "#9A5267",
    overlay: "corner-bottom-light",
    sticker: "Kóstolj\nbele!",
  },
];

const INTERVAL_MS = 5000;
/* Ha a videó valamiért nem ér véget (elakad), ennyi után akkor is lapoz. */
const VIDEO_SAFETY_MS = 9000;
/* A régi dia elsötétülésének hossza (globals.css .mobile-hero-slide-out). A
   videós dia ennyivel a videó vége előtt vált, így a kép a videó utolsó
   képkockájára sötétül el teljesen – nem látszik, hogy a videó megáll. */
const FADE_OUT_MS = 700;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const CTA =
  "inline-flex h-12 items-center justify-center gap-1.5 rounded-xl px-6 text-[15px] font-bold transition-colors";

/**
 * Némított, beágyazott háttérvideó. A <video> nyers HTML-ként kerül a
 * szerver válaszába, hogy az autoplay, muted és playsinline attribútumok
 * már az első HTML-ben rajta legyenek: a React a muted-et nem írja ki, és
 * iOS Safari enélkül érintés nélkül nem indítja el a videót.
 */
const VideoBackground = memo(function VideoBackground({
  src,
  poster,
  label,
  focus,
  slide,
}: {
  src: string;
  poster?: string;
  label: string;
  focus: string;
  slide: number;
}) {
  const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  /* Pontosan abban a formában, ahogy a böngésző visszaadja (innerHTML):
     így a hidratáláskor nincs eltérés, és a React nem cseréli ki a már
     betöltődő (iOS-en már automatikusan induló) videót egy újra. */
  const html =
    `<video src="${esc(src)}"${poster ? ` poster="${esc(poster)}"` : ""} autoplay="" muted="" playsinline="" preload="auto"` +
    ` data-slide="${slide}" aria-label="${esc(label)}" class="absolute inset-0 h-full w-full object-cover" style="object-position: ${esc(focus)};"></video>`;
  return <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: html }} suppressHydrationWarning />;
});

/** A főoldali töltőképernyő (HomeLoader) értesítése a betöltés állásáról. */
function setHeroProgress(value: number, ready = false) {
  const w = window as Window & { __heroProgress?: number; __heroReady?: boolean };
  w.__heroProgress = Math.max(w.__heroProgress ?? 0, value);
  window.dispatchEvent(new CustomEvent("eskuvo:hero-progress", { detail: w.__heroProgress }));
  if (ready && !w.__heroReady) {
    w.__heroReady = true;
    window.dispatchEvent(new Event("eskuvo:hero-ready"));
  }
}

export function MobileHeroBanner() {
  /* Csak mobilon töltjük előre: az első kép magas, a többi alacsony
     prioritással. */
  SLIDES.forEach((s, i) =>
    s.img && preload(s.img, { as: "image", fetchPriority: i === 0 ? "high" : "low", media: "(max-width: 767px)" }),
  );
  SLIDES.forEach((s) =>
    s.before && preload(s.before, { as: "image", fetchPriority: "low", media: "(max-width: 767px)" }),
  );

  const [index, setIndex] = useState(0);
  /* Az épp elhalványuló (előző) dia: a fotója az elsötétülés végéig
     megtartja a lassú ráközelítést, különben a kép a váltás pillanatában
     visszaugrana eredeti méretére. (Előző-render minta, a React leírása
     szerint renderelés közben frissítve.) */
  const [shownIndex, setShownIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  if (shownIndex !== index) {
    setPrevIndex(shownIndex);
    setShownIndex(index);
  }
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? reduced;
  const loggedIn = useIsLoggedIn();

  /* Ha a videó nem tölthető be, a dia sima, időzített fotós diaként megy. */
  const [videoFailed, setVideoFailed] = useState(false);

  /* Az első dia videója: amíg be nem tölt, a főoldal töltőképernyője
     (HomeLoader) takarja az oldalt, és a logó kerete a betöltés állását
     mutatja ("eskuvo:hero-progress", 0–1, a lejátszó pufferéből). Ha
     lejátszható, hibás, vagy nem is kell (desktop, csökkentett mozgás),
     "eskuvo:hero-ready" jelzi, hogy az oldal mehet. A videó a szerver
     HTML-jében autoplay/muted/playsinline attribútumokkal érkezik
     (VideoBackground), mert iOS csak így játssza le érintés nélkül. */
  /* A diák videóit mindig frissen keressük meg (data-slide), nem tartunk
     rájuk hivatkozást: így egy esetleges elemcsere sem töri el a vezérlést. */
  const slideVideo = (i: number) =>
    document.querySelector<HTMLVideoElement>(`video[data-slide="${i}"]`);
  const indexRef = useRef(index);
  const pausedRef = useRef(paused);
  useEffect(() => {
    indexRef.current = index;
    pausedRef.current = paused;
  }, [index, paused]);
  useEffect(() => {
    const first = slideVideo(0);
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (!first || reduced || !mobile) {
      if (first && reduced) first.pause();
      setHeroProgress(1, true);
      return;
    }
    setHeroProgress(0.08);
    /* A médiaesemények nem buborékolnak, de a capture fázisban az
       ablakon is elkaphatók – így a videóelem cseréje sem számít. */
    const isFirst = (e: Event) => (e.target as HTMLElement)?.dataset?.slide === "0";
    const onProgress = (e: Event) => {
      if (!isFirst(e)) return;
      const v = e.target as HTMLVideoElement;
      if (!v.duration || !v.buffered.length) return;
      const frac = v.buffered.end(v.buffered.length - 1) / v.duration;
      setHeroProgress(0.08 + 0.87 * Math.min(frac, 1));
    };
    const onReady = (e: Event) => { if (isFirst(e)) setHeroProgress(1, true); };
    const onError = (e: Event) => {
      if (!isFirst(e)) return;
      setVideoFailed(true);
      setHeroProgress(1, true);
    };
    /* A videó végén lapoz (megállított vetítésnél a loop ismétli). */
    const advance = () => {
      if (indexRef.current === 0 && !pausedRef.current) setIndex(1 % SLIDES.length);
    };
    let endTimer: ReturnType<typeof setTimeout> | undefined;
    const schedule = (e: Event) => {
      if (!isFirst(e)) return;
      clearTimeout(endTimer);
      const v = e.target as HTMLVideoElement;
      if (!v.duration || v.paused) return;
      const left = ((v.duration - v.currentTime) / (v.playbackRate || 1)) * 1000;
      /* +100 ms tartalék: az időzítő és a videó órája kissé elcsúszhat, a
         végére így biztosan teljesen sötét a kép. */
      endTimer = setTimeout(advance, Math.max(0, left - FADE_OUT_MS - 100));
    };
    const unschedule = (e: Event) => { if (isFirst(e)) clearTimeout(endTimer); };
    /* Tartalék: ha az időzítő valamiért nem futott le. */
    const onEnded = (e: Event) => { if (isFirst(e)) advance(); };
    /* Ha a töltőképernyő eltűnt, az elejéről indítjuk, hogy ne maradjon le
       semmi abból, ami mögötte már lement. */
    const onLoaderDone = () => {
      const v = slideVideo(0);
      if (!v || indexRef.current !== 0) return;
      v.muted = true;
      v.currentTime = 0;
      v.play().catch(() => {});
    };
    if (first.readyState >= 4) setHeroProgress(1, true);
    const media: [string, (e: Event) => void][] = [
      ["progress", onProgress],
      ["loadeddata", onProgress],
      ["canplaythrough", onReady],
      ["error", onError],
      ["ended", onEnded],
      ["playing", schedule],
      ["seeked", schedule],
      ["ratechange", schedule],
      ["pause", unschedule],
      ["waiting", unschedule],
    ];
    for (const [n, h] of media) window.addEventListener(n, h, true);
    window.addEventListener("eskuvo:loader-done", onLoaderDone);
    return () => {
      for (const [n, h] of media) window.removeEventListener(n, h, true);
      window.removeEventListener("eskuvo:loader-done", onLoaderDone);
      clearTimeout(endTimer);
    };
  }, [reduced]);

  /* Megállított vetítésnél a videó ismétlődik, egyébként a végén lapoz. */
  useEffect(() => {
    document.querySelectorAll<HTMLVideoElement>("video[data-slide]").forEach((v) => { v.loop = paused; });
  }, [paused]);

  /* A videós dia akkor fut, amikor látszik: odaváltáskor az elejéről indul.
     Elváltáskor csak az elsötétülés után áll meg, hogy közben ne látsszon
     kimerevített kép. Csökkentett mozgásnál csak a poszter látszik. */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    document.querySelectorAll<HTMLVideoElement>("video[data-slide]").forEach((v) => {
      const i = Number(v.dataset.slide);
      if (i === index && !reduced) {
        v.muted = true;
        v.currentTime = 0;
        v.play().catch(() => {});
      } else if (reduced || v.paused) {
        v.pause();
      } else {
        timers.push(setTimeout(() => v.pause(), FADE_OUT_MS + 100));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [index, reduced]);

  /* Lapozás: a videós dia FADE_OUT_MS-sel a videó vége előtt vált, a többi
     INTERVAL_MS után. A videós diánál csak egy tartalék időzítő fut. */
  const videoDrives = !!SLIDES[index].video && !reduced && !videoFailed;
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), videoDrives ? VIDEO_SAFETY_MS : INTERVAL_MS);
    return () => clearTimeout(t);
  }, [paused, index, videoDrives]);

  /* Legyintéssel is lapozható. */
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
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    setIndex((i) => (i + (dx > 0 ? 1 : -1) + SLIDES.length) % SLIDES.length);
  };

  /* A banner a képernyő alját éri el: tudnia kell, mekkora sáv van fölötte
     (figyelmeztető csík + fejléc). Csak a lap tetején mérünk. */
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
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

  const go = (e: React.MouseEvent<HTMLAnchorElement>, s: MobileSlide) => {
    e.preventDefault();
    if (s.category) window.dispatchEvent(new CustomEvent("eskuvo:set-category", { detail: s.category }));
    const target = document.querySelector(s.category ? "#szolgaltatok" : "#kategoriak");
    const reducedNow = window.matchMedia(REDUCED_QUERY).matches;
    target?.scrollIntoView({ behavior: reducedNow ? "auto" : "smooth", block: "start" });
  };

  const active = SLIDES[index];

  return (
    <section
      ref={sectionRef}
      className="mobile-hero relative z-20 -mt-6 overflow-hidden rounded-b-[32px] border-b border-white bg-black"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Főoldali banner"
    >
      {SLIDES.map((s, i) => {
        const on = i === index;
        const light = s.tone === "light";
        return (
          <div
            key={s.key}
            aria-hidden={!on || undefined}
            inert={!on || undefined}
            /* Váltás feketén át: a régi dia elsötétül, az új csak utána
               világosodik ki (mobile-hero-slide-in/out, globals.css). */
            className={`absolute inset-0 ${on ? "mobile-hero-slide-in z-[1] opacity-100" : "mobile-hero-slide-out pointer-events-none opacity-0"}`}
          >
            {/* Videós dia: a poszter (s.img) betöltésig látszik, a videó
                némán, ismétlődve fut; a lassú ráközelítés itt nem kell. */}
            {s.video ? (
              <VideoBackground src={s.video} poster={s.img} label={s.alt} focus={s.focus} slide={i} />
            ) : s.img && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={s.img}
                alt={s.alt}
                decoding="sync"
                fetchPriority={i === 0 ? "high" : "low"}
                className={`absolute inset-0 h-full w-full object-cover ${on || i === prevIndex ? (s.zoomClass ?? "mobile-hero-zoom") : ""}`}
                style={{ objectPosition: s.focus }}
              />
            )}

            {/* Fodrász dia: a kócos „előtte” képből egy fésű fésüli át a kész
                frizurára (globals.css .mhb-comb-*). A kép ugyanazt a
                ráközelítést kapja, mint alatta a kész fotó, így fedik egymást. */}
            {s.before && !reduced && (on || i === prevIndex) && (
              <>
                <span aria-hidden className="mhb-comb-before absolute inset-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.before}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover ${s.zoomClass ?? "mobile-hero-zoom"}`}
                    style={{ objectPosition: s.focus }}
                  />
                </span>
                <span aria-hidden className="mhb-comb-tool absolute">
                  <span className="mhb-comb-glow" />
                  <svg viewBox="0 0 120 40" className="relative h-full w-full drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]">
                    <defs>
                      <linearGradient id="mhb-comb-gold" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#F7E7B4" />
                        <stop offset="50%" stopColor="#D9B46A" />
                        <stop offset="100%" stopColor="#B88A3E" />
                      </linearGradient>
                    </defs>
                    <rect x="4" y="2" width="112" height="12" rx="6" fill="url(#mhb-comb-gold)" />
                    {Array.from({ length: 18 }, (_, k) => (
                      <rect key={k} x={9 + k * 6} y="12" width="2.6" height={k % 2 ? 22 : 25} rx="1.3" fill="url(#mhb-comb-gold)" />
                    ))}
                  </svg>
                </span>
                {on && <span aria-hidden className="mhb-comb-glint absolute inset-0" />}
              </>
            )}

            {/* A meghívós dia rajzolt jelenete: a prémium minta lila borítéka */}
            {s.overlay === "envelope" && <EnvelopeScene label={s.alt} active={on} />}

            {/* Rétegek: sötétítés / sarokvilágítás / kereső-keret */}
            {(s.overlay === "bottom-dark" || s.overlay === "viewfinder") && (
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    s.overlay === "viewfinder"
                      ? "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.82) 100%)"
                      : "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.1) 48%, rgba(0,0,0,0.78) 100%)",
                }}
              />
            )}
            {s.overlay === "corner-top-light" && (
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ background: "radial-gradient(150% 62% at 0% 0%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.86) 42%, rgba(255,255,255,0) 78%)" }}
              />
            )}
            {s.overlay === "corner-bottom-light" && (
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ background: "radial-gradient(160% 62% at 0% 100%, rgba(255,252,250,0.97) 0%, rgba(255,252,250,0.9) 45%, rgba(255,252,250,0) 80%)" }}
              />
            )}
            {s.overlay === "viewfinder" && (
              <span aria-hidden className="absolute inset-x-5 bottom-[46%] top-16">
                {/* A villanás után a kereten kívüli kép elsötétül (a keret
                    árnyéka), és a kereten belül egy vakuvillanás fut le. */}
                {(on || i === prevIndex) && <span className="mobile-hero-dim absolute inset-0" />}
                {on && <span className="mobile-hero-flash absolute inset-0 bg-white" />}
                {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((c) => (
                  <span key={c} className={`absolute h-7 w-7 border-white/80 ${c}`} />
                ))}
                <span className="absolute left-3 top-3 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] text-white/90">
                  <span className="mobile-hero-rec h-2 w-2 rounded-full bg-[#FF4D4D]" />
                  REC
                </span>
              </span>
            )}

            {/* Matrica */}
            {s.sticker && (
              <span
                aria-hidden
                className={`absolute grid aspect-square w-28 rotate-[-10deg] place-items-center whitespace-pre-line rounded-full text-center font-['Great_Vibes'] text-[1.7rem] leading-[0.95] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.45)] ring-2 ring-white ${
                  s.key === "torta" ? "left-5 top-[18%] bg-[#F6E3E6] text-[#A0566B]" : "right-5 top-[16%] bg-white/90 text-[#B5677D]"
                }`}
              >
                {s.sticker}
              </span>
            )}

            {/* Szöveg és gomb */}
            <div
              className={`absolute inset-x-0 px-5 ${s.place === "top" ? "top-0 pt-14" : "bottom-0 pb-16"} ${on ? "mobile-hero-text" : ""}`}
            >
              <p
                className={`text-xs font-bold uppercase tracking-[0.22em] ${light ? "text-gray-600" : "text-white/85"}`}
              >
                {s.eyebrow}
              </p>
              <h2
                className={`mt-2 font-heading text-[2.6rem] leading-[0.98] tracking-tight ${light ? "text-gray-900" : "text-white"}`}
                style={{ fontWeight: 950, textShadow: light ? undefined : "0 2px 18px rgba(0,0,0,0.35)" }}
              >
                {s.lead}
                <br />
                <span style={{ color: s.color }}>{s.accent}</span>
              </h2>
              {/* A világosított bal alsó sarokban keskenyebb, hogy a szöveg ne
                  érjen ki a világos részből */}
              <p className={`mt-3 text-[15px] leading-relaxed ${s.overlay === "corner-bottom-light" ? "max-w-[15rem]" : s.key === "fodrasz" ? "max-w-[13rem]" : "max-w-[20rem]"} ${light ? "text-gray-700" : "text-white/90"}`}>
                {s.blurb}
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {s.key === "eskuvo" && loggedIn === false && (
                  <Link
                    href="/auth/register"
                    className={`${CTA} border border-white/60 bg-white/20 text-white backdrop-blur-md hover:bg-white/30`}
                  >
                    Regisztráció
                  </Link>
                )}
                {s.href ? (
                  <Link
                    href={s.href}
                    className={`${CTA} mobile-hero-cta text-white shadow-lg`}
                    style={{ ["--cta" as string]: s.colorHover, ["--cta-hover" as string]: "#B04E91" }}
                  >
                    {s.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <a
                    href={s.category ? "#szolgaltatok" : "#kategoriak"}
                    onClick={(e) => go(e, s)}
                    className={`${CTA} mobile-hero-cta text-white shadow-lg`}
                    style={{ ["--cta" as string]: light ? s.color : s.colorHover, ["--cta-hover" as string]: light ? s.colorHover : s.color }}
                  >
                    {s.cta}
                    <ArrowDown className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Vetítésvezérlő */}
      <div className="absolute inset-x-0 bottom-4 z-20 px-5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setOverride(!paused)}
            aria-label={paused ? "Vetítés indítása" : "Vetítés megállítása"}
            className={`grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full border backdrop-blur-md ${
              active.tone === "light" ? "border-gray-900/20 bg-white/70 text-gray-800" : "border-white/50 bg-white/15 text-white"
            }`}
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
                    backgroundColor:
                      i === index
                        ? active.tone === "light" ? "#374151" : "#fff"
                        : active.tone === "light" ? "rgba(55,65,81,0.3)" : "rgba(255,255,255,0.45)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** A háttérben lebegő fénypontok – ugyanazok, mint a prémium minta nyitóképén. */
const SPARKS = [
  { left: "12%", top: "22%", size: 10, delay: "0s" },
  { left: "82%", top: "18%", size: 14, delay: "1.4s" },
  { left: "24%", top: "60%", size: 8, delay: "2.6s" },
  { left: "70%", top: "66%", size: 12, delay: "0.8s" },
  { left: "46%", top: "12%", size: 7, delay: "3.4s" },
  { left: "90%", top: "46%", size: 9, delay: "2.0s" },
  { left: "6%", top: "42%", size: 11, delay: "4.2s" },
];

/**
 * A prémium digitális meghívó borítéka – a /meghivo-premium minta
 * nyitóképének elemeivel és animációjával (globals.css .prm-env-*): a
 * boríték lassan lebeg és enyhén előredől, a viaszpecsét körül fénygyűrű
 * pulzál, a borítékon fény fut át, a háttérben fénypontok lebegnek.
 * A diára váltás után 1 mp-cel magától kinyílik: a pecsét széttörik, a fül
 * felnyílik, fény tör elő, és kiemelkedik a meghívólap (.mhb-env).
 */
/**
 * Egyetlen vonallal rajzolt két szív a meghívólap aljára: a vonal balról
 * fut be, kirajzolja a nagy, majd a kis szívet, és jobbra egy kis hurokkal
 * fut ki. A lap kiemelkedése után mintha tollal húznák végig
 * (globals.css .mhb-heart).
 */
const LINE_HEARTS_PATH = [
  "M2 76 C 30 69, 66 68, 90 73",
  "C 104 60, 116 46, 113 31 C 111 20, 103 15, 96 16 C 89 17, 84 22, 81 28",
  "C 77 22, 71 20, 66 20 C 56 20, 50 28, 51 38 C 52 52, 66 63, 92 74",
  "C 108 79, 130 75, 137 64 C 141 56, 134 49, 127 50 C 122 51, 118 54, 117 58",
  "C 116 51, 111 45, 104 45 C 96 46, 95 56, 99 63 C 104 73, 113 81, 128 82",
  "C 141 83, 150 79, 156 73 C 159 70, 158 67, 156 67 C 153 67, 153 71, 157 73",
  "C 164 76, 171 75, 174 72",
].join(" ");

function LineHearts() {
  return (
    <svg
      aria-hidden
      className="mhb-heart mx-auto mt-2 block w-[72%]"
      viewBox="0 12 176 74"
      fill="none"
      stroke="#8F3671"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path pathLength={1} d={LINE_HEARTS_PATH} />
    </svg>
  );
}

const ENV_W = "min(92vw, 440px)";
const ENV_OPEN_DELAY_MS = 1000;
/* A fül nyílása után emelkedik ki a lap – mint a /meghivo-premium oldalon. */
const ENV_CARD_DELAY_MS = ENV_OPEN_DELAY_MS + 900;

type EnvPhase = "closed" | "opening" | "card";

function EnvelopeScene({ label, active }: { label: string; active: boolean }) {
  const [phase, setPhase] = useState<EnvPhase>("closed");

  useEffect(() => {
    /* Elváltáskor csak az elhalványulás (700ms) után zárul vissza, hogy a
       visszacsukódás ne látsszon; legközelebb újra kinyílik. */
    if (!active) {
      const t = setTimeout(() => setPhase("closed"), 800);
      return () => clearTimeout(t);
    }
    const open = setTimeout(() => setPhase("opening"), ENV_OPEN_DELAY_MS);
    const card = setTimeout(() => setPhase("card"), ENV_CARD_DELAY_MS);
    return () => {
      clearTimeout(open);
      clearTimeout(card);
    };
  }, [active]);

  return (
    <div
      role="img"
      aria-label={label}
      data-phase={phase}
      className="mhb-env absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(70% 50% at 50% 40%, rgba(198, 94, 165, 0.26), transparent 70%), radial-gradient(50% 40% at 15% 90%, rgba(240, 213, 168, 0.12), transparent 70%), #150B18",
      }}
    >
      {SPARKS.map((sp) => (
        <span
          key={sp.left + sp.top}
          aria-hidden
          className="prm-spark"
          style={{ left: sp.left, top: sp.top, width: sp.size, height: sp.size, animationDelay: sp.delay }}
        />
      ))}

      {/* Zárva a boríték jobbra kilóg a diáról (csak a bal 2/3-a látszik);
          nyitáskor középre csúszik, és a kiemelkedő lappal együtt
          függőlegesen középen áll (globals.css .mhb-env-pos). */}
      <div className="mhb-env-pos" style={{ "--env-w": ENV_W } as React.CSSProperties}>
        <div className="prm-env-scene" style={{ width: "var(--env-w)" }}>
          <div className="prm-env">
            <span aria-hidden className="prm-env-rays" />
            <span aria-hidden className="prm-env-burst" />
            <span aria-hidden className="prm-env-back" />
            {/* A kiemelkedő meghívólap */}
            <div aria-hidden className="prm-env-card">
              <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#9A5182" }}>
                Meghívó
              </p>
              <p className="mt-2 text-[2.1rem] leading-none" style={{ color: "#8F3671", fontFamily: "'Great Vibes', cursive" }}>
                L &amp; D
              </p>
              <p className="mt-2 font-heading text-[17px] leading-snug" style={{ color: "#4A1B3D" }}>
                Lilla és Dániel
              </p>
              <p className="mt-1.5 text-[12px]" style={{ color: "#7C4468" }}>
                2027. augusztus 21. · Tihany
              </p>
              <LineHearts />
            </div>
            <span aria-hidden className="prm-env-front" />
            <span aria-hidden className="prm-env-flap" />
            <span aria-hidden className="prm-env-shine" />
            <span aria-hidden className="prm-env-seal" style={{ cursor: "default" }}>
              L&amp;D
            </span>
          </div>
        </div>
      </div>

      {/* Alsó sötétítés a szöveg alá */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[55%]" style={{ background: "linear-gradient(180deg, rgba(21,11,24,0) 0%, rgba(21,11,24,0.85) 60%, rgba(21,11,24,0.95) 100%)" }} />
    </div>
  );
}
