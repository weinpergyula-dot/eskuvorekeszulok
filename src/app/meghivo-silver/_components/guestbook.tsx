"use client";

import { useState } from "react";
import { PenLine, Quote } from "lucide-react";

/**
 * SILVER extra: vendégkönyv. A mintában a bejegyzések a böngészőben
 * maradnak (nincs mentés) – élesben a pár postaládájába érkeznek.
 */

type Entry = { name: string; text: string; when: string };

const SEED: Entry[] = [
  {
    name: "Kovács Anna és Bence",
    text: "Alig várjuk a nagy napot! Készültünk egy meglepetéssel is – de erről többet nem árulunk el. 😊",
    when: "3 napja",
  },
  {
    name: "Nagy Tamás",
    text: "Gratulálok nektek! Zenéből viszek pár lemezt, hátha jó lesz hajnalra.",
    when: "1 hete",
  },
  {
    name: "A Szabó család",
    text: "Csodaszép meghívó lett! Mind az öten ott leszünk, a gyerekek már a tortát tervezgetik.",
    when: "2 hete",
  },
];

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>(SEED);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setEntries((prev) => [{ name: name.trim(), text: text.trim(), when: "most" }, ...prev]);
    setName("");
    setText("");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={submit} className="slv-card px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="slv-icon-ring">
            <PenLine className="h-5 w-5" aria-hidden />
          </span>
          <p className="slv-muted text-[15px]">Írj nekünk pár sort – megőrizzük!</p>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <input
            className="slv-input"
            placeholder="A neved"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="A neved"
          />
          <textarea
            className="slv-input min-h-[92px] resize-y"
            placeholder="Üzenet a párnak…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Üzenet a párnak"
          />
          <button
            type="submit"
            className="self-start rounded-full border border-[var(--slv-line)] bg-[rgba(200,210,228,0.08)] px-6 py-2.5 text-sm text-[var(--slv-silver)] transition-colors hover:bg-[rgba(200,210,228,0.16)]"
          >
            Beírom a vendégkönyvbe
          </button>
        </div>
      </form>

      <ul className="mt-6 space-y-4">
        {entries.map((e, i) => (
          <li key={`${e.name}-${i}`} className="slv-card px-6 py-5">
            <Quote className="h-4 w-4 text-[var(--slv-glow)]" aria-hidden />
            <p className="mt-2 text-[15px] leading-relaxed">{e.text}</p>
            <p className="slv-caps mt-3 text-[10px]">
              {e.name} · {e.when}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
