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
    /* A /yettel_web kategória-csempéinek felépítése: finom, 160 fokos
       világos→sötét gradiens, az ikon színes lapkán – ott lime, itt fehér.
       Aktív állapotban a csempe és a lapka színei megcserélődnek. */
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-[18px] border p-3.5 text-center transition-all duration-200 cursor-pointer sm:p-4",
        active
          ? "border-white bg-[linear-gradient(160deg,#ffffff_0%,#f4f8f7_55%,#e8efee_100%)] shadow-lg"
          : "border-white/15 bg-[linear-gradient(160deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.06)_55%,rgba(255,255,255,0.025)_100%)] hover:border-white hover:bg-[linear-gradient(160deg,rgba(255,255,255,0.17)_0%,rgba(255,255,255,0.10)_55%,rgba(255,255,255,0.05)_100%)]"
      )}
    >
      <span
        className={cn(
          "grid h-12 w-12 place-items-center rounded-xl transition-colors",
          active ? "bg-[#2D5854] text-white" : "bg-white text-[#2D5854]"
        )}
      >
        <Icon className="h-6 w-6" strokeWidth={1.9} />
      </span>
      <span
        className={cn(
          "text-[15px] font-bold leading-tight sm:text-base",
          active ? "text-[#2D5854]" : "text-white"
        )}
      >
        {label}
      </span>
      {typeof count === "number" && (
        <span className={cn("text-xs leading-none", active ? "text-[#2D5854]/70" : "text-white/70")}>
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

  const sorted = useMemo(
    () =>
      (Object.keys(CATEGORY_LABELS) as ServiceCategory[]).sort(
        (a, b) => (categoryCounts[b] ?? 0) - (categoryCounts[a] ?? 0)
      ),
    [categoryCounts]
  );
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
          count={categoryCounts[c] ?? 0}
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
              count={categoryCounts[c] ?? 0}
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
