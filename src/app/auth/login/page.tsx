"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registered = searchParams.get("registered");
  const reset = searchParams.get("reset");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setError("Supabase nincs konfigurálva."); return; }
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Hibás email cím vagy jelszó.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .single();

    if (profile?.role === "admin") {
      router.push("/admin");
    } else if (profile?.role === "provider") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Belépés</h1>
          <p className="text-gray-700">Lépj be a fiókodba</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white border border-gray-200 rounded-lg p-6"
        >
          {registered && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-200">
              Sikeres regisztráció! Ellenőrizd az email fiókodat, majd lépj be.
            </div>
          )}
          {reset && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-200">
              Jelszavad sikeresen megváltozott. Lépj be az új jelszavaddal.
            </div>
          )}

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

          <div className="space-y-1.5">
            <Label htmlFor="password">Jelszó</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Belépés..." : "Belépés"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-700 mt-4">
          Még nincs fiókod?{" "}
          <Link href="/auth/register" className="text-[#2a9d8f] hover:underline">
            Regisztrálj
          </Link>
        </p>
        <p className="text-center text-sm text-gray-700 mt-2">
          <Link href="/auth/forgot-password" className="text-[#2a9d8f] hover:underline">
            Elfelejtett jelszó?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
