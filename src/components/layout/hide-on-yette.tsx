"use client";

import { usePathname } from "next/navigation";

/**
 * A Yette bemutató oldal (/yette_web) saját fejlécet és láblécet használ,
 * ezért ott elrejtjük az esküvős oldal chrome-ját (Navbar, Footer, stb.).
 * Szerver komponensek is átadhatók children-ként – csak a megjelenítést gátoljuk.
 */
export function HideOnYette({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/yette")) return null;
  return <>{children}</>;
}
