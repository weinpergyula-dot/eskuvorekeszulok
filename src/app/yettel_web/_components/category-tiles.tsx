"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Smartphone, Wifi, Tv, CreditCard, Briefcase, type LucideIcon } from "lucide-react";
import type { OfferCategory } from "../_data/offers";

// A menü/hash ↔ tarifakategória (az OffersExplorer-rel megegyező logika).
const HASH_TO_CAT: Record<string, OfferCategory> = {
  havidijas: "havidijas",
  ajanlatok: "havidijas",
  internet: "net",
  tv: "tv",
};
const CAT_TO_HASH: Record<OfferCategory, string> = {
  havidijas: "havidijas",
  net: "internet",
  tv: "tv",
  csomag: "csomag",
};

type Tile = { icon: LucideIcon; label: string; desc: string; href: string; cat?: OfferCategory };

const CATEGORIES: Tile[] = [
  { icon: Smartphone, label: "Havidíjas mobil", desc: "Korlátlan hívás, 5G", href: "#havidijas", cat: "havidijas" },
  { icon: Wifi, label: "Otthoni internet", desc: "Optikai & 5G", href: "#internet", cat: "net" },
  { icon: Tv, label: "Yettel TV", desc: "Élő adás & felvétel", href: "#tv", cat: "tv" },
  { icon: Smartphone, label: "Készülékek", desc: "Telefon részletre", href: "#keszulekek" },
  { icon: CreditCard, label: "Feltöltőkártya", desc: "Kötöttség nélkül", href: "#ajanlatok" },
  { icon: Briefcase, label: "Üzleti", desc: "Céges megoldások", href: "#ajanlatok" },
];

export function CategoryTiles() {
  // Alapból a "Havidíjas mobil" a kiválasztott.
  const [activeCat, setActiveCat] = useState<OfferCategory>("havidijas");

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
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Üdv a Yettel.hu-n :)</h2>
        <p className="mt-1 text-[#BBD3E4]">Melyik kategória érdekel?</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((cat) => {
          const isActive = cat.cat !== undefined && cat.cat === activeCat;
          // A tarifakategóriáknál (mobil/net/tv) csak a tartalom váltson, ne görgessen.
          const onClick =
            cat.cat !== undefined
              ? (e: MouseEvent) => {
                  e.preventDefault();
                  const hash = CAT_TO_HASH[cat.cat!];
                  setActiveCat(cat.cat!);
                  window.history.replaceState(null, "", `#${hash}`);
                  window.dispatchEvent(new CustomEvent("yettel:section", { detail: hash }));
                  // Mobilon görgessünk le a tarifákhoz, mert felül nem látszik a váltás.
                  if (window.matchMedia("(max-width: 767px)").matches) {
                    document.getElementById("ajanlatok")?.scrollIntoView({ behavior: "smooth" });
                  }
                }
              : undefined;
          return (
            <a
              key={cat.label}
              href={cat.href}
              onClick={onClick}
              aria-current={isActive ? "true" : undefined}
              className={[
                "group flex w-[186px] flex-col items-center gap-2.5 rounded-[20px] border p-6 text-center transition-colors",
                isActive
                  ? "border-[#B4FF00] bg-[#B4FF00]"
                  : "border-white/15 bg-white/[0.06] hover:border-[#B4FF00] hover:bg-white/10",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-14 w-14 place-items-center rounded-2xl",
                  isActive
                    ? "bg-[#002340] text-[#B4FF00]"
                    : "bg-[linear-gradient(to_bottom,#002340_0%,#B4FF00_20%,#B4FF00_80%,#002340_100%)] text-[#002340]",
                ].join(" ")}
              >
                <cat.icon className="h-7 w-7" strokeWidth={1.9} />
              </span>
              <span className={isActive ? "text-base font-bold text-[#002340]" : "text-base font-bold text-white"}>
                {cat.label}
              </span>
              <span className={isActive ? "text-sm text-[#002340]/70" : "text-sm text-[#BBD3E4]"}>{cat.desc}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
