"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { PageHeader } from "@/components/layout/page-header";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("A két jelszó nem egyezik.");
      return;
    }
    if (password.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie.");
      return;
    }

    const supabase = createClient();
    if (!supabase) { setError("Supabase nincs konfigurálva."); return; }
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Hiba történt a jelszó mentésekor. Kérj új visszaállítási linket.");
      setLoading(false);
      return;
    }

    router.push("/auth/login?reset=1");
  };

  return (
    <div>
      <PageHeader title="Új jelszó" />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <p className="text-gray-900 text-center mb-8">Add meg az új jelszavadat</p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {error && (
              <div className="bg-red-50 text-red-700 text-lg px-4 py-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <FloatingInput
              id="password"
              label="Új jelszó"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <FloatingInput
              id="confirm"
              label="Jelszó megerősítése"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mentés..." : "Jelszó mentése"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
