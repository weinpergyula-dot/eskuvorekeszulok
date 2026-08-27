"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * PREMIUM extra: a meghívó egy lezárt borítékkal indul. A látogató a
 * viaszpecsétre kattint, mire az széttörik, a fül kinyílik, fény tör elő a
 * borítékból, és a meghívókártya kiemelkedik – utána a réteg elúszik, és
 * alatta ott a meghívó.
 *
 * A fázisokat a data-phase attribútum viszi (closed → opening → card → done);
 * a CSS ezekhez köti az animációkat, így a JS csak az időzítést adja.
 * Kevesebb mozgást kérő látogatónál a réteg azonnal átléphető.
 */

type Phase = "closed" | "opening" | "card" | "done";

/** A háttérben lebegő fénypontok – fix értékek, hogy SSR-en se ugráljon. */
const SPARKS = [
  { left: "12%", top: "22%", size: 10, delay: "0s" },
  { left: "82%", top: "18%", size: 14, delay: "1.4s" },
  { left: "24%", top: "76%", size: 8, delay: "2.6s" },
  { left: "70%", top: "82%", size: 12, delay: "0.8s" },
  { left: "46%", top: "12%", size: 7, delay: "3.4s" },
  { left: "90%", top: "56%", size: 9, delay: "2.0s" },
  { left: "6%", top: "52%", size: 11, delay: "4.2s" },
];

export function EnvelopeIntro({
  monogram,
  names,
  date,
  place,
}: {
  monogram: string;
  names: string;
  date: string;
  place: string;
}) {
  const [phase, setPhase] = useState<Phase>("closed");

  const open = useCallback(() => {
    setPhase((p) => (p === "closed" ? "opening" : p));
  }, []);

  const skip = useCallback(() => setPhase("done"), []);

  // A nyitás lépései: fül + fénykitörés, majd a kártya, végül a réteg elúszik.
  useEffect(() => {
    if (phase !== "opening") return;
    const toCard = setTimeout(() => setPhase("card"), 900);
    return () => clearTimeout(toCard);
  }, [phase]);

  useEffect(() => {
    if (phase !== "card") return;
    const toDone = setTimeout(() => setPhase("done"), 2100);
    return () => clearTimeout(toDone);
  }, [phase]);

  // Amíg a boríték látszik, ne lehessen görgetni alatta.
  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // Escape: azonnali átugrás.
  useEffect(() => {
    if (phase === "done") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, skip]);

  return (
    <div
      className="prm-env-layer"
      data-phase={phase}
      aria-hidden={phase === "done"}
      inert={phase === "done"}
    >
      {SPARKS.map((s) => (
        <span
          key={s.left + s.top}
          aria-hidden
          className="prm-spark"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}

      <div className="relative flex flex-col items-center">
        <p className="prm-env-caption prm-caps mb-8 text-center text-[10px] sm:text-xs">
          Premium minta · digitális esküvői meghívó
        </p>

        <div className="prm-env-scene">
          <div className="prm-env">
            <span aria-hidden className="prm-env-rays" />
            <span aria-hidden className="prm-env-burst" />

            <span aria-hidden className="prm-env-back" />

            {/* A kiemelkedő meghívókártya */}
            <div className="prm-env-card">
              <p
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "#9A5182" }}
              >
                Meghívó
              </p>
              <p
                className="prm-script mt-3 text-[2rem] leading-none"
                style={{ color: "#8F3671" }}
              >
                {monogram}
              </p>
              <p className="prm-serif mt-3 text-xl leading-snug" style={{ color: "#4A1B3D" }}>
                {names}
              </p>
              <p
                className="mt-3 text-[10px] uppercase tracking-[0.26em]"
                style={{ color: "#9A5182" }}
              >
                {date}
              </p>
              <p className="mt-1 text-[13px]" style={{ color: "#7C4468" }}>
                {place}
              </p>
            </div>

            <span aria-hidden className="prm-env-front" />
            <span aria-hidden className="prm-env-flap" />
            <span aria-hidden className="prm-env-shine" />

            <button
              type="button"
              onClick={open}
              className="prm-env-seal"
              aria-label="Meghívó felnyitása"
            >
              {monogram.replace(/\s+/g, "")}
            </button>
          </div>
        </div>

        <p className="prm-muted mt-10 flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4" aria-hidden />
          {phase === "closed" ? "Nyomd meg a pecsétet a felnyitáshoz" : "Felnyitás…"}
        </p>

        <button
          type="button"
          onClick={skip}
          className="prm-muted mt-4 text-xs underline-offset-4 transition-colors hover:text-[var(--prm-rose)] hover:underline"
        >
          Átugrom a meghívóra
        </button>
      </div>
    </div>
  );
}
