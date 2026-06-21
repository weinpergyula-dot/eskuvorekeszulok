"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, X, Music2 } from "lucide-react";

const SRC = "/perfect.mp3";
const VOLUME = 0.12; // halk háttérzene
const KEY_DISMISSED = "bgmusic-dismissed";
const KEY_TIME = "bgmusic-time";

/**
 * Halk háttérzene, ami KIZÁRÓLAG a play gomb megnyomására indul – soha nem
 * automatikusan. A komponens a gyökér layoutban él, ezért kliensoldali
 * navigációnál (Link) nem mountolódik újra: ha egyszer elindították, a zene
 * megszakítás nélkül szól tovább az oldalak között. Teljes újratöltésnél a
 * lejátszási pozíciót sessionStorage-ből állítjuk vissza.
 */
export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    setDismissed(sessionStorage.getItem(KEY_DISMISSED) === "1");
  }, []);

  // A zene SOHA nem indul automatikusan – csak ha a felhasználó megnyomja a play
  // gombot. Itt csak a hangerőt és a (teljes újratöltés utáni) lejátszási pozíciót
  // állítjuk be; SPA-navigációnál a komponens nem mountolódik újra, így a zene
  // megszakítás nélkül szól tovább, ha egyszer már elindították.
  useEffect(() => {
    if (!mounted || dismissed) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = VOLUME;
    const savedTime = Number(sessionStorage.getItem(KEY_TIME) ?? "0");
    if (savedTime > 0 && Number.isFinite(savedTime)) {
      try { audio.currentTime = savedTime; } catch { /* metadata még nincs kész */ }
    }
  }, [mounted, dismissed]);

  // Lejátszási pozíció megőrzése a teljes újratöltéshez.
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

  const close = () => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    sessionStorage.setItem(KEY_DISMISSED, "1");
    setDismissed(true);
  };

  if (!mounted || dismissed) return null;

  return (
    <>
      {/* loop = folyamatos ismétlés */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={SRC} loop preload="auto" />

      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur-md shadow-sm px-2.5 py-1.5 opacity-60 hover:opacity-100 transition-opacity">
        <Music2 className="h-5 w-5 text-[#84AAA6] ml-0.5 shrink-0" strokeWidth={2} />
        <button
          onClick={toggle}
          aria-label={playing ? "Zene szüneteltetése" : "Zene lejátszása"}
          title={playing ? "Zene szüneteltetése" : "Zene lejátszása"}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-[#84AAA6] transition-colors cursor-pointer"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          onClick={close}
          aria-label="Zene kikapcsolása"
          title="Zene kikapcsolása"
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#F06C6C] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
