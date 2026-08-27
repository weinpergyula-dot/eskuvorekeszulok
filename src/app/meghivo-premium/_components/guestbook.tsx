"use client";

import { useState } from "react";
import { PenLine, Quote } from "lucide-react";

/**
 * PREMIUM extra: vendégkönyv. A mintában a bejegyzések a böngészőben
 * maradnak (nincs mentés) – élesben a pár postaládájába érkeznek.
 */

type Entry = { name: string; text: string; when: string };

const SEED: Entry[] = [
  {
    name: "Szalai Dóri és Ákos",
    text: "Ez a legszebb meghívó, amit valaha kaptunk – a borítékot háromszor nyitottuk ki. Ott leszünk!",
    when: "2 napja",
  },
  {
    name: "Papp Gergő",
    text: "Gratulálunk! A pezsgőt már hűtjük, a beszédet írom. 🥂",
    when: "5 napja",
  },
  {
    name: "A Vass család",
    text: "Nagyon várjuk a tihanyi napot! A gyerekek már a levendulás fotózást tervezgetik.",
    when: "1 hete",
  },
]

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
      <form onSubmit={submit} className="prm-card px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="prm-icon-ring">
            <PenLine className="h-5 w-5" aria-hidden />
          </span>
          <p className="prm-muted text-[15px]">Írj nekünk pár sort – megőrizzük!</p>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <input
            className="prm-input"
            placeholder="A neved"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="A neved"
          />
          <textarea
            className="prm-input min-h-[92px] resize-y"
            placeholder="Üzenet a párnak…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Üzenet a párnak"
          />
          <button
            type="submit"
            className="self-start rounded-full border border-[var(--prm-line)] bg-[rgba(232,180,212,0.08)] px-6 py-2.5 text-sm text-[var(--prm-rose)] transition-colors hover:bg-[rgba(232,180,212,0.16)]"
          >
            Beírom a vendégkönyvbe
          </button>
        </div>
      </form>

      <ul className="mt-6 space-y-4">
        {entries.map((e, i) => (
          <li key={`${e.name}-${i}`} className="prm-card px-6 py-5">
            <Quote className="h-4 w-4 text-[var(--prm-accent)]" aria-hidden />
            <p className="mt-2 text-[15px] leading-relaxed">{e.text}</p>
            <p className="prm-caps mt-3 text-[10px]">
              {e.name} · {e.when}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
