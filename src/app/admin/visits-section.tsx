"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ChevronDown, ChevronUp, Monitor, Smartphone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_TRACKED_PATH, TRACKED_PAGES } from "@/lib/tracked-paths";

interface DailyPoint { date: string; uniqueIps: number; newIps: number; hits: number }
interface WeeklyPoint { weekStart: string; uniqueIps: number; newIps: number; hits: number }

export interface VisitStats {
  available: boolean;
  error?: string;
  /** Megvan-e már az „új látogatók” szám (lefutott-e a migráció). */
  hasNew?: boolean;
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
  summaryNew?: {
    today: number;
    yesterday: number;
    thisWeek: number;
    lastWeek: number;
    last30Days: number;
  };
}

/** "unique": minden nap minden egyedi IP; "new": egy IP csak az első napján. */
type Mode = "unique" | "new";

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

interface TodayVisit {
  id: string;
  firstSeenAt: string;
  lastSeenAt: string;
  hits: number;
  device: "desktop" | "ios" | "android" | null;
  /** Operációs rendszer és böngésző, pl. „Windows · Chrome” */
  client: string | null;
  user: { id: string; name: string; role: string | null } | null;
}

const DEVICE_LABELS: Record<string, string> = { desktop: "Desktop", ios: "iOS", android: "Android" };
const ROLE_LABELS: Record<string, string> = { visitor: "látogató", provider: "szolgáltató", admin: "admin" };

/** ISO időbélyeg → "14:05" (magyar idő) */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("hu-HU", { timeZone: "Europe/Budapest", hour: "2-digit", minute: "2-digit" });
}

/** A mai látogatók listája: eszköz, időpont, belépett / kijelentkezett. */
function TodayList({ path }: { path: string }) {
  const [visits, setVisits] = useState<TodayVisit[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/visits/today?path=${encodeURIComponent(path)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { visits: TodayVisit[] }) => { if (alive) setVisits(data.visits ?? []); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [path]);

  if (failed) return <p className="text-sm text-gray-500">A mai látogatók listája nem tölthető be.</p>;
  if (!visits) return (
    <div className="flex justify-center py-6">
      <div className="w-6 h-6 border-4 border-gray-200 border-t-[#84AAA6] rounded-full animate-spin" />
    </div>
  );
  if (visits.length === 0) return <p className="text-sm text-gray-500">Ma még nem volt látogató.</p>;

  return (
    <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
      {visits.map((v) => {
        const first = formatTime(v.firstSeenAt);
        const last = formatTime(v.lastSeenAt);
        return (
          /* Rács: mobilon két sor (eszköz + időpont, alatta felhasználó +
             megnyitások), sm-től egy sor fix szélességű oszlopokkal. */
          <div
            key={v.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 px-4 py-2 text-sm sm:grid-cols-[14rem_7.5rem_minmax(0,1fr)_3rem]"
          >
            <span className="flex min-w-0 items-center gap-1.5 text-gray-700" title={v.client ?? undefined}>
              {v.device === "ios" || v.device === "android"
                ? <Smartphone className="h-4 w-4 shrink-0 text-gray-400" />
                : <Monitor className="h-4 w-4 shrink-0 text-gray-400" />}
              <span className="truncate">{v.client ?? (v.device ? DEVICE_LABELS[v.device] ?? v.device : "–")}</span>
            </span>
            <span className="whitespace-nowrap text-right tabular-nums text-gray-700 sm:text-left" title={`${v.hits} megnyitás`}>
              {first === last ? first : `${first} – ${last}`}
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              {v.user ? (
                <>
                  <UserRound className="h-4 w-4 shrink-0 text-[#84AAA6]" />
                  <span className="truncate font-medium text-gray-900">{v.user.name}</span>
                  {v.user.role && <span className="shrink-0 text-xs text-gray-400">({ROLE_LABELS[v.user.role] ?? v.user.role})</span>}
                </>
              ) : (
                <span className="whitespace-nowrap text-gray-400">Nincs belépve</span>
              )}
            </span>
            <span className="text-right text-xs text-gray-400 tabular-nums">{v.hits > 1 ? `${v.hits}×` : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

function Bars({ points }: { points: { key: string; label: string; value: number; title: string; muted: boolean; current: boolean }[] }) {
  const max = Math.max(1, ...points.map((p) => p.value));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* A hasáb tetején mindig ott a nap értéke; a hasáb maga a keret 88%-át
          használhatja, hogy a szám elférjen fölötte. */}
      <div className="flex items-end gap-1 h-44">
        {points.map((p) => (
          <div key={p.key} className="flex-1 h-full flex flex-col justify-end items-center group" title={p.title}>
            <span className="text-[10px] font-semibold leading-none text-gray-600 mb-1 whitespace-nowrap tabular-nums">
              {p.value}
            </span>
            <div
              className={`w-full rounded-t transition-colors ${
                p.current ? "bg-[#BD7E90]" : p.muted ? "bg-[#84AAA6]/40" : "bg-[#84AAA6]"
              } group-hover:bg-[#6B8E8A]`}
              style={{ height: `${Math.max((p.value / max) * 88, p.value > 0 ? 3 : 1)}%` }}
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
  const [path, setPath] = useState<string>(DEFAULT_TRACKED_PATH);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDailyTable, setShowDailyTable] = useState(false);
  const [mode, setMode] = useState<Mode>("unique");
  const [showToday, setShowToday] = useState(false);
  const [todayKey, setTodayKey] = useState(0);

  const fetchStats = useCallback(
    (p: string): Promise<VisitStats | null> =>
      fetch(`/api/admin/visits?path=${encodeURIComponent(p)}`)
        .then((r) => (r.ok ? (r.json() as Promise<VisitStats>) : null))
        .catch(() => null),
    []
  );

  useEffect(() => {
    let alive = true;
    fetchStats(path).then((data) => {
      if (!alive) return;
      if (data) setStats(data);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [fetchStats, path]);

  const selectPath = (next: string) => {
    if (next === path) return;
    setLoading(true);
    setStats(null);
    setShowToday(false);
    setPath(next);
  };

  const refresh = () => {
    setLoading(true);
    setTodayKey((k) => k + 1);
    fetchStats(path).then((data) => {
      if (data) setStats(data);
      setLoading(false);
    });
  };

  const tabs = (
    <div className="flex flex-wrap gap-1 rounded-full border border-gray-200 bg-white p-1">
      {TRACKED_PAGES.map((page) => (
        <button
          key={page.path}
          onClick={() => selectPath(page.path)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            path === page.path
              ? "bg-[#84AAA6] text-white"
              : "text-gray-600 hover:bg-[#84AAA6]/10 hover:text-[#5C8480]"
          }`}
        >
          {page.label}
          <span className="ml-1.5 font-mono text-[11px] opacity-70">{page.path}</span>
        </button>
      ))}
    </div>
  );

  if (loading && !stats) return (
    <div className="space-y-6">
      {tabs}
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#84AAA6] rounded-full animate-spin" />
      </div>
    </div>
  );

  if (stats && !stats.available) return (
    <div className="space-y-6">
      {tabs}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-gray-900 font-medium mb-1">A látogatottság-statisztika még nincs bekapcsolva.</p>
        <p className="text-sm text-gray-600">
          Futtasd le a <code className="bg-white px-1.5 py-0.5 rounded font-mono text-xs">supabase/migrations/20260831_page_visits_path.sql</code> fájlt
          a Supabase SQL Editorban, utána itt már látszani fognak a számok.
        </p>
        {stats.error && <p className="text-xs text-gray-400 mt-2 font-mono break-words">{stats.error}</p>}
      </div>
    </div>
  );

  if (!stats) return (
    <div className="space-y-6">
      {tabs}
      <p className="text-gray-500 text-sm">A statisztika nem tölthető be.</p>
    </div>
  );

  const isNew = mode === "new" && !!stats.hasNew && !!stats.summaryNew;
  const val = (p: { uniqueIps: number; newIps: number }) => (isNew ? p.newIps : p.uniqueIps);
  const unitLabel = isNew ? "új látogató" : "egyedi IP";
  const colLabel = isNew ? "Új látogató" : "Egyedi IP";
  const sum = isNew && stats.summaryNew ? { ...stats.summary, ...stats.summaryNew } : stats.summary;

  const daily = stats.daily ?? [];
  const weekly = stats.weekly ?? [];
  const today = daily.length > 0 ? daily[daily.length - 1].date : "";
  const currentWeek = weekly.length > 0 ? weekly[weekly.length - 1].weekStart : "";

  const tiles = [
    { label: "Ma",             value: sum.today },
    { label: "Tegnap",         value: sum.yesterday },
    { label: "Ezen a héten",   value: sum.thisWeek },
    { label: "Előző héten",    value: sum.lastWeek },
    { label: "Utolsó 30 nap",  value: sum.last30Days },
    { label: "Összesen",       value: sum.allTime },
  ];

  return (
    <div className="space-y-6">
      {tabs}

      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-gray-500">
          Összes megnyitás:{" "}
          <span className="font-semibold text-gray-700">{stats.summary.totalHits}</span>
        </p>
        <Button size="sm" variant="outline" onClick={refresh} disabled={loading} className="gap-1.5 cursor-pointer h-8 text-xs shrink-0">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Frissítés
        </Button>
      </div>

      {/* Nézetváltó: új látogatók / minden egyedi IP */}
      {stats.hasNew ? (
        <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
          {([
            { value: "unique", label: "Látogatók" },
            { value: "new", label: "Új látogatók" },
          ] as { value: Mode; label: string }[]).map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                mode === m.value ? "bg-[#84AAA6] text-white" : "text-gray-600 hover:bg-[#84AAA6]/10 hover:text-[#5C8480]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          Az „új látogatók” nézethez futtasd le a{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">supabase/migrations/20261012_page_visits_new_visitors.sql</code>{" "}
          fájlt a Supabase SQL Editorban.
        </p>
      )}

      {/* Összesítő számok */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((t) =>
          t.label === "Ma" ? (
            /* A mai számra kattintva lenyílik a mai látogatók listája */
            <button
              key={t.label}
              onClick={() => setShowToday((v) => !v)}
              className={`rounded-lg border bg-white p-3 text-left transition-colors cursor-pointer hover:border-[#84AAA6] ${showToday ? "border-[#84AAA6]" : "border-gray-200"}`}
            >
              <div className="text-2xl font-bold text-gray-900">{t.value}</div>
              <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                {t.label}
                {showToday ? <ChevronUp className="h-3.5 w-3.5 text-[#84AAA6]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#84AAA6]" />}
              </div>
            </button>
          ) : (
            <div key={t.label} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="text-2xl font-bold text-gray-900">{t.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{t.label}</div>
            </div>
          )
        )}
      </div>

      {showToday && (
        <section>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Mai látogatók</h3>
          <TodayList key={`${path}-${todayKey}`} path={path} />
        </section>
      )}

      {/* Napi bontás */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Napi bontás <span className="font-normal text-gray-400">– utolsó {daily.length} nap</span>
        </h3>
        <Bars
          points={daily.map((d) => ({
            key: d.date,
            label: String(Number(d.date.slice(8, 10))),
            value: val(d),
            title: `${formatDate(d.date)} – ${val(d)} ${unitLabel}, ${d.hits} megnyitás`,
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
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">{colLabel}</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Megnyitás</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...daily].reverse().map((d) => (
                  <tr key={d.date} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{formatDate(d.date)}</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-900">{val(d)}</td>
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
            value: val(w),
            title: `${formatWeek(w.weekStart)} – ${val(w)} ${unitLabel}, ${w.hits} megnyitás`,
            muted: false,
            current: w.weekStart === currentWeek,
          }))}
        />

        <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Hét</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-700">{colLabel}</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Megnyitás</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...weekly].reverse().map((w) => (
                <tr key={w.weekStart} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {formatWeek(w.weekStart)}
                    {w.weekStart === currentWeek && (
                      <span className="ml-2 text-xs text-[#BD7E90] font-medium">folyamatban</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">{val(w)}</td>
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
