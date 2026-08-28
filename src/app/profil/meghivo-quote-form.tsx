"use client";

import { useState } from "react";
import { Check, MailOpen, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingTextarea } from "@/components/ui/floating-input";

/**
 * Digitális meghívó ajánlatkérés. Ugyanarra a végpontra megy, mint az
 * általános ajánlatkérő űrlap, és a válaszok is ugyanoda, a Chat menüpontba
 * érkeznek – csak a mezői a meghívóra vannak szabva (a csomagot és a kért
 * extrákat bejelöléssel lehet megadni), és nem kell címzettet választani:
 * ezt az ajánlatkérést kizárólag mi kapjuk meg.
 */

/** Gyors ajánlatkéréshez ezen a számon vagyunk elérhetők. */
const PHONE_DISPLAY = "06 70 788 8787";
const PHONE_HREF = "tel:+36707888787";

/** A meghívó a helyszíntől független, ezért országos ajánlatkérés megy ki. */
const CATEGORY = "meghivo";
const COUNTIES = ["Országosan"];

const PACKAGES = [
  { id: "BASIC", label: "BASIC", note: "14 900 Ft-tól" },
  { id: "SILVER", label: "SILVER", note: "24 900 Ft-tól" },
  { id: "PREMIUM", label: "PREMIUM", note: "39 900 Ft-tól" },
  { id: "NEM_TUDOM", label: "Még nem tudom", note: "Segítsetek választani" },
] as const;

const EXTRAS = [
  "Fotógaléria rólatok (10 képig)",
  "Választható arculati szín",
  "Kétnyelvű meghívó",
  "Saját háttérzene feltöltése",
  "Vendéglista exportálása",
  "Egyedi illusztráció és monogram",
  "Videós köszöntő beágyazása",
  "Személyes konzultáció, saját designer",
] as const;

/** Bejelölhető sor – csomagnál egyválasztós, extráknál többválasztós. */
function Choice({
  label,
  note,
  selected,
  onClick,
}: {
  label: string;
  note?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
        selected
          ? "border-[#84AAA6] bg-[#84AAA6]/10"
          : "border-gray-200 bg-white hover:border-[#84AAA6]"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          selected ? "border-[#84AAA6] bg-[#84AAA6]" : "border-gray-300 bg-white"
        }`}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className={`block text-sm font-semibold ${selected ? "text-[#5C8480]" : "text-gray-900"}`}>
          {label}
        </span>
        {note && <span className="block text-xs text-gray-500">{note}</span>}
      </span>
    </button>
  );
}

export function MeghivoQuoteForm({
  onSent,
  onCancel,
  initialPackage,
}: {
  onSent: () => void;
  onCancel?: () => void;
  initialPackage?: string;
}) {
  const [pkg, setPkg] = useState<string>(
    PACKAGES.some(p => p.id === initialPackage?.toUpperCase()) ? initialPackage!.toUpperCase() : ""
  );
  const [extras, setExtras] = useState<string[]>([]);
  const [weddingDate, setWeddingDate] = useState("");
  const [names, setNames] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleExtra = (x: string) =>
    setExtras(prev => (prev.includes(x) ? prev.filter(e => e !== x) : [...prev, x]));

  /** A bejelölésekből összeáll az az üzenet, amit a szolgáltató megkap. */
  const buildMessage = () => {
    const lines = [
      `Csomag: ${PACKAGES.find(p => p.id === pkg)?.label ?? "—"}`,
      extras.length > 0
        ? `Kért extrák:\n${extras.map(x => `• ${x}`).join("\n")}`
        : "Kért extrák: nincs megjelölve",
    ];
    if (weddingDate) lines.push(`Az esküvő időpontja: ${weddingDate}`);
    if (names.trim()) lines.push(`A pár neve: ${names.trim()}`);
    if (note.trim()) lines.push(`Megjegyzés:\n${note.trim()}`);
    return lines.join("\n\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg) { setError("Válassz csomagot!"); return; }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Digitális meghívó – ${PACKAGES.find(p => p.id === pkg)?.label ?? "ajánlatkérés"}`,
          category: CATEGORY,
          counties: COUNTIES,
          message: buildMessage(),
          // Ezt az ajánlatkérést nem a regisztrált szolgáltatók kapják.
          houseOnly: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      onSent();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
        <MailOpen className="h-4 w-4 text-[#84AAA6]" strokeWidth={1.75} />
        Digitális meghívó – ajánlatkérés
      </h3>

      {/* Gyorsabb út: telefon */}
      <div className="flex items-start gap-3 rounded-xl border border-[#84AAA6]/40 bg-[#F0F6F5] px-4 py-3">
        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#84AAA6]" strokeWidth={1.75} />
        <p className="text-sm leading-relaxed text-gray-700">
          Ha gyorsabb ajánlatkérést szeretnél, azt a{" "}
          <a href={PHONE_HREF} className="font-bold text-[#84AAA6] hover:underline">
            {PHONE_DISPLAY}
          </a>{" "}
          telefonszámon teheted meg.
        </p>
      </div>

      {/* Csomag – egyet választhatsz */}
      <div>
        <p className="text-xs text-gray-600 mb-2">
          Melyik csomag érdekel?{" "}
          <span className="text-[1.2em] font-bold leading-none align-middle">*</span>
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PACKAGES.map(p => (
            <Choice
              key={p.id}
              label={p.label}
              note={p.note}
              selected={pkg === p.id}
              onClick={() => setPkg(pkg === p.id ? "" : p.id)}
            />
          ))}
        </div>
      </div>

      {/* Extrák – többet is bejelölhetsz */}
      <div>
        <p className="text-xs text-gray-600 mb-2">
          Milyen extrákat kérnél? (többet is bejelölhetsz)
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXTRAS.map(x => (
            <Choice key={x} label={x} selected={extras.includes(x)} onClick={() => toggleExtra(x)} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* A dátummezőnek saját címkéje van: a natív date input mindig mutat
            valamit, így a lebegő címke ráúszna. */}
        <div>
          <label htmlFor="mq-date" className="mb-1 block text-xs text-gray-600">
            Az esküvő időpontja
          </label>
          <input
            id="mq-date"
            type="date"
            value={weddingDate}
            onChange={e => setWeddingDate(e.target.value)}
            className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 outline-none transition-colors focus:border-[#84AAA6] focus:ring-1 focus:ring-[#84AAA6] sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="mq-names" className="mb-1 block text-xs text-gray-600">
            A pár neve
          </label>
          <input
            id="mq-names"
            value={names}
            onChange={e => setNames(e.target.value)}
            placeholder="pl. Eszter és Bálint"
            className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-[#84AAA6] focus:ring-1 focus:ring-[#84AAA6] sm:text-sm"
          />
        </div>
      </div>

      <FloatingTextarea
        id="mq-note"
        label="Megjegyzés"
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={3}
        compact
        className="text-base sm:text-sm"
      />

      <p className="text-xs text-gray-500">
        Ezt az ajánlatkérést közvetlenül mi kapjuk meg – nem megy ki más szolgáltatóhoz.
      </p>

      {error && (
        <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-xs px-4 py-3 rounded-xl border border-[#F06C6C]/30">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={sending}>
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {sending ? "Küldés..." : "Elküld"}
        </Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Mégse</Button>}
      </div>
      <p className="text-xs text-gray-500">
        <span className="text-sm font-bold align-middle">*</span> A csillaggal megjelöltek kitöltése kötelező.
      </p>
    </form>
  );
}
