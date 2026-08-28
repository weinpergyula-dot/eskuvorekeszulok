import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";

/**
 * Csoportos ajánlatkérés — a szolgáltatói listázás előtt álló sáv a
 * főoldalon. Egy üzenettel több egyező szolgáltató is megszólítható, ezért
 * érdemes még a böngészés előtt felkínálni.
 */
export function GroupQuoteCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="teal-shift-bg relative isolate overflow-hidden rounded-2xl px-5 py-6 shadow-[0_18px_50px_-30px_rgba(20,45,42,0.6)] ring-1 ring-white/25 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-white/20 sm:grid"
            >
              <Send className="h-5 w-5 text-white" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Nem akarsz egyenként végigírni mindenkit?
              </h2>
              <p className="mt-1.5 text-base leading-relaxed text-white/90">
                Küldj egyetlen ajánlatkérést, és mi eljuttatjuk az általad választott,
                egyező szolgáltatóknak – ők pedig itt, az oldalon válaszolnak.
              </p>
            </div>
          </div>

          <Link
            href="/profil?tab=quotes"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-6 py-3 text-[15px] font-bold text-[#2D5854] shadow-md transition-transform hover:scale-[1.03] sm:self-auto"
          >
            Csoportos ajánlatkérés
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
