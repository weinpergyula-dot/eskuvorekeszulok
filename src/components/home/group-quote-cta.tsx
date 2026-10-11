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
      <div className="chat-composer-glass relative isolate overflow-hidden px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex items-start gap-4">
            {/* Figyelemfelhívó ikon: teli teal kör halvány teal gyűrűvel,
                mobilon is. */}
            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#84AAA6] shadow-[0_0_0_6px_rgba(132,170,166,0.18)]"
            >
              <Send className="h-5 w-5 text-white" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Nem akarsz egyesével ajánlatot kérni?
              </h2>
              <p className="mt-1.5 text-base leading-relaxed text-gray-800">
                Küldj egyetlen ajánlatkérést az általad választott szolgáltatóknak –
                ők pedig itt, az oldalon válaszolnak.
              </p>
            </div>
          </div>

          <LoginGateLink
            href="/profil?tab=quotes"
            message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#84AAA6] px-6 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-[#6B8E8A] sm:self-auto"
          >
            Csoportos ajánlatkérés
            <ArrowRight className="h-4 w-4" />
          </LoginGateLink>
        </div>
      </div>
    </section>
  );
}
