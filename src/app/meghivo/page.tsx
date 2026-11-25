import type { Metadata } from "next";
import Link from "next/link";
import { MailOpen, Send, Sparkles, ArrowLeft, ArrowDown, Timer, CalendarHeart, MessageSquareHeart, Link2 } from "lucide-react";
import { MiniPhone } from "@/components/providers/meghivo-promo-card";
import { IntroTabs } from "./_components/intro-tabs";
import { PackageTile, type Package } from "./_components/package-tile";
import { VisitTracker } from "@/components/home/visit-tracker";
import { MeghivoQuoteCta } from "./_components/quote-cta";

export const metadata: Metadata = {
  title: "Digitális meghívók",
  description:
    "Rendelj egyedi, digitális esküvői meghívót! Mobilra szabott, interaktív meghívó visszaszámlálóval, programmal és RSVP visszajelzéssel – BASIC, SILVER és GOLD csomagban.",
};

/* ── Csomagok ────────────────────────────────────────────
   Kollázs-elrendezés: két négyzetes csempe (BASIC, SILVER)
   és alattuk a széles GOLD blokk. Mindhárom csomaghoz
   élő minta tartozik: /zso-es-szili, /meghivo-silver és
   /meghivo-gold. */

/** Minden extra egységesen +3 000 Ft, a személyes konzultáció óradíjas. */
const EXTRA_PRICE = "+3 000 Ft";

const PACKAGES: Package[] = [
  {
    id: "basic",
    name: "BASIC",
    tagline: "Minden, ami egy gyönyörű meghívóhoz kell",
    price: "14 900 Ft",
    priceNote: "Az ár a választott extráktól függ",
    from: "#9CC0BC",
    accent: "#6E9995",
    to: "#3F6C68",
    ink: "#2D5854",
    sampleHref: "/zso-es-szili",
    features: [
      "Mobilra szabott meghívó",
      "Visszaszámláló a nagy napig",
      "Történetetek idővonalon",
      "A nap programja óráról órára",
      "Online visszajelzés",
      "Saját link a neveitekkel",
    ],
    extras: [
      { label: "Fotógaléria rólatok (10 képig)", price: EXTRA_PRICE },
      { label: "Választható arculati szín", price: EXTRA_PRICE },
      { label: "Kétnyelvű meghívó", price: EXTRA_PRICE },
    ],
  },
  {
    id: "silver",
    name: "SILVER",
    tagline: "A BASIC csomag, extrákkal megspékelve",
    price: "24 900 Ft",
    priceNote: "Az ár a választott extráktól függ",
    from: "#A9B3C1",
    accent: "#77828F",
    to: "#4B5460",
    ink: "#4B5460",
    sampleHref: "/meghivo-silver",
    features: [
      "Minden a BASIC csomagból",
      "Fotógaléria rólatok (10 képig)",
      "Választható arculati szín",
      "Háttérzene a kedvenc dalotokkal",
      "Vendégkönyv – üzenetek nektek",
      "Interaktív térkép a helyszínekhez",
    ],
    extras: [
      { label: "Saját háttérzene feltöltése", price: EXTRA_PRICE },
      { label: "Vendéglista exportálása", price: EXTRA_PRICE },
    ],
  },
  {
    id: "gold",
    name: "GOLD",
    tagline: "Teljesen egyedi, prémium élmény – animációkkal",
    price: "39 900 Ft",
    oldPrice: "49 900 Ft",
    priceNote: "Az ár a választott extráktól függ",
    from: "#BBA57F",
    accent: "#997E4E",
    to: "#614E2D",
    ink: "#7E6842",
    sampleHref: "/meghivo-gold",
    features: [
      "Minden a SILVER csomagból",
      "Választható arculati szín",
      "Animált boríték-felnyitás pecséttel",
      "Lekaparható, játékos dátumfelfedés",
      "Korlátlan módosítás az esküvőig",
    ],
    extras: [
      { label: "Egyedi illusztráció és monogram", price: EXTRA_PRICE },
      { label: "Videós köszöntő beágyazása", price: EXTRA_PRICE },
      { label: "Személyes konzultáció, saját designer", price: "+10 000 Ft / óra" },
    ],
  },
];

const HERO_FEATURES = [
  { Icon: Timer, label: "Visszaszámláló" },
  { Icon: CalendarHeart, label: "Program óráról órára" },
  { Icon: MessageSquareHeart, label: "Online visszajelzés" },
  { Icon: Link2, label: "Saját link a neveitekkel" },
];

const GOLD = "#C9A46A";
const DARK_BG = "radial-gradient(120% 90% at 70% 30%, #3A2F20 0%, #1E1912 55%, #120F0B 100%)";

export default function MeghivoPage() {
  const [basic, silver, gold] = PACKAGES;

  return (
    <>
      {/* Látogatás rögzítése (napi/heti egyedi IP statisztika az adminban) */}
      <VisitTracker path="/meghivo" />

      {/* ── Nyitókép: sötét–arany, a meghívó-ajánlat kártyájának stílusában ── */}
      <section className="relative -mt-6 overflow-hidden text-white" style={{ background: DARK_BG }}>
        <span aria-hidden className="pointer-events-none absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-[#C9A46A]/25 blur-3xl transform-gpu" />
        <span aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#C9A46A]/10 blur-3xl transform-gpu" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:px-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[14px] font-semibold text-white/90 ring-1 ring-white/20 hover:bg-white/15">
              <ArrowLeft className="h-4 w-4" /> Vissza
            </Link>
            <p className="mt-6 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>
              <Sparkles className="h-4 w-4" /> Saját szolgáltatás · 3 csomag
            </p>
            <h1 className="mt-2 font-heading text-[36px] font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Digitális esküvői meghívó
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/75 sm:text-lg">
              Felejtsd el a papírt! Mobilra szabott, interaktív meghívó, amit egyetlen linkkel
              elküldhetsz minden vendégednek.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {HERO_FEATURES.map(({ Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-[13px] text-white/90 ring-1 ring-white/15">
                  <Icon className="h-4 w-4" style={{ color: GOLD }} />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-4">
              <p className="text-[13px] leading-tight text-white/65">
                már
                <span className="block font-heading text-[34px] font-bold leading-none text-white">14&nbsp;900&nbsp;Ft</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                <a href="#csomagok" className="tile-cta-gold inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold">
                  Csomagok <ArrowDown className="h-4 w-4" />
                </a>
                <MeghivoQuoteCta
                  href="/profil?tab=quotes&form=meghivo"
                  className="tile-cta inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold"
                >
                  <Send className="h-4 w-4" />
                  Ajánlatkérés
                </MeghivoQuoteCta>
              </div>
            </div>
          </div>

          {/* A három csomag mintája legyezőszerűen */}
          <div aria-hidden className="relative flex h-[300px] items-center justify-center sm:h-[400px]">
            <span className="pointer-events-none absolute inset-x-10 bottom-6 top-10 rounded-full bg-[#C9A46A]/20 blur-3xl transform-gpu" />
            <MiniPhone src="/meghivo/slide-basic.webp" label="Basic" maxH="max-h-[260px] sm:max-h-[340px]" className="z-0 -mr-10 translate-y-4 -rotate-[10deg]" />
            <MiniPhone src="/meghivo/slide-gold.webp" label="Gold" maxH="max-h-[260px] sm:max-h-[340px]" className="z-10 -translate-y-1 scale-110" />
            <MiniPhone src="/meghivo/slide-silver.webp" label="Silver" maxH="max-h-[260px] sm:max-h-[340px]" className="z-0 -ml-10 translate-y-4 rotate-[10deg]" />
          </div>
        </div>
        {/* Lefelé kerekedő átmenet a fehér tartalomba */}
        <div className="relative h-8 rounded-t-[32px] bg-white" aria-hidden />
      </section>

      {/* ── Csomagok kollázsban ──────────────────────────── */}
      <section id="csomagok" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-8">
          <p className="text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-[#B8925A]">Csomagok</p>
          <h2 className="mt-1 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Válassz csomagot!
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-600">
            Minden telefonon egy-egy valódi meghívó-minta látható, kattints rá bátran,
            hogy nagyban is lásd.
          </p>

          <div className="mt-10 grid gap-6 sm:mt-14 lg:grid-cols-2">
            <PackageTile pkg={basic} variant="square" />
            <PackageTile pkg={silver} variant="square" />
            <PackageTile pkg={gold} variant="wide" />
          </div>
        </div>

        {/* Elválasztó a csomagok alatt – ugyanaz a halvány teal vonal,
            mint a Vissza gomb alatt */}
        <div
          className="mx-auto max-w-6xl border-b px-4 sm:px-6 lg:px-8"
          style={{ borderColor: "rgba(45, 88, 84, 0.16)" }}
          aria-hidden
        />
      </section>

      {/* ── Bevezető: Miért népszerű? / Hogyan működik? (tabok) ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <IntroTabs />
        </div>
      </section>

      {/* ── Záró CTA: sötét–arany kártya ─────────────────── */}
      <section className="bg-white px-3 pb-12 sm:px-6 sm:pb-16">
        <div
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] px-6 py-12 text-center text-white ring-1 ring-[#B8925A]/45 shadow-[0_30px_60px_-30px_rgba(40,28,10,0.7)] sm:py-16"
          style={{ background: DARK_BG }}
        >
          <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-[#C9A46A]/25 blur-3xl transform-gpu" />
          <span aria-hidden className="pointer-events-none absolute inset-2 rounded-[26px] ring-1 ring-[#C9A46A]/20" />
          <div className="relative">
            <MailOpen className="mx-auto h-9 w-9" style={{ color: GOLD }} strokeWidth={1.5} />
            <h2 className="mt-3 font-heading text-2xl font-bold md:text-3xl">Egyedi meghívót szeretnél?</h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/75">
              Írjatok nekünk pár sort az esküvőtökről, és 48 órán belül jelentkezünk
              egy személyre szabott ajánlattal.
            </p>
            <div className="mt-7 flex justify-center">
              <MeghivoQuoteCta
                href="/profil?tab=quotes&form=meghivo"
                className="tile-cta inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-[15px] font-semibold"
              >
                <Send className="h-4 w-4" />
                Ajánlatkérés
              </MeghivoQuoteCta>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
