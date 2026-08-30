"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, Phone, UserPlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Gyors ajánlatkéréshez ezen a számon vagyunk elérhetők (lásd az ajánlatkérő űrlapot). */
const PHONE_DISPLAY = "06 70 788 8787";
const PHONE_HREF = "tel:+36707888787";

/**
 * Ajánlatkérő gomb a /meghivo oldalon.
 *
 * Az írásbeli ajánlatkérés az ajánlatkérő űrlapon fut, ahhoz viszont fiók
 * kell (oda érkezik a válasz is). Bejelentkezés nélkül ezért nem dobjuk át
 * a látogatót a bejelentkező oldalra, hanem elmondjuk, mire számítson, és
 * felkínáljuk a gyorsabb utat: a telefonszámot.
 */
export function MeghivoQuoteCta({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();
    const check = supabase
      ? supabase.auth.getUser().then(({ data }) => !!data.user).catch(() => false)
      : Promise.resolve(false);
    check.then((value) => { if (alive) setSignedIn(value); });
    return () => { alive = false; };
  }, []);

  // A bejelentkezettségről csak a kliensen tudunk; amíg nem tudjuk, a gomb
  // sima link marad, így a művelet sosem vész el.
  const needsAccount = signedIn === false;

  return (
    <>
      <Link
        href={href}
        className={className}
        style={style}
        onClick={(e) => {
          if (!needsAccount) return;
          e.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </Link>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="meghivo-quote-dialog-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Bezárás"
              className="absolute right-4 top-4 cursor-pointer text-gray-400 transition-colors hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 id="meghivo-quote-dialog-title" className="pr-8 text-lg font-bold text-gray-900">
              Az írásbeli ajánlatkéréshez fiók kell
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              A regisztráció nagyjából egy percet vesz igénybe – utána az ajánlatkérésed és a
              válaszunk is egy helyen, a fiókodban lesz.
            </p>

            <Link
              href="/auth/register"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#84AAA6] px-5 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#6B8E8A]"
            >
              <UserPlus className="h-4 w-4" />
              Regisztrálok (kb. 1 perc)
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-3 text-center text-sm text-gray-500">
              Van már fiókod?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-[#84AAA6] hover:underline"
              >
                Bejelentkezés
              </Link>
            </p>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#84AAA6]/40 bg-[#F0F6F5] px-4 py-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#84AAA6]" strokeWidth={1.75} />
              <p className="text-sm leading-relaxed text-gray-700">
                Ha gyorsabb ajánlatkérést szeretnél, azt regisztráció nélkül, a{" "}
                <a href={PHONE_HREF} className="font-bold text-[#84AAA6] hover:underline">
                  {PHONE_DISPLAY}
                </a>{" "}
                telefonszámon teheted meg.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
