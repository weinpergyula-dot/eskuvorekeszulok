import type { Metadata } from "next";
import {
  CalendarHeart,
  Church,
  Clock,
  GlassWater,
  Heart,
  Hotel,
  MapPin,
  Music,
  PartyPopper,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Wine,
  Gift,
  Camera,
  Baby,
} from "lucide-react";
import { Countdown } from "./_components/countdown";
import { Reveal } from "./_components/reveal";
import { RsvpForm } from "./_components/rsvp-form";

export const metadata: Metadata = {
  title: "Zsófi & Szilveszter – 2027. június 15. | Esküvői meghívó",
  description:
    "Kispál Zsófia és Ferencz Szilveszter szeretettel meghív az esküvőjére – 2027. június 15., Arad.",
  robots: { index: false, follow: false },
};

/* ── Random generált részletek (a valós adat: nevek, Arad, 2027.06.15.) ── */

const STORY = [
  {
    year: "2025",
    title: "Az első találkozás",
    text: "Egy közös baráti szülinapon, Aradon sodort össze minket az élet. Szili rossz vicceket mesélt, Zsófi mégis nevetett – innen már nem volt visszaút.",
  },
  {
    year: "2026 tavasza",
    title: "Összeköltöztünk",
    text: "Két bögre, egy kanapé és egy Mázli nevű macska. Kiderült, hogy együtt még a hétfő reggelek is elviselhetők.",
  },
  {
    year: "2026 ősze",
    title: "Az igen a hegytetőn",
    text: "Egy őszi túrán, a Retyezát csúcsán, naplementében hangzott el a kérdés. A válasz egy könnyes, hangos IGEN volt.",
  },
  {
    year: "2027",
    title: "A nagy nap",
    text: "Június 15-én összekötjük az életünket – és szeretnénk, ha ezt a napot velünk ünnepelnéd!",
  },
];

const PROGRAM = [
  { time: "15:30", title: "Vendégvárás", desc: "Gyülekező a templom előtt, hűsítővel és mosolyokkal.", icon: GlassWater },
  { time: "16:00", title: "Egyházi szertartás", desc: "Belvárosi Páduai Szent Antal-templom, Arad.", icon: Church },
  { time: "17:00", title: "Gratulációk és fotózás", desc: "Közös képek a templomkertben, buborékfújással.", icon: Camera },
  { time: "18:00", title: "Érkezés a lakodalomba", desc: "Welcome koktél és zene a Csillagkert Birtokon.", icon: Wine },
  { time: "19:00", title: "Ünnepi vacsora", desc: "Többfogásos menü, vegetáriánus és mentes opciókkal.", icon: UtensilsCrossed },
  { time: "21:00", title: "Nyitótánc", desc: "Az első keringő – utána mindenkit várunk a táncparketten!", icon: Music },
  { time: "23:00", title: "Tortavágás", desc: "Édes pillanatok és tűzijáték a kertben.", icon: Sparkles },
  { time: "00:30", title: "Menyecsketánc", desc: "Hajnalig tartó mulatság élő zenekarral és DJ-vel.", icon: PartyPopper },
];

const INFOS = [
  {
    icon: Shirt,
    title: "Dress code",
    text: "Elegáns viselet – a hölgyeket arra kérjük, a fehéret hagyják meg a menyasszonynak. A paletta: pasztell és földszínek.",
  },
  {
    icon: Gift,
    title: "Ajándék",
    text: "A legnagyobb ajándék, ha ott vagy! Ha mégis szeretnél hozzájárulni, a nászajándékot borítékban, a közös jövőnkre fordítjuk – nászutunk Toszkánába vezet.",
  },
  {
    icon: Hotel,
    title: "Szállás",
    text: "A környékbeli vendégeknek szobákat foglaltunk a Hotel Continental Forum Aradban, kedvezményes áron – a foglaláshoz add meg a „Zsófi & Szili” jelszót.",
  },
  {
    icon: Baby,
    title: "Gyerekek",
    text: "A legkisebbeket is szeretettel várjuk! A birtokon játszósarok és gyermekfelügyelet is lesz egész este.",
  },
];

export default function ZsoEsSziliPage() {
  return (
    <div className="zs-root min-h-screen">
      {/* Tipográfia: saját hostolású Cormorant Garamond + Great Vibes + Jost
          (@font-face a globals.css-ben, fájlok: public/fonts/zs) */}
      {/* ── Hero ──────────────────────────────────────────── */}
      <header className="zs-hero relative overflow-hidden px-4 pb-20 pt-24 text-center sm:pb-28 sm:pt-32">
        <OrnamentCorner className="left-4 top-4 sm:left-10 sm:top-10" />
        <OrnamentCorner className="right-4 top-4 rotate-90 sm:right-10 sm:top-10" />
        <OrnamentCorner className="bottom-4 left-4 -rotate-90 sm:bottom-10 sm:left-10" />
        <OrnamentCorner className="bottom-4 right-4 rotate-180 sm:bottom-10 sm:right-10" />

        <div className="relative mx-auto max-w-3xl">
          <p className="zs-caps text-xs sm:text-sm">Örömmel tudatjuk, hogy összeházasodunk</p>

          <div className="zs-monogram mx-auto mt-8">
            <span className="zs-script">Zs</span>
            <span className="zs-serif zs-amp">&</span>
            <span className="zs-script">Sz</span>
          </div>

          <h1 className="zs-serif mt-8 text-4xl leading-tight sm:text-6xl">
            Kispál Zsófia
            <span className="zs-script zs-hero-amp block py-1 text-5xl sm:text-7xl" aria-hidden>
              és
            </span>
            Ferencz Szilveszter
          </h1>

          <div className="zs-rule mx-auto mt-10" />

          <p className="zs-serif mt-8 text-xl tracking-wide sm:text-2xl">
            2027. június 15. · kedd · 16:00
          </p>
          <p className="zs-muted mt-2 flex items-center justify-center gap-1.5 text-sm sm:text-base">
            <MapPin className="h-4 w-4" aria-hidden />
            Arad, Románia
          </p>

          <div className="mt-12">
            <Countdown />
          </div>

          <a href="#rsvp" className="zs-btn mx-auto mt-12 inline-flex w-auto px-8">
            <CalendarHeart className="h-4 w-4" aria-hidden />
            Visszajelzek
          </a>
        </div>
      </header>

      {/* ── Meghívó szöveg ────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="zs-script text-4xl sm:text-5xl">Kedves Vendégünk!</span>
          <p className="mt-8 text-[17px] leading-relaxed sm:text-lg">
            Két éve együtt nevetünk, utazunk, és tervezzük a közös jövőt – most pedig
            eljött a pillanat, hogy a családunk és a barátaink előtt is kimondjuk:{" "}
            <em className="zs-serif">igen, egymást választjuk egy életre.</em>
          </p>
          <p className="zs-muted mt-5 text-[16px] leading-relaxed">
            Nagy esküvőt tervezünk: közel <strong>250 vendéggel</strong>, hajnalig tartó
            tánccal és rengeteg szeretettel. Gyere, ünnepelj velünk – nélküled nem lenne
            teljes ez a nap!
          </p>
          <Heart className="zs-accent mx-auto mt-8 h-5 w-5" aria-hidden />
        </Reveal>
      </section>

      {/* ── Történetünk ───────────────────────────────────── */}
      <section className="zs-alt px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <SectionTitle script="A mi" title="Történetünk" />
          <div className="zs-timeline mt-14">
            {STORY.map((s, i) => (
              <Reveal key={s.year} delay={i * 100} className="zs-tl-item">
                <div className="zs-tl-dot" aria-hidden />
                <p className="zs-script zs-accent text-3xl">{s.year}</p>
                <h3 className="zs-serif mt-1 text-xl">{s.title}</h3>
                <p className="zs-muted mt-2 text-[15px] leading-relaxed">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Program ───────────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <SectionTitle script="A nagy nap" title="Programja" />
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {PROGRAM.map((p, i) => (
              <Reveal key={p.time} delay={(i % 2) * 100}>
                <div className="zs-card flex h-full items-start gap-4 px-5 py-5">
                  <span className="zs-icon-ring shrink-0">
                    <p.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="zs-caps flex items-center gap-1.5 text-[11px]">
                      <Clock className="h-3 w-3" aria-hidden />
                      {p.time}
                    </p>
                    <h3 className="zs-serif mt-1 text-lg leading-snug">{p.title}</h3>
                    <p className="zs-muted mt-1 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Helyszínek ────────────────────────────────────── */}
      <section className="zs-alt px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionTitle script="Hol" title="Találkozunk?" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <Reveal>
              <div className="zs-card h-full px-7 py-8 text-center">
                <span className="zs-icon-ring mx-auto">
                  <Church className="h-6 w-6" aria-hidden />
                </span>
                <p className="zs-caps mt-5 text-[11px]">Szertartás · 16:00</p>
                <h3 className="zs-serif mt-2 text-2xl">Páduai Szent Antal-templom</h3>
                <p className="zs-muted mt-3 text-[15px] leading-relaxed">
                  Bulevardul Revoluției 96., Arad
                  <br />
                  Arad belvárosának gyönyörű, neobarokk temploma – a szertartás után a
                  templomkertben gratulálhattok.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="zs-card h-full px-7 py-8 text-center">
                <span className="zs-icon-ring mx-auto">
                  <PartyPopper className="h-6 w-6" aria-hidden />
                </span>
                <p className="zs-caps mt-5 text-[11px]">Lakodalom · 18:00</p>
                <h3 className="zs-serif mt-2 text-2xl">Csillagkert Birtok</h3>
                <p className="zs-muted mt-3 text-[15px] leading-relaxed">
                  Arad-hegyalja, a várostól 15 percre
                  <br />
                  Százéves platánok alatt terített asztalok, kerti lampionok és hajnalig
                  tartó mulatság – transzferbuszok indulnak a templomtól.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Hasznos tudnivalók ────────────────────────────── */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionTitle script="Jó, ha" title="Tudod" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {INFOS.map((info, i) => (
              <Reveal key={info.title} delay={(i % 2) * 100}>
                <div className="zs-card flex h-full items-start gap-4 px-6 py-6">
                  <span className="zs-icon-ring shrink-0">
                    <info.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="zs-serif text-xl">{info.title}</h3>
                    <p className="zs-muted mt-2 text-[15px] leading-relaxed">{info.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── RSVP ──────────────────────────────────────────── */}
      <section id="rsvp" className="zs-alt scroll-mt-8 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <SectionTitle script="Ott leszel?" title="Visszajelzés" />
          <p className="zs-muted mx-auto mt-6 max-w-xl text-center text-[15px] leading-relaxed">
            Kérünk, jelezd 2027. május 1-ig, hogy számíthatunk-e rád – így mindenkinek
            jut hely, finom falat és tánc a parketten.
          </p>
          <div className="mt-10">
            <RsvpForm />
          </div>
        </div>
      </section>

      {/* ── Lábléc ────────────────────────────────────────── */}
      <footer className="zs-footer px-4 py-14 text-center">
        <div className="zs-monogram zs-monogram-sm mx-auto">
          <span className="zs-script">Zs</span>
          <span className="zs-serif zs-amp">&</span>
          <span className="zs-script">Sz</span>
        </div>
        <p className="zs-serif mt-5 text-lg">Kispál Zsófia & Ferencz Szilveszter</p>
        <p className="zs-caps mt-2 text-[11px]">2027. 06. 15. · Arad</p>
        <p className="zs-muted mt-6 text-xs">
          Kérdésed van? Írj a tanúknak: Bartha Emese · +40 7XX XXX XXX vagy Lengyel Bence
          · +36 30 XXX XXXX
        </p>
      </footer>
    </div>
  );
}

/* ── Kis szerver-oldali segédkomponensek ─────────────────── */

function SectionTitle({ script, title }: { script: string; title: string }) {
  return (
    <Reveal className="text-center">
      <span className="zs-script zs-accent text-3xl sm:text-4xl">{script}</span>
      <h2 className="zs-serif mt-1 text-3xl sm:text-4xl">{title}</h2>
      <div className="zs-rule mx-auto mt-6" />
    </Reveal>
  );
}

function OrnamentCorner({ className }: { className: string }) {
  return (
    <svg
      className={`zs-ornament pointer-events-none absolute h-16 w-16 sm:h-24 sm:w-24 ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 60 C2 28 28 2 60 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2 78 C2 36 36 2 78 2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="2" cy="88" r="2.5" fill="currentColor" />
      <circle cx="88" cy="2" r="2.5" fill="currentColor" />
      <path
        d="M14 46c6-8 16-10 24-6-2 9-10 15-20 14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
