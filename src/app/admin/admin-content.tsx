"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ApproveButton } from "./approve-button";
import { UsersSection } from "./users-section";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";

type Filter = "pending" | "edits" | "users";

interface Provider {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  county?: string;
  category?: string;
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
  const pendingCount = pendingProviders.length;
  const editsCount = pendingChanges.length;

  const defaultFilter: Filter =
    pendingCount > 0 ? "pending" : editsCount > 0 ? "edits" : "users";

  const [filter, setFilter] = useState<Filter>(defaultFilter);

  const stats: { label: string; value: number; icon: string; target: Filter; highlight: boolean }[] = [
    { label: "Összes felhasználó",         value: totalUsers,    icon: "👥", target: "users",   highlight: false },
    { label: "Jóváhagyott szolgáltató",    value: totalApproved, icon: "✅", target: "users",   highlight: false },
    { label: "Jóváhagyásra vár",           value: pendingCount,  icon: "⏳", target: "pending", highlight: pendingCount > 0 },
    { label: "Módosítás jóváhagyásra vár", value: editsCount,    icon: "🔄", target: "edits",   highlight: editsCount > 0 },
  ];

  return (
    <>
      {/* Stat cards – clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => setFilter(s.target)}
            className={`text-left rounded-lg p-4 border transition-all cursor-pointer ${
              filter === s.target
                ? "border-[#2a9d8f] bg-[#2a9d8f]/5 ring-1 ring-[#2a9d8f]"
                : s.highlight
                ? "border-yellow-300 bg-yellow-50 hover:border-[#2a9d8f]"
                : "border-gray-200 bg-white hover:border-[#2a9d8f]"
            }`}
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-base text-gray-900 mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Pending registrations */}
      {filter === "pending" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Új regisztrációk jóváhagyása
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-base bg-yellow-400 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </h2>
          {pendingCount === 0 ? (
            <p className="text-gray-900 text-lg">Nincs jóváhagyásra váró regisztráció.</p>
          ) : (
            <div className="space-y-4">
              {pendingProviders.map((provider) => (
                <ProviderRow key={provider.id} provider={provider} type="registration" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pending edits */}
      {filter === "edits" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Profil módosítások jóváhagyása
            {editsCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-base bg-blue-400 text-white rounded-full">
                {editsCount}
              </span>
            )}
          </h2>
          {editsCount === 0 ? (
            <p className="text-gray-900 text-lg">Nincs jóváhagyásra váró módosítás.</p>
          ) : (
            <div className="space-y-4">
              {pendingChanges.map((provider) => (
                <ProviderRow key={provider.id} provider={provider} type="edit" />
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

function ProviderRow({ provider, type }: { provider: Provider; type: "registration" | "edit" }) {
  const changes = type === "edit" ? (provider.pending_changes as Record<string, unknown>) : null;
  const displayData = changes ?? provider;
  const cats = (displayData.categories as ServiceCategory[] | undefined) ?? [];
  const cnts = (displayData.counties as string[] | undefined) ?? [];
  const categoryLabels = cats
    .map((c) => CATEGORY_LABELS[c] ?? String(c))
    .join(", ");

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
            {displayData.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayData.avatar_url as string} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-gray-900">
                {String(displayData.full_name ?? "?").charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-gray-900">{String(displayData.full_name ?? "")}</span>
              <Badge variant={type === "edit" ? "default" : "pending"} className="text-base">
                {type === "edit" ? "Módosítás" : "Új regisztráció"}
              </Badge>
            </div>
            <p className="text-base text-gray-900 mb-0.5">{String(displayData.email ?? "")}</p>
            <p className="text-base text-gray-900 mb-0.5">{String(displayData.phone ?? "")}</p>
            {categoryLabels && (
              <p className="text-base text-gray-900 mb-0.5">{categoryLabels}</p>
            )}
            {cnts.length > 0 && (
              <p className="text-base text-gray-900 mb-0.5">{cnts.join(", ")}</p>
            )}
            {displayData.description ? (
              <p className="text-base text-gray-900 mt-2 line-clamp-2 max-w-md">
                {String(displayData.description)}
              </p>
            ) : null}
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
