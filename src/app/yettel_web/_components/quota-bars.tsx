"use client";

import { PhoneCall, Globe, Plane, Tv, MonitorPlay, type LucideIcon } from "lucide-react";
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
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.04em] text-[#2D466C]">
              <r.icon className="h-3.5 w-3.5" /> {r.label}
            </span>
            <span className="text-sm font-extrabold text-[#002340]">{r.value}</span>
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

// Grafikus keret-kijelző TV csomaghoz: teljes csatornaszám / HD csatornaszám.
export function TvQuotas({ offer }: { offer: Offer }) {
  const total = offer.channelsTotal ?? 0;
  const hd = offer.hdChannels ?? 0;

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

  return <QuotaBars rows={rows} />;
}
