"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { PageHeader } from "@/components/layout/page-header";

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

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user?.id)
      .single();

    if (profile?.role === "admin") {
      router.push("/admin");
    } else if (profile?.role === "provider") {
      router.push("/profil#dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="w-full max-w-md">
      <p className="text-gray-900 text-center mb-8" style={{ fontSize: "22px" }}>Jelentkezz be a fiókodba!</p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {registered && (
          <div className="bg-green-50 text-green-700 text-lg px-4 py-3 rounded-xl border border-green-200">
            Sikeres regisztráció! Ellenőrizd az email fiókodat, majd jelentkezz be.
          </div>
        )}
        {reset && (
          <div className="bg-green-50 text-green-700 text-lg px-4 py-3 rounded-xl border border-green-200">
            Jelszavad sikeresen megváltozott. Jelentkezz be az új jelszavaddal.
          </div>
        )}
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

        <FloatingInput
          id="password"
          label="Jelszó"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Bejelentkezés..." : "Bejelentkezés"}
        </Button>
      </form>

      <p className="text-center text-lg text-gray-900 mt-4">
        Még nincs fiókod?{" "}
        <Link href="/auth/register" className="text-[#84AAA6] hover:underline">
          Regisztrálj
        </Link>
      </p>
      <p className="text-center text-lg text-gray-900 mt-2">
        <Link href="/auth/forgot-password" className="text-[#84AAA6] hover:underline">
          Elfelejtett jelszó?
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div>
      <PageHeader title="Bejelentkezés" description="A látogatók számára a szolgáltatók értékeléséhez, a szolgáltatók számára pedig a profiljuk menedzseléséhez szükséges a bejelentkezés." />
      <div className="flex items-center justify-center py-12 px-4">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
