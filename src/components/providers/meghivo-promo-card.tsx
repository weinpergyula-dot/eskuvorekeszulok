import { ArrowRight, MailOpen, Sparkles, Timer, CalendarHeart, MessageSquareHeart } from "lucide-react";

/**
 * A Meghívók kategória élén álló saját ajánlatunk – prémium, sötét–arany
 * kártya, ugyanakkora és ugyanolyan felépítésű, mint a szolgáltatói kártyák
 * (ProviderTile): felül üveg címke, középen a három csomag mintája
 * legyezőszerűen, alul cím, ár, jellemzők és a Megnézem gomb. Listanézetben
 * a ProviderRow sorához igazodik. A digitális meghívók oldalára visz.
 */

const GOLD = "#C9A46A";

const FEATURES = [
  { Icon: Timer, label: "Visszaszámláló" },
  { Icon: CalendarHeart, label: "Program" },
  { Icon: MessageSquareHeart, label: "Online visszajelzés" },
];

export function MeghivoPromoCard({ listView = false }: { listView?: boolean }) {
  if (listView) {
    return (
      <a
        href="/meghivo"
        className="group relative flex items-center gap-3 overflow-hidden rounded-[26px] p-2 ring-1 ring-[#B8925A]/40 shadow-[0_16px_34px_-24px_rgba(40,28,10,0.7)]"
        style={{ background: "linear-gradient(140deg, #2B2319 0%, #17130E 100%)" }}
      >
        <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#C9A46A]/25 blur-3xl transform-gpu" />
        <span className="relative flex h-[92px] w-[92px] sm:h-[104px] sm:w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-black/30 ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/meghivo/slide-gold.webp" alt="" loading="lazy" className="h-full w-full object-cover object-top opacity-90" />
        </span>
        <div className="relative min-w-0 flex-1 py-1">
          <p className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: GOLD }}>
            <Sparkles className="h-3 w-3" /> Saját szolgáltatás
          </p>
          <h3 className="mt-0.5 font-heading text-[17px] sm:text-[19px] font-bold leading-tight text-white line-clamp-1">
            Digitális esküvői meghívó
          </h3>
          <p className="mt-1 text-[13px] text-white/70">
            3 csomag · már <span className="font-semibold text-white">14&nbsp;900&nbsp;Ft</span>-tól
          </p>
        </div>
        <span className="tile-cta-gold relative mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full" aria-label="Megnézem">
          <ArrowRight className="h-4 w-4" />
        </span>
      </a>
    );
  }

  return (
    <article className="flex flex-col">
      <a
        href="/meghivo"
        className="group relative block overflow-hidden rounded-[30px] aspect-[4/4.4] sm:aspect-[4/4] ring-1 ring-[#B8925A]/45 shadow-[0_30px_50px_-28px_rgba(40,28,10,0.75)]"
        style={{ background: "radial-gradient(120% 80% at 50% 38%, #3A2F20 0%, #1E1912 55%, #120F0B 100%)" }}
      >
        {/* Arany fények a háttérben */}
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-[38%] h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A46A]/25 blur-3xl transform-gpu" />
        <span aria-hidden className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-[#C9A46A]/10 blur-3xl transform-gpu" />
        {/* Vékony belső arany keret */}
        <span aria-hidden className="pointer-events-none absolute inset-2 rounded-[24px] ring-1 ring-[#C9A46A]/20" />

        {/* Felső sor: címke */}
        <div className="absolute inset-x-3.5 top-3.5 z-20 flex items-start justify-between">
          {/* Homályosítás (backdrop-filter) nélkül: a mögötte lévő megdöntött
              telefonok mellett az iOS Safari villogva rajzolná újra. */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[13px] font-semibold text-[#262626] ring-1 ring-white">
            <Sparkles className="h-4 w-4" style={{ color: "#B8925A" }} />
            Saját szolgáltatás
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/25">
            <MailOpen className="h-4 w-4" />
          </span>
        </div>

        {/* A három csomag mintája legyezőszerűen */}
        <div aria-hidden className="absolute inset-x-0 top-[12%] bottom-[47%] flex items-center justify-center">
          <MiniPhone
            src="/meghivo/slide-basic.webp"
            label="Basic"
            className="z-0 -mr-7 translate-y-3 -rotate-[10deg] group-hover:-translate-x-2 group-hover:-rotate-[13deg]"
          />
          <MiniPhone
            src="/meghivo/slide-gold.webp"
            label="Gold"
            className="z-10 -translate-y-1 scale-110 group-hover:-translate-y-3"
          />
          <MiniPhone
            src="/meghivo/slide-silver.webp"
            label="Silver"
            className="z-0 -ml-7 translate-y-3 rotate-[10deg] group-hover:translate-x-2 group-hover:rotate-[13deg]"
          />
        </div>

        {/* Alsó sáv: cím, ár, jellemzők, gomb – a szolgáltatói kártyák mintájára */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-4 text-white">
          <div className="pointer-events-none absolute inset-0 -top-10 bg-gradient-to-t from-[#120F0B] via-[#120F0B]/85 to-transparent" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: GOLD }}>
              Digitális meghívó · 3 csomag
            </p>
            <h3 className="mt-0.5 font-heading text-[22px] font-bold leading-tight">Digitális esküvői meghívó</h3>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-white/80">
              {FEATURES.map(({ Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1">
                  <Icon className="h-3.5 w-3.5" style={{ color: GOLD }} />
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[13px] text-white/70 leading-tight">
                már
                <span className="block font-heading text-[22px] font-bold text-white leading-none">14&nbsp;900&nbsp;Ft</span>
              </p>
              <span className="glass-dark flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 text-[14px] font-semibold">
                Megnézem
                <span className="tile-cta-gold flex h-8 w-8 items-center justify-center rounded-full">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </span>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
}

/** Kicsinyített telefonkeret egy meghívó-minta képernyőképével. */
function MiniPhone({ src, label, className = "" }: { src: string; label: string; className?: string }) {
  return (
    <div className={`mini-phone relative flex h-full max-h-[230px] flex-col items-center transition-transform duration-500 ease-out ${className}`}>
      <div className="aspect-[390/844] h-full rounded-[0.95rem] bg-[#0b0b0b] p-[3px] shadow-[0_22px_34px_-14px_rgba(0,0,0,0.85)] border border-[#C9A46A]/35">
        <div className="relative h-full overflow-hidden rounded-[0.75rem] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" loading="lazy" className="block h-full w-full object-cover object-top" />
          <span className="absolute left-1/2 top-1 h-1 w-6 -translate-x-1/2 rounded-full bg-gray-900" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/25" />
        </div>
      </div>
      <span className="absolute -bottom-2.5 rounded-full bg-[#1E1912] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ring-1 ring-[#C9A46A]/50" style={{ color: GOLD }}>
        {label}
      </span>
    </div>
  );
}
