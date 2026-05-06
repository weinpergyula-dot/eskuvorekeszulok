"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User, Lock, Briefcase, LayoutDashboard, Clock, AlertCircle, Eye, Star, BarChart2, ClipboardList, Heart, MessageSquare, FileText, ChevronDown, LogOut, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AccountInfoForm, PasswordForm } from "./account-form";
import { ProviderForm } from "./provider-form";
import { ProviderCard } from "@/components/providers/provider-card";
import { MessagesSection } from "./messages-section";
import { QuoteRequestsSection } from "./quote-requests-section";
import type { Provider, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type Section = "account" | "password" | "provider" | "dashboard" | "favorites" | "quotes" | "messages";

interface Props {
  userId: string;
  initialName: string;
  email: string;
  role: UserRole;
  provider: Provider | null;
  initialFavoriteProviders: Provider[];
}

const MENU_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "account",   label: "Fiók adatok",          icon: <User className="h-4 w-4" /> },
  { id: "password",  label: "Jelszó módosítás", icon: <Lock className="h-4 w-4" /> },
  { id: "provider",  label: "Szolgáltatói profil", icon: <Briefcase className="h-4 w-4" /> },
  { id: "dashboard", label: "Dashboard",        icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "favorites", label: "Kedvencek",        icon: <Heart className="h-4 w-4" /> },
  { id: "quotes",    label: "Ajánlatkérések",   icon: <FileText className="h-4 w-4" /> },
  { id: "messages",  label: "Üzenetek",         icon: <MessageSquare className="h-4 w-4" /> },
];

const SECTION_TITLES: Record<Section, string> = {
  account:   "Fiók adatok",
  password:  "Jelszó módosítás",
  provider:  "Szolgáltatói profil",
  dashboard: "Dashboard",
  favorites: "Kedvencek",
  quotes:    "Ajánlatkérések",
  messages:  "Üzenetek",
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
    return { color: "bg-[#F06C6C]", tooltip: "Elutasítva" };
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
        <div className="flex items-center gap-2.5 text-sm font-medium text-[#F06C6C]">
          <span className="w-2 h-2 rounded-full bg-[#F06C6C] shrink-0" />
          Elutasítva – profilod nem látható
        </div>
        {provider.rejection_reason && (
          <p className="text-sm text-[#F06C6C] pl-4">Indoklás: {provider.rejection_reason}</p>
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
      <div className="flex items-start gap-2.5 bg-[#F06C6C]/10 border-t border-[#F06C6C]/30 px-4 py-3">
        <AlertCircle className="h-4 w-4 text-[#F06C6C] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-[#F06C6C]">Legutóbbi módosításod elutasítva</p>
          {provider.rejection_reason && (
            <p className="text-sm text-[#F06C6C]">Indoklás: {provider.rejection_reason}</p>
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

// ── MobileMenuDropdown ────────────────────────────────────────────────────────

function MobileMenuDropdown({
  items,
  active,
  onSelect,
  unreadCount,
  unreadQuotesCount,
  sidebarIndicator,
}: {
  items: { id: Section; label: string; icon: React.ReactNode }[];
  active: Section;
  onSelect: (s: Section) => void;
  unreadCount: number;
  unreadQuotesCount: number;
  sidebarIndicator: SidebarIndicator | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeItem = items.find((i) => i.id === active) ?? items[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="sm:hidden relative mb-4 z-20">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-base font-semibold text-gray-900 shadow-sm cursor-pointer"
      >
        <span className="flex items-center gap-2.5">
          {activeItem.icon}
          <span>{activeItem.label}</span>
        </span>
        <span className="flex items-center gap-2">
          {active === "messages" && unreadCount > 0 && (
            <span className="min-w-[20px] h-5 px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {active === "quotes" && unreadQuotesCount > 0 && (
            <span className="min-w-[20px] h-5 px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadQuotesCount > 9 ? "9+" : unreadQuotesCount}
            </span>
          )}
          {active === "provider" && sidebarIndicator && (
            <span className={`w-2.5 h-2.5 rounded-full ${sidebarIndicator.color}`} />
          )}
          <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", open && "rotate-180")} />
        </span>
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-4 py-3 text-base font-medium transition-colors cursor-pointer",
                item.id === active
                  ? "bg-[#84AAA6]/10 text-[#84AAA6] font-semibold"
                  : "text-gray-900 hover:bg-gray-50"
              )}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </span>
              {item.id === "messages" && unreadCount > 0 && (
                <span className="min-w-[20px] h-5 px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {item.id === "quotes" && unreadQuotesCount > 0 && (
                <span className="min-w-[20px] h-5 px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {unreadQuotesCount > 9 ? "9+" : unreadQuotesCount}
                </span>
              )}
              {item.id === "provider" && sidebarIndicator && (
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${sidebarIndicator.color}`} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ProfileLayout ─────────────────────────────────────────────────────────────

const VALID_SECTIONS: Section[] = ["account", "password", "provider", "dashboard", "favorites", "quotes", "messages"];

function hashToSection(hash: string): Section | null {
  const s = hash.replace("#", "") as Section;
  return VALID_SECTIONS.includes(s) ? s : null;
}

export function ProfileLayout({ userId, initialName, email, role, provider, initialFavoriteProviders }: Props) {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<Section>("account");
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadQuotes, setUnreadQuotes] = useState(0);

  useEffect(() => {
    const tab = searchParams.get("tab") as Section | null;
    if (tab && VALID_SECTIONS.includes(tab)) {
      setActive(tab);
      return;
    }
    const s = hashToSection(window.location.hash);
    if (s) setActive(s);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data: { read: boolean; is_own: boolean }[]) =>
        setUnreadCount(data.filter((m) => !m.read && !m.is_own).length)
      )
      .catch(() => {});
    fetch("/api/quote-requests")
      .then((r) => r.json())
      .then((data: { read?: boolean; unread_reply_count?: number }[]) => {
        const unread = data.reduce((s, r) => {
          return s + ("read" in r ? (r.read ? 0 : 1) : 0) + (r.unread_reply_count ?? 0);
        }, 0);
        setUnreadQuotes(unread);
      })
      .catch(() => {});
  }, []);

  const [favoriteProviders, setFavoriteProviders] = useState<Provider[]>(initialFavoriteProviders);

  const [isProviderActive, setIsProviderActive] = useState(
    provider !== null ? provider.active !== false : false
  );

  const sidebarIndicator = deriveSidebarIndicator(provider, isProviderActive);

  const switchTo = (section: Section) => {
    setActive(section);
    window.location.hash = section;
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  };

  useEffect(() => {
    const onHashChange = () => {
      const s = hashToSection(window.location.hash);
      if (s) setActive(s);
    };
    const onProfileSection = (e: Event) => {
      const section = (e as CustomEvent).detail as Section;
      if (VALID_SECTIONS.includes(section)) setActive(section);
    };
    const onQuotesRead = () => {
      fetch("/api/quote-requests")
        .then((r) => r.json())
        .then((data: { read?: boolean; unread_reply_count?: number }[]) => {
          const unread = data.reduce((s, r) => {
            return s + ("read" in r ? (r.read ? 0 : 1) : 0) + (r.unread_reply_count ?? 0);
          }, 0);
          setUnreadQuotes(unread);
        })
        .catch(() => {});
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("profile-section", onProfileSection);
    window.addEventListener("quotes-read", onQuotesRead);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("profile-section", onProfileSection);
      window.removeEventListener("quotes-read", onQuotesRead);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-0">

        {/* Sidebar */}
        <aside className="sm:w-56 shrink-0 sm:border-r sm:border-gray-200 sm:pr-6">
          {/* Mobile custom dropdown */}
          <MobileMenuDropdown
            items={MENU_ITEMS.filter(item => item.id !== "dashboard" || role === "provider")}
            active={active}
            onSelect={switchTo}
            unreadCount={unreadCount}
            unreadQuotesCount={unreadQuotes}
            sidebarIndicator={sidebarIndicator}
          />

          {/* Desktop nav */}
          <nav className="hidden sm:flex flex-col gap-1">
            {MENU_ITEMS.filter(item => item.id !== "dashboard" || role === "provider").map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => { e.preventDefault(); switchTo(item.id); }}
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
                  <span className="ml-auto shrink-0" title={sidebarIndicator.tooltip}>
                    <span className={`inline-block w-2 h-2 rounded-full ${sidebarIndicator.color}`} />
                  </span>
                )}
                {item.id === "quotes" && unreadQuotes > 0 && (
                  <span className="ml-auto shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#F06C6C] text-white text-xs font-bold leading-none">
                    {unreadQuotes > 9 ? "9+" : unreadQuotes}
                  </span>
                )}
                {item.id === "messages" && unreadCount > 0 && (
                  <span className="ml-auto shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#F06C6C] text-white text-xs font-bold leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-medium text-[#F06C6C] hover:bg-[#F06C6C]/10 transition-colors w-full text-left cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Kijelentkezés</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 sm:pl-8">
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

          {active === "favorites" && (
            <div>
              {favoriteProviders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Heart className="h-10 w-10 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-base">Még nem mentettél el egyetlen szolgáltatót sem.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {favoriteProviders.map((p) => (
                    <ProviderCard
                      key={p.id}
                      provider={p}
                      initialLiked
                      onUnlike={(id) => setFavoriteProviders((prev) => prev.filter((fp) => fp.id !== id))}
                    />
                  ))}
                </div>
              )}
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
                <div className="bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#F06C6C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#F06C6C] text-lg">Profil elutasítva</p>
                    <p className="text-[#F06C6C] text-base mt-0.5">Az adminisztrátor elutasította a profilodat. Módosítsd és küldd be újra.</p>
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
          )}

          {active === "quotes" && (
            <QuoteRequestsSection role={role} userId={userId} onUnreadChange={setUnreadQuotes} />
          )}

          {active === "messages" && (
            <MessagesSection onUnreadChange={setUnreadCount} />
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
