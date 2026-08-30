"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * PREMIUM extra: a dátum három mezőben (év / hónap / nap) van elrejtve egy
 * sorsjegyszerű bevonat alatt – a látogatónak le kell satíroznia, hogy
 * kiderüljön. A meghívó csak akkor nyílik meg, ha mindhárom mező előbukkant.
 *
 * A bevonat egy canvas: a húzás nyomvonalát `destination-out` rajzolással
 * radírozzuk ki, és a kitakart pixelek arányából derül ki, mikor van kész a
 * mező. Egérrel és érintéssel egyaránt működik (pointer események).
 */

export type ScratchItem = { label: string; value: string };

/** Ennyi kikapart felület fölött magától felfedi a maradékot is. */
const DONE_RATIO = 0.48;

function ScratchPanel({
  item,
  revealed,
  onReveal,
}: {
  item: ScratchItem;
  revealed: boolean;
  onReveal: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);

  // A bevonat felfestése – egyszer, a méret ismeretében.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = wrap.getBoundingClientRect();
    if (!width || !height) return;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#DCC0D2");
    grad.addColorStop(0.35, "#9E7692");
    grad.addColorStop(0.62, "#CDA9C0");
    grad.addColorStop(1, "#7C5873");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Apró csillanások, hogy fémes ezüstkaparás-hatása legyen
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.16})`;
      ctx.fillRect(x, y, 1 + Math.random() * 1.6, 1 + Math.random() * 1.6);
    }

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
  }, []);

  /** Mennyi tűnt már el a bevonatból? */
  const checkProgress = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total++;
      if (data[i] < 40) clear++;
    }
    if (total > 0 && clear / total > DONE_RATIO) onReveal();
  }, [onReveal]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    const ctx = ctxRef.current;
    if (ctx && last.current) {
      // Egy koppintás is hagyjon nyomot
      ctx.beginPath();
      ctx.arc(last.current.x, last.current.y, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || revealed) return;
    const ctx = ctxRef.current;
    const p = point(e);
    if (!ctx || !last.current) return;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (++moves.current % 6 === 0) checkProgress();
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    checkProgress();
  };

  return (
    <div className="flex-1">
      <div
        ref={wrapRef}
        className={`prm-scratch ${revealed ? "is-revealed" : ""}`}
        aria-live="polite"
      >
        <span className="prm-scratch-value">{item.value}</span>
        <canvas
          ref={canvasRef}
          className="prm-scratch-cover"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onPointerCancel={onUp}
          aria-hidden
        />
      </div>
      <p className="prm-scratch-label">{item.label}</p>
    </div>
  );
}

export function ScratchDate({
  items,
  onComplete,
}: {
  items: ScratchItem[];
  onComplete: () => void;
}) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  const allDone = done.every(Boolean);
  const notified = useRef(false);

  const reveal = useCallback((i: number) => {
    setDone((prev) => (prev[i] ? prev : prev.map((v, j) => (j === i ? true : v))));
  }, []);

  useEffect(() => {
    if (!allDone || notified.current) return;
    notified.current = true;
    onComplete();
  }, [allDone, onComplete]);

  return (
    <div>
      <p className="prm-scratch-hint">
        {allDone ? "Ott találkozunk!" : "Kaparj le mindhárom mezőt!"}
      </p>

      <div className="mt-2 flex gap-2">
        {items.map((it, i) => (
          <ScratchPanel key={it.label} item={it} revealed={done[i]} onReveal={() => reveal(i)} />
        ))}
      </div>

      {!allDone && (
        <button
          type="button"
          onClick={() => setDone(items.map(() => true))}
          className="prm-scratch-skip"
        >
          Nem megy? Mutasd meg
        </button>
      )}
    </div>
  );
}
