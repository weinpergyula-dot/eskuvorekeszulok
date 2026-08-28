import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";

/**
 * Csoportos ajánlatkérés — a szolgáltatói listázás előtt álló sáv a
 * főoldalon. Egy üzenettel több szolgáltató is megszólítható, ezért érdemes
 * még a böngészés előtt felkínálni.
 *
 * A háttér csendes: álló, semleges ezüst–fehér átmenet (se szín, se
 * mozgás), sötét szöveggel; a hangsúlyt a teal gomb viszi.
 */
const SILVER_BG =
  "linear-gradient(145deg, #FFFFFF 0%, #F1F1F2 30%, #DCDCDE 60%, #F6F6F7 100%)";

export function GroupQuoteCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div
        className="relative isolate overflow-hidden rounded-2xl px-5 py-6 shadow-[0_18px_50px_-30px_rgba(45,88,84,0.35)] ring-1 ring-black/5 sm:px-7 sm:py-7"
        style={{ background: SILVER_BG }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-[#456965]/12 sm:grid"
            >
              <Send className="h-5 w-5 text-[#456965]" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Nem akarsz egyenként végigírni mindenkinek?
              </h2>
              <p className="mt-1.5 text-base leading-relaxed text-gray-800">
                Küldj egyetlen ajánlatkérést az általad választott szolgáltatóknak –
                ők pedig itt, az oldalon válaszolnak.
              </p>
            </div>
          </div>

          <Link
            href="/profil?tab=quotes"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#456965] px-6 py-3 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-[#38564F] sm:self-auto"
          >
            Csoportos ajánlatkérés
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
