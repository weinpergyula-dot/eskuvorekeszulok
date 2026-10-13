import { ArrowRight, MailOpen, Sparkles } from "lucide-react";

/**
 * A Meghívók kategória élén álló saját ajánlatunk. Ugyanakkora helyet foglal,
 * mint egy szolgáltatói kártya (rács nézetben csempe, listanézetben sor), és
 * a digitális meghívók oldalára visz.
 */
export function MeghivoPromoCard({ listView = false }: { listView?: boolean }) {
  /* Listanézetben a szolgáltatói sorok ritmusát követi: bal oldalt kör alakú
     jel az arckép helyén, középen a név–leírás–címke hármas, jobbra a gomb.
     Ettől ugyanolyan magas lesz, mint a többi sor, csak a rózsaszín háttér és a
     „Saját szolgáltatás" címke jelzi, hogy ez a mi ajánlatunk. */
  if (listView) {
    return (
      <a
        href="/meghivo"
        className="group flex flex-col gap-3 rounded-xl border border-[#C65EA5]/40 bg-[#FAF0F7] px-4 py-3 shadow-sm transition-all hover:border-[#C65EA5] hover:shadow-md sm:flex-row sm:items-center sm:gap-3"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Kör alakú jel a szolgáltatói arckép helyén */}
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#C65EA5] shadow-sm">
            <MailOpen className="h-7 w-7 text-white" strokeWidth={1.5} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[16px] font-bold text-gray-900">
              Digitális esküvői meghívó
            </div>
            <p className="mt-0.5 line-clamp-3 text-sm leading-snug text-gray-500">
              Egy linken elküldhető meghívó visszaszámlálóval és online visszajelzéssel.
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#C65EA5] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                Saját szolgáltatás
              </span>
              <span className="rounded-full border border-[#C65EA5]/40 bg-[#C65EA5]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#A34A87]">
                már 14&nbsp;900&nbsp;Ft-tól
              </span>
            </div>
          </div>
        </div>

        {/* Mobilon a gomb saját sorba kerül, hogy a névnek maradjon hely */}
        <span className="flex w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#C65EA5] px-3 py-1.5 text-sm font-medium text-white transition-colors group-hover:bg-[#B04E91] sm:w-auto">
          Megnézem a csomagokat
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </a>
    );
  }

  return (
    <a
      href="/meghivo"
      className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-2xl border border-[#C65EA5]/40 bg-[#FAF0F7] px-5 pb-14 pt-5 transition-colors hover:border-[#C65EA5]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C65EA5]/15 blur-2xl"
      />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C65EA5] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          Saját szolgáltatás
        </span>
        <h3 className="mt-3 flex items-center gap-2 text-xl font-bold text-gray-900">
          <MailOpen className="h-5 w-5 shrink-0 text-[#C65EA5]" strokeWidth={1.75} />
          Digitális esküvői meghívó
        </h3>
        <p className="mt-2 text-base leading-relaxed text-gray-700">
          Felejtsd el a papírt! Egyetlen linken elküldhető, mobilra szabott meghívó
          visszaszámlálóval, programmal és online visszajelzéssel – már 14&nbsp;900&nbsp;Ft-tól.
        </p>
      </div>

      {/* Desktopon a szöveg és a gomb közti üres sávba a három csomag
         mintája kerül, legyezőszerűen: középen, legelöl a PREMIUM, két
         oldalt megdöntve a BASIC és a SILVER. A sáv abszolút pozicionált
         tartalommal tölti ki a maradék helyet, így a kártya magasságát a
         rács többi eleme diktálja, nem a telefonok. */}
      <div aria-hidden className="relative hidden min-h-[180px] flex-1 lg:block">
        <span className="pointer-events-none absolute inset-x-6 bottom-2 top-6 rounded-full bg-[#C65EA5]/20 blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center pt-4">
          <MiniPhone
            src="/meghivo/slide-basic.webp"
            label="Basic"
            className="z-0 -mr-6 translate-y-3 -rotate-[9deg] group-hover:-translate-x-2 group-hover:-rotate-[12deg]"
          />
          <MiniPhone
            src="/meghivo/slide-premium.webp"
            label="Premium"
            className="z-10 -translate-y-1 scale-110 group-hover:-translate-y-3"
          />
          <MiniPhone
            src="/meghivo/slide-silver.webp"
            label="Silver"
            className="z-0 -ml-6 translate-y-3 rotate-[9deg] group-hover:translate-x-2 group-hover:rotate-[12deg]"
          />
        </div>
      </div>

      {/* A gomb felirata, mérete és helye is a szolgáltatói kártyák
         „Részletek" gombját követi: a lábléc px-4 py-3 belső margójának
         megfelelően a jobb alsó sarokhoz igazítva, így nem lóg rá a minták
         képére. */}
      <span className="absolute bottom-3 right-4 inline-flex items-center whitespace-nowrap rounded-full bg-[#C65EA5] px-3 py-1.5 text-sm font-medium text-white transition-colors group-hover:bg-[#B04E91]">
        Részletek
      </span>
    </a>
  );
}

/** Kicsinyített telefonkeret egy meghívó-minta képernyőképével. */
function MiniPhone({ src, label, className = "" }: { src: string; label: string; className?: string }) {
  return (
    <div className={`relative flex h-full max-h-[240px] flex-col items-center transition-transform duration-500 ease-out ${className}`}>
      <div className="aspect-[390/844] h-full rounded-[0.9rem] bg-gray-900 p-[3px] shadow-[0_18px_30px_-14px_rgba(70,20,55,0.6)] ring-1 ring-white/30">
        <div className="relative h-full overflow-hidden rounded-[0.7rem] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" loading="lazy" className="block h-full w-full object-cover object-top" />
          <span className="absolute left-1/2 top-1 h-1 w-6 -translate-x-1/2 rounded-full bg-gray-900" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/25" />
        </div>
      </div>
      <span className="absolute -bottom-2.5 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#A34A87] shadow-sm ring-1 ring-[#C65EA5]/30">
        {label}
      </span>
    </div>
  );
}
