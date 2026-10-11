"use client";

import { useEffect, useRef, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { ArrowUp } from "lucide-react";

const MAX_HEIGHT = 160;

/** Az üzenetlista alsó bélése: a lebegő beviteli doboz magassága + egy kis rés. */
export const COMPOSER_SCROLL_PAD = "pb-[calc(var(--composer-h,7rem)+1rem)]";

/**
 * A chatek közös beviteli mezője – a Claude iOS app mintájára: egyetlen
 * nagy, lekerekített doboz, felül a gépelés közben magasodó szöveg, alatta
 * jobbra a kerek küldés gomb. A gomb üres mezőnél halvány.
 *
 * A doboz üveghatású: az üzenetlista alja fölött lebeg, az üzenetek
 * elmosva látszanak mögötte. Ehhez a komponens nulla magasságú sávként
 * kerül a lista alá, a doboz abból lóg fel; a saját magasságát a szülőn
 * --composer-h változóba írja, a lista ennyi alsó bélést hagy (lásd
 * COMPOSER_SCROLL_PAD), így az utolsó üzenet sosem marad alatta.
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
  const boxRef = useRef<HTMLDivElement>(null);

  // A doboz magasságát a szülőre írjuk, hogy a lista alsó bélése kövesse.
  useEffect(() => {
    const box = boxRef.current;
    const host = box?.parentElement?.parentElement;
    if (!box || !host) return;
    const publish = () => host.style.setProperty("--composer-h", `${box.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative z-10 h-0 shrink-0">
      <div ref={boxRef} className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-2">
      <form
        onSubmit={onSubmit}
        className="rounded-[26px] border border-white/70 bg-white/65 px-4 pb-2.5 pt-3 shadow-[0_12px_32px_-14px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-black/[0.06] backdrop-blur-2xl backdrop-saturate-150 transition-colors focus-within:ring-[#84AAA6]/50"
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
      {error && (
        <p className="mt-1.5 rounded-lg bg-white/70 px-2 py-0.5 text-xs text-[#F06C6C] backdrop-blur-md">{error}</p>
      )}
      </div>
    </div>
  );
}
