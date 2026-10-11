import { ArrowRight, Send } from "lucide-react";
import { LoginGateLink } from "@/components/providers/masked-contact";

/**
 * Csoportos ajánlatkérés — a szolgáltatói listázás előtt álló sáv a
 * főoldalon. Egy üzenettel több szolgáltató is megszólítható, ezért érdemes
 * még a böngészés előtt felkínálni.
 *
 * A keret ugyanaz az iOS 27 „Liquid Glass” üveg, mint a chat beviteli
 * dobozáé (`chat-composer-glass`, lásd globals.css).
 */
export function GroupQuoteCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="chat-composer-glass relative isolate overflow-hidden px-6 py-7 sm:px-10 sm:py-8">
        {/* Mobilon egy oszlop, alul teljes szélességű gomb; gépen egy sor:
            balra a szövegek, jobbra (függőlegesen középen) a gomb. */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="min-w-0">
            {/* Ikon + kis felirat egy sorban, a cím fölött. */}
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#84AAA6]"
              >
                <Send className="h-[18px] w-[18px] text-white" strokeWidth={2} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8E8A]">
                Csoportos ajánlatkérés
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold leading-tight text-gray-900 sm:text-[1.75rem]">
              Nem akarsz egyesével ajánlatot kérni?
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              Küldj egyetlen ajánlatkérést a választott szolgáltatóknak.
            </p>
          </div>

          {/* Kijelentkezve a gomb a tájékoztató ablakot nyitja (LoginGateLink). */}
          <LoginGateLink
            href="/profil?tab=quotes"
            message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
            className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#84AAA6] px-7 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-[#6B8E8A] md:w-auto"
          >
            Megnézem
            <ArrowRight className="h-4 w-4" />
          </LoginGateLink>
        </div>
      </div>
    </section>
  );
}
