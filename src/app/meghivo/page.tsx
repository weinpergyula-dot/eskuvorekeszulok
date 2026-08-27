import type { Metadata } from "next";
import Link from "next/link";
import { Check, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { IntroTabs } from "./_components/intro-tabs";
import { LivePhonePreview } from "./_components/phone-preview";

export const metadata: Metadata = {
  title: "Digitális meghívók",
  description:
    "Rendelj egyedi, digitális esküvői meghívót! Mobilra szabott, interaktív meghívó visszaszámlálóval, programmal és RSVP visszajelzéssel – BASIC, SILVER és PREMIUM csomagban.",
};

/* ── Csomagok ────────────────────────────────────────────
   Mindhárom csomaghoz élő minta tartozik: BASIC
   (/zso-es-szili), SILVER (/meghivo-silver) és PREMIUM
   (/meghivo-premium). */

const PACKAGES = [
  {
    id: "basic",
    name: "BASIC",
    tagline: "Minden, ami egy gyönyörű meghívóhoz kell",
    price: "14 900 Ft",
    accent: "#84AAA6",
    accentDark: "#4F7D78",
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
    accent: "#8E99A8",
    accentDark: "#5C6675",
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
    id: "premium",
    name: "PREMIUM",
    tagline: "Teljesen egyedi, prémium élmény",
    price: "59 900 Ft-tól",
    accent: "#C65EA5",
    accentDark: "#8F3671",
    sampleHref: "/meghivo-premium",
    features: [
      "Minden a SILVER csomagból",
      "Teljesen egyedi design és animációk",
      "Élő galéria az esküvő napján",
      "Fotós- és videósanyag beépítése",
      "Korlátlan módosítás az esküvőig",
      "Személyes konzultáció",
    ],
  },
] as const;


export default function MeghivoPage() {
  return (
    <>
      <PageHeader
        title="Digitális meghívók"
        description="Felejtsd el a papírt! Készíttess mobilra szabott, interaktív esküvői meghívót, amit egyetlen linkkel elküldhetsz minden vendégednek – visszaszámlálóval, programmal és online visszajelzéssel."
        icon={MailOpen}
        backHref="/"
      />

      {/* ── Csomagok ─────────────────────────────────────── */}
      <section className="pkg-shift-bg">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Válassz csomagot!
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-gray-600">
            Minden telefonon egy-egy valódi meghívó-minta látható, kattints rá bátran,
            hogy nagyban is lásd.
          </p>

          <div className="mx-auto mt-10 grid max-w-5xl gap-8 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                id={pkg.id}
                className="mx-auto flex w-full max-w-[21rem] flex-col overflow-hidden rounded-3xl border border-gray-200 shadow-sm transition-shadow hover:shadow-lg sm:max-w-none"
                style={{
                  background: `linear-gradient(180deg, ${pkg.accent}66 0%, ${pkg.accent}33 18%, ${pkg.accent}00 42%), linear-gradient(0deg, ${pkg.accent}59 0%, ${pkg.accent}26 14%, ${pkg.accent}00 34%), #ffffff`,
                }}
              >
                {/* fejléc: színes sáv a csomag akcentusával */}
                <div className="relative px-6 pb-6 pt-8 text-center">
                  {/* felső élcsík */}
                  <span
                    className="absolute inset-x-0 top-0 h-2"
                    style={{ backgroundColor: pkg.accent }}
                    aria-hidden
                  />
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[15px] font-extrabold uppercase tracking-[0.22em] text-white shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${pkg.accent} 0%, ${pkg.accentDark} 100%)`,
                    }}
                  >
                    {pkg.name}
                  </span>
                  <p className="mt-3 text-sm leading-snug text-gray-700">{pkg.tagline}</p>
                </div>

                {/* telefon */}
                <div className="px-6 pb-2 pt-6">
                  <LivePhonePreview href={pkg.sampleHref} label={pkg.name} />
                </div>
                <p className="px-6 text-center text-xs text-gray-400">
                  Kattints a telefonra a minta megnyitásához
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
                <div className="border-t border-white/60 px-6 py-5 text-center">
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
        </div>
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
