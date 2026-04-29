"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Elfelejtett jelszó</h1>
          <p className="text-gray-900">Küldjük el a visszaállítási linket</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-200">
                Elküldtük a jelszó-visszaállítási linket a <strong>{email}</strong> email címre. Ellenőrizd a beérkező leveleidet.
              </div>
              <Link href="/auth/login" className="block text-sm text-[#2a9d8f] hover:underline">
                Vissza a belépéshez
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email cím</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pelda@email.hu"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Küldés..." : "Link küldése"}
              </Button>
            </form>
          )}
        </div>

        {!sent && (
          <p className="text-center text-sm text-gray-900 mt-4">
            <Link href="/auth/login" className="text-[#2a9d8f] hover:underline">
              Vissza a belépéshez
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
