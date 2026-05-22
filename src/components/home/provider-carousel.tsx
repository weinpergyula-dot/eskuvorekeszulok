"use client";

import { useRef, useState } from "react";
import type { Provider } from "@/lib/types";
import { ProviderCard } from "@/components/providers/provider-card";
import { Pause, Play, Rewind, FastForward } from "lucide-react";

// Available durations in seconds — index 1 is the default (45 s)
const DURATIONS = [60, 45, 35, 22, 14];
const DEFAULT_IDX = 1;

interface ProviderCarouselProps {
  providers: Provider[];
}

export function ProviderCarousel({ providers }: ProviderCarouselProps) {
  // All hooks must come before any conditional return (Rules of Hooks)
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const frozenX = useRef<number>(0);

  const [paused, setPaused] = useState(false);
  const [durationIdx, setDurationIdx] = useState(DEFAULT_IDX);
  const [dragging, setDragging] = useState(false);
  const pausedRef = useRef(false);
  const durationIdxRef = useRef(DEFAULT_IDX);

  if (providers.length === 0) return null;

  const doubled = [...providers, ...providers];

  const getComputedX = (): number => {
    if (!trackRef.current) return 0;
    const matrix = new DOMMatrix(window.getComputedStyle(trackRef.current).transform);
    return matrix.m41;
  };

  const getProgress = (): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const halfWidth = track.scrollWidth / 2;
    let nx = getComputedX() % halfWidth;
    if (nx > 0) nx -= halfWidth;
    return nx / -halfWidth;
  };

  const applyAnimation = (duration: number, progress: number, isPaused: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    const delaySec = -(progress * duration);
    track.style.animation = `carousel-scroll ${duration}s ${delaySec.toFixed(3)}s linear infinite`;
    track.style.animationPlayState = isPaused ? "paused" : "running";
  };

  const handlePlayPause = () => {
    const track = trackRef.current;
    if (!track) return;
    const newPaused = !pausedRef.current;
    pausedRef.current = newPaused;
    setPaused(newPaused);
    if (!track.style.animation) {
      applyAnimation(DURATIONS[durationIdxRef.current], getProgress(), newPaused);
    } else {
      track.style.animationPlayState = newPaused ? "paused" : "running";
    }
  };

  const changeSpeed = (newIdx: number) => {
    const track = trackRef.current;
    if (!track) return;
    durationIdxRef.current = newIdx;
    setDurationIdx(newIdx);
    applyAnimation(DURATIONS[newIdx], getProgress(), pausedRef.current);
  };

  // ── Touch handlers (mobile) ──────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    const track = trackRef.current;
    if (!track) return;
    touchStartX.current = e.touches[0].clientX;
    frozenX.current = getComputedX();
    track.style.animation = "none";
    track.style.transform = `translateX(${frozenX.current}px)`;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const track = trackRef.current;
    if (touchStartX.current === null || !track) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    track.style.transform = `translateX(${frozenX.current + dx}px)`;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const track = trackRef.current;
    if (!track || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const endX = frozenX.current + dx;
    const halfWidth = track.scrollWidth / 2;
    let nx = endX % halfWidth;
    if (nx > 0) nx -= halfWidth;
    const progress = nx / -halfWidth;
    track.style.transform = "";
    applyAnimation(DURATIONS[durationIdxRef.current], progress, pausedRef.current);
    touchStartX.current = null;
  };

  // ── Mouse handlers (desktop) ─────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;
    e.preventDefault();
    mouseStartX.current = e.clientX;
    frozenX.current = getComputedX();
    track.style.animation = "none";
    track.style.transform = `translateX(${frozenX.current}px)`;
    setDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const track = trackRef.current;
    if (mouseStartX.current === null || !track) return;
    const dx = e.clientX - mouseStartX.current;
    track.style.transform = `translateX(${frozenX.current + dx}px)`;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    const track = trackRef.current;
    if (!track || mouseStartX.current === null) return;
    const dx = e.clientX - mouseStartX.current;
    const endX = frozenX.current + dx;
    const halfWidth = track.scrollWidth / 2;
    let nx = endX % halfWidth;
    if (nx > 0) nx -= halfWidth;
    const progress = nx / -halfWidth;
    track.style.transform = "";
    applyAnimation(DURATIONS[durationIdxRef.current], progress, pausedRef.current);
    mouseStartX.current = null;
    setDragging(false);
  };

  const onMouseLeave = (e: React.MouseEvent) => {
    if (mouseStartX.current !== null) onMouseUp(e);
  };

  return (
    <section className="bg-white pt-10 pb-6 overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Kiemelt szolgáltatók</h2>
      </div>

      <div
        className={dragging ? "overflow-hidden cursor-grabbing select-none" : "overflow-hidden cursor-grab"}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <div
          ref={trackRef}
          className="carousel-track flex gap-3"
          style={{ width: "max-content" }}
        >
          {doubled.map((provider, i) => (
            <div
              key={`${provider.id}-${i}`}
              className="w-[calc(50vw-20px)] sm:w-[320px] flex-shrink-0"
            >
              <ProviderCard provider={provider} nameFontSize="16px" inCarousel />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 mt-5">
        <button
          type="button"
          onClick={() => durationIdx > 0 && changeSpeed(durationIdx - 1)}
          disabled={durationIdx <= 0}
          aria-label="Gyorsítás"
          className="p-2 rounded-full text-[#84AAA6] disabled:opacity-25 active:bg-[#84AAA6]/10 transition-colors"
        >
          <Rewind className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={handlePlayPause}
          aria-label={paused ? "Lejátszás" : "Megállítás"}
          className="p-2.5 rounded-full bg-[#84AAA6]/10 text-[#84AAA6] active:bg-[#84AAA6]/20 transition-colors"
        >
          {paused
            ? <Play className="h-5 w-5" strokeWidth={1.75} />
            : <Pause className="h-5 w-5" strokeWidth={1.75} />}
        </button>

        <button
          type="button"
          onClick={() => durationIdx < DURATIONS.length - 1 && changeSpeed(durationIdx + 1)}
          disabled={durationIdx >= DURATIONS.length - 1}
          aria-label="Lassítás"
          className="p-2 rounded-full text-[#84AAA6] disabled:opacity-25 active:bg-[#84AAA6]/10 transition-colors"
        >
          <FastForward className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </section>
  );
}
