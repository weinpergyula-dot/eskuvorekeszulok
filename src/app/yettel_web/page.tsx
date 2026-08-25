import type { Metadata } from "next";
import {
  Phone,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Gift,
  Sparkles,
  Leaf,
  MapPin,
  Download,
  HelpCircle,
  Globe,
} from "lucide-react";
import { OffersExplorer } from "./_components/offers-explorer";
import { CategoryTiles } from "./_components/category-tiles";
import { HeroSlides } from "./_components/hero-slides";
import { YettelHeader } from "./_components/yettel-header";
import { YettelFooter } from "./_components/yettel-footer";
import { InternetFlow, TvFlow } from "./_components/internet-flow";
import { DeviceMarquee } from "./_components/device-marquee";

export const metadata: Metadata = {
  title: "Yettel – Mobil, internet és TV egy helyen",
  description:
    "Átlátható csomagok és konkrét ajánlatok: havidíjas mobil, otthoni internet és TV. Válaszd ki a hozzád illő legjobb csomagot pár perc alatt.",
  robots: { index: false, follow: false },
};

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
  { icon: Globe, label: "Roaming" },
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
        {/* ── Banner / hero – közvetlenül a fejléc alatt ──────
            A háttér a /yettel_light welcome képernyőjének mozgó gradiense
            (130°-os sweep + két lebegő, elmosott folt) – lásd globals.css.
            A negatív felső margó a fejléc mögé húzza a hátteret (a tartalmat a
            vele azonos pt tartja a helyén). A két alsó sarok lekerekített: a
            z-10 miatt a banner a következő szekció fölé rajzolódik, így a
            sarkoknál az alábújó gyorsikonos sötétkék háttér látszik ki. */}
        <section className="yettel-hero-bg relative z-10 -mt-14 overflow-hidden rounded-b-[32px] pt-14">
          <span aria-hidden className="yettel-blob yettel-blob-1" />
          <span aria-hidden className="yettel-blob yettel-blob-2" />
          <HeroSlides />
        </section>

        {/* ── Üdvözlő + gyors kategóriák (animált, mozgó sötétkék gradient sáv) ──────
            Az alsó extra térköz alá csúszik be az ajánlatok szekció, hogy annak
            lekerekített felső sarkainál ez a sötétkék háttér látsszon ki, a
            felső pedig a banner lekerekített alja alá bújik be. */}
        <section className="yettel-welcome-bg -mt-8 pt-8 pb-10">
          <CategoryTiles />
        </section>

        {/* ── Ajánlott csomagok (a kiemelt szekció) ────────── */}
        <section
          id="ajanlatok"
          className="relative -mt-10 scroll-mt-16 rounded-t-[32px] bg-[#E4F2F7] shadow-[inset_0_16px_16px_-12px_rgba(0,35,64,0.22)]"
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            {/* Anchor célok az egyes fülekhez */}
            <span id="havidijas" className="block -mt-16 pt-16" aria-hidden />
            <span id="internet" className="block -mt-16 pt-16" aria-hidden />
            <span id="tv" className="block -mt-16 pt-16" aria-hidden />
            <span id="feltoltokartya" className="block -mt-16 pt-16" aria-hidden />
            <OffersExplorer />
          </div>
        </section>

        {/* ── Készülékek ───────────────────────────────────── */}
        <section id="keszulekek" className="scroll-mt-16 border-b border-t border-[#CDE0EA] bg-white py-14 shadow-[inset_0_16px_16px_-12px_rgba(0,35,64,0.22)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-sm font-extrabold uppercase tracking-[0.06em] text-[#2D466C]">Készülékek</span>
                <h2 className="mt-1 text-[1.375rem] font-extrabold tracking-tight text-[#002340] sm:text-[1.75rem]">
                  Új telefon, 0 Ft előleggel
                </h2>
              </div>
              <a href="#" className="inline-flex items-center gap-1 text-sm font-bold text-[#2D466C] hover:underline">
                Összes készülék <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          {/* Végtelenített, automatikusan görgő készülék-sáv – egérrel megáll,
              mobilon ujjal csúsztatható (lásd DeviceMarquee). */}
          <DeviceMarquee />
        </section>


        {/* ── Miért a Yettel? ──────────────────────────────── */}
        <section className="bg-[#002340]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="mb-8 text-center text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Miért a Yettel?
            </h2>
            {/* Rács, nem fix szélességű kártyák: így a négy elem minden
                nézetben egy sorba fér (a fix px-szélesség nem skálázódott
                együtt a konténerrel, ezért esett a 4. kártya új sorba). */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUE_PROPS.map((vp) => (
                <div
                  key={vp.title}
                  className="flex flex-col items-center rounded-[20px] border border-[#CDE0EA] bg-white p-5 text-center"
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
        <section className="relative overflow-hidden border-t border-[#CDE0EA] bg-white shadow-[inset_0_16px_16px_-12px_rgba(0,35,64,0.22)]">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-14 sm:px-6 md:grid-cols-2">
            <div className="pb-14 md:pb-16">
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
              {/* QR-kód – csak desktopon; az eskuvorekeszulok.hu oldalra vezet */}
              <div className="mt-6 hidden items-center gap-4 md:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/yettel/qr-eskuvorekeszulok.svg"
                  alt="QR-kód az eskuvorekeszulok.hu oldalra"
                  className="h-24 w-24 rounded-xl border border-[#CDE0EA] bg-white p-2"
                />
                <div>
                  <p className="text-sm font-bold text-[#002340]">Olvasd be a QR-kódot</p>
                  <p className="text-sm text-[#2D466C]">Ugrás az eskuvorekeszulok.hu oldalra</p>
                </div>
              </div>
            </div>
            <div className="self-end md:justify-self-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/yettel/app-home.png"
                alt="Yettel app a telefon kezdőképernyőjén"
                className="mx-auto block h-[360px] w-auto md:h-[440px]"
              />
            </div>
          </div>
        </section>

        {/* ── Ügyfélszolgálat ──────────────────────────────── */}
        <section id="ugyfelszolgalat" className="scroll-mt-16 bg-[#E4F2F7] shadow-[inset_0_16px_16px_-12px_rgba(0,35,64,0.22)]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-6">
              <span className="text-base font-extrabold uppercase tracking-[0.06em] text-[#2D466C]">Gyors ügyintézés</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#002340] sm:text-3xl">
                Miben segíthetünk?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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

      {/* Teljes oldalas, hash-vezérelt igénylési folyamatok (internet + TV) */}
      <InternetFlow />
      <TvFlow />
    </div>
  );
}
