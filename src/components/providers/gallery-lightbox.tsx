"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function GalleryLightbox({ urls, alt }: { urls: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setOpen((i) => (i === null ? null : (i - 1 + urls.length) % urls.length));
  const next = () => setOpen((i) => (i === null ? null : (i + 1) % urls.length));

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {urls.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={url}
            alt={`${alt} ${i + 1}`}
            onClick={() => setOpen(i)}
            className="w-full h-40 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
          />
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setOpen(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Close */}
          <button
            onClick={() => setOpen(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <X className="h-7 w-7" />
          </button>

          {/* Prev */}
          {urls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 text-white/80 hover:text-white p-2"
            >
              <ChevronLeft className="h-9 w-9" />
            </button>
          )}

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urls[open]}
            alt={`${alt} ${open + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg select-none"
          />

          {/* Next */}
          {urls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 text-white/80 hover:text-white p-2"
            >
              <ChevronRight className="h-9 w-9" />
            </button>
          )}

          {/* Counter */}
          {urls.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {open + 1} / {urls.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
