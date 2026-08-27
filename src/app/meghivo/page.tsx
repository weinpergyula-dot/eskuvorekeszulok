import type { Metadata } from "next";
import Link from "next/link";
import { MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { IntroTabs } from "./_components/intro-tabs";
import { PackageTile, type Package } from "./_components/package-tile";

export const metadata: Metadata = {
  title: "Digitális meghívók",
  description:
    "Rendelj egyedi, digitális esküvői meghívót! Mobilra szabott, interaktív meghívó visszaszámlálóval, programmal és RSVP visszajelzéssel – BASIC, SILVER és PREMIUM csomagban.",
};

/* ── Csomagok ────────────────────────────────────────────
   Kollázs-elrendezés: két négyzetes csempe (BASIC, SILVER)
   és alattuk a széles PREMIUM blokk. Mindhárom csomaghoz
   élő minta tartozik: /zso-es-szili, /meghivo-silver és
   /meghivo-premium. */

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
    id: "premium",
    name: "PREMIUM",
    tagline: "Teljesen egyedi, prémium élmény – animációkkal",
    price: "39 900 Ft",
    oldPrice: "49 900 Ft",
    priceNote: "Az ár a választott extráktól függ",
    from: "#CE7CB0",
    accent: "#A8437F",
    to: "#6B2455",
    ink: "#8F3671",
    sampleHref: "/meghivo-premium",
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

export default function MeghivoPage() {
  const [basic, silver, premium] = PACKAGES;

  return (
    <>
      <PageHeader
        title="Digitális meghívók"
        description="Felejtsd el a papírt! Készíttess mobilra szabott, interaktív esküvői meghívót, amit egyetlen linkkel elküldhetsz minden vendégednek – visszaszámlálóval, programmal és online visszajelzéssel."
        icon={MailOpen}
        backHref="/"
      />

      {/* ── Csomagok kollázsban ──────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Válassz csomagot!
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-600">
            Minden telefonon egy-egy valódi meghívó-minta látható, kattints rá bátran,
            hogy nagyban is lásd.
          </p>

          <div className="mt-10 grid gap-6 sm:mt-14 lg:grid-cols-2">
            <PackageTile pkg={basic} variant="square" />
            <PackageTile pkg={silver} variant="square" />
            <PackageTile pkg={premium} variant="wide" />
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

      {/* ── Záró CTA ─────────────────────────────────────── */}
      <section className="teal-shift-bg relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Egyedi meghívót szeretnél?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/90">
            Írjatok nekünk pár sort az esküvőtökről, és 48 órán belül jelentkezünk
            egy személyre szabott ajánlattal.
          </p>
          <div className="mt-7 flex justify-center">
            <Link href="/kapcsolat">
              <Button size="lg" className="bg-white px-8 text-[#2D5854] hover:bg-white/90">
                Ajánlatot kérek
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
