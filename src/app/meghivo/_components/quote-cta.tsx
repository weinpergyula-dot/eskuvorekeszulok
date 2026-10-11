"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import { LoginRequiredDialog, useIsLoggedIn } from "@/components/providers/masked-contact";

/** Gyors ajánlatkéréshez ezen a számon vagyunk elérhetők (lásd az ajánlatkérő űrlapot). */
const PHONE_DISPLAY = "06 70 788 8787";
const PHONE_HREF = "tel:+36707888787";

/**
 * Ajánlatkérő gomb a /meghivo oldalon.
 *
 * Az írásbeli ajánlatkérés az ajánlatkérő űrlapon fut, ahhoz viszont fiók
 * kell (oda érkezik a válasz is). Bejelentkezés nélkül ezért a közös
 * „csak regisztrált felhasználóknak” ablakot nyitjuk (Belépés /
 * Regisztráció), alatta felkínálva a gyorsabb utat: a telefonszámot.
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
  const loggedIn = useIsLoggedIn();
  const [open, setOpen] = useState(false);

  // A bejelentkezettségről csak a kliensen tudunk; amíg nem tudjuk, a gomb
  // sima link marad, így a művelet sosem vész el.
  const needsAccount = loggedIn === false;

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

      {open && (
        <LoginRequiredDialog
          message="Az írásbeli ajánlatkérés csak regisztrált felhasználók számára érhető el."
          onClose={() => setOpen(false)}
          footer={
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#84AAA6]/40 bg-[#F0F6F5] px-4 py-3 text-left">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#84AAA6]" strokeWidth={1.75} />
              <p className="text-sm leading-relaxed text-gray-700">
                Ha gyorsabb ajánlatkérést szeretnél, azt regisztráció nélkül, a{" "}
                <a href={PHONE_HREF} className="font-bold text-[#84AAA6] hover:underline">
                  {PHONE_DISPLAY}
                </a>{" "}
                telefonszámon teheted meg.
              </p>
            </div>
          }
        />
      )}
    </>
  );
}
