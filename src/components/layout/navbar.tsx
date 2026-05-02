"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User as UserIcon, UserCheck, Lock, Briefcase, LayoutDashboard, Heart, MessageSquare, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

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
  const [providerDot, setProviderDot] = useState<"amber" | "red" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node))
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

  useEffect(() => {
    if (!supabase || !user) { setProfile(null); setProviderDot(null); setUnreadMessages(0); return; }
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));
    supabase.from("providers").select("approval_status, pending_changes, active").eq("user_id", user.id).maybeSingle()
      .then(({ data: p }) => {
        if (!p) { setProviderDot(null); return; }
        if (p.approval_status === "rejected") { setProviderDot("red"); return; }
        setProviderDot(p.approval_status === "pending" || !!p.pending_changes ? "amber" : null);
      });
    fetch("/api/messages").then((r) => r.json())
      .then((data: { read: boolean; is_own: boolean }[]) =>
        setUnreadMessages(data.filter((m) => !m.read && !m.is_own).length))
      .catch(() => {});
  }, [user]);

  const refreshAdminCount = (sb: typeof supabase) => {
    if (!sb) return;
    Promise.all([
      sb.from("providers").select("*", { count: "exact", head: true }).eq("approval_status", "pending"),
      sb.from("providers").select("*", { count: "exact", head: true }).not("pending_changes", "is", null),
      sb.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false),
    ]).then(([{ count: newRegs }, { count: edits }, { count: contactUnread }]) => {
      setPendingCount((newRegs ?? 0) + (edits ?? 0) + (contactUnread ?? 0));
    });
  };

  useEffect(() => {
    if (!supabase || profile?.role !== "admin") { setPendingCount(0); return; }
    refreshAdminCount(supabase);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    const refresh = () => {
      fetch("/api/messages").then((r) => r.json())
        .then((data: { read: boolean; is_own: boolean }[]) =>
          setUnreadMessages(data.filter((m) => !m.read && !m.is_own).length))
        .catch(() => {});
    };
    window.addEventListener("messages-read", refresh);
    return () => window.removeEventListener("messages-read", refresh);
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
  const badgeCount = unreadMessages > 0 ? unreadMessages : pendingCount > 0 ? pendingCount : 0;
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
      router.push(`/profil#${section}`);
    }
  };

  const profileItems: { id: string; label: string; Icon: React.ElementType }[] = [
    ...(profile?.role === "admin" ? [{ id: "admin", label: "Admin", Icon: ShieldCheck }] : []),
    { id: "account",   label: "Fiók adatok",          Icon: UserIcon },
    { id: "password",  label: "Jelszó módosítás",      Icon: Lock },
    ...(profile?.role === "provider" ? [
      { id: "provider",  label: "Szolgáltatói profil", Icon: Briefcase },
      { id: "dashboard", label: "Dashboard",           Icon: LayoutDashboard },
    ] : []),
    { id: "favorites", label: "Kedvencek",             Icon: Heart },
    { id: "messages",  label: "Üzenetek",              Icon: MessageSquare },
  ];

  // ── Shared dropdown panel renderer ──────────────────────────────────────────
  const DropdownPanel = ({ closeAll }: { closeAll: () => void }) => (
    <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
      {profileItems.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => navTo(id, closeAll)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6] text-left"
        >
          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span className="flex-1">{label}</span>
          {id === "admin" && pendingCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
          {id === "messages" && unreadMessages > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center">
              {unreadMessages > 99 ? "99+" : unreadMessages}
            </span>
          )}
          {id === "provider" && providerDot && (
            <span className={`w-2.5 h-2.5 rounded-full ${providerDot === "red" ? "bg-[#F06C6C]" : "bg-amber-400"}`} />
          )}
        </button>
      ))}
      <div className="border-t border-gray-100 mt-1 pt-1">
        <button
          onClick={() => { closeAll(); handleSignOut(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-base text-[#F06C6C] hover:bg-[#F06C6C]/10 text-left"
        >
          Kijelentkezés
        </button>
      </div>
    </div>
  );

  return (
    <nav className={`sticky top-0 z-50 border-b border-gray-200 transition-all duration-300 relative ${scrolled ? "bg-white/80 backdrop-blur-md" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Desktop nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center shrink-0">
              <Image src="/logo2.png" alt="Esküvőre Készülök" width={320} height={80} quality={100} className="h-10 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-base text-gray-900 hover:underline">Kezdőlap</Link>
              <Link href="/informaciok" className="text-base text-gray-900 hover:underline">Információk</Link>

              {/* Kategóriák dropdown */}
              <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
                <button className="flex items-center gap-1 text-base text-gray-900 hover:underline">
                  Kategóriák <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {servicesOpen && (
                  <div className="absolute top-full left-0 pt-2 w-56 z-50">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                      {mainCategories.map((cat) => (
                        <Link key={cat} href={`/services/${cat}`} className="block px-4 py-2 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]">
                          {CATEGORY_LABELS[cat]}
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

              <Link href="/contact" className="text-base text-gray-900 hover:underline">Kapcsolat</Link>
            </div>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div
                ref={desktopDropdownRef}
                className="relative"
                onMouseEnter={() => setDesktopDropdownOpen(true)}
                onMouseLeave={() => setDesktopDropdownOpen(false)}
              >
                <button className="relative p-2 rounded-xl text-[#84AAA6] hover:text-[#6B8E8A]">
                  <UserCheck className="h-6 w-6" strokeWidth={2} />
                  {badgeCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[11px] font-bold flex items-center justify-center leading-none">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                  {showDot && (
                    <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${providerDot === "red" ? "bg-[#F06C6C]" : "bg-amber-400"}`} />
                  )}
                </button>
                {desktopDropdownOpen && (
                  <DropdownPanel closeAll={() => setDesktopDropdownOpen(false)} />
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button className="text-base bg-transparent text-[#C65EA5] border border-[#C65EA5] hover:bg-[#FAF0F7] hover:text-[#C65EA5]">Regisztráció</Button>
                </Link>
                <Link href="/auth/login">
                  <Button className="text-base bg-[#84AAA6] hover:bg-[#6B8E8A]">Bejelentkezés</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: user icon + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            {!user && (
              <a href="/auth/login" className="relative p-2 rounded-xl text-[#84AAA6] hover:text-[#6B8E8A]">
                <UserIcon className="h-7 w-7" strokeWidth={2} />
              </a>
            )}

            {user && (
              <div ref={userDropdownRef} className="relative">
                <button
                  onClick={() => { setUserDropdownOpen(!userDropdownOpen); setMobileOpen(false); }}
                  className="relative p-2 rounded-xl text-[#84AAA6] hover:text-[#6B8E8A]"
                >
                  <UserCheck className="h-7 w-7" strokeWidth={2} />
                  {badgeCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[11px] font-bold flex items-center justify-center leading-none">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                  {showDot && (
                    <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${providerDot === "red" ? "bg-[#F06C6C]" : "bg-amber-400"}`} />
                  )}
                </button>
                {userDropdownOpen && (
                  <DropdownPanel closeAll={() => setUserDropdownOpen(false)} />
                )}
              </div>
            )}

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
          <Link href="/contact" className="block px-4 py-2.5 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]" onClick={() => setMobileOpen(false)}>Kapcsolat</Link>
          {!user && (
            <div className="border-t border-gray-100 mt-1 pt-1 px-2 pb-2 flex flex-col gap-1.5">
              <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block w-full text-center text-base font-medium text-[#C65EA5] border border-[#C65EA5] rounded-lg py-2 hover:bg-[#FAF0F7] transition-colors">
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
  );
}
