"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, Briefcase, LayoutDashboard, Clock, AlertCircle } from "lucide-react";
import { AccountInfoForm, PasswordForm } from "./account-form";
import { ProviderForm } from "./provider-form";
import type { Provider, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type Section = "account" | "password" | "provider";

interface Props {
  userId: string;
  initialName: string;
  email: string;
  role: UserRole;
  provider: Provider | null;
}

const MENU_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "account",  label: "Fiók adatok",      icon: <User className="h-4 w-4" /> },
  { id: "password", label: "Jelszó módosítás", icon: <Lock className="h-4 w-4" /> },
  { id: "provider", label: "Profil adatok",    icon: <Briefcase className="h-4 w-4" /> },
];

const SECTION_TITLES: Record<Section, string> = {
  account:  "Fiók adatok",
  password: "Jelszó módosítás",
  provider: "Profil adatok",
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

type SidebarIndicator =
  | { kind: "dot";   color: string; tooltip: string }
  | { kind: "badge"; count: number; tooltip: string };

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
    return { kind: "dot", color: "bg-red-500",   tooltip: "Elutasítva" };
  if (hasPendingUpdate)
    return { kind: "badge", count: diffCount,     tooltip: `${diffCount} mező jóváhagyásra vár` };
  if (isFirstSubmission && provider.approval_status === "pending")
    return { kind: "dot", color: "bg-amber-400",  tooltip: "Jóváhagyásra vár" };
  if (!isProviderActive)
    return { kind: "dot", color: "bg-gray-400",   tooltip: "Kikapcsolva" };
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row gap-6">

        {/* Sidebar */}
        <aside className="sm:w-52 shrink-0">
          <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
            {MENU_ITEMS.map((item) => (
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
                    {sidebarIndicator.kind === "badge" ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-white text-xs font-bold leading-none">
                        {sidebarIndicator.count}
                      </span>
                    ) : (
                      <span className={`inline-block w-2 h-2 rounded-full ${sidebarIndicator.color}`} />
                    )}
                  </span>
                )}
              </button>
            ))}

            {role === "provider" && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-medium transition-colors text-left whitespace-nowrap text-gray-900 hover:bg-gray-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}
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
              {/* StatusCard – only when provider exists */}
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
        </div>
      </div>
    </div>
  );
}
