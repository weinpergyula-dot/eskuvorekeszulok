"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Vissza gomb, ami oda visz vissza, ahonnan a látogató érkezett. A listázás a
 * `from` paraméterben küldi el a saját címét a szűrőivel együtt; ha nincs ilyen
 * (pl. keresőből érkezett a látogató), a megadott alapértelmezés érvényes.
 *
 * Csak saját, relatív útvonalat fogadunk el – így a paraméter nem használható
 * idegen oldalra irányításra.
 */
const CLASS = "glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[14px] font-semibold text-[#1F1A2E] transition-colors";

function isInternal(path: string | null): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

/* `round`: csak ikon, kerek üveg gomb (a szolgáltatói profil fotóján). */
function Anchor({ href, round }: { href: string; round?: boolean }) {
  if (round) {
    return (
      <a href={href} aria-label="Vissza" className="glass-strong flex h-10 w-10 items-center justify-center rounded-full text-[#1F1A2E]">
        <ArrowLeft className="h-5 w-5" />
      </a>
    );
  }
  return (
    <a href={href} className={CLASS}>
      <ArrowLeft className="h-4 w-4" />
      Vissza
    </a>
  );
}

function FromAwareAnchor({ fallbackHref, round }: { fallbackHref: string; round?: boolean }) {
  const from = useSearchParams().get("from");
  return <Anchor href={isInternal(from) ? from : fallbackHref} round={round} />;
}

export function BackLink({ fallbackHref, round = false }: { fallbackHref: string; round?: boolean }) {
  return (
    <Suspense fallback={<Anchor href={fallbackHref} round={round} />}>
      <FromAwareAnchor fallbackHref={fallbackHref} round={round} />
    </Suspense>
  );
}
