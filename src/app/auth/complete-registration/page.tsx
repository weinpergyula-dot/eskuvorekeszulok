"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { completeOAuthRegistrationAction } from "./actions";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { PageHeader } from "@/components/layout/page-header";
import { UserRound, Briefcase } from "lucide-react";

function CompleteRegistrationContent() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"visitor" | "provider">("visitor");
  const [consentsAccepted, setConsentsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!supabase) { router.replace("/auth/login"); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }

      setUserId(user.id);
      setGoogleEmail(user.email ?? "");
      // Google metadatából előtöltjük a nevet
      const meta = user.user_metadata;
      const name = meta?.full_name ?? meta?.name ?? "";
      setFullName(name);
      setInitializing(false);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!fullName.trim()) { setError("Add meg a teljes nevedet!"); return; }
    if (!consentsAccepted) { setError("Az ÁSZF és adatvédelmi tájékoztató elfogadása kötelező."); return; }

    setLoading(true);
    setError(null);

    const { error: actionError } = await completeOAuthRegistrationAction(userId, fullName.trim(), role);
    if (actionError) {
      setError(actionError);
      setLoading(false);
      return;
    }

    if (role === "provider") {
      // Szolgáltató flow: a meglévő upgrade flow-ba irányítjuk (már be van jelentkezve)
      router.push("/auth/register?type=provider");
    } else {
      router.push("/");
    }
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-gray-400 text-lg">Betöltés...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={UserRound}
        title="Regisztráció befejezése"
        description="Még egy lépés, és kész is vagy! Add meg a nevedet, válaszd ki a fiók típusát, és fogadd el a feltételeket."
        bgColor="#84AAA6"
      />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-8">

          {googleEmail && (
            <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              <div>
                <p className="text-sm text-gray-500 leading-tight">Bejelentkezve Google-lal</p>
                <p className="text-sm font-medium text-gray-900">{googleEmail}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <FloatingInput
              accentColor="#84AAA6"
              id="fullName"
              label="Teljes név *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <div className="space-y-2">
              <p className="text-base text-gray-800">Milyen típusú fiókot szeretnél?<span className="text-[1.1em] font-bold align-middle ml-0.5">*</span></p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("visitor")}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-colors text-left ${
                    role === "visitor"
                      ? "border-[#84AAA6] bg-[#84AAA6]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <UserRound className={`h-5 w-5 ${role === "visitor" ? "text-[#84AAA6]" : "text-gray-400"}`} strokeWidth={1.5} />
                  <span className={`font-semibold text-sm ${role === "visitor" ? "text-[#84AAA6]" : "text-gray-700"}`}>Látogató</span>
                  <span className="text-xs text-gray-400">Értékelés, kedvencek, ajánlatkérés</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("provider")}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-colors text-left ${
                    role === "provider"
                      ? "border-[#84AAA6] bg-[#84AAA6]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Briefcase className={`h-5 w-5 ${role === "provider" ? "text-[#84AAA6]" : "text-gray-400"}`} strokeWidth={1.5} />
                  <span className={`font-semibold text-sm ${role === "provider" ? "text-[#84AAA6]" : "text-gray-700"}`}>Szolgáltató</span>
                  <span className="text-xs text-gray-400">Profil, ajánlatkérések fogadása</span>
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentsAccepted}
                onChange={(e) => setConsentsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#84AAA6] cursor-pointer shrink-0"
              />
              <span className="text-base text-gray-700">
                Elolvastam és elfogadom az{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#84AAA6] underline">
                  Általános Szerződési Feltételeket
                </a>{" "}
                és az{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#84AAA6] underline">
                  Adatvédelmi tájékoztatóban
                </a>{" "}
                foglaltakat.{" "}
                <span className="text-[1.1em] font-bold align-middle">*</span>
              </span>
            </label>

            {error && (
              <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-base px-4 py-3 rounded-xl border border-[#F06C6C]/30">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#84AAA6] hover:bg-[#6B8E8A]"
              disabled={loading || !consentsAccepted || !fullName.trim()}
            >
              {loading
                ? "Mentés..."
                : role === "provider"
                ? "Tovább a szolgáltatói adatokhoz →"
                : "Regisztráció befejezése"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            Nem a te fiókod?{" "}
            <Link href="/auth/signout?next=/auth/login" className="text-[#84AAA6] hover:underline">
              Kijelentkezés
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense>
      <CompleteRegistrationContent />
    </Suspense>
  );
}
