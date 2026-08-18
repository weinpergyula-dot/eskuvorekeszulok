"use client";

import { PhoneCall, Globe, Plane, Tv, MonitorPlay, PlayCircle, type LucideIcon } from "lucide-react";
import { type Offer } from "../_data/offers";

// Egy sávdiagramos keret-sor (ikon + felirat + érték + arányos sáv).
type QuotaRow = {
  icon: LucideIcon;
  label: string;
  value: string;
  pct: number;
};

function QuotaBars({ rows }: { rows: QuotaRow[] }) {
  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.04em] text-[#2D466C] sm:text-xs">
              <r.icon className="h-3.5 w-3.5" /> {r.label}
            </span>
            <span className="text-xs font-extrabold text-[#002340] sm:text-sm">{r.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E4F2F7]">
            <div className="h-full rounded-full bg-[#B4FF00]" style={{ width: `${Math.round(r.pct * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Grafikus keret-kijelző mobil tarifához: Hívás / Net / Roaming.
export function MobileQuotas({ offer }: { offer: Offer }) {
  const callUnlimited = !!offer.unlimitedCall;
  const dataUnlimited = !!offer.unlimitedNet;
  const callNum = parseInt(offer.voiceLabel ?? "", 10);
  const dataNum = parseInt(offer.dataLabel ?? "", 10);
  const roam = offer.roamingGb ?? 0;

  const rows: QuotaRow[] = [
    {
      icon: PhoneCall,
      label: "Hívás",
      value: callUnlimited ? "Korlátlan" : `${callNum} perc`,
      pct: callUnlimited ? 1 : Math.min(callNum / 300, 1),
    },
    {
      icon: Globe,
      label: "Net",
      value: dataUnlimited ? "Korlátlan" : `${dataNum} GB`,
      pct: dataUnlimited ? 1 : Math.min(dataNum / 100, 1),
    },
    {
      icon: Plane,
      label: "Roaming",
      value: `${roam} GB`,
      pct: Math.min(roam / 120, 1),
    },
  ];

  return <QuotaBars rows={rows} />;
}

// Grafikus keret-kijelző TV csomaghoz: teljes csatornaszám / HD csatornaszám,
// alatta az elérhető streaming szolgáltatások.
export function TvQuotas({ offer }: { offer: Offer }) {
  const total = offer.channelsTotal ?? 0;
  const hd = offer.hdChannels ?? 0;
  const streaming = offer.streaming ?? [];

  const rows: QuotaRow[] = [
    {
      icon: Tv,
      label: "Csatorna",
      value: offer.channelsLabel ? `${offer.channelsLabel} db` : `${total} db`,
      pct: Math.min(total / 120, 1),
    },
    {
      icon: MonitorPlay,
      label: "HD csatorna",
      value: `${hd} db`,
      pct: Math.min(hd / 60, 1),
    },
  ];

  return (
    <div className="space-y-4">
      <QuotaBars rows={rows} />
      {streaming.length > 0 && (
        <div>
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.04em] text-[#2D466C] sm:text-xs">
            <PlayCircle className="h-3.5 w-3.5" /> Streaming
          </p>
          <div className="flex flex-wrap gap-1.5">
            {streaming.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full border border-[#CDE0EA] bg-[#E4F2F7] px-2.5 py-1 text-[0.625rem] font-bold text-[#002340] sm:text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
