"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Mail, Trash2, Info, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/types";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  sender_role: string;
  sender_provider_id: string | null;
  sender_provider_categories: string[] | null;
  recipient_name: string | null;
  recipient_role: string | null;
  recipient_provider_id: string | null;
  recipient_provider_categories: string[] | null;
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
  category: string | null;
  providerLinkId: string | null;
  otherName: string;
  otherProviderId: string | null;
  recipientId: string;
  isOutgoing: boolean;
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
  const map = new Map<string, Omit<Thread, "category" | "providerLinkId" | "otherName" | "otherProviderId" | "recipientId" | "isOutgoing">>();
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
    .map((t) => {
      const sorted = t.messages.sort((a, b) => a.created_at.localeCompare(b.created_at));
      const firstMsg = sorted[0];
      const isOutgoing = firstMsg?.is_own ?? false;
      const incomingMsg = sorted.find(m => !m.is_own);

      const otherName = isOutgoing
        ? (firstMsg?.recipient_name ?? "")
        : (incomingMsg?.sender_name ?? "");
      const otherProviderId = isOutgoing
        ? (firstMsg?.recipient_provider_id ?? null)
        : (incomingMsg?.sender_provider_id ?? null);
      const recipientId = incomingMsg
        ? incomingMsg.sender_id
        : (sorted[0]?.recipient_id ?? "");
      const providerLinkId = otherProviderId;
      const category = isOutgoing
        ? ((firstMsg?.recipient_provider_categories ?? [])[0] ?? null)
        : ((incomingMsg?.sender_provider_categories ?? [])[0] ?? null);

      return { ...t, messages: sorted, category, providerLinkId, otherName, otherProviderId, recipientId, isOutgoing };
    });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("hu-HU", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatShort(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  if (now.toDateString() === date.toDateString())
    return date.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
  if ((now.getTime() - date.getTime()) / 86400000 < 7)
    return date.toLocaleDateString("hu-HU", { weekday: "short" });
  if (date.getFullYear() === now.getFullYear())
    return date.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
  return date.toLocaleDateString("hu-HU", { year: "2-digit", month: "short", day: "numeric" });
}

// ── InboxListItem ─────────────────────────────────────────────────────────────

function InboxListItem({
  subject, categoryLabel, recipientName, recipientHref, lastMessage, date, hasUnread, onSelect,
}: {
  subject: string; categoryLabel: string | null; recipientName: string; recipientHref: string | null;
  lastMessage: string; date: string; hasUnread: boolean; onSelect: () => void;
}) {
  return (
    <button onClick={onSelect} className="w-full text-left px-4 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0">
          <Mail className={`h-4 w-4 ${hasUnread ? "text-[#84AAA6]" : "text-gray-300"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-sm truncate ${hasUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>{subject}</p>
            <span className="text-xs text-gray-400 shrink-0">{formatShort(date)}</span>
          </div>
          {categoryLabel && <p className="text-xs text-[#84AAA6] truncate mb-0.5">{categoryLabel}</p>}
          {recipientHref ? (
            <a href={recipientHref} onClick={(e) => e.stopPropagation()} className="text-xs text-gray-500 hover:text-[#84AAA6] hover:underline truncate block mb-0.5 transition-colors">{recipientName}</a>
          ) : (
            <p className="text-xs text-gray-500 truncate mb-0.5">{recipientName}</p>
          )}
          <p className="text-xs text-gray-400 truncate">{lastMessage}</p>
        </div>
        {hasUnread && <span className="w-2 h-2 rounded-full bg-[#F06C6C] shrink-0 mt-1.5" />}
      </div>
    </button>
  );
}

// ── MessageChat ───────────────────────────────────────────────────────────────

function MessageChat({
  thread, onBack, onDeleted,
}: {
  thread: Thread; onBack: () => void; onDeleted: (ids: string[]) => void;
}) {
  const [localMessages, setLocalMessages] = useState(thread.messages);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasSystemMessage = localMessages.some(m => !m.is_own && isSystemMsg(m.body));
  const { otherName, otherProviderId, recipientId, providerLinkId } = thread;

  // Mark unread on mount
  useEffect(() => {
    const unread = thread.messages.filter(m => !m.read && !m.is_own);
    if (unread.length > 0) {
      Promise.all(unread.map(m => fetch(`/api/messages/${m.id}/read`, { method: "PATCH" }))).then(() => {
        window.dispatchEvent(new CustomEvent("messages-read"));
      }).catch(() => {});
    }
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !recipientId) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: recipientId, subject: `Re: ${thread.subject}`, body: replyBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      setLocalMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        sender_id: "self",
        recipient_id: recipientId,
        sender_name: "Te",
        sender_role: "self",
        sender_provider_id: null,
        sender_provider_categories: null,
        recipient_name: otherName,
        recipient_role: null,
        recipient_provider_id: otherProviderId,
        recipient_provider_categories: null,
        is_own: true,
        subject: `Re: ${thread.subject}`,
        body: replyBody.trim(),
        read: false,
        created_at: new Date().toISOString(),
      }]);
      setReplyBody("");
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Hiba történt.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const ids = thread.messages.map(m => m.id);
    await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    onDeleted(ids);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col sm:relative sm:inset-auto sm:z-auto">
      {/* Mobile: teal header */}
      <div className="flex items-center px-4 py-3 bg-[#84AAA6] text-white shrink-0 sm:hidden">
        <button onClick={onBack} className="text-white cursor-pointer shrink-0"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1 min-w-0 px-3">
          <h2 className="text-base font-semibold text-center truncate">Chat</h2>
          <p className="text-xs text-white/80 text-center truncate">{thread.subject} · {otherName}</p>
        </div>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="text-white/80 hover:text-white cursor-pointer shrink-0"><Trash2 className="h-4 w-4" /></button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleDelete} disabled={deleting} className="text-xs font-medium text-white cursor-pointer disabled:opacity-50">{deleting ? "..." : "Törlés"}</button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-white/70 hover:text-white cursor-pointer">Mégse</button>
          </div>
        )}
      </div>

      {/* Desktop: header */}
      <div className="hidden sm:flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />Vissza
        </button>
        <div className="flex-1 min-w-0 ml-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{thread.subject}</p>
          {providerLinkId ? (
            <a href={`/providers/${providerLinkId}`} className="text-xs text-[#84AAA6] hover:underline">{otherName}</a>
          ) : (
            <p className="text-xs text-gray-500">{otherName}</p>
          )}
        </div>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#F06C6C] transition-colors cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />Törlés
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} disabled={deleting} className="text-sm font-medium text-[#F06C6C] cursor-pointer disabled:opacity-50">{deleting ? "Törlés..." : "Igen, törlöm"}</button>
            <button onClick={() => setConfirmDelete(false)} className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer">Mégse</button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {localMessages.map(msg =>
          (!msg.is_own && isSystemMsg(msg.body)) ? (
            <div key={msg.id} className="flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2.5">
              <Info className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 italic">{systemText(msg.body)}</p>
            </div>
          ) : (
            <div key={msg.id} className={`flex flex-col ${msg.is_own ? "items-end" : "items-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${msg.is_own ? "bg-[#84AAA6] text-white" : "bg-gray-100 text-gray-900"}`}>
                <p className="text-sm whitespace-pre-line">{msg.body}</p>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1">{formatDate(msg.created_at)}</span>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply */}
      {!hasSystemMessage && recipientId && (
        <div className="border-t border-gray-200 px-4 py-3 bg-white shrink-0">
          <form onSubmit={handleReply} className="flex gap-2 items-end">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Üzenet..."
              rows={2}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#84AAA6] transition-colors"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (replyBody.trim()) handleReply(e as unknown as React.FormEvent); } }}
            />
            <Button type="submit" size="sm" disabled={sending || !replyBody.trim()} className="shrink-0 h-10">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {sendError && <p className="text-xs text-[#F06C6C] mt-1">{sendError}</p>}
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

type MessageView = { mode: "list" } | { mode: "chat"; thread: Thread };
type MessageTab = "bejovo" | "kimenő";

export function MessagesSection({ onUnreadChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<MessageView>({ mode: "list" });
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [tab, setTab] = useState<MessageTab>("bejovo");

  const loadMessages = useCallback(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data: Message[]) => {
        setMessages(data);
        onUnreadChange(data.filter((m) => !m.read && !m.is_own).length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [onUnreadChange]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const threads = buildThreads(messages);

  const handleDeleted = (deletedIds: string[]) => {
    const next = messages.filter((m) => !deletedIds.includes(m.id));
    setMessages(next);
    onUnreadChange(next.filter((m) => !m.read && !m.is_own).length);
    setView({ mode: "list" });
  };

  if (loading) return <p className="text-base text-gray-500">Betöltés...</p>;

  // Chat view
  if (view.mode === "chat") {
    return (
      <MessageChat
        thread={view.thread}
        onBack={() => { setView({ mode: "list" }); loadMessages(); }}
        onDeleted={handleDeleted}
      />
    );
  }

  const incomingThreads = threads.filter(t => !t.isOutgoing);
  const outgoingThreads = threads.filter(t => t.isOutgoing);
  const tabThreads = tab === "bejovo" ? incomingThreads : outgoingThreads;

  // Empty state (no messages at all)
  if (threads.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex border-b border-gray-200">
          {(["bejovo", "kimenő"] as MessageTab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setFilterCategory(null); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                tab === t ? "border-[#84AAA6] text-[#84AAA6]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "bejovo" ? "Beérkező" : "Elküldött"}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
          <Mail className="h-10 w-10 mb-3 text-gray-300" strokeWidth={1.5} />
          <p className="text-base">Még nem érkezett üzeneted.</p>
        </div>
      </div>
    );
  }

  // Category filter (from current tab's threads)
  const categories = [...new Set(tabThreads.map(t => t.category).filter(Boolean))] as string[];
  const visibleThreads = filterCategory ? tabThreads.filter(t => t.category === filterCategory) : tabThreads;

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(["bejovo", "kimenő"] as MessageTab[]).map((t) => {
          const count = t === "bejovo" ? incomingThreads.filter(th => th.hasUnread).length : 0;
          return (
            <button
              key={t}
              onClick={() => { setTab(t); setFilterCategory(null); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                tab === t ? "border-[#84AAA6] text-[#84AAA6]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "bejovo" ? "Beérkező" : "Elküldött"}
              {count > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCategory === null ? "bg-[#84AAA6] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Összes
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(c => c === cat ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCategory === cat ? "bg-[#84AAA6] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
            </button>
          ))}
        </div>
      )}

      {visibleThreads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
          <Mail className="h-10 w-10 mb-3 text-gray-300" strokeWidth={1.5} />
          <p className="text-base">{tab === "bejovo" ? "Még nem érkezett üzeneted." : "Még nem küldtél üzenetet."}</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y-0">
          {visibleThreads.map((thread) => {
            const lastMsg = thread.messages[thread.messages.length - 1];
            const lastText = lastMsg
              ? (isSystemMsg(lastMsg.body) ? "Rendszerüzenet" : lastMsg.body)
              : "";
            const categoryLabel = thread.category
              ? (CATEGORY_LABELS[thread.category as keyof typeof CATEGORY_LABELS] ?? thread.category)
              : null;
            return (
              <InboxListItem
                key={thread.key}
                subject={thread.subject}
                categoryLabel={categoryLabel}
                recipientName={thread.otherName}
                recipientHref={thread.providerLinkId ? `/providers/${thread.providerLinkId}` : null}
                lastMessage={lastText}
                date={thread.lastAt}
                hasUnread={thread.hasUnread}
                onSelect={() => setView({ mode: "chat", thread })}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
