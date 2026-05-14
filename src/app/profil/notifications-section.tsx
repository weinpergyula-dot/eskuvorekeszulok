"use client";

import { useState, useEffect } from "react";
import type { UserRole } from "@/lib/types";

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
  saving: boolean;
}

function ToggleRow({ label, description, checked, onChange, saving }: ToggleRowProps) {
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
        disabled={saving}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed mt-0.5 ${
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/notification-preferences")
      .then((r) => r.json())
      .then((data: Prefs) => setPrefs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = async (key: keyof Prefs, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // visszaállítás hiba esetén
      setPrefs((prev) => ({ ...prev, [key]: !value }));
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
          onChange={(v) => update("notify_new_message", v)}
          saving={saving}
        />

        {/* Értékelés – csak szolgáltató */}
        {(isProvider || isAdmin) && (
          <ToggleRow
            label="Új értékelés"
            description="E-mail értesítő, ha valaki értékelést hagyott a profilodon."
            checked={prefs.notify_new_review}
            onChange={(v) => update("notify_new_review", v)}
            saving={saving}
          />
        )}

        {/* Ajánlatkérés – csak szolgáltató */}
        {(isProvider || isAdmin) && (
          <ToggleRow
            label="Új ajánlatkérés"
            description="E-mail értesítő, ha egy látogató ajánlatkérést küldött a profilodra."
            checked={prefs.notify_new_quote_request}
            onChange={(v) => update("notify_new_quote_request", v)}
            saving={saving}
          />
        )}

        {/* Ajánlatkérés visszaválasz – csak látogató */}
        {(isVisitor || isAdmin) && (
          <ToggleRow
            label="Válasz az ajánlatkérésedre"
            description="E-mail értesítő, ha egy szolgáltató válaszolt az ajánlatkérésedre."
            checked={prefs.notify_quote_reply}
            onChange={(v) => update("notify_quote_reply", v)}
            saving={saving}
          />
        )}

        {/* Kapcsolati üzenet – csak admin */}
        {isAdmin && (
          <ToggleRow
            label="Kapcsolati üzenet"
            description="E-mail értesítő, ha valaki üzenetet küldött a Kapcsolat oldalon keresztül."
            checked={prefs.notify_contact_message}
            onChange={(v) => update("notify_contact_message", v)}
            saving={saving}
          />
        )}
      </div>

      {saved && (
        <p className="text-sm text-[#84AAA6] font-medium">Beállítások mentve.</p>
      )}

      <p className="text-sm text-gray-400">
        Az e-mail értesítők az általad megadott e-mail-címre érkeznek.
        Kikapcsolt értesítő esetén a Profil oldalon belüli jelzések (piros badge) változatlanul megmaradnak.
      </p>
    </div>
  );
}
