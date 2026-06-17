"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User as UserIcon, Lock, Briefcase, LayoutDashboard, Heart, MessageCircle, FileText, ShieldCheck, LogOut, Bell, Settings, Link2, LayoutGrid, CircleUser, Check } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { OnboardingTour } from "@/components/onboarding-tour";

const mainCategories = [
  "fotosok-videosok",
  "elo-zene-dj",
  "vofely",
  "torta-sutemeny",
  "menyasszonyi-ruha",
  "smink",
  "fodrasz-borbely",
  "helyszin",
] as const;


function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[12px] font-bold flex items-center justify-center leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadQuotes, setUnreadQuotes] = useState(0);
  const [providerDot, setProviderDot] = useState<"amber" | "red" | "green" | "gray" | null>(null);
  const [hasProvider, setHasProvider] = useState(false);
  const [providerIsActive, setProviderIsActive] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navCategoryCounts, setNavCategoryCounts] = useState<Record<string, number>>({});
  const [navAvatarUrl, setNavAvatarUrl] = useState<string | null>(null);
  const categoryCountsFetched = useRef(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const desktopCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tourDropdownLockedRef = useRef(false);

  const openServices = () => {
    setServicesOpen(true);
    if (!categoryCountsFetched.current) {
      categoryCountsFetched.current = true;
      fetch("/api/providers/category-counts")
        .then(r => r.json()).then(setNavCategoryCounts).catch(() => {});
    }
  };

  // Tour: open/close the mobile user-dropdown and prevent outside-click from closing it
  useEffect(() => {
    const openDropdown = () => { setUserDropdownOpen(true); tourDropdownLockedRef.current = true; };
    const closeDropdown = () => { setUserDropdownOpen(false); tourDropdownLockedRef.current = false; };
    window.addEventListener("tour-open-mobile-dropdown", openDropdown);
    window.addEventListener("tour-close-mobile-dropdown", closeDropdown);
    return () => {
      window.removeEventListener("tour-open-mobile-dropdown", openDropdown);
      window.removeEventListener("tour-close-mobile-dropdown", closeDropdown);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!tourDropdownLockedRef.current && userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node))
        setUserDropdownOpen(false);
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target as Node))
        setDesktopDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Single source of realtime truth — navbar owns all Supabase subscriptions
  // and broadcasts results via window events so other components don't need
  // their own subscriptions (avoids hitting Supabase channel limits).
  useEffect(() => {
    if (!supabase || !user) return;

    const broadcastMessages = (payload?: { new?: Record<string, unknown> }) => {
      // Dispatch raw payload so chat views can show the new message immediately
      if (payload?.new) {
        window.dispatchEvent(new CustomEvent("message-inserted", { detail: payload.new }));
      }
      fetch("/api/messages/unread-count")
        .then((r) => r.json())
        .then(({ count }: { count: number }) => {
          setUnreadMessages(count);
          window.dispatchEvent(new CustomEvent("messages-unread-count", { detail: count }));
        })
        .catch(() => {});
    };

    const broadcastQuotes = (payload?: { new?: Record<string, unknown> }) => {
      // Dispatch raw payload so quote chat views can show the new message immediately
      if (payload?.new) {
        window.dispatchEvent(new CustomEvent("quote-message-inserted", { detail: payload.new }));
      }
      fetch("/api/quote-requests/unread-count")
        .then((r) => r.json())
        .then(({ count }: { count: number }) => {
          setUnreadQuotes(count);
          window.dispatchEvent(new CustomEvent("quotes-unread-count", { detail: count }));
          // Trigger chat-section to reload its full conversation list
          window.dispatchEvent(new CustomEvent("quotes-unread-count-refresh"));
        })
        .catch(() => {});
    };

    const channel = supabase
      .channel(`navbar-realtime-${user.id}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        broadcastMessages
      )
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "quote_messages" },
        broadcastQuotes
      )
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "quote_request_recipients", filter: `provider_user_id=eq.${user.id}` },
        broadcastQuotes
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (!supabase || !user) { setProfile(null); setProviderDot(null); setHasProvider(false); setUnreadMessages(0); setNavAvatarUrl(null); return; }
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => {
        setProfile(data);
        if (data?.avatar_url) setNavAvatarUrl(data.avatar_url);
      });
    supabase.from("providers").select("approval_status, pending_changes, active, avatar_url").eq("user_id", user.id).maybeSingle()
      .then(({ data: p }) => {
        if (!p) { setProviderDot(null); setHasProvider(false); setProviderIsActive(true); return; }
        setHasProvider(true);
        setProviderIsActive(p.active !== false);
        if (p.avatar_url) setNavAvatarUrl(p.avatar_url as string);
        if (p.approval_status === "rejected") { setProviderDot("red"); return; }
        if (p.approval_status === "pending" || !!p.pending_changes) { setProviderDot("amber"); return; }
        if (p.approval_status === "approved") {
          setProviderDot(p.active !== false ? "green" : "gray");
          return;
        }
        setProviderDot(null);
      });
    fetch("/api/messages/unread-count").then((r) => r.json())
      .then(({ count }: { count: number }) => {
        setUnreadMessages(count);
        window.dispatchEvent(new CustomEvent("messages-unread-count", { detail: count }));
      })
      .catch(() => {});
    fetch("/api/quote-requests/unread-count").then((r) => r.json())
      .then(({ count }: { count: number }) => {
        setUnreadQuotes(count);
        window.dispatchEvent(new CustomEvent("quotes-unread-count", { detail: count }));
      })
      .catch(() => {});
  }, [user]);

  const refreshAdminCount = (sb: typeof supabase) => {
    if (!sb) return;
    Promise.all([
      sb.from("providers").select("user_id").eq("approval_status", "pending"),
      sb.from("providers").select("*", { count: "exact", head: true }).not("pending_changes", "is", null),
      sb.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false),
      fetch("/api/admin/pre-registrations").then((r) => r.json()).catch(() => []),
    ]).then(([{ data: pendingProviders }, { count: edits }, { count: contactUnread }, preRegs]) => {
      // Kizárjuk azokat a pending providereket akiknek még nincs megerősített emailcíme
      // (ők már szerepelnek a preRegs-ben, ne legyenek duplán számolva)
      const preRegUserIds = new Set((Array.isArray(preRegs) ? preRegs : []).map((p: { id: string }) => p.id));
      const confirmedPending = (pendingProviders ?? []).filter((p: { user_id: string }) => !preRegUserIds.has(p.user_id)).length;
      setPendingCount(confirmedPending + (edits ?? 0) + (contactUnread ?? 0) + (Array.isArray(preRegs) ? preRegs.length : 0));
    });
  };

  useEffect(() => {
    if (!supabase || profile?.role !== "admin") { setPendingCount(0); return; }
    refreshAdminCount(supabase);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    const onMessagesRead = () => {
      fetch("/api/messages/unread-count").then((r) => r.json())
        .then(({ count }: { count: number }) => {
          setUnreadMessages(count);
          window.dispatchEvent(new CustomEvent("messages-unread-count", { detail: count }));
        })
        .catch(() => {});
    };
    const onApprovalSeen = () => setProviderDot(null);
    const onActiveChanged = (e: Event) => {
      const active = (e as CustomEvent<boolean>).detail;
      setProviderDot(active ? "green" : "gray");
    };
    window.addEventListener("messages-read", onMessagesRead);
    window.addEventListener("provider-approval-seen", onApprovalSeen);
    window.addEventListener("provider-active-changed", onActiveChanged);
    return () => {
      window.removeEventListener("messages-read", onMessagesRead);
      window.removeEventListener("provider-approval-seen", onApprovalSeen);
      window.removeEventListener("provider-active-changed", onActiveChanged);
    };
  }, []);

  useEffect(() => {
    if (!supabase || profile?.role !== "admin") return;
    const refresh = () => refreshAdminCount(supabase);
    window.addEventListener("admin-pending-changed", refresh);
    window.addEventListener("contact-message-read", refresh);
    return () => {
      window.removeEventListener("admin-pending-changed", refresh);
      window.removeEventListener("contact-message-read", refresh);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // ── Shared dropdown data ─────────────────────────────────────────────────────
  const badgeCount = unreadMessages + pendingCount + unreadQuotes;
  const showDot = badgeCount === 0 && !!providerDot;

  const navTo = (section: string, closeAll: () => void) => {
    closeAll();
    if (section === "admin") {
      window.dispatchEvent(new CustomEvent("nav-start"));
      router.push("/admin");
      return;
    }
    if (pathname === "/profil") {
      window.dispatchEvent(new CustomEvent("profile-section", { detail: section }));
    } else {
      window.dispatchEvent(new CustomEvent("nav-start"));
      router.push(`/profil?tab=${section}`);
    }
  };

  const ACCOUNT_SETTINGS_ITEMS = [
    { id: "account",         label: "Fiók adatok",       Icon: UserIcon },
    { id: "password",        label: "Jelszó módosítás",  Icon: Lock },
    { id: "linked-accounts", label: "Kapcsolt fiókok",   Icon: Link2 },
    { id: "notifications",   label: "Értesítések",       Icon: Bell },
  ];

  const providerItems: { id: string; label: string; Icon: React.ElementType }[] = [
    ...(hasProvider ? [
      { id: "provider", label: "Szolgáltatói profil", Icon: Briefcase },
    ] : []),
    ...(hasProvider ? [
      { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    ] : []),
    ...(!hasProvider ? [
      { id: "favorites", label: "Kedvencek", Icon: Heart },
    ] : []),
    { id: "chat",      label: "Chat",      Icon: MessageCircle },
  ];

  // ── Shared dropdown panel renderer ──────────────────────────────────────────
  const DropdownPanel = ({ closeAll }: { closeAll: () => void }) => (
    <div data-tour="dropdown-panel" className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
      {/* Ajánlatkérés – highlighted at top */}
      <div className="border-b border-gray-100 mb-1 pb-1">
        <button
          data-tour="dropdown-quotes"
          onClick={() => navTo("quotes", closeAll)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-base text-[#84AAA6] font-semibold hover:bg-[#84AAA6]/10 text-left"
        >
          <FileText className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span className="flex-1">Ajánlatkérés</span>
        </button>
      </div>

      {/* Admin */}
      {profile?.role === "admin" && (
        <button
          onClick={() => navTo("admin", closeAll)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6] text-left"
        >
          <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span className="flex-1">Admin</span>
          {pendingCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </button>
      )}

      {/* Fiók beállítások group */}
      <button
        onClick={() => setAccountSettingsOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6] text-left"
      >
        <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span className="flex-1">Fiók beállítások</span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${accountSettingsOpen ? "rotate-180" : ""}`} />
      </button>
      {accountSettingsOpen && (
        <div className="border-l-2 border-[#84AAA6]/30 ml-5 mb-1">
          {ACCOUNT_SETTINGS_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => navTo(id, closeAll)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6] text-left"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Szolgáltatói profil, Kedvencek, Chat */}
      {providerItems.map(({ id, label, Icon }) => (
        <button
          key={id}
          data-tour={`dropdown-${id}`}
          onClick={() => navTo(id, closeAll)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6] text-left"
        >
          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span className="flex-1">{label}</span>
          {id === "chat" && (unreadMessages + unreadQuotes) > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center">
              {(unreadMessages + unreadQuotes) > 99 ? "99+" : (unreadMessages + unreadQuotes)}
            </span>
          )}
          {id === "provider" && providerDot && (
            <span className={`w-2.5 h-2.5 rounded-full ${
              providerDot === "red" ? "bg-[#F06C6C]" :
              providerDot === "green" ? "bg-green-500" :
              providerDot === "gray" ? "bg-gray-400" :
              "bg-amber-400"
            }`} />
          )}
        </button>
      ))}

      <div className="border-t border-gray-100 mt-1 pt-1">
        <button
          onClick={() => { closeAll(); handleSignOut(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-base text-[#F06C6C] hover:bg-[#F06C6C]/10 text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          Kijelentkezés
        </button>
      </div>
    </div>
  );

  return (
  <>
    <nav className={`sticky top-0 z-50 border-b border-gray-200 transition-all duration-300 relative ${scrolled ? "bg-white/80 backdrop-blur-md" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Desktop nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center shrink-0">
              <Image src="/logo.png" alt="Esküvőre Készülök" width={320} height={80} quality={100} className="h-10 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-base text-gray-900 px-2 py-1 rounded-md hover:bg-[#F0F6F5] transition-colors">Kezdőlap</Link>
              <Link href="/informaciok" className="text-base text-gray-900 px-2 py-1 rounded-md hover:bg-[#F0F6F5] transition-colors">Információk</Link>

              {/* Kategóriák dropdown */}
              <div className="relative" onMouseEnter={openServices} onMouseLeave={() => setServicesOpen(false)}>
                <button data-tour="nav-categories" className="flex items-center gap-1 text-base text-gray-900 px-2 py-1 rounded-md hover:bg-[#F0F6F5] transition-colors">
                  Kategóriák <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {servicesOpen && (
                  <div className="absolute top-full left-0 pt-2 w-64 z-50">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                      {(Object.keys(navCategoryCounts).length > 0
                        ? (Object.keys(CATEGORY_LABELS) as (typeof mainCategories[number])[])
                            .filter((cat) => (navCategoryCounts[cat] ?? 0) > 0)
                            .sort((a, b) => (navCategoryCounts[b] ?? 0) - (navCategoryCounts[a] ?? 0))
                            .slice(0, 8)
                        : mainCategories
                      ).map((cat) => (
                        <Link key={cat} href={`/services/${cat}`} className="flex items-center justify-between px-4 py-2 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]">
                          <span>{CATEGORY_LABELS[cat]}</span>
                          {navCategoryCounts[cat] != null && (
                            <span className="text-sm text-gray-400 font-normal ml-2">({navCategoryCounts[cat]})</span>
                          )}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link href="/services" className="block px-4 py-2 text-base text-[#84AAA6] font-medium hover:bg-[#84AAA6]/10">
                          Összes kategória →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/kapcsolat" className="text-base text-gray-900 px-2 py-1 rounded-md hover:bg-[#F0F6F5] transition-colors">Kapcsolat</Link>
            </div>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div
                ref={desktopDropdownRef}
                className="relative"
                onMouseEnter={() => {
                  if (desktopCloseTimer.current) clearTimeout(desktopCloseTimer.current);
                  setDesktopDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  desktopCloseTimer.current = setTimeout(() => setDesktopDropdownOpen(false), 1000);
                }}
              >
                <button className="relative p-2 rounded-xl text-[#84AAA6] hover:text-[#6B8E8A]">
                  {navAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={navAvatarUrl} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-[#84AAA6]/40" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#84AAA6]/15 border-2 border-[#84AAA6] flex items-center justify-center">
                      <Check className="h-3 w-3 text-[#84AAA6]" strokeWidth={2.5} />
                    </div>
                  )}
                  {badgeCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[11px] font-bold flex items-center justify-center leading-none">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                  {showDot && (
                    <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${providerDot === "red" ? "bg-[#F06C6C]" : providerDot === "green" ? "bg-green-500" : providerDot === "gray" ? "bg-gray-400" : "bg-amber-400"}`} />
                  )}
                </button>
                {desktopDropdownOpen && (
                  <DropdownPanel closeAll={() => setDesktopDropdownOpen(false)} />
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button className="text-base bg-transparent text-[#C65EA5] border border-[#C65EA5] hover:bg-[#C65EA5]/10 hover:text-[#C65EA5]">Regisztráció</Button>
                </Link>
                <Link href="/auth/login">
                  <Button className="text-base bg-[#84AAA6] hover:bg-[#6B8E8A]">Bejelentkezés</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: user icon + categories icon + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            {!user && (
              <a href="/auth/login" className="relative p-2 rounded-xl text-[#84AAA6] hover:text-[#6B8E8A]">
                <CircleUser className="h-7 w-7" strokeWidth={1.75} />
              </a>
            )}

            {user && (
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => { setUserDropdownOpen(!userDropdownOpen); setMobileOpen(false); }}
                  className="relative p-2 rounded-xl text-[#84AAA6] hover:text-[#6B8E8A]"
                >
                  {navAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={navAvatarUrl ?? ""} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-[#84AAA6]/40" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#84AAA6]/15 border-2 border-[#84AAA6] flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-[#84AAA6]" strokeWidth={2.5} />
                    </div>
                  )}
                  {badgeCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[11px] font-bold flex items-center justify-center leading-none">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                  {showDot && (
                    <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${providerDot === "red" ? "bg-[#F06C6C]" : providerDot === "green" ? "bg-green-500" : providerDot === "gray" ? "bg-gray-400" : "bg-amber-400"}`} />
                  )}
                </button>
                {userDropdownOpen && (
                  <DropdownPanel closeAll={() => setUserDropdownOpen(false)} />
                )}
              </div>
            )}

            <Link href="/services" data-tour="nav-categories" className="p-2 rounded-xl text-[#84AAA6] hover:text-[#6B8E8A]">
              <LayoutGrid className="h-6 w-6" strokeWidth={2} />
            </Link>

            <button
              className="p-2 rounded-xl text-[#84AAA6] hover:text-[#6B8E8A]"
              onClick={() => { setMobileOpen(!mobileOpen); setUserDropdownOpen(false); }}
            >
              {mobileOpen ? <X className="h-7 w-7" strokeWidth={2.5} /> : <Menu className="h-7 w-7" strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute right-4 top-[calc(100%+4px)] w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
          <Link href="/" className="block px-4 py-2.5 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]" onClick={() => setMobileOpen(false)}>Kezdőlap</Link>
          <Link href="/informaciok" className="block px-4 py-2.5 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]" onClick={() => setMobileOpen(false)}>Információk</Link>
          <Link href="/services" className="block px-4 py-2.5 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]" onClick={() => setMobileOpen(false)}>Kategóriák</Link>
          <Link href="/kapcsolat" className="block px-4 py-2.5 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]" onClick={() => setMobileOpen(false)}>Kapcsolat</Link>
          {!user && (
            <div className="border-t border-gray-100 mt-1 pt-1 px-2 pb-2 flex flex-col gap-1.5">
              <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block w-full text-center text-base font-medium text-[#C65EA5] border border-[#C65EA5] rounded-lg py-2 hover:bg-[#C65EA5]/10 transition-colors">
                Regisztráció
              </Link>
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block w-full text-center text-base font-medium text-white bg-[#84AAA6] rounded-lg py-2 hover:bg-[#6B8E8A] transition-colors">
                Bejelentkezés
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
    {user && profile && profile.role !== "admin" && (
      <OnboardingTour userId={user.id} role={profile.role} />
    )}
  </>
  );
}
