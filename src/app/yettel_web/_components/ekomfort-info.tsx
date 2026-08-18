"use client";

import { useEffect } from "react";
import { X, FileText, CreditCard, CalendarCheck, Leaf } from "lucide-react";

// Megosztott e-Komfort tájékoztató – a tarifakártya felugró ablakában és a
// folyamat hozzájárulások lépésében is ezt használjuk.

const EKOMFORT_CONDITIONS = [
  { icon: FileText, t: "Elektronikus számla", s: "Papíralapú helyett e-számlát kapsz, SMS/e-mail értesítéssel." },
  { icon: CreditCard, t: "Elektronikus fizetés", s: "App, csoportos beszedés, banki átutalás vagy ATM befizetés." },
  { icon: CalendarCheck, t: "Határidőre fizetés", s: "A számlát a feltüntetett fizetési határidőig rendezed." },
];

const EKOMFORT_INTRO =
  "A választott csomag e-Komfort csomaggal érhető el. A beépített díjkedvezmény megtartásához teljesítened kell az alábbi 3 feltételt. Ha nem teljesülnek, a kedvezmény visszavonásra és a következő számládban felszámításra kerül.";

export function EKomfortConditions() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {EKOMFORT_CONDITIONS.map((it) => (
        <div key={it.t} className="rounded-xl border border-[#CDE0EA] bg-[#E4F2F7] p-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-[#002340]">
            <it.icon className="h-5 w-5" />
          </span>
          <p className="mt-2.5 text-sm font-bold text-[#002340]">{it.t}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#2D466C]">{it.s}</p>
        </div>
      ))}
    </div>
  );
}

// Beágyazott kártya (a hozzájárulások lépéshez).
export function EKomfortCard() {
  return (
    <div className="mb-6 rounded-2xl border border-[#CDE0EA] bg-white p-5 shadow-[0_10px_30px_-20px_rgba(0,35,64,0.35)] sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#B4FF00] text-[#002340]">
          <Leaf className="h-5 w-5" />
        </span>
        <div>
          <p className="font-extrabold text-[#002340]">A választott csomag e-Komfort csomaggal érhető el</p>
          <p className="mt-1 text-sm text-[#2D466C]">{EKOMFORT_INTRO}</p>
        </div>
      </div>
      <EKomfortConditions />
    </div>
  );
}

// Felugró ablak (a tarifakártyáról nyitva).
export function EKomfortModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#002340]/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="e-Komfort csomag tájékoztató"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-[0_30px_80px_rgba(0,35,64,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#B4FF00] text-[#002340]">
              <Leaf className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-[#002340]">e-Komfort csomag</h3>
              <p className="mt-1 text-sm text-[#2D466C]">{EKOMFORT_INTRO}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#2D466C] transition-colors hover:bg-[#E4F2F7]"
            aria-label="Bezárás"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <EKomfortConditions />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#002340] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#001D36]"
        >
          Értem
        </button>
      </div>
    </div>
  );
}
