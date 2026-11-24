"use client";

import { useState, useEffect } from "react";
import type { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface Prefs {
  notify_new_message: boolean;
  notify_new_review: boolean;
  notify_new_quote_request: boolean;
  notify_quote_reply: boolean;
  notify_contact_message: boolean;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none mt-0.5 ${
          checked ? "bg-[#84AAA6]" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform ring-0 transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function NotificationsSection({ role }: { role: UserRole }) {
  const [prefs, setPrefs] = useState<Prefs>({
    notify_new_message: true,
    notify_new_review: true,
    notify_new_quote_request: true,
    notify_quote_reply: true,
    notify_contact_message: true,
  });
  const [savedPrefs, setSavedPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notification-preferences")
      .then((r) => r.json())
      .then((data: Prefs) => {
        setPrefs(data);
        setSavedPrefs(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isDirty = savedPrefs !== null && (
    prefs.notify_new_message       !== savedPrefs.notify_new_message       ||
    prefs.notify_new_review        !== savedPrefs.notify_new_review        ||
    prefs.notify_new_quote_request !== savedPrefs.notify_new_quote_request ||
    prefs.notify_quote_reply       !== savedPrefs.notify_quote_reply       ||
    prefs.notify_contact_message   !== savedPrefs.notify_contact_message
  );

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        setSavedPrefs({ ...prefs });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const json = await res.json().catch(() => ({}));
        setSaveError(json?.error ?? "Hiba történt a mentés során.");
        if (savedPrefs) setPrefs({ ...savedPrefs });
      }
    } catch {
      setSaveError("Hálózati hiba. Kérjük, próbáld újra.");
      if (savedPrefs) setPrefs({ ...savedPrefs });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  const isProvider = role === "provider";
  const isVisitor  = role === "visitor";
  const isAdmin    = role === "admin";

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl px-6 divide-y divide-gray-100">
        {/* Üzenetek – mindenki */}
        <ToggleRow
          label="Új üzenet"
          description="E-mail értesítő, ha új üzeneted érkezik a Profil / Üzenetek szekcióban."
          checked={prefs.notify_new_message}
          onChange={(v) => setPrefs((p) => ({ ...p, notify_new_message: v }))}
        />

        {/* Értékelés – csak szolgáltató */}
        {(isProvider || isAdmin) && (
          <ToggleRow
            label="Új értékelés"
            description="E-mail értesítő, ha valaki értékelést hagyott a profilodon."
            checked={prefs.notify_new_review}
            onChange={(v) => setPrefs((p) => ({ ...p, notify_new_review: v }))}
          />
        )}

        {/* Ajánlatkérés – csak szolgáltató */}
        {(isProvider || isAdmin) && (
          <ToggleRow
            label="Új ajánlatkérés"
            description="E-mail értesítő, ha egy látogató ajánlatkérést küldött a profilodra."
            checked={prefs.notify_new_quote_request}
            onChange={(v) => setPrefs((p) => ({ ...p, notify_new_quote_request: v }))}
          />
        )}

        {/* Ajánlatkérés visszaválasz – csak látogató */}
        {(isVisitor || isAdmin) && (
          <ToggleRow
            label="Válasz az ajánlatkérésedre"
            description="E-mail értesítő, ha egy szolgáltató válaszolt az ajánlatkérésedre."
            checked={prefs.notify_quote_reply}
            onChange={(v) => setPrefs((p) => ({ ...p, notify_quote_reply: v }))}
          />
        )}

        {/* Kapcsolati üzenet – csak admin */}
        {isAdmin && (
          <ToggleRow
            label="Kapcsolati üzenet"
            description="E-mail értesítő, ha valaki üzenetet küldött a Kapcsolat oldalon keresztül."
            checked={prefs.notify_contact_message}
            onChange={(v) => setPrefs((p) => ({ ...p, notify_contact_message: v }))}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="bg-[#84AAA6] hover:bg-[#6B8E8A] min-w-[160px]"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Mentés...
            </span>
          ) : "Beállítások mentése"}
        </Button>
        {saved && (
          <span className="text-sm text-[#84AAA6] font-medium">✓ Beállítások mentve.</span>
        )}
        {saveError && (
          <span className="text-sm text-[#F06C6C]">{saveError}</span>
        )}
      </div>

      <p className="text-sm text-gray-400">
        Az e-mail értesítők az általad megadott e-mail-címre érkeznek.
        Kikapcsolt értesítő esetén a Profil oldalon belüli jelzések (piros badge) változatlanul megmaradnak.
      </p>
    </div>
  );
}
