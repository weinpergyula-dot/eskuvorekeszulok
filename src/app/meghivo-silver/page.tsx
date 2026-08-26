import type { Metadata } from "next";
import {
  Bus,
  Camera,
  Church,
  Clock,
  GlassWater,
  Hotel,
  Images,
  MapPin,
  Music,
  PartyPopper,
  PenLine,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { Countdown } from "./_components/countdown";
import { Gallery } from "./_components/gallery";
import { Guestbook } from "./_components/guestbook";
import { MusicToggle } from "./_components/music-toggle";
import { Reveal } from "./_components/reveal";
import { RsvpForm } from "./_components/rsvp-form";

export const metadata: Metadata = {
  title: "SILVER minta – Digitális esküvői meghívó",
  description:
    "A SILVER csomag bemutató mintája: galéria, háttérzene, vendégkönyv és térkép egy sötét, elegáns meghívóban.",
  robots: { index: false, follow: false },
};

/* ── Bemutató minta: kitalált pár, kitalált adatok ── */

const PROGRAM = [
  { time: "15:00", title: "Vendégvárás", desc: "Pezsgő és limonádé a teraszon, a tó felőli oldalon.", icon: GlassWater },
  { time: "15:30", title: "Szertartás", desc: "Polgári szertartás a levendulás kertben.", icon: Church },
  { time: "16:30", title: "Fotózás, koccintás", desc: "Csoportkép a mólónál, majd kötetlen beszélgetés.", icon: Camera },
  { time: "18:00", title: "Ünnepi vacsora", desc: "Négyfogásos menü balatoni borokkal.", icon: UtensilsCrossed },
  { time: "20:00", title: "Nyitótánc", desc: "Az első tánc – utána mindenkit várunk a parketten!", icon: Music },
  { time: "22:00", title: "Tortavágás", desc: "Csillagszórós felvonulás a kertben.", icon: Sparkles },
  { time: "23:30", title: "Éjféli falatok", desc: "Meleg szendvicsek, leves és sok-sok zene.", icon: Wine },
  { time: "02:00", title: "Buszok indulnak", desc: "Első busz a szállásra; a mulatság hajnalig tart.", icon: Bus },
];

/* A mintában demó fotók szerepelnek (public/meghivo-silver) – élesben
   ide a pár saját képei kerülnek. */
const GALLERY = [
  { src: "/meghivo-silver/g2.webp", alt: "A koszorúslányok csokrokkal" },
  { src: "/meghivo-silver/g3.webp", alt: "Az esküvői torta" },
  { src: "/meghivo-silver/g4.webp", alt: "Meghívók és papíráru" },
  { src: "/meghivo-silver/g5.webp", alt: "Készülődés, frizura" },
  { src: "/meghivo-silver/g6.webp", alt: "A menyasszony" },
  { src: "/meghivo-silver/g1.webp", alt: "Pecsétes meghívó közelről" },
];

const VENUES = [
  {
    icon: Church,
    name: "Levendulás kert – szertartás",
    address: "8230 Balatonfüred, Szegfű utca 4.",
    note: "Parkolás a kert melletti füves területen, 15:00-tól.",
    maps: "https://www.google.com/maps/search/?api=1&query=Balatonf%C3%BCred%2C%20Szegf%C5%B1%20utca%204.",
  },
  {
    icon: Wine,
    name: "Tóparti Birtok – vacsora és mulatság",
    address: "8230 Balatonfüred, Mólótér 2.",
    note: "A szertartás helyszínétől 6 perc séta a parton.",
    maps: "https://www.google.com/maps/search/?api=1&query=Balatonf%C3%BCred%2C%20M%C3%B3l%C3%B3t%C3%A9r%202.",
  },
  {
    icon: Hotel,
    name: "Hotel Ezüstpart – szállás",
    address: "8230 Balatonfüred, Vitorlás sétány 9.",
    note: "Kedvezményes szobák a „Réka & Máté” jelszóval, 2027. július 1-ig.",
    maps: "https://www.google.com/maps/search/?api=1&query=Balatonf%C3%BCred%2C%20Vitorl%C3%A1s%20s%C3%A9t%C3%A1ny%209.",
  },
];

const INFOS = [
  { icon: Shirt, title: "Dress code", text: "Elegáns nyári viselet, hűvös estére egy réteggel. A hölgyeket kérjük, a fehéret hagyják a menyasszonynak." },
  { icon: Bus, title: "Utazás", text: "Busz indul Budapestről 12:30-kor, és éjjel kettőtől óránként hoz vissza mindenkit a szállásra." },
  { icon: Images, title: "Fotók", text: "A szertartás alatt kérjük, tedd el a telefonod – a közös képeket a galériába töltjük fel a nagy nap után." },
  { icon: PenLine, title: "Vendégkönyv", text: "Nem tudsz eljönni? Írj pár sort a vendégkönyvbe – minden üzenetet kinyomtatunk az albumunkba." },
];

export default function MeghivoSilverPage() {
  return (
    <div className="slv-root min-h-screen">
      {/* ── Hero ────────────────────────────────────────── */}
      <header className="slv-hero relative overflow-hidden px-4 pb-20 pt-24 text-center sm:pb-28 sm:pt-32">
        <div className="relative mx-auto max-w-3xl">
          <p className="slv-caps text-[10px] sm:text-xs">Silver minta · digitális esküvői meghívó</p>

          <div className="slv-monogram mx-auto mt-8">
            <span className="slv-script">R</span>
            <span className="slv-serif slv-muted text-xl">&amp;</span>
            <span className="slv-script">M</span>
          </div>

          <h1 className="slv-serif mt-8 text-4xl leading-tight sm:text-6xl">
            Bodnár Réka
            <span className="slv-script block py-1 text-4xl sm:text-6xl" aria-hidden>
              és
            </span>
            Halász Máté
          </h1>

          <div className="slv-rule mx-auto mt-10" />

          <p className="slv-caps mt-8 text-[11px] sm:text-xs">2027. szeptember 4. · szombat · 15:30</p>
          <p className="slv-muted mt-2 flex items-center justify-center gap-2 text-[15px]">
            <MapPin className="h-4 w-4" aria-hidden />
            Balatonfüred
          </p>

          <div className="mt-12">
            <Countdown />
          </div>

          <a
            href="#visszajelzes"
            className="mt-12 inline-flex items-center gap-2 rounded-full border border-[var(--slv-line)] bg-[rgba(200,210,228,0.08)] px-7 py-3 text-sm tracking-wide text-[var(--slv-silver)] transition-colors hover:bg-[rgba(200,210,228,0.18)]"
          >
            Visszajelzek
          </a>
        </div>
      </header>

      {/* ── Meghívás ────────────────────────────────────── */}
      <section className="slv-alt px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="slv-icon-ring mx-auto">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="slv-serif mt-6 text-3xl sm:text-4xl">Szeretettel meghívunk</h2>
          <p className="slv-muted mt-5 text-[17px] leading-relaxed">
            Hét éve egy vitorlás fedélzetén ismerkedtünk meg, és azóta minden nyarunk
            a Balatonhoz köt. Idén ősszel ugyanott mondjuk ki az igent – és szeretnénk,
            ha ezt a napot te is velünk töltenéd.
          </p>
          <p className="slv-script mt-6 text-3xl">Réka &amp; Máté</p>
        </Reveal>
      </section>

      {/* ── Program ─────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="slv-caps text-[10px]">Óráról órára</p>
            <h2 className="slv-serif mt-2 text-3xl sm:text-4xl">A nap programja</h2>
            <div className="slv-rule mx-auto mt-6" />
          </Reveal>

          <div className="mt-12 space-y-4">
            {PROGRAM.map(({ time, title, desc, icon: Icon }, i) => (
              <Reveal key={time} delay={i * 40}>
                <div className="slv-card flex items-start gap-4 px-5 py-4 sm:px-6">
                  <span className="slv-icon-ring shrink-0">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="slv-serif text-xl text-[var(--slv-silver)]">{time}</span>
                      <h3 className="slv-serif text-lg">{title}</h3>
                    </div>
                    <p className="slv-muted mt-1 text-[15px] leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galéria (SILVER extra) ──────────────────────── */}
      <section className="slv-alt px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <p className="slv-caps text-[10px]">Silver extra</p>
            <h2 className="slv-serif mt-2 text-3xl sm:text-4xl">Galériánk</h2>
            <p className="slv-muted mt-4 text-[15px]">
              Kattints bármelyik képre a nagyításhoz.
            </p>
            <div className="slv-rule mx-auto mt-6" />
          </Reveal>
          <Reveal className="mt-10">
            <Gallery items={GALLERY} />
          </Reveal>
        </div>
      </section>

      {/* ── Helyszínek (SILVER extra: térkép) ───────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="slv-caps text-[10px]">Silver extra</p>
            <h2 className="slv-serif mt-2 text-3xl sm:text-4xl">Helyszínek</h2>
            <div className="slv-rule mx-auto mt-6" />
          </Reveal>

          <div className="mt-12 space-y-4">
            {VENUES.map(({ icon: Icon, name, address, note, maps }, i) => (
              <Reveal key={name} delay={i * 60}>
                <div className="slv-card px-6 py-6">
                  <div className="flex items-start gap-4">
                    <span className="slv-icon-ring shrink-0">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="slv-serif text-xl">{name}</h3>
                      <p className="slv-muted mt-1 text-[15px]">{address}</p>
                      <p className="slv-muted mt-2 text-sm leading-relaxed">{note}</p>
                      <a
                        href={maps}
                        target="_blank"
                        rel="noopener"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--slv-line)] px-4 py-2 text-xs tracking-wide text-[var(--slv-silver)] transition-colors hover:bg-[rgba(200,210,228,0.12)]"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Megnyitom a térképen
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tudnivalók ──────────────────────────────────── */}
      <section className="slv-alt px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <p className="slv-caps text-[10px]">Hogy minden gördülékeny legyen</p>
            <h2 className="slv-serif mt-2 text-3xl sm:text-4xl">Jó, ha tudod</h2>
            <div className="slv-rule mx-auto mt-6" />
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {INFOS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 60}>
                <div className="slv-card h-full px-6 py-6">
                  <span className="slv-icon-ring">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="slv-serif mt-4 text-xl">{title}</h3>
                  <p className="slv-muted mt-2 text-[15px] leading-relaxed">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vendégkönyv (SILVER extra) ──────────────────── */}
      <section className="px-4 py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="slv-caps text-[10px]">Silver extra</p>
          <h2 className="slv-serif mt-2 text-3xl sm:text-4xl">Vendégkönyv</h2>
          <div className="slv-rule mx-auto mt-6" />
        </Reveal>
        <Reveal className="mt-10">
          <Guestbook />
        </Reveal>
      </section>

      {/* ── RSVP ────────────────────────────────────────── */}
      <section id="visszajelzes" className="slv-alt scroll-mt-8 px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="slv-icon-ring mx-auto">
            <PartyPopper className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="slv-serif mt-6 text-3xl sm:text-4xl">Visszajelzés</h2>
          <p className="slv-muted mt-4 flex items-center justify-center gap-2 text-[15px]">
            <Clock className="h-4 w-4" aria-hidden />
            Kérjük, 2027. július 15-ig jelezz vissza
          </p>
        </Reveal>
        <div className="mt-10">
          <RsvpForm />
        </div>
      </section>

      {/* ── Lábléc ──────────────────────────────────────── */}
      <footer className="px-4 py-14 text-center">
        <p className="slv-script text-3xl">Réka &amp; Máté</p>
        <p className="slv-caps mt-3 text-[10px]">2027. szeptember 4. · Balatonfüred</p>
        <div className="slv-rule mx-auto mt-6" />
        <p className="slv-muted mt-6 text-xs">
          Ez a SILVER csomag bemutató mintája – a szereplők és az adatok kitaláltak.
        </p>
        <a
          href="/meghivo"
          className="slv-accent mt-3 inline-block text-sm underline-offset-4 hover:underline"
        >
          Vissza a csomagokhoz
        </a>
      </footer>

      {/* SILVER extra: háttérzene – csak kattintásra indul */}
      <MusicToggle src="/perfect.mp3" title="A dalunk" />
    </div>
  );
}
