import type { Metadata } from "next";
import {
  Smartphone,
  Wifi,
  Tv,
  Phone,
  CreditCard,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Gift,
  Sparkles,
  Leaf,
  MapPin,
  Download,
  HelpCircle,
} from "lucide-react";
import { OffersExplorer } from "./_components/offers-explorer";
import { YettelHeader } from "./_components/yettel-header";
import { YettelFooter } from "./_components/yettel-footer";
import { DEVICES, formatFt } from "./_data/offers";

export const metadata: Metadata = {
  title: "Yettel – Mobil, internet és TV egy helyen",
  description:
    "Átlátható csomagok és konkrét ajánlatok: havidíjas mobil, otthoni internet és TV. Válaszd ki a hozzád illő legjobb csomagot pár perc alatt.",
  robots: { index: false, follow: false },
};

const CATEGORIES = [
  { icon: Smartphone, label: "Havidíjas mobil", desc: "Korlátlan hívás, 5G", href: "#havidijas" },
  { icon: Wifi, label: "Otthoni internet", desc: "Optikai & 5G", href: "#internet" },
  { icon: Tv, label: "Yettel TV", desc: "Élő adás & felvétel", href: "#tv" },
  { icon: Smartphone, label: "Készülékek", desc: "Telefon részletre", href: "#keszulekek" },
  { icon: CreditCard, label: "Feltöltőkártya", desc: "Kötöttség nélkül", href: "#ajanlatok" },
  { icon: Briefcase, label: "Üzleti", desc: "Céges megoldások", href: "#ajanlatok" },
];

const VALUE_PROPS = [
  { icon: ShieldCheck, title: "Megbízható 5G hálózat", desc: "Az ország 99%-át lefedő hálózat, stabil sebesség otthon és úton." },
  { icon: Gift, title: "Yettel Zóna kedvezmények", desc: "Heti ajándékok, mozijegyek és partnerkedvezmények az appban." },
  { icon: Sparkles, title: "Ügyintézés percek alatt", desc: "Szerződés, feltöltés, csomagváltás – mindent elintézel online." },
  { icon: Leaf, title: "Fenntartható működés", desc: "Újrahasznosított készülékek és zöld energiával működő hálózat." },
];

const SUPPORT_LINKS = [
  { icon: CreditCard, label: "Egyenlegfeltöltés" },
  { icon: Phone, label: "Számlabefizetés" },
  { icon: MapPin, label: "Üzletkereső" },
  { icon: ShieldCheck, label: "SIM aktiválás" },
  { icon: HelpCircle, label: "Gyakori kérdések" },
];

export default function YettelWebPage() {
  return (
    <div className="yettel-root min-h-screen bg-[#F1F5FC]">
      {/* Yettel tipográfia: Sora (címek) + Manrope (szöveg) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap"
        rel="stylesheet"
      />

      <YettelHeader />

      <main>
        {/* ── Hero (lime, mint a /yettel_light_asis) ────────── */}
        <section className="bg-[#C6F24E]">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#4F7A00]">
                <Sparkles className="h-3.5 w-3.5" />
                Új ügyfeleknek: online kedvezmény minden csomagra
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#14245E] sm:text-[2.6rem]">
                Minden szolgáltatásod egy helyen.
              </h1>
              <p className="mt-3 max-w-md text-base text-[#2C3A63]">
                Mobil, internet és TV – nincs kisbetűs meglepetés. Válaszd ki a hozzád illő csomagot konkrét árakkal, és
                pár perc alatt megrendeled.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#ajanlatok"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#14245E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0B1330]"
                >
                  Ajánlott csomagok
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#internet"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#14245E]/25 bg-white px-5 py-3 text-sm font-bold text-[#14245E] transition-colors hover:border-[#14245E]"
                >
                  Otthoni internet
                </a>
              </div>
              <p className="mt-4 text-xs font-semibold text-[#14245E]/70">
                Hűségidő nélkül is választható · Ingyenes bekötés · 14 napos elállás
              </p>
            </div>

            {/* Kompakt kiemelő kártya nagy kép helyett */}
            <div className="md:justify-self-end">
              <div className="w-full max-w-sm rounded-[22px] border border-[#E6EAF2] bg-white p-5 shadow-[0_18px_50px_rgba(20,36,94,0.18)]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#14245E] px-3 py-1 text-xs font-bold text-white">
                  A hét ajánlata
                </span>
                <h2 className="mt-3 text-lg font-extrabold text-[#14245E]">Teljes csomag</h2>
                <p className="text-sm text-[#5B6684]">Net 500 + TV Extra + Yettel M mobil</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-[#14245E]">{formatFt(14990)}</span>
                  <span className="pb-1 text-sm text-[#5B6684]">/ hó</span>
                  <span className="pb-1 text-sm text-[#9AA3BC] line-through">{formatFt(17470)}</span>
                </div>
                <p className="mt-1 text-sm font-bold text-[#4F7A00]">Havi ~2 480 Ft megtakarítás, egy számlán.</p>
                <a
                  href="#ajanlatok"
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#C6F24E] px-4 py-2.5 text-sm font-bold text-[#14245E] transition-colors hover:bg-[#b6e63a]"
                >
                  Megnézem <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Gyors kategóriák ─────────────────────────────── */}
        <section className="border-b border-[#E6EAF2] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.label}
                  href={cat.href}
                  className="group flex flex-col items-start gap-2 rounded-[18px] border border-[#E6EAF2] p-4 transition-colors hover:border-[#C6F24E] hover:bg-[#FBFEF3]"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#C6F24E] text-[#14245E]">
                    <cat.icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="text-sm font-bold text-[#14245E]">{cat.label}</span>
                  <span className="text-xs text-[#5B6684]">{cat.desc}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ajánlott csomagok (a kiemelt szekció) ────────── */}
        <section id="ajanlatok" className="scroll-mt-16 bg-[#F1F5FC]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-8 max-w-2xl">
              <span className="text-sm font-bold text-[#4F7A00]">Ajánljuk neked</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#14245E] sm:text-3xl">
                A legjobb csomagok, kategóriánként
              </h2>
              <p className="mt-2 text-base text-[#5B6684]">
                Összeválogattuk a legnépszerűbb havidíjas mobil, otthoni internet és TV csomagokat – konkrét árakkal,
                hogy könnyen összehasonlíthasd őket.
              </p>
            </div>
            {/* Anchor célok az egyes fülekhez */}
            <span id="havidijas" className="block -mt-16 pt-16" aria-hidden />
            <span id="internet" className="block -mt-16 pt-16" aria-hidden />
            <span id="tv" className="block -mt-16 pt-16" aria-hidden />
            <OffersExplorer />
          </div>
        </section>

        {/* ── Készülékek ───────────────────────────────────── */}
        <section id="keszulekek" className="scroll-mt-16 border-b border-t border-[#E6EAF2] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-sm font-bold text-[#4F7A00]">Készülékek</span>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#14245E] sm:text-3xl">
                  Új telefon, 0 Ft előleggel
                </h2>
              </div>
              <a href="#" className="inline-flex items-center gap-1 text-sm font-bold text-[#4F7A00] hover:underline">
                Összes készülék <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {DEVICES.map((device) => (
                <div
                  key={device.id}
                  className="flex flex-col rounded-[20px] border border-[#E6EAF2] p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(20,36,94,0.08)]"
                >
                  <div className="mb-4 grid h-28 place-items-center rounded-2xl bg-[#F1F5FC]">
                    <Smartphone className="h-12 w-12 text-[#C4D1E1]" strokeWidth={1.25} />
                  </div>
                  <h3 className="text-base font-extrabold text-[#14245E]">{device.name}</h3>
                  <p className="text-xs text-[#5B6684]">{device.note}</p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-2xl font-extrabold tracking-tight text-[#14245E]">{formatFt(device.monthly)}</span>
                    <span className="pb-1 text-sm text-[#5B6684]">/ hó</span>
                  </div>
                  <p className="text-xs font-semibold text-[#4F7A00]">{device.upfront}</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#C7D0E4] px-4 py-2.5 text-sm font-bold text-[#14245E] transition-colors hover:border-[#14245E] hover:bg-[#F1F5FC]"
                  >
                    Részletek <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Miért a Yettel? ──────────────────────────────── */}
        <section className="bg-[#F1F5FC]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-[#14245E] sm:text-3xl">Miért a Yettel?</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUE_PROPS.map((vp) => (
                <div key={vp.title} className="rounded-[20px] border border-[#E6EAF2] bg-white p-5">
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#C6F24E] text-[#14245E]">
                    <vp.icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <h3 className="text-base font-extrabold text-[#14245E]">{vp.title}</h3>
                  <p className="mt-1 text-sm text-[#5B6684]">{vp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MyYettel app ─────────────────────────────────── */}
        <section className="border-t border-[#E6EAF2] bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
            <div>
              <span className="text-sm font-bold text-[#4F7A00]">MyYettel alkalmazás</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#14245E] sm:text-3xl">
                Az egész előfizetésed a zsebedben
              </h2>
              <p className="mt-2 max-w-md text-base text-[#5B6684]">
                Kövesd a felhasználásod, fizesd be a számlád, válts csomagot vagy vedd át a heti Yettel Zóna ajándékodat –
                mindezt egyetlen appból.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#3A4A6B]">
                {["Valós idejű adat- és keretfigyelés", "Egyérintéses számlabefizetés", "Csomagváltás kötöttség nélkül"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#C6F24E] text-[#14245E]">
                        <ArrowRight className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  )
                )}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#14245E] px-4 py-2.5 text-sm font-bold text-white">
                  <Download className="h-4 w-4" /> App Store
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#14245E] px-4 py-2.5 text-sm font-bold text-white">
                  <Download className="h-4 w-4" /> Google Play
                </span>
              </div>
            </div>
            <div className="md:justify-self-end">
              <div className="mx-auto grid h-56 w-40 place-items-center rounded-[2rem] border-4 border-[#14245E] bg-[#C6F24E]">
                <span className="flex items-baseline gap-0.5">
                  <span className="text-xl font-extrabold text-[#14245E]">Yettel</span>
                  <span
                    aria-hidden
                    className="inline-block h-0 w-0 border-x-[5px] border-b-[8px] border-x-transparent border-b-[#14245E]"
                  />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ügyfélszolgálat ──────────────────────────────── */}
        <section id="ugyfelszolgalat" className="scroll-mt-16 bg-[#F1F5FC]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-6">
              <span className="text-sm font-bold text-[#4F7A00]">Gyors ügyintézés</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#14245E] sm:text-3xl">
                Miben segíthetünk?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {SUPPORT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href="#"
                  className="group flex flex-col items-center gap-2 rounded-[18px] border border-[#E6EAF2] bg-white p-5 text-center transition-colors hover:border-[#C6F24E]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#C6F24E] text-[#14245E]">
                    <link.icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="text-sm font-semibold text-[#14245E]">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Hírlevél / CTA ───────────────────────────────── */}
        <section id="belepes" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="rounded-[28px] bg-[#14245E] px-6 py-10 text-center sm:px-10">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Ne maradj le a legjobb ajánlatokról
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#C4D1E1]">
                Iratkozz fel, és elsőként küldjük az akciókat, Yettel Zóna ajándékokat és exkluzív kedvezményeket.
              </p>
              <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" aria-label="Hírlevél feliratkozás">
                <input
                  type="email"
                  required
                  placeholder="E-mail cím"
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-[#8DA0C9] focus:border-[#C6F24E] focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C6F24E] px-5 py-3 text-sm font-bold text-[#14245E] transition-colors hover:bg-[#b6e63a]"
                >
                  Feliratkozom <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-3 text-xs text-[#8DA0C9]">A feliratkozással elfogadod az adatkezelési tájékoztatót.</p>
            </div>
          </div>
        </section>
      </main>

      <YettelFooter />
    </div>
  );
}
