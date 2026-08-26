"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function RsvpForm() {
  const [submitted, setSubmitted] = useState(false);
  const [attending, setAttending] = useState<"igen" | "nem">("igen");

  if (submitted) {
    return (
      <div className="slv-card mx-auto max-w-xl px-8 py-12 text-center">
        <span className="slv-icon-ring mx-auto">
          <Check className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="slv-serif mt-5 text-2xl">Köszönjük a visszajelzést!</h3>
        <p className="slv-muted mt-3 text-[15px] leading-relaxed">
          {attending === "igen"
            ? "Nagyon örülünk, hogy velünk ünnepelsz! A részletekről időben küldünk emlékeztetőt."
            : "Sajnáljuk, hogy nem tudsz eljönni – gondolatban veled ünneplünk!"}
        </p>
      </div>
    );
  }

  return (
    <form
      className="slv-card mx-auto max-w-xl px-6 py-8 sm:px-10 sm:py-10"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="slv-name" className="slv-caps mb-1.5 block text-[11px]">
            Név
          </label>
          <input id="slv-name" className="slv-input" placeholder="Teljes neved" required />
        </div>

        <div>
          <label htmlFor="slv-email" className="slv-caps mb-1.5 block text-[11px]">
            E-mail
          </label>
          <input id="slv-email" type="email" className="slv-input" placeholder="pelda@email.hu" required />
        </div>

        <fieldset>
          <legend className="slv-caps mb-2 text-[11px]">Ott leszel?</legend>
          <div className="flex gap-2.5">
            {(["igen", "nem"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAttending(v)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  attending === v
                    ? "border-[var(--slv-glow)] bg-[rgba(143,166,204,0.16)] text-[var(--slv-text)]"
                    : "border-[var(--slv-line)] text-[var(--slv-muted)] hover:text-[var(--slv-text)]"
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
              <label htmlFor="slv-guests" className="slv-caps mb-1.5 block text-[11px]">
                Hányan jöttök?
              </label>
              <input id="slv-guests" type="number" min={1} max={6} defaultValue={2} className="slv-input" />
            </div>
            <div>
              <label htmlFor="slv-menu" className="slv-caps mb-1.5 block text-[11px]">
                Menü
              </label>
              <select id="slv-menu" className="slv-input" defaultValue="hagyomanyos">
                <option value="hagyomanyos">Hagyományos menü</option>
                <option value="vega">Vegetáriánus</option>
                <option value="glutenmentes">Gluténmentes</option>
                <option value="laktozmentes">Laktózmentes</option>
              </select>
            </div>
            <div>
              <label htmlFor="slv-song" className="slv-caps mb-1.5 block text-[11px]">
                Milyen dalra táncolnál?
              </label>
              <input id="slv-song" className="slv-input" placeholder="Előadó – dal címe" />
            </div>
          </>
        )}

        <div>
          <label htmlFor="slv-note" className="slv-caps mb-1.5 block text-[11px]">
            Üzenet a párnak
          </label>
          <textarea id="slv-note" className="slv-input min-h-[92px] resize-y" placeholder="Pár kedves sor…" />
        </div>

        <button
          type="submit"
          className="mt-1 rounded-full border border-[var(--slv-line)] bg-[rgba(200,210,228,0.10)] px-8 py-3 text-sm tracking-wide text-[var(--slv-silver)] transition-colors hover:bg-[rgba(200,210,228,0.2)]"
        >
          Visszajelzés elküldése
        </button>
        <p className="slv-muted text-center text-xs">
          Ez egy bemutató minta – az űrlap nem küld valódi visszajelzést.
        </p>
      </div>
    </form>
  );
}
