"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Mail, MailOpen, CornerDownRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingTextarea } from "@/components/ui/floating-input";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  sender_role: string;
  sender_provider_id: string | null;
  is_own: boolean;
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface Thread {
  subject: string;
  messages: Message[];
  lastAt: string;
  hasUnread: boolean;
}

interface Props {
  onUnreadChange: (count: number) => void;
}

function normalizeSubject(s: string) {
  return s.replace(/^(Re:\s*)+/i, "").trim();
}

function buildThreads(messages: Message[]): Thread[] {
  const map = new Map<string, Thread>();
  for (const msg of messages) {
    const key = normalizeSubject(msg.subject);
    if (!map.has(key)) {
      map.set(key, { subject: key, messages: [], lastAt: msg.created_at, hasUnread: false });
    }
    const t = map.get(key)!;
    t.messages.push(msg);
    if (msg.created_at > t.lastAt) t.lastAt = msg.created_at;
    if (!msg.read && !msg.is_own) t.hasUnread = true;
  }
  return [...map.values()]
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
    .map((t) => ({
      ...t,
      messages: t.messages.sort((a, b) => a.created_at.localeCompare(b.created_at)),
    }));
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

function SenderLabel({ msg }: { msg: Message }) {
  if (msg.is_own) return <span className="font-medium text-gray-700">Te</span>;
  if (msg.sender_role === "admin") return <span className="font-medium text-gray-700">Admin</span>;
  if (msg.sender_provider_id) {
    return (
      <a
        href={`/providers/${msg.sender_provider_id}`}
        className="text-[#84AAA6] hover:underline font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        {msg.sender_name}
      </a>
    );
  }
  return (
    <span>
      {msg.sender_name} <span className="text-gray-400">(Látogató)</span>
    </span>
  );
}

function ReplyForm({
  subject,
  recipientId,
  onSent,
}: {
  subject: string;
  recipientId: string;
  onSent: () => void;
}) {
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
          recipient_id: recipientId,
          subject: `Re: ${subject}`,
          body: body.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      setSuccess(true);
      setBody("");
      setTimeout(onSent, 1200);
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
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-gray-100 pt-3">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CornerDownRight className="h-4 w-4 shrink-0" />
        <span>Válasz — {subject}</span>
      </div>
      <FloatingTextarea
        id={`reply-${subject}`}
        label="Válasz üzenet"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
      />
      {error && (
        <p className="text-base text-[#F06C6C] bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <Button type="submit" size="sm" disabled={sending}>
        {sending ? "Küldés..." : "Válasz küldése"}
      </Button>
    </form>
  );
}

function ThreadCard({
  thread,
  onDeleted,
  onUnreadMarked,
}: {
  thread: Thread;
  onDeleted: (ids: string[]) => void;
  onUnreadMarked: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replying, setReplying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localHasUnread, setLocalHasUnread] = useState(thread.hasUnread);

  const otherParticipant = thread.messages.find((m) => !m.is_own);
  const recipientId = otherParticipant
    ? otherParticipant.sender_id
    : (thread.messages[0]?.recipient_id ?? "");

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      setReplying(false);
      setConfirmDelete(false);
      return;
    }
    setExpanded(true);
    if (localHasUnread) {
      const unread = thread.messages.filter((m) => !m.read && !m.is_own);
      await Promise.all(
        unread.map((m) => fetch(`/api/messages/${m.id}/read`, { method: "PATCH" }))
      );
      setLocalHasUnread(false);
      onUnreadMarked();
      window.dispatchEvent(new CustomEvent("messages-read"));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const ids = thread.messages.map((m) => m.id);
    await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    onDeleted(ids);
  };

  const otherNames = [
    ...new Set(thread.messages.filter((m) => !m.is_own).map((m) => m.sender_name)),
  ];

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-colors ${
        localHasUnread
          ? "border-[#84AAA6] bg-[#84AAA6]/5"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Thread header */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
      >
        {localHasUnread ? (
          <Mail className="h-4 w-4 text-[#84AAA6] shrink-0" />
        ) : (
          <MailOpen className="h-4 w-4 text-gray-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-base truncate text-gray-900 ${localHasUnread ? "font-semibold" : ""}`}>
            {thread.subject}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {thread.messages.length} üzenet
            {otherNames.length > 0 && ` · ${otherNames.join(", ")}`}
            {" · "}
            {formatDate(thread.lastAt)}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        )}
      </button>

      {/* Expanded: message list */}
      {expanded && (
        <div className="border-t border-gray-100">
          <div className="divide-y divide-gray-100">
            {thread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`px-4 py-3 ${msg.is_own ? "bg-gray-50" : "bg-white"}`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-4">
                  <span className="text-sm text-gray-500">
                    <SenderLabel msg={msg} />
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{formatDate(msg.created_at)}</span>
                </div>
                <p className="text-base text-gray-900 whitespace-pre-line leading-relaxed">
                  {msg.body}
                </p>
              </div>
            ))}
          </div>

          {/* Reply form */}
          {replying && recipientId && (
            <div className="px-4 pb-4">
              <ReplyForm
                subject={thread.subject}
                recipientId={recipientId}
                onSent={() => {
                  setReplying(false);
                  window.location.reload();
                }}
              />
            </div>
          )}

          {/* Footer: reply + delete */}
          {!replying && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-4">
              {recipientId && (
                <button
                  onClick={() => setReplying(true)}
                  className="flex items-center gap-1.5 text-sm text-[#84AAA6] hover:underline cursor-pointer"
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                  Válasz
                </button>
              )}

              {confirmDelete ? (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-600">Törlöd az összes üzenetet?</span>
                  <Button size="sm" variant="destructive" disabled={deleting} onClick={handleDelete}>
                    {deleting ? "Törlés..." : "Törlés"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>
                    Mégse
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#F06C6C] cursor-pointer ml-auto transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Törlés
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MessagesSection({ onUnreadChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = () => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data: Message[]) => {
        setMessages(data);
        onUnreadChange(data.filter((m) => !m.read && !m.is_own).length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const threads = buildThreads(messages);

  const handleDeleted = (deletedIds: string[]) => {
    const next = messages.filter((m) => !deletedIds.includes(m.id));
    setMessages(next);
    onUnreadChange(next.filter((m) => !m.read && !m.is_own).length);
  };

  const handleUnreadMarked = () => {
    onUnreadChange(messages.filter((m) => !m.read && !m.is_own).length - 1);
  };

  if (loading) return <p className="text-base text-gray-500">Betöltés...</p>;

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
        <Mail className="h-10 w-10 mb-3 text-gray-300" strokeWidth={1.5} />
        <p className="text-base">Még nem érkezett üzeneted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <ThreadCard
          key={thread.subject}
          thread={thread}
          onDeleted={handleDeleted}
          onUnreadMarked={handleUnreadMarked}
        />
      ))}
    </div>
  );
}
