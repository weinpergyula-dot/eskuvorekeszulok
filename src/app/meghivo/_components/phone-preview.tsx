"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";

/**
 * Telefon-mockup a csomagkártyákon. Az élő minta kicsinyítve, printscreen-
 * szerűen fut a "kijelzőn"; kattintásra teljes oldalas popupban nyílik meg,
 * ahol a jobb felső sarokban végig ott van a bezáró X.
 *
 * A 198px széles kijelzőn egy 390px-es mobilnézet fut ~0.51-es
 * kicsinyítéssel; az iframe 20px-szel szélesebb, így a görgetősávja a
 * kereten kívülre esik és nem látszik csík.
 *
 * A popup portállal a <body> alá kerül: a csempén a telefon egy megdöntött
 * (transform-os) dobozban ül, márpedig egy transzformált ős a fixen
 * pozicionált elemek tartalmazó blokkjává válik – a popup különben a csempén
 * belül maradna, és a levágás miatt nem is látszana.
 */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[216px] shrink-0 rounded-[2.4rem] bg-gray-900 p-[9px] shadow-[0_24px_50px_-16px_rgba(45,88,84,0.45)]">
      <div className="relative h-[428px] w-[198px] overflow-hidden rounded-[1.9rem] bg-white">
        {children}
        {/* kamera-sziget */}
        <div className="absolute left-1/2 top-[8px] z-20 h-[14px] w-[62px] -translate-x-1/2 rounded-full bg-gray-900" aria-hidden />
      </div>
    </div>
  );
}

export function LivePhonePreview({ href, label }: { href: string; label: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <PhoneFrame>
        {/* Élő, kicsinyített előnézet – nem kattintható, a fölé rakott
            gomb nyitja meg a teljes oldalas popupot. */}
        <iframe
          src={href}
          title={`${label} – előnézet`}
          aria-hidden
          tabIndex={-1}
          loading="lazy"
          className="pointer-events-none absolute left-0 top-0 origin-top-left select-none border-0"
          style={{ width: 410, height: 843, transform: "scale(0.5077)" }}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group absolute inset-0 z-10 flex items-end justify-center rounded-[1.9rem] pb-5"
          aria-label={`${label} minta megnyitása`}
        >
          <span className="inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-gray-900/80 px-4 py-2 text-sm font-semibold text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Minta megnyitása
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        </button>
      </PhoneFrame>

      {/* Csak kattintásra nyílik, tehát a portál mindig a böngészőben készül. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-gray-900" role="dialog" aria-modal="true" aria-label={`${label} minta`}>
            <iframe src={href} title={`${label} minta`} className="h-full w-full border-0" />

            {/* Mindig látható bezáró gomb a jobb felső sarokban */}
            <button
              type="button"
              onClick={close}
              aria-label="Bezárás"
              className="fixed right-4 top-4 z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-gray-900/40 text-white backdrop-blur-md transition-colors hover:bg-gray-900/70 sm:right-6 sm:top-6"
            >
              <X className="h-7 w-7" strokeWidth={2} />
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
