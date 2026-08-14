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
    <div className="yettel-root min-h-screen bg-[#E4F2F7]">
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
        <section className="bg-[#B4FF00]">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#2D466C]">
                <Sparkles className="h-3.5 w-3.5" />
                Új ügyfeleknek: online kedvezmény minden csomagra
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#002340] sm:text-[2.6rem]">
                Minden szolgáltatásod egy helyen.
              </h1>
              <p className="mt-3 max-w-md text-base text-[#2D466C]">
                Mobil, internet és TV – nincs kisbetűs meglepetés. Válaszd ki a hozzád illő csomagot konkrét árakkal, és
                pár perc alatt megrendeled.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#ajanlatok"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#002340] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#001D36]"
                >
                  Ajánlott csomagok
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#internet"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#002340]/25 bg-white px-5 py-3 text-sm font-bold text-[#002340] transition-colors hover:border-[#002340]"
                >
                  Otthoni internet
                </a>
              </div>
              <p className="mt-4 text-xs font-semibold text-[#002340]/70">
                Hűségidő nélkül is választható · Ingyenes bekötés · 14 napos elállás
              </p>
            </div>

            {/* Hero kép (család laptoppal) + lebegő ajánlatkártya */}
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/yettel/hero-family.png"
                alt="Család együtt böngészik a laptopon"
                className="block w-full"
              />
              {/* Az ár a gyerek keze körül, sosem az arcokon */}
              <div className="mx-auto mt-4 w-full max-w-[230px] rounded-[20px] border border-[#CDE0EA] bg-white p-4 shadow-[0_18px_50px_rgba(0,35,64,0.22)] md:absolute md:bottom-4 md:left-4 md:mt-0">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#002340] px-3 py-1 text-xs font-bold text-white">
                  A hét ajánlata
                </span>
                <h2 className="mt-2 text-base font-extrabold text-[#002340]">Teljes csomag</h2>
                <p className="text-xs text-[#2D466C]">Net 500 + TV Extra + Yettel M</p>
                <div className="mt-2 flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="shrink-0 text-2xl font-extrabold tracking-tight text-[#002340]">{formatFt(14990)}</span>
                  <span className="shrink-0 text-xs text-[#2D466C]">/ hó</span>
                </div>
                <p className="text-xs text-[#7E93B0]">
                  <span className="line-through">{formatFt(17470)}</span> helyett
                </p>
                <p className="mt-1 text-xs font-bold text-[#2D466C]">Havi ~2 480 Ft megtakarítás.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Gyors kategóriák ─────────────────────────────── */}
        <section className="border-b border-[#CDE0EA] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.label}
                  href={cat.href}
                  className="group flex w-[150px] flex-col items-center gap-2 rounded-[18px] border border-[#CDE0EA] p-4 text-center transition-colors hover:border-[#B4FF00] hover:bg-[#F4FFDB]"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#B4FF00] text-[#002340]">
                    <cat.icon className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <span className="text-sm font-bold text-[#002340]">{cat.label}</span>
                  <span className="text-xs text-[#2D466C]">{cat.desc}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ajánlott csomagok (a kiemelt szekció) ────────── */}
        <section id="ajanlatok" className="scroll-mt-16 bg-[#E4F2F7]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-8 max-w-2xl">
              <span className="text-base font-extrabold uppercase tracking-[0.06em] text-[#2D466C]">Ajánljuk neked</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#002340] sm:text-3xl">
                A legjobb csomagok, kategóriánként
              </h2>
              <p className="mt-2 text-base text-[#2D466C]">
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
        <section id="keszulekek" className="scroll-mt-16 border-b border-t border-[#CDE0EA] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-base font-extrabold uppercase tracking-[0.06em] text-[#2D466C]">Készülékek</span>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#002340] sm:text-3xl">
                  Új telefon, 0 Ft előleggel
                </h2>
              </div>
              <a href="#" className="inline-flex items-center gap-1 text-sm font-bold text-[#2D466C] hover:underline">
                Összes készülék <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {DEVICES.map((device) => (
                <div
                  key={device.id}
                  className="flex flex-col rounded-[20px] border border-[#CDE0EA] p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(0,35,64,0.08)]"
                >
                  <div className="mb-4 grid h-72 place-items-center rounded-2xl bg-gradient-to-b from-[#E4F2F7] to-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/yettel/device-${device.id}.svg`} alt={device.name} className="h-64 w-auto" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#002340]">{device.name}</h3>
                  <p className="text-xs text-[#2D466C]">{device.note}</p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-2xl font-extrabold tracking-tight text-[#002340]">{formatFt(device.monthly)}</span>
                    <span className="pb-1 text-sm text-[#2D466C]">/ hó</span>
                  </div>
                  <p className="text-xs font-semibold text-[#2D466C]">{device.upfront}</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#CDE0EA] px-4 py-2.5 text-sm font-bold text-[#002340] transition-colors hover:border-[#002340] hover:bg-[#E4F2F7]"
                  >
                    Részletek <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Miért a Yettel? ──────────────────────────────── */}
        <section className="bg-[#E4F2F7]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="mb-8 text-center text-2xl font-extrabold tracking-tight text-[#002340] sm:text-3xl">
              Miért a Yettel?
            </h2>
            <div className="flex flex-wrap justify-center gap-5">
              {VALUE_PROPS.map((vp) => (
                <div
                  key={vp.title}
                  className="flex w-full max-w-[260px] flex-col items-center rounded-[20px] border border-[#CDE0EA] bg-white p-5 text-center"
                >
                  <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[#B4FF00] text-[#002340]">
                    <vp.icon className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <h3 className="text-base font-extrabold text-[#002340]">{vp.title}</h3>
                  <p className="mt-1 text-sm text-[#2D466C]">{vp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MyYettel app ─────────────────────────────────── */}
        <section className="border-t border-[#CDE0EA] bg-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
            <div>
              <span className="text-base font-extrabold uppercase tracking-[0.06em] text-[#2D466C]">MyYettel alkalmazás</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#002340] sm:text-3xl">
                Az egész előfizetésed a zsebedben
              </h2>
              <p className="mt-2 max-w-md text-base text-[#2D466C]">
                Kövesd a felhasználásod, fizesd be a számlád, válts csomagot vagy vedd át a heti Yettel Zóna ajándékodat –
                mindezt egyetlen appból.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#2D466C]">
                {["Valós idejű adat- és keretfigyelés", "Egyérintéses számlabefizetés", "Csomagváltás kötöttség nélkül"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#B4FF00] text-[#002340]">
                        <ArrowRight className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  )
                )}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#002340] px-4 py-2.5 text-sm font-bold text-white">
                  <Download className="h-4 w-4" /> App Store
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#002340] px-4 py-2.5 text-sm font-bold text-white">
                  <Download className="h-4 w-4" /> Google Play
                </span>
              </div>
            </div>
            <div className="md:justify-self-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/yettel/app-home.png"
                alt="Yettel app a telefon kezdőképernyőjén"
                className="mx-auto block h-80 w-auto drop-shadow-[0_20px_40px_rgba(0,35,64,0.20)]"
              />
            </div>
          </div>
        </section>

        {/* ── Ügyfélszolgálat ──────────────────────────────── */}
        <section id="ugyfelszolgalat" className="scroll-mt-16 bg-[#E4F2F7]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-6">
              <span className="text-base font-extrabold uppercase tracking-[0.06em] text-[#2D466C]">Gyors ügyintézés</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#002340] sm:text-3xl">
                Miben segíthetünk?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {SUPPORT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href="#"
                  className="group flex flex-col items-center gap-2 rounded-[18px] border border-[#CDE0EA] bg-white p-5 text-center transition-colors hover:border-[#B4FF00]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#B4FF00] text-[#002340]">
                    <link.icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="text-sm font-semibold text-[#002340]">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Hírlevél / CTA ───────────────────────────────── */}
        <section id="belepes" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="rounded-[28px] bg-[#002340] px-6 py-10 text-center sm:px-10">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Ne maradj le a legjobb ajánlatokról
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#BBD3E4]">
                Iratkozz fel, és elsőként küldjük az akciókat, Yettel Zóna ajándékokat és exkluzív kedvezményeket.
              </p>
              <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" aria-label="Hírlevél feliratkozás">
                <input
                  type="email"
                  required
                  placeholder="E-mail cím"
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-[#7E9BC0] focus:border-[#B4FF00] focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#B4FF00] px-5 py-3 text-sm font-bold text-[#002340] transition-colors hover:bg-[#9BE000]"
                >
                  Feliratkozom <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-3 text-xs text-[#7E9BC0]">A feliratkozással elfogadod az adatkezelési tájékoztatót.</p>
            </div>
          </div>
        </section>
      </main>

      <YettelFooter />
    </div>
  );
}
