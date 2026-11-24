"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorLog {
  id: string;
  created_at: string;
  source: string;
  message: string;
  details: Record<string, unknown> | null;
}

export function LogsSection() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  /* A lekérés maga nem állít állapotot, csak visszaadja az eredményt: a
     betöltésjelzőt a frissítés gomb kapcsolja, a beolvasott adatot pedig a
     promise visszahívása teszi be. Így az effekt nem indít azonnali
     újrarajzolást (react-hooks/set-state-in-effect). */
  const fetchLogs = useCallback(
    (): Promise<ErrorLog[] | null> =>
      fetch("/api/admin/logs")
        .then((r) => (r.ok ? (r.json() as Promise<ErrorLog[]>) : null))
        .catch(() => null),
    []
  );

  useEffect(() => {
    let alive = true;
    fetchLogs().then((data) => {
      if (!alive) return;
      if (data) setLogs(data);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [fetchLogs]);

  const refresh = () => {
    setLoading(true);
    fetchLogs().then((data) => {
      if (data) setLogs(data);
      setLoading(false);
    });
  };

  const clearAll = async () => {
    if (!confirm("Biztosan törlöd az összes logot?")) return;
    setClearing(true);
    await fetch("/api/admin/logs", { method: "DELETE" });
    setLogs([]);
    setClearing(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-[#84AAA6] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">{logs.length} bejegyzés (max 200)</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={refresh} className="gap-1.5 cursor-pointer h-8 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Frissítés
          </Button>
          {logs.length > 0 && (
            <Button size="sm" variant="destructive" onClick={clearAll} disabled={clearing} className="gap-1.5 cursor-pointer h-8 text-xs">
              <Trash2 className="h-3.5 w-3.5" /> Összes törlése
            </Button>
          )}
        </div>
      </div>

      {logs.length === 0 && (
        <p className="text-gray-500 text-sm">Nincs rögzített hiba.</p>
      )}

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          {logs.length > 0 && (
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-700 whitespace-nowrap">Időpont</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Forrás</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Hibaüzenet</th>
                <th className="px-4 py-2.5 w-8" />
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <>
                <tr key={log.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap align-top">
                    {new Date(log.created_at).toLocaleString("hu-HU", {
                      month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    <code className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                      {log.source}
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-[#F06C6C] align-top max-w-[400px]">
                    <span className="break-words">{log.message}</span>
                  </td>
                  <td className="px-4 py-2.5 align-top">
                    {log.details && (
                      <button
                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expanded === log.id
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />}
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === log.id && log.details && (
                  <tr key={`${log.id}-details`} className="bg-gray-50">
                    <td colSpan={4} className="px-4 py-3">
                      <pre className="text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
