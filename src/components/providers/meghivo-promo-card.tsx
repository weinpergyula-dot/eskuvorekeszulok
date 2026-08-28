import { ArrowRight, MailOpen, Sparkles } from "lucide-react";

/**
 * A Meghívók kategória élén álló saját ajánlatunk. Ugyanakkora helyet foglal,
 * mint egy szolgáltatói kártya (rács nézetben csempe, listanézetben sor), és
 * a digitális meghívók oldalára visz.
 */
export function MeghivoPromoCard({ listView = false }: { listView?: boolean }) {
  return (
    <a
      href="/meghivo"
      className={`group relative flex overflow-hidden rounded-2xl border border-[#84AAA6]/40 bg-[#F0F6F5] p-5 transition-colors hover:border-[#84AAA6] ${
        listView ? "flex-row items-center gap-5" : "min-h-[260px] flex-col justify-between"
      }`}
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

      <span
        className={`relative inline-flex items-center gap-2 self-start rounded-full bg-[#84AAA6] px-5 py-2.5 text-[15px] font-bold text-white transition-colors group-hover:bg-[#6B8E8A] ${
          listView ? "shrink-0" : "mt-5"
        }`}
      >
        Megnézem a csomagokat
        <ArrowRight className="h-4 w-4" />
      </span>
    </a>
  );
}
