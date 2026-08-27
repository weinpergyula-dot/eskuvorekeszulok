import type { Metadata } from "next";
import {
  Bus,
  Camera,
  Church,
  Clock,
  Flower2,
  GlassWater,
  Heart,
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
import { EnvelopeIntro } from "./_components/envelope-intro";
import { Gallery } from "./_components/gallery";
import { Guestbook } from "./_components/guestbook";
import { MusicToggle } from "./_components/music-toggle";
import { Reveal } from "./_components/reveal";
import { RsvpForm } from "./_components/rsvp-form";
import { SketchDate } from "./_components/sketch-date";

export const metadata: Metadata = {
  title: "PREMIUM minta – Digitális esküvői meghívó",
  description:
    "A PREMIUM csomag bemutató mintája: animált boríték-felnyitás, satírozott dátum, élő galéria és teljesen egyedi design.",
  robots: { index: false, follow: false },
};

/* ── Bemutató minta: kitalált pár, kitalált adatok ── */

const COUPLE = {
  monogram: "L & D",
  names: "Faragó Lilla és Márkus Dániel",
  date: "2027. augusztus 21.",
  dateLong: "2027. augusztus 21. · szombat · 16:00",
  place: "Tihany, Apátsági Kertek",
};

const STORY = [
  {
    year: "2019",
    title: "Az első találkozás",
    text: "Egy esős novemberi estén, egy tihanyi kávézóban – ugyanazt a könyvet olvastuk két asztallal arrébb.",
    icon: Heart,
  },
  {
    year: "2022",
    title: "Az első közös otthon",
    text: "Egy pici, ferde tetős lakás a Belvárosban, egy citromfával az ablakban. Máig megvan.",
    icon: Flower2,
  },
  {
    year: "2026",
    title: "A kérdés",
    text: "Naplementekor, ugyanazon a mólón, ahol az első nyarunkat töltöttük. A válasz nem volt kérdéses.",
    icon: Sparkles,
  },
];

const PROGRAM = [
  { time: "15:00", title: "Vendégvárás", desc: "Rozé pezsgő és levendulás limonádé az apátsági kertben.", icon: GlassWater },
  { time: "16:00", title: "Szertartás", desc: "Szabadtéri szertartás a levendulasor végén, a tóra néző teraszon.", icon: Church },
  { time: "17:00", title: "Gratuláció, fotózás", desc: "Koccintás, majd csoportkép a kilátónál – jön a drón is!", icon: Camera },
  { time: "18:30", title: "Ünnepi vacsora", desc: "Ötfogásos menü badacsonyi borokkal, séfi bemutatóval.", icon: UtensilsCrossed },
  { time: "20:30", title: "Nyitótánc", desc: "Az első táncunk élő vonósnégyessel – utána mindenkit várunk!", icon: Music },
  { time: "22:00", title: "Tortavágás", desc: "Csillagszórós felvonulás és egy kis tűzijáték a kert felett.", icon: Sparkles },
  { time: "00:30", title: "Éjféli meglepetés", desc: "Erről most nem árulunk el többet – de érdemes ébren maradni.", icon: Wine },
  { time: "02:00", title: "Buszok indulnak", desc: "Első busz a szállásra; a mulatság hajnalig tart.", icon: Bus },
];

/* A mintában demó fotók szerepelnek – élesben a pár saját képei kerülnek ide. */
const GALLERY = [
  { src: "/meghivo-silver/g2.webp", alt: "A koszorúslányok csokrokkal" },
  { src: "/meghivo-silver/g5.webp", alt: "Készülődés, frizura" },
  { src: "/meghivo-silver/g3.webp", alt: "Az esküvői torta" },
  { src: "/meghivo-silver/g6.webp", alt: "A menyasszony" },
  { src: "/meghivo-silver/g4.webp", alt: "Meghívók és papíráru" },
  { src: "/meghivo-silver/g1.webp", alt: "Pecsétes meghívó közelről" },
];

const VENUES = [
  {
    icon: Church,
    name: "Apátsági Kertek – szertartás",
    address: "8237 Tihany, András tér 1.",
    note: "Parkolás a felső parkolóban, 14:30-tól. A kertbe a keleti kapun át vezet az út.",
    maps: "https://www.google.com/maps/search/?api=1&query=Tihany%2C%20Andr%C3%A1s%20t%C3%A9r%201.",
  },
  {
    icon: Wine,
    name: "Levendula Kúria – vacsora és mulatság",
    address: "8237 Tihany, Kossuth Lajos utca 32.",
    note: "A szertartás helyszínétől 8 perc séta, végig a levendulasoron.",
    maps: "https://www.google.com/maps/search/?api=1&query=Tihany%2C%20Kossuth%20Lajos%20utca%2032.",
  },
  {
    icon: Hotel,
    name: "Panoráma Hotel – szállás",
    address: "8237 Tihany, Rév utca 3.",
    note: "Kedvezményes szobák a „Lilla & Dániel” jelszóval, 2027. június 30-ig.",
    maps: "https://www.google.com/maps/search/?api=1&query=Tihany%2C%20R%C3%A9v%20utca%203.",
  },
];

const INFOS = [
  { icon: Shirt, title: "Dress code", text: "Black tie optional, mályva és mélylila árnyalatokkal. A hölgyeket kérjük, a fehéret hagyják a menyasszonynak." },
  { icon: Bus, title: "Utazás", text: "Busz indul Budapestről 13:00-kor, és éjjel kettőtől óránként hoz vissza mindenkit a szállásra." },
  { icon: Images, title: "Élő galéria", text: "A nap fotói még az esküvő estéjén felkerülnek ide – frissítsd az oldalt, és nézd élőben, hogy telik a nap." },
  { icon: PenLine, title: "Vendégkönyv", text: "Nem tudsz eljönni? Írj pár sort a vendégkönyvbe – minden üzenetet kinyomtatunk az albumunkba." },
];

export default function MeghivoPremiumPage() {
  return (
    <div className="prm-root min-h-screen">
      {/* PREMIUM extra: a meghívó egy lezárt borítékkal indul */}
      <EnvelopeIntro
        monogram={COUPLE.monogram}
        names={COUPLE.names}
        date={COUPLE.dateLong}
        place={COUPLE.place}
      />

      {/* ── Hero ────────────────────────────────────────── */}
      <header className="prm-hero relative overflow-hidden px-4 pb-20 pt-24 text-center sm:pb-28 sm:pt-32">
        <div className="relative mx-auto max-w-3xl">
          <p className="prm-caps text-[10px] sm:text-xs">Premium minta · digitális esküvői meghívó</p>

          <div className="prm-monogram mx-auto mt-8">
            <span className="prm-script">L</span>
            <span className="prm-serif prm-muted text-xl">&amp;</span>
            <span className="prm-script">D</span>
          </div>

          <h1 className="prm-serif mt-8 text-4xl leading-tight sm:text-6xl">
            Faragó Lilla
            <span className="prm-script block py-1 text-4xl sm:text-6xl" aria-hidden>
              és
            </span>
            Márkus Dániel
          </h1>

          {/* PREMIUM extra: satírozott, megrajzolódó dátum */}
          <div className="mt-10">
            <SketchDate text={COUPLE.date} sub="Szombat · 16:00 · Tihany" />
          </div>

          <p className="prm-muted mt-2 flex items-center justify-center gap-2 text-[15px]">
            <MapPin className="h-4 w-4" aria-hidden />
            {COUPLE.place}
          </p>

          <div className="mt-12">
            <Countdown />
          </div>

          <a
            href="#visszajelzes"
            className="mt-12 inline-flex items-center gap-2 rounded-full border border-[var(--prm-line)] bg-[rgba(232,180,212,0.08)] px-7 py-3 text-sm tracking-wide text-[var(--prm-rose)] transition-colors hover:bg-[rgba(232,180,212,0.18)]"
          >
            Visszajelzek
          </a>
        </div>
      </header>

      {/* ── Meghívás ────────────────────────────────────── */}
      <section className="prm-alt px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="prm-icon-ring mx-auto">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="prm-serif mt-6 text-3xl sm:text-4xl">Szeretettel meghívunk</h2>
          <p className="prm-muted mt-5 text-[17px] leading-relaxed">
            Nyolc éve ugyanabban a tihanyi kávézóban futottunk össze, és azóta minden
            fontos pillanatunk ehhez a félszigethez köt. Idén nyáron ugyanott mondjuk ki
            az igent – és szeretnénk, ha ezt a napot te is velünk töltenéd.
          </p>
          <p className="prm-script mt-6 text-3xl">Lilla &amp; Dániel</p>
        </Reveal>
      </section>

      {/* ── Történetünk (PREMIUM extra) ─────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="prm-caps text-[10px]">Premium extra</p>
            <h2 className="prm-serif mt-2 text-3xl sm:text-4xl">A történetünk</h2>
            <div className="prm-rule mx-auto mt-6" />
          </Reveal>

          <div className="mt-12 space-y-4">
            {STORY.map(({ year, title, text, icon: Icon }, i) => (
              <Reveal key={year} delay={i * 70}>
                <div className="prm-card flex items-start gap-4 px-5 py-5 sm:px-6">
                  <span className="prm-icon-ring shrink-0">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="prm-serif text-xl text-[var(--prm-rose)]">{year}</span>
                      <h3 className="prm-serif text-lg">{title}</h3>
                    </div>
                    <p className="prm-muted mt-1 text-[15px] leading-relaxed">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Program ─────────────────────────────────────── */}
      <section className="prm-alt px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="prm-caps text-[10px]">Óráról órára</p>
            <h2 className="prm-serif mt-2 text-3xl sm:text-4xl">A nap programja</h2>
            <div className="prm-rule mx-auto mt-6" />
          </Reveal>

          <div className="mt-12 space-y-4">
            {PROGRAM.map(({ time, title, desc, icon: Icon }, i) => (
              <Reveal key={time} delay={i * 40}>
                <div className="prm-card flex items-start gap-4 px-5 py-4 sm:px-6">
                  <span className="prm-icon-ring shrink-0">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="prm-serif text-xl text-[var(--prm-rose)]">{time}</span>
                      <h3 className="prm-serif text-lg">{title}</h3>
                    </div>
                    <p className="prm-muted mt-1 text-[15px] leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Élő galéria (PREMIUM extra) ─────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <p className="prm-caps text-[10px]">Premium extra</p>
            <h2 className="prm-serif mt-2 text-3xl sm:text-4xl">Élő galéria</h2>
            <p className="prm-muted mt-4 text-[15px]">
              A nagy nap fotói még aznap este megjelennek itt. Kattints bármelyik képre a
              nagyításhoz.
            </p>
            <div className="prm-rule mx-auto mt-6" />
          </Reveal>
          <Reveal className="mt-10">
            <Gallery items={GALLERY} />
          </Reveal>
        </div>
      </section>

      {/* ── Helyszínek ──────────────────────────────────── */}
      <section className="prm-alt px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="prm-caps text-[10px]">Merre induljunk</p>
            <h2 className="prm-serif mt-2 text-3xl sm:text-4xl">Helyszínek</h2>
            <div className="prm-rule mx-auto mt-6" />
          </Reveal>

          <div className="mt-12 space-y-4">
            {VENUES.map(({ icon: Icon, name, address, note, maps }, i) => (
              <Reveal key={name} delay={i * 60}>
                <div className="prm-card px-6 py-6">
                  <div className="flex items-start gap-4">
                    <span className="prm-icon-ring shrink-0">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="prm-serif text-xl">{name}</h3>
                      <p className="prm-muted mt-1 text-[15px]">{address}</p>
                      <p className="prm-muted mt-2 text-sm leading-relaxed">{note}</p>
                      <a
                        href={maps}
                        target="_blank"
                        rel="noopener"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--prm-line)] px-4 py-2 text-xs tracking-wide text-[var(--prm-rose)] transition-colors hover:bg-[rgba(232,180,212,0.12)]"
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
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <p className="prm-caps text-[10px]">Hogy minden gördülékeny legyen</p>
            <h2 className="prm-serif mt-2 text-3xl sm:text-4xl">Jó, ha tudod</h2>
            <div className="prm-rule mx-auto mt-6" />
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {INFOS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 60}>
                <div className="prm-card h-full px-6 py-6">
                  <span className="prm-icon-ring">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="prm-serif mt-4 text-xl">{title}</h3>
                  <p className="prm-muted mt-2 text-[15px] leading-relaxed">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vendégkönyv ─────────────────────────────────── */}
      <section className="prm-alt px-4 py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="prm-caps text-[10px]">Premium extra</p>
          <h2 className="prm-serif mt-2 text-3xl sm:text-4xl">Vendégkönyv</h2>
          <div className="prm-rule mx-auto mt-6" />
        </Reveal>
        <Reveal className="mt-10">
          <Guestbook />
        </Reveal>
      </section>

      {/* ── RSVP ────────────────────────────────────────── */}
      <section id="visszajelzes" className="scroll-mt-8 px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="prm-icon-ring mx-auto">
            <PartyPopper className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="prm-serif mt-6 text-3xl sm:text-4xl">Visszajelzés</h2>
          <p className="prm-muted mt-4 flex items-center justify-center gap-2 text-[15px]">
            <Clock className="h-4 w-4" aria-hidden />
            Kérjük, 2027. június 30-ig jelezz vissza
          </p>
        </Reveal>
        <div className="mt-10">
          <RsvpForm />
        </div>
      </section>

      {/* ── Lábléc ──────────────────────────────────────── */}
      <footer className="prm-alt px-4 py-14 text-center">
        <p className="prm-script text-3xl">Lilla &amp; Dániel</p>
        <p className="prm-caps mt-3 text-[10px]">2027. augusztus 21. · Tihany</p>
        <div className="prm-rule mx-auto mt-6" />
        <p className="prm-muted mt-6 text-xs">
          Ez a PREMIUM csomag bemutató mintája – a szereplők és az adatok kitaláltak.
        </p>
        <a
          href="/meghivo"
          className="prm-accent mt-3 inline-block text-sm underline-offset-4 hover:underline"
        >
          Vissza a csomagokhoz
        </a>
      </footer>

      {/* PREMIUM extra: háttérzene – csak kattintásra indul */}
      <MusicToggle src="/perfect.mp3" title="A dalunk" />
    </div>
  );
}
