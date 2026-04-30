"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, Briefcase, LayoutDashboard } from "lucide-react";
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

export function ProfileLayout({ userId, initialName, email, role, provider }: Props) {
  const [active, setActive] = useState<Section>("account");

  // Lifted from ProviderForm so status badge + sidebar dot update immediately on toggle
  const [isProviderActive, setIsProviderActive] = useState(
    provider !== null ? provider.active === true : false
  );

  const dot = (() => {
    if (!provider) return null;
    if (!isProviderActive) return "bg-gray-400";
    if (provider.approval_status === "approved") return "bg-green-500";
    if (provider.approval_status === "rejected") return "bg-red-500";
    return "bg-yellow-400";
  })();

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
                {item.id === "provider" && dot && (
                  <span className={`ml-auto w-2 h-2 rounded-full shrink-0 ${dot}`} />
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
              {/* Status indicator */}
              {provider ? (
                <div className="space-y-2">
                  {!isProviderActive ? (
                    <div className="flex items-center gap-2 text-base font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
                      Kikapcsolva – profilod nem látható a listában
                    </div>
                  ) : provider.approval_status === "approved" ? (
                    <div className="flex items-center gap-2 text-base font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      Aktív – profilod látható a listában
                    </div>
                  ) : provider.approval_status === "rejected" ? (
                    <div className="text-base font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        Elutasítva – profilod nem látható
                      </div>
                      {provider.rejection_reason && (
                        <p className="text-base font-normal pl-4">Indoklás: {provider.rejection_reason}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-base font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                      Jóváhagyásra vár – profilod egyelőre nem látható
                    </div>
                  )}
                  {provider.pending_changes && (
                    <div className="flex items-center gap-2 text-base text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      Módosítás jóváhagyásra vár – addig az előző adatok látszódnak
                    </div>
                  )}
                  {!provider.pending_changes && provider.approval_status === "approved" && provider.rejection_reason && (
                    <div className="text-base text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        Legutóbbi módosításod elutasítva
                      </div>
                      <p className="text-base font-normal pl-4">Indoklás: {provider.rejection_reason}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-base text-gray-900">
                  Töltsd ki az adatlapot és aktiváld a szolgáltatói profilodat. Az adminisztrátor jóváhagyása után megjelensz a listában.
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
