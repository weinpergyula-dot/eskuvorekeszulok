"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisitorRegisterButton } from "@/components/home/visitor-register-button";
import { ProviderRegisterButton } from "@/components/home/provider-register-button";

/**
 * "Miért regisztrálj?" szekció – prémium megjelenés minden nézetben.
 * Fehér háttéren szegmens-váltó (Látogató / Szolgáltató) és egy gradienses,
 * lekerekített kártya; desktopon középre zárva, kétoszlopos előnylistával.
 */

const TABS = [
  {
    id: "visitor",
    label: "Látogató",
    icon: Users,
    title: "Regisztrálj látogatónak",
    chip: "Ingyenes fiók",
    accent: "#84AAA6",
    gradient: "linear-gradient(150deg, #8FB3AF 0%, #6B8E8A 60%, #55736F 100%)",
    shadow: "0 22px 44px -20px rgba(85, 115, 111, 0.65)",
    features: [
      "Kedvencnek jelölni szolgáltatókat",
      "Csoportos vagy egyéni ajánlatot kérni",
      "Chatelni a kiválasztott szakemberrel",
      "Értékelni, tapasztalatokat megosztani",
    ],
  },
  {
    id: "provider",
    label: "Szolgáltató",
    icon: Briefcase,
    title: "Regisztrálj szolgáltatónak",
    chip: "Ingyenes profil",
    accent: "#C65EA5",
    gradient: "linear-gradient(150deg, #D98FC2 0%, #C0699F 60%, #A84D8B 100%)",
    shadow: "0 22px 44px -20px rgba(168, 77, 139, 0.65)",
    features: [
      "Ingyenes szolgáltatói profilt létrehozni",
      "Ajánlatkéréseket fogadni a pároktól",
      "Chatelni az érdeklődő párokkal",
      "Értékeléseket kapni, válaszolni rájuk",
    ],
  },
] as const;

export function WhyRegister() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("visitor");
  const tab = TABS.find((t) => t.id === active)!;
  const Icon = tab.icon;

  return (
    <section className="mx-auto max-w-2xl px-5 pb-2 pt-2 sm:px-0">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-[#84AAA6]">
        Csatlakozz hozzánk
      </p>
      <h2 className="mt-1.5 text-center text-[26px] font-bold text-gray-900 md:text-3xl">
        Miért regisztrálj?
      </h2>
      <div className="mx-auto mt-3 flex items-center justify-center gap-2" aria-hidden>
        <span className="h-px w-10 bg-gray-200" />
        <span className="h-1.5 w-1.5 rotate-45 rounded-[2px] bg-[#D07AB5]" />
        <span className="h-px w-10 bg-gray-200" />
      </div>
      <p className="mx-auto mt-3 max-w-xs text-center text-[15px] leading-relaxed text-gray-600">
        Egy ingyenes fiókkal minden eszközt megkapsz a nagy naphoz – válaszd ki,
        melyik oldalon állsz!
      </p>

      {/* Szegmens-váltó */}
      <div
        role="tablist"
        aria-label="Regisztráció típusa"
        className="mx-auto mt-6 flex max-w-sm rounded-full bg-gray-100 p-1"
      >
        {TABS.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(t.id)}
              className={`flex-1 rounded-full py-2.5 text-[15px] font-semibold transition-all duration-200 ${
                selected ? "bg-white shadow-md" : "text-gray-500"
              }`}
              style={selected ? { color: t.accent } : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Kártya */}
      <div
        key={tab.id}
        className="mwr-card-in relative mt-5 overflow-hidden rounded-3xl px-6 pb-7 pt-6 text-white"
        style={{ background: tab.gradient, boxShadow: tab.shadow }}
      >
        {/* dekoratív fényfoltok */}
        <div
          className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/15 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-black/10 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur-sm">
              <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-snug">{tab.title}</h3>
              <span className="mt-1 inline-block rounded-full border border-white/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                {tab.chip}
              </span>
            </div>
          </div>

          <hr className="mt-5 border-white/25" />

          <p className="mt-4 text-[15px] font-semibold text-white/90">
            Lehetőséged lesz…
          </p>
          <ul className="mt-3 grid gap-2.5 md:grid-cols-2 md:gap-x-6">
            {tab.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[15px] leading-snug">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 [&_button]:w-full [&>div]:w-full md:flex md:items-start md:gap-3 md:space-y-0 md:[&_button]:w-auto md:[&>div]:w-auto">
            {tab.id === "visitor" ? (
              <>
                <Link href="/services" className="block">
                  <Button size="lg" className="w-full bg-white text-[#2D5854] hover:bg-white/90">
                    Megnézem a kínálatot
                  </Button>
                </Link>
                <VisitorRegisterButton />
              </>
            ) : (
              <ProviderRegisterButton />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
