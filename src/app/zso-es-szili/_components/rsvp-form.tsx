"use client";

import { useState } from "react";
import { Check, HeartHandshake } from "lucide-react";

export function RsvpForm() {
  const [submitted, setSubmitted] = useState(false);
  const [attending, setAttending] = useState<"igen" | "nem">("igen");

  if (submitted) {
    return (
      <div className="zs-card mx-auto max-w-xl px-8 py-12 text-center">
        <span className="zs-icon-ring mx-auto">
          <Check className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="zs-serif mt-5 text-2xl">Köszönjük a visszajelzést!</h3>
        <p className="zs-muted mt-3 text-[15px] leading-relaxed">
          {attending === "igen"
            ? "Nagyon örülünk, hogy velünk ünnepelsz! Hamarosan minden részletről küldünk emlékeztetőt."
            : "Sajnáljuk, hogy nem tudsz eljönni – gondolatban veled ünneplünk!"}
        </p>
      </div>
    );
  }

  return (
    <form
      className="zs-card mx-auto max-w-xl px-6 py-8 sm:px-10 sm:py-10"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="zs-name" className="zs-caps mb-1.5 block text-[11px]">
            Név
          </label>
          <input
            id="zs-name"
            name="name"
            required
            placeholder="Teljes neved"
            className="zs-input"
            autoComplete="name"
          />
        </div>

        <div>
          <span className="zs-caps mb-1.5 block text-[11px]">Ott leszel?</span>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { v: "igen", label: "Igen, ott leszek!" },
                { v: "nem", label: "Sajnos nem tudok" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setAttending(o.v)}
                aria-pressed={attending === o.v}
                className={`zs-choice ${attending === o.v ? "zs-choice-active" : ""}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {attending === "igen" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="zs-guests" className="zs-caps mb-1.5 block text-[11px]">
                  Kísérők száma
                </label>
                <select id="zs-guests" name="guests" className="zs-input" defaultValue="0">
                  <option value="0">Egyedül jövök</option>
                  <option value="1">+1 fő</option>
                  <option value="2">+2 fő</option>
                  <option value="3">+3 fő</option>
                  <option value="4">+4 fő</option>
                </select>
              </div>
              <div>
                <label htmlFor="zs-diet" className="zs-caps mb-1.5 block text-[11px]">
                  Étrend
                </label>
                <select id="zs-diet" name="diet" className="zs-input" defaultValue="normal">
                  <option value="normal">Hagyományos</option>
                  <option value="vega">Vegetáriánus</option>
                  <option value="vegan">Vegán</option>
                  <option value="glutenmentes">Gluténmentes</option>
                  <option value="laktozmentes">Laktózmentes</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="zs-song" className="zs-caps mb-1.5 block text-[11px]">
                Egy dal, amire biztosan táncolnál
              </label>
              <input
                id="zs-song"
                name="song"
                placeholder="Előadó – Cím (nem kötelező)"
                className="zs-input"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="zs-msg" className="zs-caps mb-1.5 block text-[11px]">
            Üzenet a párnak
          </label>
          <textarea
            id="zs-msg"
            name="message"
            rows={3}
            placeholder="Pár kedves szó… (nem kötelező)"
            className="zs-input resize-none"
          />
        </div>

        <button type="submit" className="zs-btn mt-1">
          <HeartHandshake className="h-4 w-4" aria-hidden />
          Visszajelzés küldése
        </button>
        <p className="zs-muted text-center text-xs">
          Kérjük, legkésőbb <strong>2027. május 1-ig</strong> jelezz vissza.
        </p>
      </div>
    </form>
  );
}
