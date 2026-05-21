"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserIdentity } from "@supabase/auth-js";
import { CheckCircle2, Link2, Link2Off, AlertCircle } from "lucide-react";

function translateProviderError(msg: string): string {
  if (msg.toLowerCase().includes("manual linking is disabled"))
    return "A fiók összekapcsolás/leválasztás funkció nincs engedélyezve. Kérjük, vedd fel a kapcsolatot az oldal üzemeltetőjével.";
  if (msg.toLowerCase().includes("identity is already linked"))
    return "Ez a Google fiók már össze van kötve egy másik fiókkal.";
  if (msg.toLowerCase().includes("at least one"))
    return "Nem lehet leválasztani – legalább egy bejelentkezési mód szükséges. Állíts be jelszót előbb.";
  return "Hiba történt. Kérjük, próbáld újra.";
}

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z"/>
    </svg>
  );
}

function ConnectedAccountsContent() {
  const searchParams = useSearchParams();
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justLinked, setJustLinked] = useState(false);

  useEffect(() => {
    if (searchParams.get("linked") === "google") {
      setJustLinked(true);
    }
  }, [searchParams]);

  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    const fetchIdentities = async () => {
      const supabase = createClient();
      if (!supabase) return;
      const [{ data: { user } }, { data: hasPass }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.rpc("user_has_password"),
      ]);
      setIdentities(user?.identities ?? []);
      setHasPassword(hasPass === true);
      setLoading(false);
    };
    fetchIdentities();
  }, []);

  const googleIdentity = identities.find((i) => i.provider === "google");
  const hasEmailIdentity = identities.some((i) => i.provider === "email");
  const canUnlink = identities.length > 1 || hasEmailIdentity || hasPassword;

  const handleLinkGoogle = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setActionLoading(true);
    setError(null);
    const origin = window.location.origin;
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?intent=link`,
      },
    });
    if (linkError) {
      setError(translateProviderError(linkError.message));
      setActionLoading(false);
    }
    // Ha sikeres, az oldal átirányít Google-ra, nem kell setLoading(false)
  };

  const handleUnlinkGoogle = async () => {
    if (!googleIdentity) return;
    if (!canUnlink) {
      setError("Nem lehet leválasztani a Google fiókot, mert más bejelentkezési módod nincs. Először állíts be jelszót.");
      return;
    }
    if (!confirm("Biztosan leválasztod a Google fiókodat? Ezután Google-lal nem tudsz majd bejelentkezni.")) return;

    setActionLoading(true);
    setError(null);
    const supabase = createClient();
    if (!supabase) return;

    const { error: unlinkError } = await supabase.auth.unlinkIdentity(googleIdentity);
    if (unlinkError) {
      setError(translateProviderError(unlinkError.message));
    } else {
      setIdentities((prev) => prev.filter((i) => i.provider !== "google"));
      setJustLinked(false);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg">
      <p className="text-base text-gray-600">
        Kösd össze a fiókodat külső szolgáltatókkal a gyorsabb bejelentkezéshez.
      </p>

      {justLinked && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-base">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Google fiók sikeresen összekapcsolva!
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-xl text-[#F06C6C] text-base">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Google */}
      <div className="flex items-center justify-between gap-4 px-4 py-4 bg-white border-2 border-gray-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
            <GoogleIcon size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">Google</p>
            {googleIdentity ? (
              <p className="text-sm text-gray-500">
                {googleIdentity.identity_data?.email ?? "Összekapcsolva"}
              </p>
            ) : (
              <p className="text-sm text-gray-400">Nincs összekapcsolva</p>
            )}
          </div>
        </div>

        {googleIdentity ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Összekapcsolva
            </span>
            <button
              onClick={handleUnlinkGoogle}
              disabled={actionLoading || !canUnlink}
              title={!canUnlink ? "Jelszó beállítása szükséges a leválasztáshoz" : "Leválasztás"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Link2Off className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Leválaszt</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleLinkGoogle}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-[#84AAA6] text-sm text-[#84AAA6] font-medium hover:bg-[#84AAA6]/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            <Link2 className="h-3.5 w-3.5" />
            Összekapcsolás
          </button>
        )}
      </div>

      {/* Facebook – előkészítve */}
      <div className="flex items-center justify-between gap-4 px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
            <FacebookIcon size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-base">Facebook</p>
            <p className="text-sm text-gray-400">Hamarosan elérhető</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-100 rounded-lg shrink-0">
          Hamarosan
        </span>
      </div>

      {googleIdentity && !canUnlink && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-base">
          <span className="shrink-0 mt-0.5">ⓘ</span>
          <span>
            A Google fiók leválasztásához először{" "}
            <a href="?tab=password" className="font-semibold underline hover:text-amber-900">
              állíts be jelszót
            </a>
            , hogy ne veszítsd el a hozzáférést a fiókodhoz.
          </span>
        </div>
      )}
    </div>
  );
}

export function ConnectedAccountsSection() {
  return (
    <Suspense fallback={
      <div className="space-y-4 max-w-lg">
        <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    }>
      <ConnectedAccountsContent />
    </Suspense>
  );
}
