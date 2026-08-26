import type { Metadata } from "next";
import Link from "next/link";
import { Check, Clock, ExternalLink, Heart, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { IntroTabs } from "./_components/intro-tabs";

export const metadata: Metadata = {
  title: "Digitális meghívók",
  description:
    "Rendelj egyedi, digitális esküvői meghívót! Mobilra szabott, interaktív meghívó visszaszámlálóval, programmal és RSVP visszajelzéssel – BASIC, SILVER, GOLD és PREMIUM csomagban.",
};

/* ── Csomagok ────────────────────────────────────────────
   A BASIC csomaghoz élő minta tartozik (/zso-es-szili), a
   többi csomag mintája még készül – ott üres telefon-
   előnézet jelenik meg. */

const PACKAGES = [
  {
    id: "basic",
    name: "BASIC",
    tagline: "Minden, ami egy gyönyörű meghívóhoz kell",
    price: "14 900 Ft",
    accent: "#84AAA6",
    sampleHref: "/zso-es-szili",
    features: [
      "Egyoldalas, mobilra szabott meghívó",
      "Visszaszámláló a nagy napig",
      "Történetetek idővonalon",
      "A nap programja óráról órára",
      "Hasznos infók (dress code, szállás…)",
      "RSVP – online visszajelzés a vendégektől",
      "Saját link a neveitekkel",
    ],
  },
  {
    id: "silver",
    name: "SILVER",
    tagline: "A BASIC csomag, extrákkal megspékelve",
    price: "24 900 Ft",
    accent: "#9AA5B1",
    sampleHref: "/meghivo-silver",
    features: [
      "Minden a BASIC csomagból",
      "Fotógaléria a közös képeitekből",
      "Háttérzene a kedvenc dalotokkal",
      "Vendégkönyv – üzenetek a pártól",
      "Interaktív térkép a helyszínekhez",
    ],
  },
  {
    id: "gold",
    name: "GOLD",
    tagline: "Többoldalas meghívó, több nyelven",
    price: "39 900 Ft",
    accent: "#C9A227",
    sampleHref: null,
    features: [
      "Minden a SILVER csomagból",
      "Több aloldal (program, szállás, GYIK)",
      "Kétnyelvű változat (pl. magyar–angol)",
      "QR-kód a nyomtatott meghívóhoz",
      "Ültetési rend és menü aloldal",
    ],
  },
  {
    id: "premium",
    name: "PREMIUM",
    tagline: "Teljesen egyedi, prémium élmény",
    price: "59 900 Ft-tól",
    accent: "#C65EA5",
    sampleHref: null,
    features: [
      "Minden a GOLD csomagból",
      "Teljesen egyedi design és animációk",
      "Élő galéria az esküvő napján",
      "Fotós- és videósanyag beépítése",
      "Korlátlan módosítás az esküvőig",
      "Személyes konzultáció",
    ],
  },
] as const;


/* ── Telefon-mockup ──────────────────────────────────────
   228px széles "kijelzőn" egy 390px-es mobilnézet fut,
   0.5846-os kicsinyítéssel – így printscreen-szerű, éles
   előnézetet ad az élő oldalról. */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[216px] shrink-0 rounded-[2.4rem] bg-gray-900 p-[9px] shadow-[0_24px_50px_-16px_rgba(45,88,84,0.45)]">
      {/* oldalgombok */}
      <div className="absolute -left-[2px] top-20 h-9 w-[3px] rounded-l bg-gray-700" aria-hidden />
      <div className="absolute -left-[2px] top-32 h-9 w-[3px] rounded-l bg-gray-700" aria-hidden />
      <div className="absolute -right-[2px] top-24 h-12 w-[3px] rounded-r bg-gray-700" aria-hidden />
      <div className="relative h-[428px] w-[198px] overflow-hidden rounded-[1.9rem] bg-white">
        {children}
        {/* kamera-sziget */}
        <div className="absolute left-1/2 top-[8px] z-20 h-[14px] w-[62px] -translate-x-1/2 rounded-full bg-gray-900" aria-hidden />
      </div>
    </div>
  );
}

function LivePhonePreview({ href, label }: { href: string; label: string }) {
  return (
    <PhoneFrame>
      {/* Élő, kicsinyített előnézet – nem kattintható, a fölé
          rakott link nyitja meg az igazi oldalt. */}
      <iframe
        src={href}
        title={`${label} – előnézet`}
        aria-hidden
        tabIndex={-1}
        loading="lazy"
        className="pointer-events-none absolute left-0 top-0 origin-top-left select-none border-0"
        /* 390px a látható tartalom + 20px a görgetősávnak, amit a telefon
           kerete levág – így nem látszik csík a kijelző szélén. */
        style={{ width: 410, height: 843, transform: "scale(0.5077)" }}
      />
      <Link
        href={href}
        target="_blank"
        rel="noopener"
        className="group absolute inset-0 z-10 flex items-end justify-center rounded-[2rem] pb-5"
        aria-label={`${label} minta megnyitása új lapon`}
      >
        <span className="inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-gray-900/80 px-4 py-2 text-sm font-semibold text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Minta megnyitása
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </Link>
    </PhoneFrame>
  );
}

function PlaceholderPhonePreview({ accent }: { accent: string }) {
  return (
    <PhoneFrame>
      <div
        className="flex h-full w-full flex-col items-center px-5 pb-6 pt-12 text-center"
        style={{ background: `linear-gradient(180deg, ${accent}22 0%, #ffffff 55%)` }}
      >
        {/* vázlatos meghívó-előnézet */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full border-2"
          style={{ borderColor: accent, color: accent }}
        >
          <Heart className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <div className="mt-4 h-2.5 w-32 rounded-full bg-gray-300" />
        <div className="mt-2 h-2.5 w-24 rounded-full bg-gray-200" />
        <div className="mt-6 h-px w-16" style={{ backgroundColor: accent }} />
        <div className="mt-6 grid w-full grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-gray-100" />
          ))}
        </div>
        <div className="mt-5 h-2 w-full rounded-full bg-gray-100" />
        <div className="mt-2 h-2 w-4/5 rounded-full bg-gray-100" />
        <div className="mt-2 h-2 w-full rounded-full bg-gray-100" />
        <div className="mt-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: accent }}>
          <Clock className="h-3.5 w-3.5" />
          Minta hamarosan
        </div>
      </div>
    </PhoneFrame>
  );
}

export default function MeghivoPage() {
  return (
    <>
      <PageHeader
        title="Digitális meghívók"
        description="Felejtsd el a papírt! Készíttess mobilra szabott, interaktív esküvői meghívót, amit egyetlen linkkel elküldhetsz minden vendégednek – visszaszámlálóval, programmal és online visszajelzéssel."
        icon={MailOpen}
        ctaLabel="Ajánlatot kérek"
        ctaHref="/kapcsolat"
        roundedBottom={false}
      />

      {/* ── Bevezető: Miért népszerű? / Hogyan működik? (tabok) ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <IntroTabs />
        </div>
      </section>

      {/* ── Csomagok ─────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-[#F9F9F9]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Válassz csomagot!
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-600">
            Minden telefonon egy-egy valódi meghívó-minta látható. A BASIC és a SILVER mintánk már
            élőben megnézhető – kattints rá bátran! A többi csomag mintája hamarosan érkezik.
          </p>

          <div className="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-2 xl:grid-cols-4">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                id={pkg.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                {/* fejléc */}
                <div className="px-6 pt-6 text-center">
                  <span
                    className="inline-flex items-center rounded-lg px-5 py-1.5 text-[15px] font-extrabold uppercase tracking-[0.22em] text-white shadow-sm ring-1 ring-inset ring-white/25"
                    style={{ backgroundColor: pkg.accent }}
                  >
                    {pkg.name}
                  </span>
                  <p className="mt-3 min-h-[2.5rem] text-[15px] text-gray-600">{pkg.tagline}</p>
                </div>

                {/* telefon */}
                <div className="px-6 pb-2 pt-6">
                  {pkg.sampleHref ? (
                    <LivePhonePreview href={pkg.sampleHref} label={pkg.name} />
                  ) : (
                    <PlaceholderPhonePreview accent={pkg.accent} />
                  )}
                </div>
                <p className="px-6 text-center text-xs text-gray-400">
                  {pkg.sampleHref
                    ? "Kattints a telefonra a minta megnyitásához"
                    : "A minta jelenleg készül"}
                </p>

                {/* tartalom */}
                <ul className="flex-1 space-y-2.5 px-6 pb-6 pt-5 text-[15px] text-gray-700">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0"
                        strokeWidth={2.5}
                        style={{ color: pkg.accent }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* ár + CTA */}
                <div className="border-t border-gray-100 px-6 py-5 text-center">
                  <p className="text-2xl font-bold text-gray-900">{pkg.price}</p>
                  <Link href="/kapcsolat" className="mt-3 block">
                    <Button
                      size="lg"
                      className="w-full text-white hover:opacity-90"
                      style={{ backgroundColor: pkg.accent }}
                    >
                      Ajánlatot kérek
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Az árak tájékoztató jellegűek – a végleges ár az egyedi igényektől függ.
          </p>
        </div>
      </section>

      {/* ── Záró CTA ─────────────────────────────────────── */}
      <section className="teal-shift-bg relative overflow-hidden">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Készen álltok a saját meghívótokra?
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
