"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
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
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center leading-none border-2 border-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [providerDot, setProviderDot] = useState<"amber" | "red" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setProfile(data));

    supabase
      .from("providers")
      .select("approval_status, pending_changes, active")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data: p }) => {
        if (!p) { setProviderDot(null); return; }
        if (p.approval_status === "rejected") { setProviderDot("red"); return; }
        const hasPending = p.approval_status === "pending" || !!p.pending_changes;
        setProviderDot(hasPending ? "amber" : null);
      });

    fetch("/api/messages")
      .then((r) => r.json())
      .then((data: { read: boolean; is_own: boolean }[]) =>
        setUnreadMessages(data.filter((m) => !m.read && !m.is_own).length)
      )
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!supabase || profile?.role !== "admin") { setPendingCount(0); return; }
    Promise.all([
      supabase.from("providers").select("*", { count: "exact", head: true }).eq("approval_status", "pending"),
      supabase.from("providers").select("*", { count: "exact", head: true }).not("pending_changes", "is", null),
    ]).then(([{ count: newRegs }, { count: edits }]) => {
      setPendingCount((newRegs ?? 0) + (edits ?? 0));
    });
  }, [profile]);

  useEffect(() => {
    const refresh = () => {
      fetch("/api/messages")
        .then((r) => r.json())
        .then((data: { read: boolean; is_own: boolean }[]) =>
          setUnreadMessages(data.filter((m) => !m.read && !m.is_own).length)
        )
        .catch(() => {});
    };
    window.addEventListener("messages-read", refresh);
    return () => window.removeEventListener("messages-read", refresh);
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className={`sticky top-0 z-50 border-b border-gray-200 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Desktop nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center shrink-0">
              <Image src="/logo2.png" alt="Esküvőre Készülök" width={44} height={40} className="h-10 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-base text-gray-900 hover:underline">
                Kezdőlap
              </Link>

              {/* Szolgáltatások dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button className="flex items-center gap-1 text-base text-gray-900 hover:underline">
                  Szolgáltatások <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {servicesOpen && (
                  <div className="absolute top-full left-0 pt-2 w-56 z-50">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                      {mainCategories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/services/${cat}`}
                          className="block px-4 py-2 text-base text-gray-900 hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]"
                        >
                          {CATEGORY_LABELS[cat]}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link
                          href="/services"
                          className="block px-4 py-2 text-base text-[#84AAA6] font-medium hover:bg-[#84AAA6]/10"
                        >
                          Összes kategória →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/contact" className="text-base text-gray-900 hover:underline">
                Kapcsolat
              </Link>
            </div>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {profile?.role === "admin" && (
                  <Link href="/admin" className="relative">
                    <Button variant="ghost" className="text-base">Admin</Button>
                    <NavBadge count={pendingCount} />
                  </Link>
                )}
                <Link href="/profil#messages" className="relative">
                  <Button variant="ghost" className="text-base">Üzenetek</Button>
                  <NavBadge count={unreadMessages} />
                </Link>
                <Link href="/profil" className="relative">
                  <Button variant="ghost" className="text-base">Profilom</Button>
                  {providerDot && (
                    <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${providerDot === "red" ? "bg-[#F06C6C]" : "bg-amber-400"}`} />
                  )}
                </Link>
                <Button variant="outline" className="text-base" onClick={handleSignOut}>
                  Kijelentkezés
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button className="text-base bg-transparent text-[#C65EA5] border border-[#C65EA5] hover:bg-[#C65EA5] hover:text-white">Regisztráció</Button>
                </Link>
                <Link href="/auth/login">
                  <Button className="text-base bg-[#84AAA6] hover:bg-[#6B8E8A]">Bejelentkezés</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-900 hover:text-[#84AAA6]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          <Link href="/" className="block py-2 text-base text-gray-900" onClick={() => setMobileOpen(false)}>
            Kezdőlap
          </Link>
          <Link href="/services" className="block py-2 text-base text-gray-900" onClick={() => setMobileOpen(false)}>
            Szolgáltatások
          </Link>
          <Link href="/contact" className="block py-2 text-base text-gray-900" onClick={() => setMobileOpen(false)}>
            Kapcsolat
          </Link>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <>
                {profile?.role === "admin" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="relative block">
                    <Button variant="outline" size="sm" className="w-full">
                      Admin
                      {pendingCount > 0 && (
                        <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold leading-none">
                          {pendingCount > 99 ? "99+" : pendingCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}
                <Link href="/profil#messages" onClick={() => setMobileOpen(false)} className="relative block">
                  <Button variant="outline" size="sm" className="w-full">
                    Üzenetek
                    {unreadMessages > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold leading-none">
                        {unreadMessages > 99 ? "99+" : unreadMessages}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/profil" onClick={() => setMobileOpen(false)} className="relative block">
                  <Button variant="outline" size="sm" className="w-full">Profilom</Button>
                  {providerDot && (
                    <span className={`absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${providerDot === "red" ? "bg-[#F06C6C]" : "bg-amber-400"}`} />
                  )}
                </Link>
                <Button size="sm" className="w-full" onClick={handleSignOut}>
                  Kijelentkezés
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full bg-transparent text-[#C65EA5] border border-[#C65EA5] hover:bg-[#C65EA5] hover:text-white">Regisztráció</Button>
                </Link>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full bg-[#84AAA6] hover:bg-[#6B8E8A]">Bejelentkezés</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
