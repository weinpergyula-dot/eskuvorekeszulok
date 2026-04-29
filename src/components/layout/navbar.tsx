"use client";

import Link from "next/link";
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

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
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
    if (!supabase || !user) { setProfile(null); return; }
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#C04C9B] text-white font-bold text-sm">
              EK
            </span>
            <span className="hidden sm:block font-semibold text-gray-800 text-sm leading-tight">
              Esküvőre<br />Készülök
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-[#2a9d8f] transition-colors"
            >
              Kezdőlap
            </Link>

            {/* Szolgáltatások dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#2a9d8f] transition-colors"
              >
                Szolgáltatások <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {servicesOpen && (
                <div
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                  className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50"
                >
                  {mainCategories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/services/${cat}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#2a9d8f]/10 hover:text-[#2a9d8f]"
                    >
                      {CATEGORY_LABELS[cat]}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link
                      href="/services"
                      className="block px-4 py-2 text-sm text-[#2a9d8f] font-medium hover:bg-[#2a9d8f]/10"
                    >
                      Összes kategória →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-[#2a9d8f] transition-colors"
            >
              Kapcsolat
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {profile?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">Admin</Button>
                  </Link>
                )}
                {profile?.role === "provider" && (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">Profilom</Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Kilépés
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button variant="outline" size="sm">Regisztráció</Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="sm" className="bg-[#C04C9B] hover:bg-[#a33d83]">Belépés</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-[#2a9d8f]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          <Link href="/" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
            Kezdőlap
          </Link>
          <Link href="/services" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
            Szolgáltatások
          </Link>
          <Link href="/contact" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>
            Kapcsolat
          </Link>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <>
                {profile?.role === "provider" && (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Profilom</Button>
                  </Link>
                )}
                {profile?.role === "admin" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Admin</Button>
                  </Link>
                )}
                <Button size="sm" className="w-full" onClick={handleSignOut}>
                  Kilépés
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Regisztráció</Button>
                </Link>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Belépés</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
