"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, Briefcase, LayoutDashboard, Clock, AlertCircle, Eye, Star, BarChart2, ClipboardList, type LucideIcon } from "lucide-react";
import { AccountInfoForm, PasswordForm } from "./account-form";
import { ProviderForm } from "./provider-form";
import { ProviderCard } from "@/components/providers/provider-card";
import type { Provider, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type Section = "account" | "password" | "provider" | "dashboard";

interface Props {
  userId: string;
  initialName: string;
  email: string;
  role: UserRole;
  provider: Provider | null;
}

const MENU_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "account",   label: "Fiók adatok",      icon: <User className="h-4 w-4" /> },
  { id: "password",  label: "Jelszó módosítás", icon: <Lock className="h-4 w-4" /> },
  { id: "provider",  label: "Profil adatok",    icon: <Briefcase className="h-4 w-4" /> },
  { id: "dashboard", label: "Dashboard",        icon: <LayoutDashboard className="h-4 w-4" /> },
];

const SECTION_TITLES: Record<Section, string> = {
  account:   "Fiók adatok",
  password:  "Jelszó módosítás",
  provider:  "Profil adatok",
  dashboard: "Dashboard",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Count fields that genuinely differ between live data and pending_changes. */
function countDiffs(provider: Provider): number {
  const pc = provider.pending_changes;
  if (!pc) return 0;
  const norm = (v: unknown) => String(v ?? "");
  let n = 0;
  if ("full_name"   in pc && norm(pc.full_name)   !== norm(provider.full_name))   n++;
  if ("phone"       in pc && norm(pc.phone)        !== norm(provider.phone))       n++;
  if ("description" in pc && norm(pc.description)  !== norm(provider.description)) n++;
  if ("website"     in pc && norm(pc.website)      !== norm(provider.website))     n++;
  if ("avatar_url"  in pc && norm(pc.avatar_url)   !== norm(provider.avatar_url))  n++;
  return n;
}

type SidebarIndicator = { color: string; tooltip: string };

function deriveSidebarIndicator(
  provider: Provider | null,
  isProviderActive: boolean
): SidebarIndicator | null {
  if (!provider) return null;

  const isFirstSubmission = provider.approval_status !== "approved";
  const diffCount         = countDiffs(provider);
  const hasPendingUpdate  = provider.approval_status === "approved"
                            && !!provider.pending_changes
                            && diffCount > 0;
  const wasUpdateRejected = provider.approval_status === "approved"
                            && !provider.pending_changes
                            && !!provider.rejection_reason;

  if (provider.approval_status === "rejected" || wasUpdateRejected)
    return { color: "bg-red-500",   tooltip: "Elutasítva" };
  if (hasPendingUpdate)
    return { color: "bg-amber-400", tooltip: `${diffCount} mező jóváhagyásra vár` };
  if (isFirstSubmission && provider.approval_status === "pending")
    return { color: "bg-amber-400", tooltip: "Jóváhagyásra vár" };
  if (!isProviderActive)
    return { color: "bg-gray-400",  tooltip: "Kikapcsolva" };
  return null;
}

// ── StatusCard ────────────────────────────────────────────────────────────────

function StatusCard({
  provider,
  isProviderActive,
}: {
  provider: Provider;
  isProviderActive: boolean;
}) {
  const isFirstSubmission = provider.approval_status !== "approved";
  const diffCount         = countDiffs(provider);
  const hasPendingUpdate  = provider.approval_status === "approved"
                            && !!provider.pending_changes
                            && diffCount > 0;
  const wasUpdateRejected = provider.approval_status === "approved"
                            && !provider.pending_changes
                            && !!provider.rejection_reason;

  // ── Row 1: LiveStatusRow ─────────────────────────────────────────────────
  let liveRow: React.ReactNode;

  if (!isProviderActive) {
    liveRow = (
      <div className="flex items-center gap-2.5 text-sm text-gray-600">
        <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
        Nem látszik a listában – kapcsold be a Szolgáltató módot
      </div>
    );
  } else if (isFirstSubmission && provider.approval_status === "rejected") {
    liveRow = (
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 text-sm font-medium text-red-700">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          Elutasítva – profilod nem látható
        </div>
        {provider.rejection_reason && (
          <p className="text-sm text-red-600 pl-4">Indoklás: {provider.rejection_reason}</p>
        )}
      </div>
    );
  } else if (isFirstSubmission) {
    liveRow = (
      <div className="flex items-center gap-2.5 text-sm text-amber-700">
        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
        Még nem látszik – első jóváhagyásra vár
      </div>
    );
  } else {
    liveRow = (
      <div className="flex items-center gap-2.5 text-sm text-green-700">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        Látszik a listában
      </div>
    );
  }

  // ── Row 2: PendingRow (only when relevant) ───────────────────────────────
  let pendingRow: React.ReactNode = null;

  if (isFirstSubmission && provider.approval_status === "pending") {
    pendingRow = (
      <div className="flex items-start gap-2.5 bg-amber-50 border-t border-amber-200 px-4 py-3">
        <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-amber-800">Profil benyújtva, jóváhagyásra vár</p>
          <p className="text-sm text-amber-700">A profil a jóváhagyás után jelenik meg.</p>
        </div>
      </div>
    );
  } else if (hasPendingUpdate) {
    pendingRow = (
      <div className="flex items-start gap-2.5 bg-amber-50 border-t border-amber-200 px-4 py-3">
        <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-amber-800">
            {diffCount} mező módosítása jóváhagyásra vár
          </p>
          <p className="text-sm text-amber-700">Az élő adatok addig változatlanok maradnak.</p>
        </div>
      </div>
    );
  } else if (wasUpdateRejected) {
    pendingRow = (
      <div className="flex items-start gap-2.5 bg-red-50 border-t border-red-200 px-4 py-3">
        <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-red-800">Legutóbbi módosításod elutasítva</p>
          {provider.rejection_reason && (
            <p className="text-sm text-red-700">Indoklás: {provider.rejection_reason}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-white">{liveRow}</div>
      {pendingRow}
    </div>
  );
}

// ── ProfileLayout ─────────────────────────────────────────────────────────────

export function ProfileLayout({ userId, initialName, email, role, provider }: Props) {
  const [active, setActive] = useState<Section>("account");

  const [isProviderActive, setIsProviderActive] = useState(
    provider !== null ? provider.active === true : false
  );

  const sidebarIndicator = deriveSidebarIndicator(provider, isProviderActive);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row gap-6">

        {/* Sidebar */}
        <aside className="sm:w-52 shrink-0">
          {/* Mobile dropdown */}
          <div className="sm:hidden mb-2">
            <select
              value={active}
              onChange={(e) => setActive(e.target.value as Section)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#84AAA6] focus:border-transparent text-center"
            >
              {MENU_ITEMS.filter(item => item.id !== "dashboard" || role === "provider").map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex flex-col gap-1">
            {MENU_ITEMS.filter(item => item.id !== "dashboard" || role === "provider").map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-medium transition-colors text-left whitespace-nowrap cursor-pointer",
                  active === item.id
                    ? "bg-[#84AAA6] text-white"
                    : "text-gray-900 hover:bg-gray-100"
                )}
              >
                {item.icon}
                <span>{item.label}</span>

                {item.id === "provider" && sidebarIndicator && (
                  <span
                    className="ml-auto shrink-0"
                    title={sidebarIndicator.tooltip}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full ${sidebarIndicator.color}`} />
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {SECTION_TITLES[active]}
          </h2>

          {active === "account" && (
            <AccountInfoForm userId={userId} initialName={initialName} email={email} />
          )}

          {active === "password" && <PasswordForm />}

          {active === "provider" && (
            <div className="space-y-5">
              {provider ? (
                <StatusCard provider={provider} isProviderActive={isProviderActive} />
              ) : (
                <p className="text-base text-gray-700">
                  Töltsd ki az adatlapot és aktiváld a szolgáltatói profilodat.
                  Az adminisztrátor jóváhagyása után megjelensz a listában.
                </p>
              )}

              <ProviderForm
                userId={userId}
                role={role}
                provider={provider}
                isProviderActive={isProviderActive}
                onActiveChange={setIsProviderActive}
              />
            </div>
          )}

          {active === "dashboard" && provider && (
            <div className="space-y-6">
              {provider.approval_status === "pending" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800 text-lg">Profil jóváhagyásra vár</p>
                    <p className="text-yellow-700 text-base mt-0.5">Az adminisztrátor hamarosan elbírálja a profilodat.</p>
                  </div>
                </div>
              )}
              {provider.approval_status === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 text-lg">Profil elutasítva</p>
                    <p className="text-red-700 text-base mt-0.5">Az adminisztrátor elutasította a profilodat. Módosítsd és küldd be újra.</p>
                  </div>
                </div>
              )}
              {provider.pending_changes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 text-lg">Módosítás jóváhagyásra vár</p>
                    <p className="text-blue-700 text-base mt-0.5">A legutóbbi módosításaid az adminisztrátor jóváhagyásáig nem jelennek meg.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-3">Előnézet</h3>
                  <ProviderCard provider={provider} showStatus />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-3">Statisztikák</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <DashStatCard label="Megtekintések" value={provider.view_count ?? 0} icon={Eye} />
                    <DashStatCard label="Értékelések" value={provider.review_count ?? 0} icon={Star} />
                    <DashStatCard
                      label="Átlagos értékelés"
                      value={provider.average_rating ? `${Number(provider.average_rating).toFixed(1)}/5` : "–"}
                      icon={BarChart2}
                    />
                    <DashStatCard
                      label="Státusz"
                      value={provider.approval_status === "approved" ? "Aktív" : provider.approval_status === "pending" ? "Függőben" : "Elutasítva"}
                      icon={ClipboardList}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashStatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <Icon className="h-6 w-6 mb-1 text-[#84AAA6]" strokeWidth={1.5} />
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-base text-gray-900 mt-0.5">{label}</div>
    </div>
  );
}
