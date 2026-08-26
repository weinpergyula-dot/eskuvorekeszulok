"use client";

import { useState } from "react";
import {
  Heart,
  Palette,
  Send,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * A /meghivo felső, füles blokkja: "Miért népszerű?" és "Hogyan működik?"
 * ugyanazon a helyen, szegmens-váltóval – a látogató választja ki, melyiket
 * nézi. A csempék a főoldal színvilágát viszik tovább (teal / pink).
 */

type Card = { icon: LucideIcon; title: string; text: string };

const WHY: Card[] = [
  {
    icon: Smartphone,
    title: "Mindig kéznél van",
    text: "A vendégeid a telefonjukon bármikor megnézhetik – nem vész el, nem gyűrődik, és az utolsó pillanatban is frissíthető.",
  },
  {
    icon: Send,
    title: "Egy link, és kész",
    text: "Messengeren, WhatsAppon vagy e-mailben pillanatok alatt eljut mindenkihez – a visszajelzések pedig maguktól gyűlnek.",
  },
  {
    icon: Sparkles,
    title: "Egyedi és látványos",
    text: "Animációk, visszaszámláló, a ti történetetek – olyan meghívó, amiről még hetekkel később is beszélnek a vendégek.",
  },
];

const HOW: Card[] = [
  {
    icon: Send,
    title: "1. Ajánlatkérés",
    text: "Írjátok meg nekünk, melyik csomag tetszik, és meséljetek pár szót az esküvőtökről.",
  },
  {
    icon: Palette,
    title: "2. Tervezés",
    text: "Elkészítjük a meghívótok első változatát a színeitek és a stílusotok alapján.",
  },
  {
    icon: Heart,
    title: "3. Finomhangolás",
    text: "Addig csiszoljuk közösen, amíg minden betű és szín a helyére nem kerül.",
  },
  {
    icon: Smartphone,
    title: "4. Átadás",
    text: "Megkapjátok a saját linketeket, amit azonnal küldhettek a vendégeknek.",
  },
];

const TABS = [
  { id: "why", label: "Miért népszerű?", accent: "#84AAA6", panel: "#F0F6F5", cards: WHY },
  { id: "how", label: "Hogyan működik?", accent: "#C65EA5", panel: "#FAF0F7", cards: HOW },
] as const;

export function IntroTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("why");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <div>
      {/* Szegmens-váltó */}
      <div
        role="tablist"
        aria-label="Bemutató nézetek"
        className="mx-auto flex max-w-xl rounded-full bg-gray-100 p-1"
      >
        {TABS.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(t.id)}
              className={`flex-1 rounded-full px-4 py-2.5 text-[15px] font-bold transition-all duration-200 sm:text-base ${
                selected ? "bg-white shadow-md" : "text-gray-500 hover:text-gray-700"
              }`}
              style={selected ? { color: t.accent } : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Kártyák */}
      <div
        key={tab.id}
        className={`mwr-card-in mt-8 grid gap-6 sm:grid-cols-2 ${
          tab.cards.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
        }`}
      >
        {tab.cards.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl p-6"
            style={{ backgroundColor: tab.panel }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: tab.accent }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-gray-600">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
