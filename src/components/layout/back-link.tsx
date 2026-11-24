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
const CLASS = "inline-flex items-center gap-1.5 text-[15px] font-medium transition-colors";

function isInternal(path: string | null): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

function Anchor({ href }: { href: string }) {
  return (
    <a href={href} className={CLASS} style={{ color: "#84AAA6" }}>
      <ArrowLeft className="h-4 w-4" />
      Vissza
    </a>
  );
}

function FromAwareAnchor({ fallbackHref }: { fallbackHref: string }) {
  const from = useSearchParams().get("from");
  return <Anchor href={isInternal(from) ? from : fallbackHref} />;
}

export function BackLink({ fallbackHref }: { fallbackHref: string }) {
  return (
    <Suspense fallback={<Anchor href={fallbackHref} />}>
      <FromAwareAnchor fallbackHref={fallbackHref} />
    </Suspense>
  );
}
