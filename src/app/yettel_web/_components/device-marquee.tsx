"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { DEVICES, formatFt } from "../_data/offers";

// Végtelenített, automatikusan görgő készülék-sáv.
// - Egérrel fölé állva megáll, elhúzva újraindul.
// - Mobilon ujjal csúsztatható; elengedés után 2 mp-cel indul újra.
// A görgetés JS-vezérelt (scrollLeft), így a natív érintéses görgetéssel
// együtt is jól működik. A lista többszörözve van a folytonos hurokhoz.
export function DeviceMarquee() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Négy példány: az első fele megegyezik a másodikkal, így a scrollWidth/2
  // pontnál visszaugorva a hurok láthatatlan.
  const items = [...DEVICES, ...DEVICES, ...DEVICES, ...DEVICES];

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    const SPEED = 0.6; // px / frame (~36 px/s @60fps)

    const step = () => {
      if (!pausedRef.current) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          let next = el.scrollLeft + SPEED;
          if (next >= half) next -= half;
          el.scrollLeft = next;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const clearResume = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };
  const scheduleResume = (delay: number) => {
    clearResume();
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, delay);
  };

  return (
    <div className="mx-auto max-w-[1760px] px-4 sm:px-6">
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]">
        <div
          ref={scrollerRef}
          className="scrollbar-none flex w-full gap-5 overflow-x-auto py-1"
          // Egér: fölé állva megáll, elhúzva azonnal indul
          onMouseEnter={() => {
            clearResume();
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
          // Érintés: csúsztatás közben áll, elengedés után 2 mp-cel indul
          onTouchStart={() => {
            clearResume();
            pausedRef.current = true;
          }}
          onTouchEnd={() => scheduleResume(2000)}
          onTouchCancel={() => scheduleResume(2000)}
        >
          {items.map((device, i) => (
            <div
              key={i}
              className="flex w-[300px] shrink-0 flex-col rounded-[20px] border border-[#CDE0EA] bg-white p-5 sm:w-[320px]"
            >
              <div className="mb-4 h-56 overflow-hidden rounded-2xl bg-gradient-to-b from-[#E4F2F7] to-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/yettel/${device.img}`}
                  alt={device.name}
                  className="pointer-events-none h-full w-full object-contain"
                  draggable={false}
                />
              </div>
              <h3 className="text-xl font-extrabold text-[#002340]">{device.name}</h3>

              {/* Árak: teljes ár + havidíjas konstrukció */}
              <div className="mt-3 flex items-stretch gap-2">
                <div className="flex-1 rounded-xl border border-[#CDE0EA] bg-white px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#7E93B0]">Teljes ár</p>
                  <p className="text-lg font-extrabold tracking-tight text-[#002340]">{formatFt(device.fullPrice)}</p>
                </div>
                <div className="flex-1 rounded-xl border border-[#B4FF00] bg-[#B4FF00]/12 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#2D466C]">Havidíjas</p>
                  <p className="text-lg font-extrabold tracking-tight text-[#002340]">
                    {formatFt(device.monthly)}
                    <span className="text-xs font-semibold text-[#2D466C]"> / hó</span>
                  </p>
                </div>
              </div>
              <p className="mt-1.5 text-xs font-semibold text-[#2D466C]">{device.upfront}</p>

              {/* CTA-k */}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#002340] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#001D36]"
                >
                  Mobil szolgáltatással <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#CDE0EA] px-4 py-2.5 text-sm font-bold text-[#002340] transition-colors hover:border-[#002340] hover:bg-[#E4F2F7]"
                >
                  Csak készülék
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
