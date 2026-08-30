import { ArrowRight, MailOpen, Sparkles } from "lucide-react";

/**
 * A Meghívók kategória élén álló saját ajánlatunk. Ugyanakkora helyet foglal,
 * mint egy szolgáltatói kártya (rács nézetben csempe, listanézetben sor), és
 * a digitális meghívók oldalára visz.
 */
export function MeghivoPromoCard({ listView = false }: { listView?: boolean }) {
  /* Listanézetben a szolgáltatói sorok ritmusát követi: bal oldalt kör alakú
     jel az arckép helyén, középen a név–leírás–címke hármas, jobbra a gomb.
     Ettől ugyanolyan magas lesz, mint a többi sor, csak a teal háttér és a
     „Saját szolgáltatás" címke jelzi, hogy ez a mi ajánlatunk. */
  if (listView) {
    return (
      <a
        href="/meghivo"
        className="group flex flex-col gap-3 rounded-xl border border-[#84AAA6]/40 bg-[#F0F6F5] px-4 py-3 shadow-sm transition-all hover:border-[#84AAA6] hover:shadow-md sm:flex-row sm:items-center sm:gap-3"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Kör alakú jel a szolgáltatói arckép helyén */}
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#84AAA6] shadow-sm">
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
              <span className="inline-flex items-center gap-1 rounded-full bg-[#84AAA6] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
                Saját szolgáltatás
              </span>
              <span className="rounded-full border border-[#84AAA6]/40 bg-[#84AAA6]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#5C8480]">
                már 14&nbsp;900&nbsp;Ft-tól
              </span>
            </div>
          </div>
        </div>

        {/* Mobilon a gomb saját sorba kerül, hogy a névnek maradjon hely */}
        <span className="flex w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#84AAA6] px-3 py-1.5 text-sm font-medium text-white transition-colors group-hover:bg-[#6B8E8A] sm:w-auto">
          Megnézem a csomagokat
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </a>
    );
  }

  return (
    <a
      href="/meghivo"
      className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-2xl border border-[#84AAA6]/40 bg-[#F0F6F5] p-5 transition-colors hover:border-[#84AAA6]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#84AAA6]/15 blur-2xl"
      />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#84AAA6] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          Saját szolgáltatás
        </span>
        <h3 className="mt-3 flex items-center gap-2 text-xl font-bold text-gray-900">
          <MailOpen className="h-5 w-5 shrink-0 text-[#84AAA6]" strokeWidth={1.75} />
          Digitális esküvői meghívó
        </h3>
        <p className="mt-2 text-base leading-relaxed text-gray-700">
          Felejtsd el a papírt! Egyetlen linken elküldhető, mobilra szabott meghívó
          visszaszámlálóval, programmal és online visszajelzéssel – már 14&nbsp;900&nbsp;Ft-tól.
        </p>
      </div>

      <span className="relative mt-5 inline-flex items-center gap-2 self-start rounded-full bg-[#84AAA6] px-5 py-2.5 text-[15px] font-bold text-white transition-colors group-hover:bg-[#6B8E8A]">
        Megnézem a csomagokat
        <ArrowRight className="h-4 w-4" />
      </span>
    </a>
  );
}
