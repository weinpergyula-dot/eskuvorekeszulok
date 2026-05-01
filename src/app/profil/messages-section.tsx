"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Mail, MailOpen, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingTextarea } from "@/components/ui/floating-input";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_provider_id: string | null;
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface Props {
  onUnreadChange: (count: number) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReplyForm({ message, onSent }: { message: Message; onSent: () => void }) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: message.sender_id,
          subject: `Re: ${message.subject}`,
          body: body.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      setSuccess(true);
      setBody("");
      setTimeout(onSent, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt.");
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <p className="text-base text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3">
        ✓ Válasz elküldve!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CornerDownRight className="h-4 w-4 shrink-0" />
        <span>Válasz — Re: {message.subject}</span>
      </div>
      <FloatingTextarea
        id={`reply-${message.id}`}
        label="Válasz üzenet"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
      />
      {error && (
        <p className="text-base text-[#F06C6C] bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg px-3 py-2">{error}</p>
      )}
      <Button type="submit" size="sm" disabled={sending}>
        {sending ? "Küldés..." : "Válasz küldése"}
      </Button>
    </form>
  );
}

export function MessagesSection({ onUnreadChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replying, setReplying] = useState<string | null>(null);

  const loadMessages = () => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        onUnreadChange(data.filter((m: Message) => !m.read).length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadMessages(); }, []);

  const handleExpand = async (msg: Message) => {
    if (expanded === msg.id) {
      setExpanded(null);
      setReplying(null);
      return;
    }
    setExpanded(msg.id);
    if (!msg.read) {
      await fetch(`/api/messages/${msg.id}/read`, { method: "PATCH" });
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
      onUnreadChange(messages.filter((m) => !m.read && m.id !== msg.id).length);
    }
  };

  if (loading) return <p className="text-base text-gray-500">Betöltés...</p>;

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
        <Mail className="h-10 w-10 mb-3 text-gray-300" strokeWidth={1.5} />
        <p className="text-base">Még nem érkezett üzeneted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`border rounded-xl overflow-hidden transition-colors ${
            msg.read ? "border-gray-200 bg-white" : "border-[#84AAA6] bg-[#84AAA6]/5"
          }`}
        >
          {/* Header row */}
          <button
            onClick={() => handleExpand(msg)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
          >
            {msg.read
              ? <MailOpen className="h-4 w-4 text-gray-400 shrink-0" />
              : <Mail className="h-4 w-4 text-[#84AAA6] shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-base truncate ${!msg.read ? "font-semibold" : ""} text-gray-900`}>
                {msg.subject}
              </p>
              <p className="text-sm text-gray-500">
                Feladó:{" "}
                {msg.sender_role === "admin" ? (
                  <span className="font-medium text-gray-700">Admin</span>
                ) : msg.sender_provider_id ? (
                  <a
                    href={`/providers/${msg.sender_provider_id}`}
                    className="text-[#84AAA6] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {msg.sender_name}
                  </a>
                ) : (
                  <span>{msg.sender_name} <span className="text-gray-400">(Látogató)</span></span>
                )}
                {" · "}
                {formatDate(msg.created_at)}
              </p>
            </div>
            {expanded === msg.id
              ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
              : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            }
          </button>

          {/* Expanded content */}
          {expanded === msg.id && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              <p className="text-base text-gray-900 whitespace-pre-line leading-relaxed">{msg.body}</p>

              {replying === msg.id ? (
                <ReplyForm
                  message={msg}
                  onSent={() => { setReplying(null); loadMessages(); }}
                />
              ) : (
                <button
                  onClick={() => setReplying(msg.id)}
                  className="mt-3 flex items-center gap-1.5 text-sm text-[#84AAA6] hover:underline cursor-pointer"
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                  Válasz
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
