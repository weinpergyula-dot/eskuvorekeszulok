"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

/**
 * Mobilos szolgáltatókereső a kategóriaválasztó teal sávjában. Alapból csak
 * egy kerek nagyító gomb a „Válassz kategóriát!” cím mellett; koppintásra
 * mezővé nyílik. Gépelés közben a lista szűr ("eskuvo:set-query"), Enterre
 * a lista elejére görget. Bezáráskor a keresés törlődik.
 */
export function CategorySearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /* Rövid késleltetéssel küldjük a listának, hogy ne szűrjön minden leütésre. */
  useEffect(() => {
    const t = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("eskuvo:set-query", { detail: query.trim() }));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  /* A lista fölötti „Keresés: …” címke törlőgombja is bezárja. */
  useEffect(() => {
    const h = () => { setOpen(false); setQuery(""); };
    window.addEventListener("eskuvo:clear-query", h);
    return () => window.removeEventListener("eskuvo:clear-query", h);
  }, []);

  const openSearch = () => {
    setOpen(true);
    /* A mező a nyitó animáció alatt kap fókuszt, így iOS-en is feljön a billentyűzet. */
    inputRef.current?.focus();
  };

  const close = () => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
    window.dispatchEvent(new CustomEvent("eskuvo:set-query", { detail: query.trim() }));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("szolgaltatok")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      data-open={open || undefined}
      className="category-search pointer-events-none absolute inset-0 z-10 flex items-center justify-end"
    >
      <div className="category-search-field pointer-events-auto relative flex h-10 items-center overflow-hidden rounded-full border">
        <button
          type="button"
          onClick={open ? () => inputRef.current?.focus() : openSearch}
          aria-label="Szolgáltató keresése"
          aria-expanded={open}
          className="category-search-icon grid h-10 w-10 shrink-0 cursor-pointer place-items-center"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </button>
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") close(); }}
          tabIndex={open ? 0 : -1}
          aria-hidden={!open}
          placeholder="Szolgáltató, kategória, megye…"
          aria-label="Keresés a szolgáltatók között"
          /* 16px, hogy iOS-en fókuszáláskor ne nagyítson rá az oldal */
          className="min-w-0 flex-1 bg-transparent pr-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {open && (
          <button
            type="button"
            onClick={close}
            aria-label="Keresés bezárása"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center text-gray-500"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </button>
        )}
      </div>
    </form>
  );
}
