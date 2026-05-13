"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { PageHeader } from "@/components/layout/page-header";
import { Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmailFormat = (val: string) => {
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))
      setEmailError("Adj meg érvényes e-mail-címet (pl. nev@example.hu).");
    else setEmailError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) { setError("Supabase nincs konfigurálva."); return; }
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (resetError) {
      setError("Hiba történt. Ellenőrizd az email címet.");
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div>
      <PageHeader title="Elfelejtett jelszó" icon={Lock} />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-xl bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-8">
          {sent ? (
            <div className="text-center space-y-6">
              <div className="bg-green-50 text-green-700 px-4 py-4 rounded-xl border border-green-200 space-y-1">
                <p className="text-lg font-semibold">Elküldtük a visszaállítási linket!</p>
                <p className="text-base leading-relaxed">
                  Keresd meg az e-mailt a <strong>{email}</strong> postaládájában, és kattints a levélben található linkre az új jelszavad megadásához – a SPAM mappát is ellenőrizd!
                </p>
              </div>
              <hr className="border-gray-200" />
              <Link href="/auth/login" className="block text-lg text-[#84AAA6] hover:underline">
                Vissza a bejelentkezéshez
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-900 text-center mb-8" style={{ fontSize: "22px" }}>Jelszó visszaállítása</p>
              <p className="text-gray-500 text-center text-base mb-6 leading-relaxed">
                Add meg a fiókodhoz tartozó e-mail címet, és elküldjük a visszaállítási linket.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-lg px-4 py-3 rounded-xl border border-[#F06C6C]/30">
                    {error}
                  </div>
                )}
                <div>
                  <FloatingInput
                    id="email"
                    label="E-mail-cím"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                    onBlur={() => validateEmailFormat(email)}
                    required
                  />
                  {emailError && (
                    <p className="text-sm text-[#F06C6C] mt-1 px-1">{emailError}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading || !email.trim() || !!emailError}>
                  {loading ? "Küldés..." : "Visszaállítási link küldése"}
                </Button>
              </form>
              <p className="text-center text-lg text-gray-900 mt-4">
                <Link href="/auth/login" className="text-[#84AAA6] hover:underline">
                  Vissza a bejelentkezéshez
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
