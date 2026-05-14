"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Mail, MailOpen, CornerDownRight, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingTextarea } from "@/components/ui/floating-input";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  sender_role: string;
  sender_provider_id: string | null;
  recipient_name: string | null;
  recipient_role: string | null;
  recipient_provider_id: string | null;
  is_own: boolean;
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface Thread {
  key: string;
  subject: string;
  messages: Message[];
  lastAt: string;
  hasUnread: boolean;
}

interface Props {
  onUnreadChange: (count: number) => void;
}

const SYSTEM_PREFIX = "__SYSTEM__:";
const isSystemMsg = (body: string) => body.startsWith(SYSTEM_PREFIX);
const systemText  = (body: string) => body.slice(SYSTEM_PREFIX.length);

function normalizeSubject(s: string) {
  return s.replace(/^(Re:\s*)+/i, "").trim();
}

function buildThreads(messages: Message[]): Thread[] {
  const visible = messages.filter((m) => !(m.is_own && isSystemMsg(m.body)));
  const map = new Map<string, Thread>();
  for (const msg of visible) {
    const otherId = msg.is_own ? msg.recipient_id : msg.sender_id;
    const key = `${normalizeSubject(msg.subject)}|${otherId}`;
    if (!map.has(key)) {
      map.set(key, { key, subject: normalizeSubject(msg.subject), messages: [], lastAt: msg.created_at, hasUnread: false });
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
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function senderLabel(msg: Message): React.ReactNode {
  if (msg.is_own) return "Te";
  if (msg.sender_role === "admin") return "Admin";
  return msg.sender_name || "Névtelen";
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
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localHasUnread, setLocalHasUnread] = useState(thread.hasUnread);
  const [localMessages, setLocalMessages] = useState(thread.messages);

  const hasSystemMessage = localMessages.some((m) => !m.is_own && isSystemMsg(m.body));

  const otherParticipant = localMessages.find((m) => !m.is_own);
  const recipientId = otherParticipant
    ? otherParticipant.sender_id
    : (localMessages[0]?.recipient_id ?? "");

  const firstMsg = localMessages[0];
  const isOutgoing = firstMsg?.is_own ?? false;
  const otherName = isOutgoing
    ? (firstMsg?.recipient_name ?? "")
    : (otherParticipant?.sender_name ?? "");
  const otherProviderId = isOutgoing
    ? (firstMsg?.recipient_provider_id ?? null)
    : (otherParticipant?.sender_provider_id ?? null);

  const handleExpand = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (localHasUnread) {
      const unread = localMessages.filter((m) => !m.read && !m.is_own);
      await Promise.all(
        unread.map((m) => fetch(`/api/messages/${m.id}/read`, { method: "PATCH" }))
      );
      setLocalHasUnread(false);
      onUnreadMarked();
      window.dispatchEvent(new CustomEvent("messages-read"));
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !recipientId) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: recipientId,
          subject: `Re: ${thread.subject}`,
          body: replyBody.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      setLocalMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender_id: "me",
          recipient_id: recipientId,
          sender_name: "Te",
          sender_role: "self",
          sender_provider_id: null,
          recipient_name: otherName,
          recipient_role: null,
          recipient_provider_id: null,
          is_own: true,
          subject: `Re: ${thread.subject}`,
          body: replyBody.trim(),
          read: true,
          created_at: new Date().toISOString(),
        },
      ]);
      setReplyBody("");
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Hiba történt.");
    } finally {
      setSending(false);
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

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${
      localHasUnread ? "border-[#84AAA6] bg-[#84AAA6]/5" : "border-gray-200 bg-white"
    }`}>
      {/* Thread header */}
      <button onClick={handleExpand} className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer">
        {localHasUnread
          ? <Mail className="h-4 w-4 text-[#84AAA6] shrink-0" />
          : <MailOpen className="h-4 w-4 text-gray-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className={`text-base truncate text-gray-900 ${localHasUnread ? "font-semibold" : ""}`}>
            {thread.subject}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {localMessages.length} üzenet
            {" · "}
            {isOutgoing ? "Címzett: " : "Feladó: "}
            {otherProviderId ? (
              <span
                className="text-[#84AAA6] hover:underline cursor-pointer"
                onClick={(e) => { e.stopPropagation(); window.open(`/providers/${otherProviderId}`, "_blank"); }}
              >
                {otherName}
              </span>
            ) : (
              <span className="text-gray-700">{otherName}</span>
            )}
            {" · "}{formatDate(thread.lastAt)}
          </p>
        </div>
        {localHasUnread && (
          <span className="min-w-[20px] h-5 px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center">Új</span>
        )}
        {expanded
          ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          {/* Messages */}
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
            {localMessages.map((msg) =>
              isSystemMsg(msg.body) ? (
                <div key={msg.id} className="px-3 py-2.5 bg-amber-50 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 italic">{systemText(msg.body)}</p>
                </div>
              ) : (
                <div key={msg.id} className={`px-3 py-2.5 ${msg.is_own ? "bg-gray-50" : "bg-white"}`}>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-xs font-medium text-gray-600">{senderLabel(msg)}</span>
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-900 whitespace-pre-line leading-relaxed">{msg.body}</p>
                </div>
              )
            )}
          </div>

          {/* Reply form — always visible unless system message */}
          {!hasSystemMessage && recipientId && (
            <form onSubmit={handleReply} className="space-y-2">
              <FloatingTextarea
                id={`reply-${thread.key}`}
                label="Válasz írása..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={3}
              />
              {sendError && <p className="text-xs text-[#F06C6C]">{sendError}</p>}
              <Button type="submit" size="sm" disabled={sending || !replyBody.trim()}>
                <CornerDownRight className="h-3.5 w-3.5 mr-1" />
                {sending ? "Küldés..." : "Válasz küldése"}
              </Button>
            </form>
          )}

          {/* Delete */}
          <div className="pt-1 border-t border-gray-100 flex justify-end">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#F06C6C] transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Törlés
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Biztosan törlöd?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-sm font-medium text-[#F06C6C] hover:text-[#F06C6C]/80 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleting ? "Törlés..." : "Igen, törlöm"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  Mégse
                </button>
              </div>
            )}
          </div>
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

  useEffect(() => { loadMessages(); }, []);

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
          key={thread.key}
          thread={thread}
          onDeleted={handleDeleted}
          onUnreadMarked={handleUnreadMarked}
        />
      ))}
    </div>
  );
}
