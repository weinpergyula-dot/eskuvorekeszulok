"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Mail, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const fullName = user.user_metadata?.full_name ?? "";
      const userEmail = user.email ?? "";
      if (fullName) setName(fullName);
      if (userEmail) setEmail(userEmail);
    });
  }, []);

  const validateEmail = (val: string) => {
    if (!val.trim()) { setEmailError(null); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
      setEmailError("Adj meg érvényes e-mail-címet (pl. nev@example.hu).");
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Add meg a nevedet!"); return; }
    if (!email.trim()) { setError("Add meg az e-mail-címedet!"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Adj meg érvényes e-mail-címet (pl. nev@example.hu)."); return; }
    if (emailError) { setError(emailError); return; }
    if (!message.trim()) { setError("Írj egy rövid üzenetet!"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Hiba történt az üzenet küldése során. Kérlek próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Kapcsolat" icon={Mail} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Contact form */}
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Send className="h-5 w-5 text-[#84AAA6]" strokeWidth={1.5} />
          Írj nekünk
        </h2>

        {sent ? (
          <div className="flex flex-col items-center text-center py-10 gap-4">
            <CheckCircle className="h-14 w-14 text-[#84AAA6]" strokeWidth={1.5} />
            <p className="text-xl font-semibold text-gray-900">Üzeneted megkaptuk!</p>
            <p className="text-base text-gray-600">Hamarosan felvesszük veled a kapcsolatot.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-base px-4 py-3 rounded-xl border border-[#F06C6C]/30">
                {error}
              </div>
            )}
            <FloatingInput
              id="contact-name"
              label="Név *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div>
              <FloatingInput
                id="contact-email"
                label="Email cím *"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                onBlur={() => validateEmail(email)}
              />
              {emailError && (
                <p className="text-sm text-[#F06C6C] mt-1 px-1">{emailError}</p>
              )}
            </div>
            <FloatingInput
              id="contact-phone"
              label="Telefonszám (opcionális)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <FloatingTextarea
              id="contact-message"
              label="Rövid leírás *"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Küldés..." : "Üzenet küldése"}
            </Button>
            <p className="text-sm text-gray-500 text-center">
              <span className="text-base font-bold align-middle">*</span> A csillaggal jelöltek kitöltése kötelező.
            </p>
          </form>
        )}

        {/* Contact info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 mt-10">
          <p className="text-lg text-gray-900">
            <span className="font-medium">Email:</span>{" "}
            <a href="mailto:info@eskuvorekeszulok.hu" className="text-[#84AAA6] hover:underline">
              info@eskuvorekeszulok.hu
            </a>
          </p>
          <p className="text-lg text-gray-900">
            <span className="font-medium">Weboldal:</span>{" "}
            <span className="text-gray-900">www.eskuvorekeszulok.hu</span>
          </p>
        </div>
      </div>
    </div>
  );
}
