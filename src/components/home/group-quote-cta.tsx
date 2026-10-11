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
        {/* Figyelemfelhívó ikon: teli teal kör, felül középen. */}
        <span
          aria-hidden
          className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full bg-[#84AAA6]"
        >
          <Send className="h-5 w-5 text-white" strokeWidth={2} />
        </span>

        {/* Két hasáb: balra a szövegek, jobbra a gomb. Kijelentkezve a gomb
            a tájékoztató ablakot nyitja (LoginGateLink). */}
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Nem akarsz egyesével ajánlatot kérni?
            </h2>
            <p className="mt-1.5 text-base leading-relaxed text-gray-800">
              Küldj egyetlen ajánlatkérést az általad választott szolgáltatóknak.
            </p>
          </div>

          <LoginGateLink
            href="/profil?tab=quotes"
            message="Az ajánlatkérés csak regisztrált felhasználók számára érhető el."
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#84AAA6] px-4 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-[#6B8E8A] sm:px-6"
          >
            Megnézem
            <ArrowRight className="h-4 w-4" />
          </LoginGateLink>
        </div>
      </div>
    </section>
  );
}
