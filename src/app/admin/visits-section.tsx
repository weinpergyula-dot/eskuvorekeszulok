"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyPoint { date: string; uniqueIps: number; hits: number }
interface WeeklyPoint { weekStart: string; uniqueIps: number; hits: number }

export interface VisitStats {
  available: boolean;
  error?: string;
  daily: DailyPoint[];
  weekly: WeeklyPoint[];
  summary: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    last30Days: number;
    allTime: number;
    totalHits: number;
  };
}

const MONTHS_SHORT = ["jan.", "febr.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];

/** "2026-08-30" → "aug. 30." (időzóna-független, a string darabjaiból) */
function formatDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]} ${d}.`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function weekday(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = vasárnap
}

/** "2026-08-24" → "aug. 24 – 30." */
function formatWeek(iso: string): string {
  const end = addDays(iso, 6);
  const [, sm, sd] = iso.split("-").map(Number);
  const [, em, ed] = end.split("-").map(Number);
  return sm === em
    ? `${MONTHS_SHORT[sm - 1]} ${sd}–${ed}.`
    : `${MONTHS_SHORT[sm - 1]} ${sd}. – ${MONTHS_SHORT[em - 1]} ${ed}.`;
}

function Bars({ points }: { points: { key: string; label: string; value: number; title: string; muted: boolean; current: boolean }[] }) {
  const max = Math.max(1, ...points.map((p) => p.value));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-end gap-1 h-40">
        {points.map((p) => (
          <div key={p.key} className="flex-1 h-full flex flex-col justify-end items-center group" title={p.title}>
            <span className="text-[10px] font-semibold text-gray-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {p.value}
            </span>
            <div
              className={`w-full rounded-t transition-colors ${
                p.current ? "bg-[#D07AB5]" : p.muted ? "bg-[#84AAA6]/40" : "bg-[#84AAA6]"
              } group-hover:bg-[#6B8E8A]`}
              style={{ height: `${Math.max((p.value / max) * 100, p.value > 0 ? 3 : 1)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1.5">
        {points.map((p) => (
          <div key={p.key} className="flex-1 text-center text-[10px] text-gray-400 truncate">
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VisitsSection() {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDailyTable, setShowDailyTable] = useState(false);

  const fetchStats = useCallback(
    (): Promise<VisitStats | null> =>
      fetch("/api/admin/visits")
        .then((r) => (r.ok ? (r.json() as Promise<VisitStats>) : null))
        .catch(() => null),
    []
  );

  useEffect(() => {
    let alive = true;
    fetchStats().then((data) => {
      if (!alive) return;
      if (data) setStats(data);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [fetchStats]);

  const refresh = () => {
    setLoading(true);
    fetchStats().then((data) => {
      if (data) setStats(data);
      setLoading(false);
    });
  };

  if (loading && !stats) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-[#84AAA6] rounded-full animate-spin" />
    </div>
  );

  if (stats && !stats.available) return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm text-gray-900 font-medium mb-1">A látogatottság-statisztika még nincs bekapcsolva.</p>
      <p className="text-sm text-gray-600">
        Futtasd le a <code className="bg-white px-1.5 py-0.5 rounded font-mono text-xs">supabase/migrations/20260830_home_page_visits.sql</code> fájlt
        a Supabase SQL Editorban, utána itt már látszani fognak a számok.
      </p>
      {stats.error && <p className="text-xs text-gray-400 mt-2 font-mono break-words">{stats.error}</p>}
    </div>
  );

  if (!stats) return <p className="text-gray-500 text-sm">A statisztika nem tölthető be.</p>;

  const daily = stats.daily ?? [];
  const weekly = stats.weekly ?? [];
  const today = daily.length > 0 ? daily[daily.length - 1].date : "";
  const currentWeek = weekly.length > 0 ? weekly[weekly.length - 1].weekStart : "";

  const tiles = [
    { label: "Ma",             value: stats.summary.today },
    { label: "Tegnap",         value: stats.summary.yesterday },
    { label: "Ezen a héten",   value: stats.summary.thisWeek },
    { label: "Előző héten",    value: stats.summary.lastWeek },
    { label: "Utolsó 30 nap",  value: stats.summary.last30Days },
    { label: "Összesen",       value: stats.summary.allTime },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-gray-500 max-w-2xl">
          Hány különböző IP-címről nyitották meg a főoldalt. Az IP-címeket nem tároljuk, csak azok
          visszafejthetetlen lenyomatát – naponta és IP-nként egyszer, 12 hónapig. Összes megnyitás:{" "}
          <span className="font-semibold text-gray-700">{stats.summary.totalHits}</span>.
        </p>
        <Button size="sm" variant="outline" onClick={refresh} disabled={loading} className="gap-1.5 cursor-pointer h-8 text-xs shrink-0">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Frissítés
        </Button>
      </div>

      {/* Összesítő számok */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="text-2xl font-bold text-gray-900">{t.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Napi bontás */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Napi bontás <span className="font-normal text-gray-400">– utolsó {daily.length} nap</span>
        </h3>
        <Bars
          points={daily.map((d) => ({
            key: d.date,
            label: String(Number(d.date.slice(8, 10))),
            value: d.uniqueIps,
            title: `${formatDate(d.date)} – ${d.uniqueIps} egyedi IP, ${d.hits} megnyitás`,
            muted: weekday(d.date) === 0 || weekday(d.date) === 6,
            current: d.date === today,
          }))}
        />

        <button
          onClick={() => setShowDailyTable((v) => !v)}
          className="mt-3 text-sm text-[#84AAA6] hover:text-[#6B8E8A] flex items-center gap-1 cursor-pointer"
        >
          {showDailyTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showDailyTable ? "Napi táblázat elrejtése" : "Napi táblázat megjelenítése"}
        </button>

        {showDailyTable && (
          <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Nap</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Egyedi IP</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Megnyitás</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...daily].reverse().map((d) => (
                  <tr key={d.date} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{formatDate(d.date)}</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">{d.uniqueIps}</td>
                    <td className="px-4 py-2 text-right text-gray-500">{d.hits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Heti bontás */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Heti bontás <span className="font-normal text-gray-400">– utolsó {weekly.length} hét (hétfőtől vasárnapig)</span>
        </h3>
        <Bars
          points={weekly.map((w) => ({
            key: w.weekStart,
            label: `${Number(w.weekStart.slice(5, 7))}.${Number(w.weekStart.slice(8, 10))}.`,
            value: w.uniqueIps,
            title: `${formatWeek(w.weekStart)} – ${w.uniqueIps} egyedi IP, ${w.hits} megnyitás`,
            muted: false,
            current: w.weekStart === currentWeek,
          }))}
        />

        <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Hét</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Egyedi IP</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Megnyitás</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...weekly].reverse().map((w) => (
                <tr key={w.weekStart} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {formatWeek(w.weekStart)}
                    {w.weekStart === currentWeek && (
                      <span className="ml-2 text-xs text-[#D07AB5] font-medium">folyamatban</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{w.uniqueIps}</td>
                  <td className="px-4 py-2 text-right text-gray-500">{w.hits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
