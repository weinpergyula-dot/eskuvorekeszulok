"use client";

import { useEffect, useRef, useState } from "react";
import { PersonStanding, Plus, Minus, Contrast, Underline, RotateCcw, X } from "lucide-react";

const KEY = "a11y-settings";
const MIN = 80;
const MAX = 150;
const STEP = 10;

interface Settings {
  fontScale: number; // %
  contrast: boolean;
  underline: boolean;
}
const DEFAULT: Settings = { fontScale: 100, contrast: false, underline: false };

function apply(s: Settings) {
  const root = document.documentElement;
  root.style.fontSize = s.fontScale === 100 ? "" : `${s.fontScale}%`;
  root.classList.toggle("a11y-contrast", s.contrast);
  root.classList.toggle("a11y-underline", s.underline);
}

/**
 * Akadálymentesítési eszköztár — a zenelejátszó gombbal megegyező stílusú úszó
 * gomb a képernyő jobb alsó sarkában. Megnyitva betűméret-, kontraszt- és
 * link-aláhúzás beállításokat kínál, amelyek az oldal tartalmára hatnak.
 */
export function AccessibilityWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved) {
        const merged = { ...DEFAULT, ...saved };
        setSettings(merged);
        apply(merged);
      }
    } catch { /* ignore */ }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next: Settings = { ...prev, ...patch };
      if (patch.fontScale !== undefined) next.fontScale = Math.min(MAX, Math.max(MIN, patch.fontScale));
      apply(next);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const reset = () => {
    apply(DEFAULT);
    setSettings(DEFAULT);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  };

  if (!mounted) return null;

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="absolute bottom-full right-0 mb-3 w-64 rounded-2xl border border-gray-200 bg-white shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <PersonStanding className="h-4 w-4 text-[#84AAA6]" />
              Akadálymentesítés
            </h2>
            <button onClick={() => setOpen(false)} aria-label="Bezárás" className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Betűméret */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-1.5">Betűméret</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update({ fontScale: settings.fontScale - STEP })}
                disabled={settings.fontScale <= MIN}
                aria-label="Betűméret csökkentése"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex-1 text-center text-sm font-medium text-gray-900 tabular-nums">{settings.fontScale}%</span>
              <button
                onClick={() => update({ fontScale: settings.fontScale + STEP })}
                disabled={settings.fontScale >= MAX}
                aria-label="Betűméret növelése"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Nagy kontraszt */}
          <ToggleRow
            icon={<Contrast className="h-4 w-4" />}
            label="Nagy kontraszt"
            on={settings.contrast}
            onClick={() => update({ contrast: !settings.contrast })}
          />

          {/* Linkek aláhúzása */}
          <ToggleRow
            icon={<Underline className="h-4 w-4" />}
            label="Linkek aláhúzása"
            on={settings.underline}
            onClick={() => update({ underline: !settings.underline })}
          />

          <button
            onClick={reset}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Visszaállítás
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Akadálymentesítési beállítások"
        title="Akadálymentesítési beállítások"
        aria-expanded={open}
        className="flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white/80 backdrop-blur-md shadow-sm text-[#84AAA6] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <PersonStanding className="h-6 w-6" strokeWidth={2} />
      </button>
    </div>
  );
}

function ToggleRow({ icon, label, on, onClick }: { icon: React.ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className="w-full flex items-center gap-2 py-2 text-left cursor-pointer"
    >
      <span className="text-gray-500 shrink-0">{icon}</span>
      <span className="flex-1 text-sm text-gray-800">{label}</span>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${on ? "bg-[#84AAA6]" : "bg-gray-200"}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
      </span>
    </button>
  );
}
