"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { PageHeader } from "@/components/layout/page-header";
import { LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmailFormat = (val: string) => {
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))
      setEmailError("Adj meg érvényes e-mail-címet (pl. nev@example.hu).");
    else setEmailError(null);
  };

  const registered = searchParams.get("registered");
  const reset = searchParams.get("reset");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Add meg az e-mail címedet!"); return; }
    if (!password) { setError("Add meg a jelszavadat!"); return; }
    if (!supabase) { setError("Supabase nincs konfigurálva."); return; }
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const msg = signInError.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        setError("Az e-mail-címed még nincs megerősítve. Kérjük, keresd meg a megerősítő levelet a postaládádban – és a SPAM mappát is ellenőrizd!");
      } else {
        setError("Hibás e-mail-cím vagy jelszó.");
      }
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
        noValidate
      >
        {registered && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 space-y-1">
            <p className="text-lg font-semibold">Köszönjük a regisztrációt!</p>
            <p className="text-base leading-relaxed">Elküldtük a megerősítő levelet a megadott e-mail-címre. Kérjük, nyisd meg, és kattints a levélben található linkre a fiókod aktiválásához – ezután tudsz bejelentkezni.</p>
          </div>
        )}
        {reset && (
          <div className="bg-green-50 text-green-700 text-lg px-4 py-3 rounded-xl border border-green-200">
            Jelszavad sikeresen megváltozott. Jelentkezz be az új jelszavaddal.
          </div>
        )}
        {error && (
          <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-lg px-4 py-3 rounded-xl border border-[#F06C6C]/30">
            {error}
          </div>
        )}

        <div>
          <FloatingInput
            id="email"
            label="Email cím"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
            onBlur={() => validateEmailFormat(email)}
          />
          {emailError && (
            <p className="text-sm text-[#F06C6C] mt-1 px-1">{emailError}</p>
          )}
        </div>

        <FloatingInput
          id="password"
          label="Jelszó"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
      <PageHeader title="Bejelentkezés" icon={LogIn} description="A látogatók számára a szolgáltatók értékeléséhez, a szolgáltatók számára pedig a profiljuk menedzseléséhez szükséges a bejelentkezés." />
      <div className="flex items-center justify-center py-12 px-4">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
