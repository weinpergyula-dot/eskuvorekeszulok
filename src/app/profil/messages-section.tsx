"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mail, MailOpen, Trash2, Info, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

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
  userId: string;
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

function formatShort(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate();
  return isToday
    ? d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}

// ─── Inbox list item ────────────────────────────────────────────────────────

function InboxItem({ thread, onSelect }: { thread: Thread; onSelect: () => void }) {
  const firstMsg = thread.messages[0];
  const isOutgoing = firstMsg?.is_own ?? false;
  const otherParticipant = thread.messages.find((m) => !m.is_own);
  const otherName = isOutgoing
    ? (firstMsg?.recipient_name ?? "Névtelen")
    : (otherParticipant?.sender_name ?? "Névtelen");

  // Preview: last message with "Te:" / sender name prefix
  const lastMsg = thread.messages[thread.messages.length - 1];
  let previewLabel: string;
  let previewBody: string;
  if (isSystemMsg(lastMsg?.body ?? "")) {
    previewLabel = "";
    previewBody = systemText(lastMsg.body);
  } else if (lastMsg?.is_own) {
    previewLabel = "Te";
    previewBody = lastMsg.body;
  } else if (lastMsg?.sender_role === "admin") {
    previewLabel = "Admin";
    previewBody = lastMsg.body;
  } else {
    previewLabel = otherName;
    previewBody = lastMsg?.body ?? "";
  }

  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-4 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {thread.hasUnread
            ? <Mail className="h-4 w-4 text-gray-500" />
            : <MailOpen className="h-4 w-4 text-gray-300" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-sm truncate ${thread.hasUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
              {thread.subject}
            </p>
            <span className="text-xs text-gray-400 shrink-0">{formatShort(thread.lastAt)}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">
            {previewLabel && <span className="text-gray-400">{previewLabel}: </span>}
            {previewBody}
          </p>
        </div>
        {thread.hasUnread && (
          <span className="w-2 h-2 rounded-full bg-[#F06C6C] shrink-0 mt-1.5" />
        )}
      </div>
    </button>
  );
}

// ─── Thread / chat view ─────────────────────────────────────────────────────

function ThreadChat({
  thread,
  userId,
  onBack,
  onDeleted,
  onUnreadMarked,
}: {
  thread: Thread;
  userId: string;
  onBack: () => void;
  onDeleted: (ids: string[]) => void;
  onUnreadMarked: (count: number) => void;
}) {
  const [replyBody, setReplyBody]         = useState("");
  const [sending, setSending]             = useState(false);
  const [sendError, setSendError]         = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [localMessages, setLocalMessages] = useState(thread.messages);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasSystemMessage = localMessages.some((m) => !m.is_own && isSystemMsg(m.body));
  const otherParticipant = localMessages.find((m) => !m.is_own);
  const recipientId = otherParticipant
    ? otherParticipant.sender_id
    : (localMessages[0]?.recipient_id ?? "");
  const firstMsg = localMessages[0];
  const isOutgoing = firstMsg?.is_own ?? false;
  const otherName = isOutgoing
    ? (firstMsg?.recipient_name ?? "Névtelen")
    : (otherParticipant?.sender_name ?? "Névtelen");
  const otherProviderId = isOutgoing
    ? (firstMsg?.recipient_provider_id ?? null)
    : (otherParticipant?.sender_provider_id ?? null);

  // ── Mark as read on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const unread = thread.messages.filter((m) => !m.read && !m.is_own);
    if (unread.length > 0) {
      Promise.all(unread.map((m) =>
        fetch(`/api/messages/${m.id}/read`, { method: "PATCH" })
      )).then(() => {
        onUnreadMarked(unread.length);
        window.dispatchEvent(new CustomEvent("messages-read"));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // ── Presence tracking ─────────────────────────────────────────────────────
  useEffect(() => {
    // thread.key = "normalizedSubject|otherUserId" — matches the server-side check
    const threadKey = thread.key;
    const pingPresence = () =>
      fetch("/api/messages/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_key: threadKey }),
      }).catch(() => {});

    pingPresence();
    const interval = setInterval(pingPresence, 60_000);

    return () => {
      clearInterval(interval);
      fetch("/api/messages/presence", { method: "DELETE", keepalive: true }).catch(() => {});
    };
  }, [thread.subject, userId]);

  // ── Realtime: new incoming messages ───────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`thread-${thread.key}-${userId}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${userId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const raw = payload.new;
          // Only handle messages that belong to this thread
          if (normalizeSubject(raw.subject) !== thread.subject) return;
          if (raw.sender_id !== recipientId) return;

          const newMsg: Message = {
            id:                   raw.id,
            sender_id:            raw.sender_id,
            recipient_id:         raw.recipient_id,
            sender_name:          otherName,
            sender_role:          "unknown",
            sender_provider_id:   otherProviderId,
            recipient_name:       null,
            recipient_role:       null,
            recipient_provider_id: null,
            is_own:               false,
            subject:              raw.subject,
            body:                 raw.body,
            read:                 false,
            created_at:           raw.created_at,
          };

          setLocalMessages((prev) => [...prev, newMsg]);
          // Auto-mark as read since we're looking at it, then update badge
          fetch(`/api/messages/${raw.id}/read`, { method: "PATCH" })
            .then(() => window.dispatchEvent(new CustomEvent("messages-read")))
            .catch(() => {});
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, thread.key, thread.subject, recipientId]);

  // ── Reply ──────────────────────────────────────────────────────────────────
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
          id:                   crypto.randomUUID(),
          sender_id:            userId,
          recipient_id:         recipientId,
          sender_name:          "Te",
          sender_role:          "self",
          sender_provider_id:   null,
          recipient_name:       otherName,
          recipient_role:       null,
          recipient_provider_id: null,
          is_own:               true,
          subject:              `Re: ${thread.subject}`,
          body:                 replyBody.trim(),
          read:                 true,
          created_at:           new Date().toISOString(),
        },
      ]);
      setReplyBody("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Hiba történt.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && replyBody.trim()) {
      e.preventDefault();
      handleReply(e as unknown as React.FormEvent);
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
    onBack();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Vissza</span>
        </button>
        <div className="h-4 w-px bg-gray-200 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{thread.subject}</p>
          <p className="text-xs text-gray-500 truncate">
            {isOutgoing ? "Címzett: " : "Feladó: "}
            {otherProviderId ? (
              <span
                className="text-[#84AAA6] hover:underline cursor-pointer"
                onClick={() => window.open(`/providers/${otherProviderId}`, "_blank")}
              >
                {otherName}
              </span>
            ) : otherName}
          </p>
        </div>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-[#F06C6C] hover:text-[#F06C6C]/70 transition-colors cursor-pointer shrink-0"
            title="Törlés"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-600">Biztosan törlöd?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-medium text-[#F06C6C] hover:text-[#F06C6C]/80 cursor-pointer disabled:opacity-50"
            >
              {deleting ? "..." : "Igen"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Mégse
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4 bg-gray-50">
        {localMessages.map((msg) =>
          isSystemMsg(msg.body) ? (
            <div key={msg.id} className="flex justify-center">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                <Info className="h-3 w-3 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">{systemText(msg.body)}</p>
              </div>
            </div>
          ) : (
            <div key={msg.id} className={`flex ${msg.is_own ? "justify-end" : "justify-start"}`}>
              <div className={`flex flex-col gap-1 max-w-[75%] ${msg.is_own ? "items-end" : "items-start"}`}>
                <div className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  msg.is_own
                    ? "bg-gray-200 text-gray-900 rounded-2xl rounded-tr-sm"
                    : "bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm"
                }`}>
                  {msg.body}
                </div>
                <span className="text-[10px] text-gray-400 px-1">{formatDate(msg.created_at)}</span>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply */}
      {!hasSystemMessage && recipientId && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
          <form onSubmit={handleReply} className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={replyBody}
              onChange={(e) => {
                setReplyBody(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Írj üzenetet… (Shift+Enter = új sor)"
              rows={1}
              className="flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#84AAA6] focus:border-[#84AAA6] transition-colors overflow-hidden"
              style={{ maxHeight: "120px" }}
            />
            <Button type="submit" size="sm" disabled={sending || !replyBody.trim()} className="shrink-0">
              <Send className="h-3.5 w-3.5 mr-1" />
              {sending ? "..." : "Küldés"}
            </Button>
          </form>
          {sendError && <p className="text-xs text-[#F06C6C] mt-1.5">{sendError}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Main section ────────────────────────────────────────────────────────────

export function MessagesSection({ userId, onUnreadChange }: Props) {
  const [messages, setMessages]             = useState<Message[]>([]);
  const [loading, setLoading]               = useState(true);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

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

  // Add/remove body class + scroll to top on desktop when entering chat
  useEffect(() => {
    if (selectedThread) {
      document.body.classList.add("chat-mode");
      // On desktop (sm+), scroll to top so the chat is fully visible
      if (window.innerWidth >= 640) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      document.body.classList.remove("chat-mode");
    }
    return () => { document.body.classList.remove("chat-mode"); };
  }, [selectedThread]);

  const threads = buildThreads(messages);

  const handleDeleted = (deletedIds: string[]) => {
    const next = messages.filter((m) => !deletedIds.includes(m.id));
    setMessages(next);
    onUnreadChange(next.filter((m) => !m.read && !m.is_own).length);
  };

  const handleUnreadMarked = (count: number) => {
    onUnreadChange(Math.max(0, messages.filter((m) => !m.read && !m.is_own).length - count));
  };

  if (loading) return <p className="text-base text-gray-500">Betöltés...</p>;

  // ── Chat view ──
  if (selectedThread) {
    return (
      /*
       * Mobile:  fixed full-screen overlay (z-100, covers navbar + footer)
       * Desktop: normal document flow with a minimum height
       */
      <div className="fixed sm:relative inset-0 sm:inset-auto z-[100] sm:z-auto flex flex-col bg-white sm:max-h-[680px]">

        {/* "Chat" page-header – mobile only */}
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-4 bg-[#84AAA6] sm:hidden">
          <h2 className="text-xl font-semibold text-white">Chat</h2>
        </div>

        {/* ThreadChat – fills remaining space between title and footer */}
        <ThreadChat
          thread={selectedThread}
          userId={userId}
          onBack={() => setSelectedThread(null)}
          onDeleted={handleDeleted}
          onUnreadMarked={handleUnreadMarked}
        />

        {/* Compact footer – mobile only, always at viewport bottom */}
        <div className="shrink-0 sm:hidden border-t border-gray-100 bg-gray-50 py-2.5 px-4">
          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Esküvőre Készülök. Minden jog fenntartva.
          </p>
        </div>
      </div>
    );
  }

  // ── Inbox view ──
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
        <Mail className="h-10 w-10 mb-3 text-gray-300" strokeWidth={1.5} />
        <p className="text-base">Még nem érkezett üzeneted.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {threads.map((thread) => (
        <InboxItem
          key={thread.key}
          thread={thread}
          onSelect={() => setSelectedThread(thread)}
        />
      ))}
    </div>
  );
}
