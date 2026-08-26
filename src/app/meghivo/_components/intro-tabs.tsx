"use client";

import { useState } from "react";
import {
  Heart,
  ListChecks,
  Palette,
  Send,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * A /meghivo alsó, füles blokkja: "Miért népszerű?" és "Hogyan működik?"
 * ugyanazon a helyen, szegmens-váltóval. A két nézet szándékosan másképp
 * néz ki: az előnyök emelt kártyákon, a folyamat számozott lépéssoron
 * (desktopon vízszintes, mobilon függőleges idővonal).
 */

const ACCENT = { why: "#84AAA6", how: "#C65EA5" } as const;

const WHY: { icon: LucideIcon; title: string; text: string }[] = [
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

const HOW: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Send, title: "Ajánlatkérés", text: "Írjátok meg, melyik csomag tetszik, és meséljetek pár szót az esküvőtökről." },
  { icon: Palette, title: "Tervezés", text: "Elkészítjük az első változatot a színeitek és a stílusotok alapján." },
  { icon: Heart, title: "Finomhangolás", text: "Addig csiszoljuk közösen, amíg minden betű és szín a helyére nem kerül." },
  { icon: Smartphone, title: "Átadás", text: "Megkapjátok a saját linketeket, amit azonnal küldhettek a vendégeknek." },
];

const TABS = [
  { id: "why", label: "Miért népszerű?", icon: Sparkles },
  { id: "how", label: "Hogyan működik?", icon: ListChecks },
] as const;

function WhyCards() {
  return (
    <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-3">
      {WHY.map(({ icon: Icon, title, text }) => (
        <article
          key={title}
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 pt-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          {/* felső élcsík, ami hoverre kiszínesedik */}
          <span
            className="absolute inset-x-0 top-0 h-1 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
            style={{ backgroundColor: ACCENT.why }}
            aria-hidden
          />
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${ACCENT.why}1f`, color: ACCENT.why }}
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{text}</p>
        </article>
      ))}
    </div>
  );
}

function HowSteps() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Desktop: vízszintes lépéssor összekötő vonallal */}
      <ol className="relative hidden sm:grid sm:grid-cols-4 sm:gap-6">
        <span
          className="absolute left-[12.5%] right-[12.5%] top-7 h-px"
          style={{ background: `linear-gradient(90deg, ${ACCENT.how}33, ${ACCENT.how}80, ${ACCENT.how}33)` }}
          aria-hidden
        />
        {HOW.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative flex flex-col items-center text-center">
            <span
              className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white text-white shadow-md"
              style={{ backgroundColor: ACCENT.how }}
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <span
              className="mt-3 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: ACCENT.how }}
            >
              {i + 1}. lépés
            </span>
            <h3 className="mt-1 text-lg font-bold text-gray-900">{title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-gray-600">{text}</p>
          </li>
        ))}
      </ol>

      {/* Mobil: függőleges idővonal */}
      <ol className="space-y-6 sm:hidden">
        {HOW.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative flex gap-4">
            {/* összekötő vonal az utolsó kivételével */}
            {i < HOW.length - 1 && (
              <span
                className="absolute left-[27px] top-14 h-[calc(100%-2rem)] w-px"
                style={{ backgroundColor: `${ACCENT.how}40` }}
                aria-hidden
              />
            )}
            <span
              className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-md"
              style={{ backgroundColor: ACCENT.how }}
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div className="pt-1">
              <span
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: ACCENT.how }}
              >
                {i + 1}. lépés
              </span>
              <h3 className="mt-0.5 text-lg font-bold text-gray-900">{title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-gray-600">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function IntroTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("why");
  const accent = ACCENT[active];

  return (
    <div>
      {/* Szegmens-váltó: ikonos, aláhúzott aktív fül */}
      <div
        role="tablist"
        aria-label="Bemutató nézetek"
        className="mx-auto flex w-fit items-center gap-1 rounded-full border border-gray-200 bg-white p-1.5 shadow-sm"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = id === active;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-bold transition-all duration-200 sm:px-7 sm:text-base ${
                selected ? "text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
              style={selected ? { backgroundColor: ACCENT[id] } : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Díszcsík az aktív fül színében */}
      <div className="mx-auto mt-6 flex items-center justify-center gap-2" aria-hidden>
        <span className="h-px w-12" style={{ backgroundColor: `${accent}4d` }} />
        <span className="h-1.5 w-1.5 rotate-45 rounded-[1px]" style={{ backgroundColor: accent }} />
        <span className="h-px w-12" style={{ backgroundColor: `${accent}4d` }} />
      </div>

      <div key={active} className="mwr-card-in mt-8">
        {active === "why" ? <WhyCards /> : <HowSteps />}
      </div>
    </div>
  );
}
