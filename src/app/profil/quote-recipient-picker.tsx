"use client";

import { useEffect, useState } from "react";
import { Check, Heart, Star } from "lucide-react";

/**
 * A címzettválasztó: a kategória és a megyék alapján egyező szolgáltatók
 * listája, ahol a látogató egyenként bejelöli, ki kapja meg az ajánlatkérést.
 * Az általános és a meghívós ajánlatkérő űrlap is ezt használja.
 */

export interface MatchingProvider {
  id: string;
  full_name: string;
  average_rating: number | null;
  avatar_url?: string | null;
  is_favorite?: boolean;
}

export function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-gray-400">Nincs értékelés</span>;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className="h-3 w-3"
          fill={i <= full ? "#f59e0b" : i === full + 1 && half ? "url(#half)" : "none"}
          stroke="#f59e0b"
          strokeWidth={1.5}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

export function RecipientPicker({
  category,
  counties,
  userId,
  checkedIds,
  setCheckedIds,
}: {
  category: string;
  counties: string[];
  userId?: string;
  checkedIds: Set<string>;
  setCheckedIds: (ids: Set<string>) => void;
}) {
  /* A találatot a lekérdezés kulcsával együtt tároljuk, így a szűrő
     változásakor a régi lista magától érvénytelen lesz – nem kell külön
     nullázni, és nem indul fölösleges újrarenderelés. */
  const countyKey = counties.join(",");
  const queryKey = category && countyKey ? `${category}|${countyKey}` : "";
  const [result, setResult] = useState<{ key: string; list: MatchingProvider[] } | null>(null);

  useEffect(() => {
    if (!queryKey) return;
    const [cat, cos] = queryKey.split("|");
    const params = new URLSearchParams({ category: cat, counties: cos });
    if (userId) params.set("userId", userId);
    let cancelled = false;
    fetch(`/api/providers/matching-count?${params}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        setResult({ key: queryKey, list: (d.providers ?? []) as MatchingProvider[] });
        // Alapból senki nincs kijelölve – a címzetteket kifejezetten a
        // látogató választja ki.
        setCheckedIds(new Set());
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // setCheckedIds a szülő stabil settere
  }, [queryKey, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const providers = result && result.key === queryKey ? result.list : null;

  if (providers === null) return null;

  if (providers.length === 0) {
    return <p className="text-xs text-gray-400">Nincs egyező szolgáltató a kiválasztott feltételekre.</p>;
  }

  const allSelected = checkedIds.size === providers.length;
  const toggle = (id: string) => {
    const next = new Set(checkedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCheckedIds(next);
  };

  return (
    <div>
      <p className="text-xs text-gray-600 mb-2">
        Válaszd ki, hogy ki kapja meg az ajánlatkérést.{" "}
        <span className="text-[1.2em] font-bold leading-none align-middle">*</span>
      </p>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setCheckedIds(allSelected ? new Set() : new Set(providers.map(p => p.id)))}
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#84AAA6] text-[#84AAA6] hover:bg-[#84AAA6]/10 transition-colors cursor-pointer"
        >
          {allSelected ? "Kijelölés törlése" : "Összes kijelölése"}
        </button>
        {providers.some(p => p.is_favorite) && (
          <button
            type="button"
            onClick={() => setCheckedIds(new Set(providers.filter(p => p.is_favorite).map(p => p.id)))}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-rose-300 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Heart className="h-3 w-3 fill-rose-400 stroke-rose-400" />
            Kedvencek kijelölése
          </button>
        )}
      </div>
      <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
        {[...providers]
          .sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0))
          .map(p => {
            const selected = checkedIds.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${selected ? "bg-[#84AAA6]/10" : "hover:bg-gray-50"}`}
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {p.avatar_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                      : <span className="text-xs font-bold text-gray-500">{p.full_name.charAt(0)}</span>}
                  </div>
                  {p.is_favorite && (
                    <span className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                      <Heart className="h-3 w-3 fill-rose-400 stroke-rose-400" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${selected ? "text-[#5C8480]" : "text-gray-900"}`}>{p.full_name}</p>
                  <StarRating rating={p.average_rating} />
                </div>
                <span className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${selected ? "bg-[#84AAA6] border-[#84AAA6]" : "border-gray-300 bg-white"}`}>
                  {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5">{checkedIds.size} / {providers.length} szolgáltató kijelölve</p>
    </div>
  );
}
