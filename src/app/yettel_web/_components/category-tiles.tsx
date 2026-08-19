"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Smartphone, Wifi, Tv, CreditCard, FileText, type LucideIcon } from "lucide-react";
import type { OfferCategory } from "../_data/offers";

// A menü/hash ↔ tarifakategória (az OffersExplorer-rel megegyező logika).
const HASH_TO_CAT: Record<string, OfferCategory> = {
  havidijas: "havidijas",
  ajanlatok: "havidijas",
  internet: "net",
  tv: "tv",
  feltoltokartya: "feltolto",
};
const CAT_TO_HASH: Record<OfferCategory, string> = {
  havidijas: "havidijas",
  net: "internet",
  tv: "tv",
  csomag: "csomag",
  feltolto: "feltoltokartya",
};

type Tile = { icon: LucideIcon; label: string; desc: string; href: string; cat?: OfferCategory };

const CATEGORIES: Tile[] = [
  { icon: Smartphone, label: "Havidíjas mobil", desc: "Korlátlan hívás, 5G", href: "#havidijas", cat: "havidijas" },
  { icon: CreditCard, label: "Feltöltőkártya", desc: "Kötöttség nélkül", href: "#feltoltokartya", cat: "feltolto" },
  { icon: Wifi, label: "Otthoni internet", desc: "Optikai & 5G", href: "#internet", cat: "net" },
  { icon: Tv, label: "Yettel TV", desc: "Élő adás & felvétel", href: "#tv", cat: "tv" },
  { icon: Smartphone, label: "Készülékek", desc: "Telefon részletre", href: "#keszulekek" },
  { icon: FileText, label: "Ügyintézés", desc: "Online, egyszerűen", href: "#ugyfelszolgalat" },
];

export function CategoryTiles() {
  // Alapból a "Havidíjas mobil" a kiválasztott.
  const [activeCat, setActiveCat] = useState<OfferCategory>("havidijas");
  const tilesRef = useRef<HTMLDivElement>(null);

  // Kategóriaváltásnál nem a tarifaszekció tetejére ugrunk, hanem úgy
  // görgetünk, hogy maga az ikonsor kerüljön a fejléc alá – így a csempék
  // végig láthatók maradnak, alattuk pedig már a kiválasztott tarifák jönnek.
  const scrollToTiles = () => {
    const el = tilesRef.current;
    if (!el) return;
    const headerOffset = 64; // ragadó fejléc + kis levegő
    window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top - headerOffset,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fromHash = () => setActiveCat(HASH_TO_CAT[window.location.hash.slice(1)] ?? "havidijas");
    const onSection = (e: Event) => setActiveCat(HASH_TO_CAT[(e as CustomEvent<string>).detail] ?? "havidijas");
    fromHash();
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("yettel:section", onSection);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener("yettel:section", onSection);
    };
  }, []);

  return (
    <div ref={tilesRef} className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((cat) => {
          const isActive = cat.cat !== undefined && cat.cat === activeCat;
          const onClick = (e: MouseEvent) => {
            e.preventDefault();
            if (cat.cat !== undefined) {
              // Tarifakategória: váltsuk a tartalmat…
              const hash = CAT_TO_HASH[cat.cat];
              setActiveCat(cat.cat);
              window.history.replaceState(null, "", `#${hash}`);
              window.dispatchEvent(new CustomEvent("yettel:section", { detail: hash }));
              // …és görgessünk oda, hogy az ikonsor még látsszon a tarifák fölött.
              scrollToTiles();
            } else {
              // Egyéb csempe (Készülékek, Ügyintézés): sima szekcióhoz görgetés – desktopon is.
              const id = cat.href.slice(1);
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
              window.history.replaceState(null, "", cat.href);
            }
          };
          return (
            <a
              key={cat.label}
              href={cat.href}
              onClick={onClick}
              aria-current={isActive ? "true" : undefined}
              className={[
                // Mindkét állapot finom, világos→sötét irányú gradienst kap
                // (ugyanaz a 160°-os irány, mint a prémium tarifakártya fejlécén).
                "group flex w-[150px] flex-col items-center gap-2 rounded-[18px] border p-4 text-center transition-all",
                isActive
                  ? "border-[#B4FF00] bg-[linear-gradient(160deg,#CBFF4D_0%,#B4FF00_55%,#9FE000_100%)]"
                  : "border-white/15 bg-[linear-gradient(160deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.06)_55%,rgba(255,255,255,0.025)_100%)] hover:border-[#B4FF00] hover:bg-[linear-gradient(160deg,rgba(255,255,255,0.17)_0%,rgba(255,255,255,0.10)_55%,rgba(255,255,255,0.05)_100%)]",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-12 w-12 place-items-center rounded-xl",
                  isActive ? "bg-[#002340] text-[#B4FF00]" : "bg-[#B4FF00] text-[#002340]",
                ].join(" ")}
              >
                <cat.icon className="h-6 w-6" strokeWidth={1.9} />
              </span>
              <span className={isActive ? "text-sm font-bold text-[#002340]" : "text-sm font-bold text-white"}>
                {cat.label}
              </span>
              <span className={isActive ? "text-xs text-[#002340]/70" : "text-xs text-[#BBD3E4]"}>{cat.desc}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
