"use client";

import { usePathname } from "next/navigation";
import { LayoutGrid, FileText } from "lucide-react";
import { FloatingActionLink } from "./floating-action-link";

/**
 * Kontextusfüggő úszó gomb a layoutban:
 *  - főoldalon  → Kategóriák (a kategória-oldalra)
 *  - kategória oldalakon → Ajánlatkérés (az ajánlatkérés oldalra)
 *  - szolgáltató profiloldalán a gombot maga az oldal rendereli (a chat
 *    célzott linkjével), ezért ott itt nem jelenítünk meg semmit.
 */
export function FloatingActionButton() {
  const pathname = usePathname();

  if (pathname === "/") {
    return <FloatingActionLink href="/services" label="Kategóriák" icon={LayoutGrid} />;
  }
  if (pathname.startsWith("/services")) {
    return <FloatingActionLink href="/profil?tab=quotes" label="Ajánlatkérés" icon={FileText} />;
  }
  return null;
}
