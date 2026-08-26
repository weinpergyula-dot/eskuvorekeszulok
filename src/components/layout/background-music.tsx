"use client";

import { useEffect, useRef, useState } from "react";
import { Music2 } from "lucide-react";

const SRC = "/perfect.mp3";
const VOLUME = 0.12; // halk háttérzene
const KEY_TIME = "bgmusic-time";

/**
 * Halk háttérzene egyetlen kapcsolóval (bal alsó sarok). Áthúzott dallam ikon =
 * némítva, áthúzás nélkül = szól. Kattintásra vált. A zene SOHA nem indul
 * automatikusan – csak ha a felhasználó bekapcsolja. A komponens a gyökér
 * layoutban él, ezért kliensoldali navigációnál nem mountolódik újra: ha egyszer
 * elindították, megszakítás nélkül szól tovább. Teljes újratöltésnél a lejátszási
 * pozíciót sessionStorage-ből állítjuk vissza.
 */
export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = VOLUME;
    const savedTime = Number(sessionStorage.getItem(KEY_TIME) ?? "0");
    if (savedTime > 0 && Number.isFinite(savedTime)) {
      try { audio.currentTime = savedTime; } catch { /* metadata még nincs kész */ }
    }
  }, [mounted]);

  // Lejátszási pozíció megőrzése + play/pause állapot követése.
  useEffect(() => {
    if (!mounted) return;
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.currentTime > 0) sessionStorage.setItem(KEY_TIME, String(audio.currentTime));
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [mounted]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.volume = VOLUME;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* loop = folyamatos ismétlés */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={SRC} loop preload="auto" />

      <button
        onClick={toggle}
        aria-label={playing ? "Zene kikapcsolása" : "Zene bekapcsolása"}
        title={playing ? "Zene kikapcsolása" : "Zene bekapcsolása"}
        className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white/80 backdrop-blur-md shadow-sm text-[#84AAA6] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <span className="relative inline-flex">
          <Music2 className="h-5 w-5" strokeWidth={2} />
          {!playing && (
            <span className="absolute left-1/2 top-1/2 h-[2px] w-[26px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
          )}
        </span>
      </button>
    </>
  );
}
