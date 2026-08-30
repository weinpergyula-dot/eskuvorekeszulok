"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function RsvpForm() {
  const [submitted, setSubmitted] = useState(false);
  const [attending, setAttending] = useState<"igen" | "nem">("igen");

  if (submitted) {
    return (
      <div className="prm-card mx-auto max-w-xl px-8 py-12 text-center">
        <span className="prm-icon-ring mx-auto">
          <Check className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="prm-serif mt-5 text-2xl">Köszönjük a visszajelzést!</h3>
        <p className="prm-muted mt-3 text-[15px] leading-relaxed">
          {attending === "igen"
            ? "Nagyon örülünk, hogy velünk ünnepelsz! A részletekről időben küldünk emlékeztetőt."
            : "Sajnáljuk, hogy nem tudsz eljönni – gondolatban veled ünneplünk!"}
        </p>
      </div>
    );
  }

  return (
    <form
      className="prm-card mx-auto max-w-xl px-6 py-8 sm:px-10 sm:py-10"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="prm-name" className="prm-caps mb-1.5 block text-[11px]">
            Név
          </label>
          <input id="prm-name" className="prm-input" placeholder="Teljes neved" required />
        </div>

        <div>
          <label htmlFor="prm-email" className="prm-caps mb-1.5 block text-[11px]">
            E-mail
          </label>
          <input id="prm-email" type="email" className="prm-input" placeholder="pelda@email.hu" required />
        </div>

        <fieldset>
          <legend className="prm-caps mb-2 text-[11px]">Ott leszel?</legend>
          <div className="flex gap-2.5">
            {(["igen", "nem"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAttending(v)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  attending === v
                    ? "border-[var(--prm-accent)] bg-[rgba(198,94,165,0.16)] text-[var(--prm-text)]"
                    : "border-[var(--prm-line)] text-[var(--prm-muted)] hover:text-[var(--prm-text)]"
                }`}
              >
                {v === "igen" ? "Igen, ott leszek" : "Sajnos nem tudok menni"}
              </button>
            ))}
          </div>
        </fieldset>

        {attending === "igen" && (
          <>
            <div>
              <label htmlFor="prm-guests" className="prm-caps mb-1.5 block text-[11px]">
                Hányan jöttök?
              </label>
              <input id="prm-guests" type="number" min={1} max={6} defaultValue={2} className="prm-input" />
            </div>
            <div>
              <label htmlFor="prm-menu" className="prm-caps mb-1.5 block text-[11px]">
                Menü
              </label>
              <select id="prm-menu" className="prm-input" defaultValue="hagyomanyos">
                <option value="hagyomanyos">Hagyományos menü</option>
                <option value="vega">Vegetáriánus</option>
                <option value="glutenmentes">Gluténmentes</option>
                <option value="laktozmentes">Laktózmentes</option>
              </select>
            </div>
            <div>
              <label htmlFor="prm-song" className="prm-caps mb-1.5 block text-[11px]">
                Milyen dalra táncolnál?
              </label>
              <input id="prm-song" className="prm-input" placeholder="Előadó – dal címe" />
            </div>
          </>
        )}

        <div>
          <label htmlFor="prm-note" className="prm-caps mb-1.5 block text-[11px]">
            Üzenet a párnak
          </label>
          <textarea id="prm-note" className="prm-input min-h-[92px] resize-y" placeholder="Pár kedves sor…" />
        </div>

        <button
          type="submit"
          className="mt-1 rounded-full border border-[var(--prm-line)] bg-[rgba(232,180,212,0.10)] px-8 py-3 text-sm tracking-wide text-[var(--prm-rose)] transition-colors hover:bg-[rgba(232,180,212,0.2)]"
        >
          Visszajelzés elküldése
        </button>
        <p className="prm-muted text-center text-xs">
          Ez egy bemutató minta – az űrlap nem küld valódi visszajelzést.
        </p>
      </div>
    </form>
  );
}
