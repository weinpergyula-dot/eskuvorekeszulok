"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-input";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

interface Props {
  recipientId: string;
  providerId: string;
}

export function MessageForm({ recipientId, providerId }: Props) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: recipientId, provider_id: providerId, subject, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      setSuccess(true);
      setSubject("");
      setBody("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt.");
    } finally {
      setSending(false);
    }
  };

  if (loggedIn === null) return null;

  return (
    <section className="mt-8 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#84AAA6]" />
        Üzenet küldése
      </h2>

      {loggedIn ? (
        success ? (
          <div className="text-base text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 space-y-1">
            <p>✓ Üzeneted elküldve! A szolgáltató hamarosan válaszol.</p>
            <p className="text-sm text-green-600">
              A további üzenetváltásokat a szolgáltatóval az{" "}
              <Link href="/profil?tab=messages" className="underline underline-offset-2 hover:text-green-800 font-medium">
                Üzenetek
              </Link>{" "}
              menüpontból kezdeményezheted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <FloatingInput
              id="msg-subject"
              label="Tárgy"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <FloatingTextarea
              id="msg-body"
              label="Üzenet"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
            />
            {error && (
              <p className="text-base text-[#F06C6C] bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button type="submit" disabled={sending}>
              {sending ? "Küldés..." : "Üzenet küldése"}
            </Button>
          </form>
        )
      ) : (
        <p className="text-base text-gray-700">
          <Link href="/auth/login" className="text-[#84AAA6] hover:underline font-medium">
            Jelentkezz be
          </Link>{" "}
          az üzenet küldéséhez.
        </p>
      )}
    </section>
  );
}
