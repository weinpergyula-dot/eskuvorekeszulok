"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";

/**
 * PREMIUM extra: háttérzene a pár kedvenc dalával. Sosem indul magától –
 * a látogató kapcsolja be, és a gomb végig a képernyő sarkában marad.
 */
export function MusicToggle({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnd = () => setPlaying(false);
    el.addEventListener("ended", onEnd);
    return () => el.removeEventListener("ended", onEnd);
  }, []);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    try {
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-[var(--prm-line)] bg-[#2A1733]/90 px-4 py-2.5 text-sm text-[var(--prm-rose)] backdrop-blur transition-colors hover:bg-[#351D40]"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Music className="h-4 w-4" />}
        <span className="hidden sm:inline">{playing ? "Zene szünetel" : title}</span>
        <span className="sm:hidden">{playing ? "Szünet" : "Zene"}</span>
      </button>
    </>
  );
}
