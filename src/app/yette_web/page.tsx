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
import { YetteHeader } from "./_components/yette-header";
import { YetteFooter } from "./_components/yette-footer";
import { DEVICES, formatFt } from "./_data/offers";

export const metadata: Metadata = {
  title: "Yette – Mobil, internet és TV egy helyen",
  description:
    "Átlátható csomagok és konkrét ajánlatok: havidíjas mobil, otthoni internet és TV. Válaszd ki a hozzád illő legjobb csomagot pár perc alatt.",
  robots: { index: false, follow: false },
};

const CATEGORIES = [
  { icon: Smartphone, label: "Havidíjas mobil", desc: "Korlátlan hívás, 5G", href: "#havidijas" },
  { icon: Wifi, label: "Otthoni internet", desc: "Optikai & 5G", href: "#internet" },
  { icon: Tv, label: "Yette TV", desc: "Élő adás & felvétel", href: "#tv" },
  { icon: Smartphone, label: "Készülékek", desc: "Telefon részletre", href: "#keszulekek" },
  { icon: CreditCard, label: "Feltöltőkártya", desc: "Kötöttség nélkül", href: "#ajanlatok" },
  { icon: Briefcase, label: "Üzleti", desc: "Céges megoldások", href: "#ajanlatok" },
];

const VALUE_PROPS = [
  { icon: ShieldCheck, title: "Megbízható 5G hálózat", desc: "Az ország 99%-át lefedő hálózat, stabil sebesség otthon és úton." },
  { icon: Gift, title: "Yette Zóna kedvezmények", desc: "Heti ajándékok, mozijegyek és partnerkedvezmények az appban." },
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

export default function YetteWebPage() {
  return (
    <div className="yette-root min-h-screen bg-white text-gray-900">
      <YetteHeader />

      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-[#e8f7f0] via-white to-[#f4fbf8]">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#00875a] ring-1 ring-[#00a868]/20">
                <Sparkles className="h-3.5 w-3.5" />
                Új ügyfeleknek: online kedvezmény minden csomagra
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl">
                Mobil, internet és TV –{" "}
                <span className="text-[#00a868]">átláthatóan, egy helyen.</span>
              </h1>
              <p className="mt-3 max-w-md text-base text-gray-600">
                Nincs kisbetűs meglepetés. Válaszd ki a hozzád illő csomagot konkrét árakkal, és pár perc alatt
                megrendeled.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#ajanlatok"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a868] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00875a]"
                >
                  Ajánlott csomagok
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#internet"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-[#00a868] hover:text-[#00875a]"
                >
                  Otthoni internet
                </a>
              </div>
              <p className="mt-4 text-xs text-gray-400">Hűségidő nélkül is választható · Ingyenes bekötés · 14 napos elállás</p>
            </div>

            {/* Kompakt kiemelő kártya nagy kép helyett */}
            <div className="md:justify-self-end">
              <div className="w-full max-w-sm rounded-2xl border border-[#00a868]/20 bg-white p-5 shadow-[0_10px_40px_rgba(0,168,104,0.12)]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#00a868] px-3 py-1 text-xs font-semibold text-white">
                  A hét ajánlata
                </span>
                <h2 className="mt-3 text-lg font-bold text-gray-900">Teljes csomag</h2>
                <p className="text-sm text-gray-500">Net 500 + TV Extra + Yette M mobil</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-extrabold tracking-tight">{formatFt(14990)}</span>
                  <span className="pb-1 text-sm text-gray-500">/ hó</span>
                  <span className="pb-1 text-sm text-gray-400 line-through">{formatFt(17470)}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-[#00875a]">Havi ~2 480 Ft megtakarítás, egy számlán.</p>
                <a
                  href="#ajanlatok"
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#00a868] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00875a]"
                >
                  Megnézem <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Gyors kategóriák ─────────────────────────────── */}
        <section className="border-b border-gray-100">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.label}
                  href={cat.href}
                  className="group flex flex-col items-start gap-2 rounded-xl border border-gray-200 p-4 transition-colors hover:border-[#00a868] hover:bg-[#e8f7f0]/40"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f7f0] text-[#00875a] transition-colors group-hover:bg-[#00a868] group-hover:text-white">
                    <cat.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{cat.label}</span>
                  <span className="text-xs text-gray-500">{cat.desc}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ajánlott csomagok (a kiemelt szekció) ────────── */}
        <section id="ajanlatok" className="scroll-mt-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-8 max-w-2xl">
              <span className="text-sm font-semibold text-[#00875a]">Ajánljuk neked</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                A legjobb csomagok, kategóriánként
              </h2>
              <p className="mt-2 text-base text-gray-600">
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
        <section id="keszulekek" className="scroll-mt-16 border-b border-gray-100">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-[#00875a]">Készülékek</span>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  Új telefon, 0 Ft előleggel
                </h2>
              </div>
              <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-[#00875a] hover:underline">
                Összes készülék <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {DEVICES.map((device) => (
                <div
                  key={device.id}
                  className="flex flex-col rounded-2xl border border-gray-200 p-5 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 grid h-28 place-items-center rounded-xl bg-gray-50">
                    <Smartphone className="h-12 w-12 text-gray-300" strokeWidth={1.25} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{device.name}</h3>
                  <p className="text-xs text-gray-500">{device.note}</p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-2xl font-extrabold tracking-tight">{formatFt(device.monthly)}</span>
                    <span className="pb-1 text-sm text-gray-500">/ hó</span>
                  </div>
                  <p className="text-xs text-[#00875a]">{device.upfront}</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:border-[#00a868] hover:text-[#00875a]"
                  >
                    Részletek <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Miért a Yette? ───────────────────────────────── */}
        <section className="border-b border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Miért a Yette?</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUE_PROPS.map((vp) => (
                <div key={vp.title} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-[#e8f7f0] text-[#00875a]">
                    <vp.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="text-base font-bold text-gray-900">{vp.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{vp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MyYette app ──────────────────────────────────── */}
        <section className="border-b border-gray-100">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
            <div>
              <span className="text-sm font-semibold text-[#00875a]">MyYette alkalmazás</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Az egész előfizetésed a zsebedben
              </h2>
              <p className="mt-2 max-w-md text-base text-gray-600">
                Kövesd a felhasználásod, fizesd be a számlád, válts csomagot vagy vedd át a heti Yette Zóna ajándékodat –
                mindezt egyetlen appból.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {["Valós idejű adat- és keretfigyelés", "Egyérintéses számlabefizetés", "Csomagváltás kötöttség nélkül"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#e8f7f0] text-[#00875a]">
                        <ArrowRight className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  )
                )}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white">
                  <Download className="h-4 w-4" /> App Store
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white">
                  <Download className="h-4 w-4" /> Google Play
                </span>
              </div>
            </div>
            <div className="md:justify-self-end">
              <div className="mx-auto grid h-56 w-40 place-items-center rounded-[2rem] border-4 border-gray-900 bg-gradient-to-b from-[#e8f7f0] to-white">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#00a868] text-2xl font-black text-white">
                  y
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ügyfélszolgálat ──────────────────────────────── */}
        <section id="ugyfelszolgalat" className="scroll-mt-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="mb-6">
              <span className="text-sm font-semibold text-[#00875a]">Gyors ügyintézés</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Miben segíthetünk?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {SUPPORT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href="#"
                  className="group flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-5 text-center transition-colors hover:border-[#00a868]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e8f7f0] text-[#00875a] transition-colors group-hover:bg-[#00a868] group-hover:text-white">
                    <link.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-medium text-gray-800">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Hírlevél / CTA ───────────────────────────────── */}
        <section id="belepes" className="scroll-mt-16">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="rounded-3xl bg-gray-900 px-6 py-10 text-center sm:px-10">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Ne maradj le a legjobb ajánlatokról
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-300">
                Iratkozz fel, és elsőként küldjük az akciókat, Yette Zóna ajándékokat és exkluzív kedvezményeket.
              </p>
              <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" aria-label="Hírlevél feliratkozás">
                <input
                  type="email"
                  required
                  placeholder="E-mail cím"
                  className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-[#00a868] focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00a868] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00875a]"
                >
                  Feliratkozom <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-3 text-xs text-gray-500">A feliratkozással elfogadod az adatkezelési tájékoztatót.</p>
            </div>
          </div>
        </section>
      </main>

      <YetteFooter />
    </div>
  );
}
