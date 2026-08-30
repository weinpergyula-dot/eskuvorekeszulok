"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Brush,
  Cake,
  Camera,
  Car,
  Crown,
  Flower2,
  Footprints,
  Gem,
  Gift,
  Hand,
  LayoutGrid,
  Mail,
  MapPin,
  Mic,
  Minus,
  Music,
  PartyPopper,
  Plus,
  Scissors,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { displayCount, orderedCategories } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * Gyors kategória-csempék a főoldali teal sávban – a /yettel_web ikonos
 * gyorskategória-sávjának mintájára. A csempék egyben szűrnek is: kattintásra
 * eseményt küldenek a ProvidersContent-nek, ami a listát szűri (és vissza is
 * jelez, így a kiemelés akkor is követi a szűrőt, ha azt máshol állítják át).
 * Első csempe: Összes; utolsó: Még több, ami lefelé nyitja ki a maradék
 * kategóriát.
 */

const TILE_ICONS: Record<ServiceCategory, LucideIcon> = {
  "fotosok-videosok": Camera,
  "elo-zene-dj": Music,
  vofely: Mic,
  "torta-sutemeny": Cake,
  "menyasszonyi-ruha": Crown,
  "oltonya-szmoking": Shirt,
  "dekor-kellek": PartyPopper,
  smink: Brush,
  "fodrasz-borbely": Scissors,
  kormos: Hand,
  "koszonto-ajandek": Gift,
  "pedikur-manikur": Footprints,
  kozmetika: Sparkles,
  ekszer: Gem,
  meghivo: Mail,
  "auto-hinto": Car,
  tanckoktatas: Music,
  catering: UtensilsCrossed,
  helyszin: MapPin,
  virag: Flower2,
};

function Tile({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        /* Egyenletes, áttetsző fehér fátyol a teal sávon – ettől lesz a
           csempe világos teal; hoverre világosodik és a kerete erősödik. */
        "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200 cursor-pointer sm:p-3.5",
        active
          ? "border-white bg-white text-[#2D5854] shadow-lg"
          : "border-white/25 bg-white/10 text-white hover:border-white/80 hover:bg-white/20"
      )}
    >
      <Icon className="h-6 w-6" strokeWidth={1.75} />
      <span className="text-[15px] font-bold leading-tight sm:text-base">{label}</span>
      {typeof count === "number" && (
        <span className={cn("text-xs leading-none", active ? "text-[#2D5854]/60" : "text-white/70")}>
          {count} szolgáltató
        </span>
      )}
    </button>
  );
}

export function CategoryQuickTiles({ categoryCounts }: { categoryCounts: Record<string, number> }) {
  const [active, setActive] = useState("");
  const [expanded, setExpanded] = useState(false);

  // A lista felőli szűrőváltás (pl. mobil legördülő) is átszínezi a csempéket.
  useEffect(() => {
    const h = (e: Event) => setActive((e as CustomEvent<string>).detail ?? "");
    window.addEventListener("eskuvo:category", h);
    return () => window.removeEventListener("eskuvo:category", h);
  }, []);

  const sorted = useMemo(() => orderedCategories(categoryCounts), [categoryCounts]);
  const top = sorted.slice(0, 6);
  const rest = sorted.slice(6);

  const select = (c: string) => {
    setActive(c);
    window.dispatchEvent(new CustomEvent("eskuvo:set-category", { detail: c }));
    document.getElementById("szolgaltatok")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    /* Desktopon (lg+) a 8 alapcsempe egyetlen sorban fér el; kisebb
       kijelzőn 2, majd 4 oszlopba törik. Kibontáskor a további kategóriák
       lefelé, újabb sorokban jelennek meg. */
    <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">
      <Tile icon={LayoutGrid} label="Összes" active={!active} onClick={() => select("")} />
      {top.map((c) => (
        <Tile
          key={c}
          icon={TILE_ICONS[c]}
          label={CATEGORY_LABELS[c]}
          count={displayCount(c, categoryCounts)}
          active={active === c}
          onClick={() => select(c)}
        />
      ))}
      <Tile
        icon={expanded ? Minus : Plus}
        label={expanded ? "Kevesebb" : "Még több"}
        onClick={() => setExpanded((v) => !v)}
      />
      {expanded && (
        <>
          {rest.map((c) => (
            <Tile
              key={c}
              icon={TILE_ICONS[c]}
              label={CATEGORY_LABELS[c]}
              count={displayCount(c, categoryCounts)}
              active={active === c}
              onClick={() => select(c)}
            />
          ))}
          {/* A kibontott lista végén is zárható */}
          <Tile icon={Minus} label="Kevesebb" onClick={() => setExpanded(false)} />
        </>
      )}
    </div>
  );
}
