"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  /** A háttérfotó; ha nincs, a dia saját rajzolt jelenetet kap (overlay). */
  img?: string;
  alt: string;
  /** A kép kivágásának fókusza (object-position). */
  focus: string;
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
    img: "/hero-m/eskuvo.webp",
    alt: "Menyasszony hajdísszel és csokorral",
    focus: "35% 30%",
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

const INTERVAL_MS = 6000;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const CTA =
  "inline-flex h-12 items-center justify-center gap-1.5 rounded-xl px-6 text-[15px] font-bold transition-colors";

export function MobileHeroBanner() {
  /* Csak mobilon töltjük előre: az első kép magas, a többi alacsony
     prioritással. */
  SLIDES.forEach((s, i) =>
    s.img && preload(s.img, { as: "image", fetchPriority: i === 0 ? "high" : "low", media: "(max-width: 767px)" }),
  );

  const [index, setIndex] = useState(0);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? reduced;
  const loggedIn = useIsLoggedIn();

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [paused, index]);

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
      className="mobile-hero relative z-20 -mt-6 overflow-hidden rounded-b-[32px] border-b border-white bg-gray-900"
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
            className={`absolute inset-0 transition-opacity duration-700 ${on ? "z-[1] opacity-100" : "pointer-events-none opacity-0"}`}
          >
            {/* A fotó lassú ráközelítéssel (csak az aktív dián) */}
            {s.img && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={s.img}
                alt={s.alt}
                decoding="sync"
                fetchPriority={i === 0 ? "high" : "low"}
                className={`absolute inset-0 h-full w-full object-cover ${on ? "mobile-hero-zoom" : ""}`}
                style={{ objectPosition: s.focus }}
              />
            )}

            {/* A meghívós dia rajzolt jelenete: a prémium minta lila borítéka */}
            {s.overlay === "envelope" && <EnvelopeScene label={s.alt} />}

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
                  s.key === "torta" ? "right-5 top-[22%] bg-[#F6E3E6] text-[#A0566B]" : "right-5 top-[16%] bg-white/90 text-[#B5677D]"
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
                    {s.category ? <ArrowRight className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
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
 * A prémium digitális meghívó zárt borítéka – a /meghivo-premium minta
 * nyitóképének elemeivel és animációjával (globals.css .prm-env-*): a
 * boríték lassan lebeg és enyhén előredől, a viaszpecsét körül fénygyűrű
 * pulzál, a borítékon fény fut át, a háttérben fénypontok lebegnek.
 */
function EnvelopeScene({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(70% 50% at 50% 34%, rgba(198, 94, 165, 0.26), transparent 70%), radial-gradient(50% 40% at 15% 90%, rgba(240, 213, 168, 0.12), transparent 70%), #150B18",
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

      <div className="absolute left-1/2 top-[13%] -translate-x-1/2">
        <div className="prm-env-scene" style={{ width: "min(80vw, 380px)" }}>
          <div className="prm-env">
            <span aria-hidden className="prm-env-back" />
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
