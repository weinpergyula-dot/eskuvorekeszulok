"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ApproveButton } from "./approve-button";
import { UsersSection } from "./users-section";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";

type Filter = "pending" | "users";

interface Provider {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  description?: string;
  avatar_url?: string;
  pending_changes?: Record<string, unknown> | null;
  [key: string]: unknown;
}

interface Props {
  totalUsers: number;
  totalApproved: number;
  pendingProviders: Provider[];
  pendingChanges: Provider[];
}

export function AdminContent({ totalUsers, totalApproved, pendingProviders, pendingChanges }: Props) {
  // Merge first-submissions + edits into one unified list
  type PendingItem = Provider & { kind: "registration" | "edit" };
  const allPending: PendingItem[] = [
    ...pendingProviders.map((p) => ({ ...p, kind: "registration" as const })),
    ...pendingChanges.map((p) => ({ ...p, kind: "edit" as const })),
  ];
  const totalPending = allPending.length;

  const defaultFilter: Filter = totalPending > 0 ? "pending" : "users";

  const [filter, setFilter] = useState<Filter>(defaultFilter);

  const stats: { label: string; value: number; icon: string; target: Filter; highlight: boolean }[] = [
    { label: "Összes felhasználó",      value: totalUsers,    icon: "👥", target: "users",   highlight: false },
    { label: "Jóváhagyott szolgáltató", value: totalApproved, icon: "✅", target: "users",   highlight: false },
    { label: "Jóváhagyásra vár",        value: totalPending,  icon: "⏳", target: "pending", highlight: totalPending > 0 },
  ];

  return (
    <>
      {/* Stat cards – clickable */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => setFilter(s.target)}
            className={`text-left rounded-lg p-4 border transition-all cursor-pointer ${
              filter === s.target
                ? "border-[#84AAA6] bg-[#84AAA6]/5 ring-1 ring-[#84AAA6]"
                : s.highlight
                ? "border-yellow-300 bg-yellow-50 hover:border-[#84AAA6]"
                : "border-gray-200 bg-white hover:border-[#84AAA6]"
            }`}
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-base text-gray-900 mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Pending (registrations + edits combined) */}
      {filter === "pending" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Jóváhagyásra váró tételek
            {totalPending > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-sm bg-amber-400 text-white rounded-full font-bold">
                {totalPending}
              </span>
            )}
          </h2>
          {totalPending === 0 ? (
            <p className="text-gray-500 text-base">Nincs jóváhagyásra váró tétel.</p>
          ) : (
            <div className="space-y-4">
              {allPending.map((item) => (
                <ProviderRow key={item.id} provider={item} type={item.kind} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Users */}
      {filter === "users" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Felhasználók kezelése</h2>
          <UsersSection />
        </section>
      )}
    </>
  );
}

// ── Field labels for diff display ──────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  full_name:   "Teljes név",
  phone:       "Telefonszám",
  description: "Leírás",
  website:     "Weboldal",
  avatar_url:  "Profilkép",
};

function DiffValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return <span className="text-gray-400 italic">–</span>;
  const str = String(value);
  if (str.startsWith("http") && (str.includes("/avatar") || str.includes("supabase"))) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={str} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 inline-block" />;
  }
  if (str.length > 80) return <span className="text-sm">{str.slice(0, 80)}…</span>;
  return <span className="text-sm">{str}</span>;
}

function EditDiff({ current, proposed }: { current: Provider; proposed: Record<string, unknown> }) {
  const fields = Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[];
  const changed = fields.filter((f) => {
    const oldVal = current[f] ?? null;
    const newVal = proposed[f] ?? null;
    return String(oldVal) !== String(newVal);
  });

  if (changed.length === 0) {
    return <p className="text-sm text-gray-400 mt-2">Nincs szöveges változtatás.</p>;
  }

  return (
    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
      {changed.map((f) => (
        <div key={f} className="grid grid-cols-[auto_1fr] gap-x-3 items-start text-sm">
          <span className="text-gray-500 font-medium whitespace-nowrap pt-0.5">{FIELD_LABELS[f]}:</span>
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="line-through text-red-400 break-all"><DiffValue value={current[f]} /></span>
            <span className="text-gray-400">→</span>
            <span className="text-green-700 font-medium break-all"><DiffValue value={proposed[f]} /></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProviderRow({ provider, type }: { provider: Provider; type: "registration" | "edit" }) {
  const changes = type === "edit" ? (provider.pending_changes as Record<string, unknown>) : null;
  // For new registrations show the provider data; for edits show current live data in header
  const header = provider;
  const cats = (header.categories as ServiceCategory[] | undefined) ?? [];
  const cnts = (header.counties as string[] | undefined) ?? [];
  const categoryLabels = cats.map((c) => CATEGORY_LABELS[c] ?? String(c)).join(", ");

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-4 min-w-0 flex-1">
          {/* Avatar – show proposed if available */}
          <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
            {(changes?.avatar_url ?? header.avatar_url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(changes?.avatar_url ?? header.avatar_url)} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-gray-900">
                {String(header.full_name ?? "?").charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-gray-900">{String(header.full_name ?? "")}</span>
              <Badge variant={type === "edit" ? "default" : "pending"} className="text-base">
                {type === "edit" ? "Módosítás" : "Új regisztráció"}
              </Badge>
            </div>
            <p className="text-base text-gray-900 mb-0.5">{String(header.email ?? "")}</p>
            <p className="text-base text-gray-900 mb-0.5">{String(header.phone ?? "")}</p>
            {categoryLabels && (
              <p className="text-base text-gray-900 mb-0.5">{categoryLabels}</p>
            )}
            {cnts.length > 0 && (
              <p className="text-base text-gray-900 mb-0.5">{cnts.join(", ")}</p>
            )}
            {type === "registration" && header.description ? (
              <p className="text-base text-gray-900 mt-2 line-clamp-2 max-w-md">
                {String(header.description)}
              </p>
            ) : null}

            {/* Diff view for edits */}
            {type === "edit" && changes && (
              <EditDiff current={provider} proposed={changes} />
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <ApproveButton providerId={String(provider.id)} type={type} action="approve" changes={changes} />
          <ApproveButton providerId={String(provider.id)} type={type} action="reject" changes={null} />
        </div>
      </div>
    </div>
  );
}
