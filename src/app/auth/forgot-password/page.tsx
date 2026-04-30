"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { PageHeader } from "@/components/layout/page-header";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) { setError("Supabase nincs konfigurálva."); return; }
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
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
      <PageHeader title="Elfelejtett jelszó" />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <p className="text-gray-900 text-center mb-8">Küldjük el a visszaállítási linket</p>

          <div>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 text-green-700 text-lg px-4 py-3 rounded-xl border border-green-200">
                  Elküldtük a jelszó-visszaállítási linket a <strong>{email}</strong> email címre. Ellenőrizd a beérkező leveleidet.
                </div>
                <Link href="/auth/login" className="block text-lg text-[#84AAA6] hover:underline">
                  Vissza a belépéshez
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-700 text-lg px-4 py-3 rounded-xl border border-red-200">
                    {error}
                  </div>
                )}
                <FloatingInput
                  id="email"
                  label="Email cím"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Küldés..." : "Link küldése"}
                </Button>
              </form>
            )}
          </div>

          {!sent && (
            <p className="text-center text-lg text-gray-900 mt-4">
              <Link href="/auth/login" className="text-[#84AAA6] hover:underline">
                Vissza a belépéshez
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
