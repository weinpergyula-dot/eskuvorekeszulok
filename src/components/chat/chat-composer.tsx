"use client";

import type { FormEvent, KeyboardEvent, RefObject } from "react";
import { ArrowUp } from "lucide-react";

const MAX_HEIGHT = 160;

/**
 * A chatek közös beviteli mezője – a Claude iOS app mintájára: egyetlen
 * nagy, lekerekített doboz, felül a gépelés közben magasodó szöveg, alatta
 * jobbra a kerek küldés gomb. A gomb üres mezőnél halvány.
 */
export function ChatComposer({
  textareaRef,
  value,
  onChange,
  onKeyDown,
  onSubmit,
  sending,
  error,
  placeholder = "Írj üzenetet…",
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  sending: boolean;
  error?: string | null;
  placeholder?: string;
}) {
  const canSend = !sending && value.trim().length > 0;

  return (
    <div className="shrink-0 bg-gray-50 px-3 pb-3 pt-2">
      <form
        onSubmit={onSubmit}
        className="rounded-[26px] border border-gray-200 bg-white px-4 pb-2.5 pt-3 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.22)] transition-colors focus-within:border-[#84AAA6]/60"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, MAX_HEIGHT) + "px";
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          aria-label="Üzenet"
          className="block w-full resize-none overflow-y-auto border-0 bg-transparent p-0 text-base leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
          style={{ maxHeight: `${MAX_HEIGHT}px` }}
        />
        <div className="mt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={!canSend}
            aria-label={sending ? "Küldés folyamatban" : "Küldés"}
            className={`grid h-9 w-9 place-items-center rounded-full text-white transition-colors ${
              canSend
                ? "cursor-pointer bg-[#84AAA6] hover:bg-[#6B8E8A]"
                : "cursor-default bg-[#84AAA6]/40"
            }`}
          >
            <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </button>
        </div>
      </form>
      {error && <p className="mt-1.5 px-2 text-xs text-[#F06C6C]">{error}</p>}
    </div>
  );
}
