"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Heart, MessageCircle, Send, Trash2, Info, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS, COUNTIES } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatProvider {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  categories: string[];
  counties: string[];
  average_rating: number | null;
  review_count: number | null;
  featured: boolean;
  is_favorite: boolean;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  sender_role: string;
  sender_provider_id: string | null;
  sender_avatar_url: string | null;
  recipient_name: string | null;
  recipient_role: string | null;
  recipient_provider_id: string | null;
  recipient_avatar_url: string | null;
  is_own: boolean;
  subject: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface ChatThread {
  otherUserId: string;
  otherName: string;
  otherAvatarUrl: string | null;
  messages: ChatMessage[];
  lastAt: string;
  hasUnread: boolean;
}

interface Props {
  userId: string;
}

type Tab = "providers" | "conversations";

// ── Helpers ───────────────────────────────────────────────────────────────────

const SYSTEM_PREFIX = "__SYSTEM__:";
const isSystemMsg = (b: string) => b.startsWith(SYSTEM_PREFIX);
const systemText  = (b: string) => b.slice(SYSTEM_PREFIX.length);

function normalizeSubject(s: string) {
  return s.replace(/^(Re:\s*)+/i, "").trim();
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
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}

function buildThreads(messages: ChatMessage[], providerUserIds: Set<string>): ChatThread[] {
  const filtered = messages
    .filter((m) => !(m.is_own && isSystemMsg(m.body)))
    .filter((m) => {
      const otherId = m.is_own ? m.recipient_id : m.sender_id;
      // Include if other party is in active providers list OR has a provider role
      const otherIsProvider = m.is_own
        ? (m.recipient_role === "provider" || m.recipient_provider_id !== null)
        : (m.sender_role === "provider" || m.sender_provider_id !== null);
      return providerUserIds.has(otherId) || otherIsProvider;
    });

  const map = new Map<string, ChatThread>();
  for (const msg of filtered) {
    const otherId = msg.is_own ? msg.recipient_id : msg.sender_id;
    if (!map.has(otherId)) {
      map.set(otherId, {
        otherUserId: otherId,
        otherName: msg.is_own ? (msg.recipient_name ?? "Névtelen") : msg.sender_name,
        otherAvatarUrl: msg.is_own ? msg.recipient_avatar_url : msg.sender_avatar_url,
        messages: [],
        lastAt: msg.created_at,
        hasUnread: false,
      });
    }
    const t = map.get(otherId)!;
    t.messages.push(msg);
    if (msg.created_at > t.lastAt) t.lastAt = msg.created_at;
    if (!msg.read && !msg.is_own) t.hasUnread = true;
  }
  return [...map.values()]
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
    .map((t) => ({ ...t, messages: t.messages.sort((a, b) => a.created_at.localeCompare(b.created_at)) }));
}

// ── StarRating ────────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number | null; count?: number | null }) {
  if (!rating) return <span className="text-xs text-gray-400">Nincs értékelés</span>;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5 flex-wrap">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="h-3 w-3 shrink-0"
          fill={i <= full ? "#f59e0b" : i === full + 1 && half ? "#f59e0b" : "none"}
          stroke="#f59e0b"
          strokeWidth={1.5}
          strokeOpacity={i <= full || (i === full + 1 && half) ? 1 : 0.4}
        />
      ))}
      <span className="text-xs text-gray-500 ml-0.5">{rating.toFixed(1)}</span>
      {count != null && count > 0 && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </span>
  );
}

// ── ProviderRow ───────────────────────────────────────────────────────────────

function ProviderRow({
  provider,
  onChat,
  onToggleFavorite,
}: {
  provider: ChatProvider;
  onChat: () => void;
  onToggleFavorite: () => void;
}) {
  const initials = provider.full_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const categoryLabel = provider.categories
    .map((c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c)
    .join(", ");

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
        {provider.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={provider.avatar_url}
            alt={provider.full_name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Name + category (+ rating on mobile) */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{provider.full_name}</p>
          {provider.featured && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5 shrink-0">
              Kiemelt
            </span>
          )}
        </div>
        {categoryLabel && (
          <p className="text-xs text-[#84AAA6] truncate mt-0.5">{categoryLabel}</p>
        )}
        {/* Rating: visible only on mobile (hidden on sm+) */}
        <div className="mt-1 sm:hidden">
          <StarRating rating={provider.average_rating} count={provider.review_count} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Rating: visible only on desktop */}
        <div className="hidden sm:block">
          <StarRating rating={provider.average_rating} count={provider.review_count} />
        </div>
        <button
          onClick={onToggleFavorite}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          title={provider.is_favorite ? "Eltávolítás a kedvencekből" : "Hozzáadás a kedvencekhez"}
        >
          <Heart
            className="h-4 w-4"
            fill={provider.is_favorite ? "#F06C6C" : "none"}
            stroke={provider.is_favorite ? "#F06C6C" : "#9CA3AF"}
            strokeWidth={1.5}
          />
        </button>
        <Button size="sm" onClick={onChat} className="text-xs whitespace-nowrap">
          <MessageCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
          Chat
        </Button>
      </div>
    </div>
  );
}

// ── ConversationRow ───────────────────────────────────────────────────────────

function ConversationRow({
  thread,
  onSelect,
}: {
  thread: ChatThread;
  onSelect: () => void;
}) {
  const initials = thread.otherName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const lastMsg = thread.messages[thread.messages.length - 1];

  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-4 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
          {thread.otherAvatarUrl
            ? <img src={thread.otherAvatarUrl} alt={thread.otherName} className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-sm font-bold truncate ${thread.hasUnread ? "text-gray-900" : "text-gray-700"}`}>
              {thread.otherName}
            </p>
            <span className="text-xs text-gray-400 shrink-0">{formatShort(thread.lastAt)}</span>
          </div>
          {lastMsg && (
            <p className={`text-xs truncate ${thread.hasUnread ? "font-semibold text-gray-700" : "text-gray-500"}`}>
              {lastMsg.is_own ? "Te: " : ""}{isSystemMsg(lastMsg.body) ? systemText(lastMsg.body) : lastMsg.body}
            </p>
          )}
        </div>
        {thread.hasUnread && (
          <span className="w-2.5 h-2.5 rounded-full bg-[#F06C6C] shrink-0" />
        )}
      </div>
    </button>
  );
}

// ── ChatView ──────────────────────────────────────────────────────────────────

function ChatView({
  provider,
  userId,
  initialMessages,
  onBack,
  onMessagesUpdated,
}: {
  provider: ChatProvider;
  userId: string;
  initialMessages: ChatMessage[];
  onBack: () => void;
  onMessagesUpdated: () => void;
}) {
  const [messages, setMessages]           = useState(initialMessages);
  const [replyBody, setReplyBody]         = useState("");
  const [sending, setSending]             = useState(false);
  const [sendError, setSendError]         = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasSystemMessage = messages.some((m) => !m.is_own && isSystemMsg(m.body));
  const initials = provider.full_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll top on desktop when chat opens
  useEffect(() => {
    if (window.innerWidth >= 640) {
      setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }), 0);
    }
    document.body.classList.add("chat-mode");
    return () => { document.body.classList.remove("chat-mode"); };
  }, []);

  // Mark unread on mount
  useEffect(() => {
    const unread = initialMessages.filter((m) => !m.read && !m.is_own);
    if (unread.length > 0) {
      Promise.all(unread.map((m) =>
        fetch(`/api/messages/${m.id}/read`, { method: "PATCH" })
      )).then(() => {
        window.dispatchEvent(new CustomEvent("messages-read"));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase
      .channel(`chat-view-${provider.user_id}-${userId}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` },
        () => {
          fetch("/api/messages")
            .then((r) => r.json())
            .then((all: ChatMessage[]) => {
              const filtered = all
                .filter((m) => !(m.is_own && isSystemMsg(m.body)))
                .filter((m) => (m.is_own ? m.recipient_id : m.sender_id) === provider.user_id)
                .sort((a, b) => a.created_at.localeCompare(b.created_at));
              setMessages(filtered);
              const unread = filtered.filter((m) => !m.read && !m.is_own);
              if (unread.length > 0) {
                Promise.all(unread.map((m) =>
                  fetch(`/api/messages/${m.id}/read`, { method: "PATCH" })
                )).then(() => window.dispatchEvent(new CustomEvent("messages-read")));
              }
            })
            .catch(() => {});
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider.user_id, userId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const isFirst = messages.length === 0;
      const lastSubject = messages[messages.length - 1]?.subject ?? `Chat – ${provider.full_name}`;
      const subject = isFirst
        ? `Chat – ${provider.full_name}`
        : `Re: ${normalizeSubject(lastSubject)}`;
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: provider.user_id, subject, body: replyBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender_id: userId,
          recipient_id: provider.user_id,
          sender_name: "Te",
          sender_role: "self",
          sender_provider_id: null,
          sender_avatar_url: null,
          recipient_name: provider.full_name,
          recipient_role: "provider",
          recipient_provider_id: provider.id || null,
          recipient_avatar_url: provider.avatar_url,
          is_own: true,
          subject,
          body: replyBody.trim(),
          read: true,
          created_at: new Date().toISOString(),
        },
      ]);
      setReplyBody("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onMessagesUpdated();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Hiba történt.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && replyBody.trim()) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const ids = messages.map((m) => m.id);
    if (ids.length > 0) {
      await fetch("/api/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    }
    onMessagesUpdated();
    onBack();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white sm:relative sm:inset-auto sm:z-auto sm:h-[680px]">

      {/* Mobile header */}
      <div className="flex items-center px-4 py-3 bg-[#84AAA6] text-white shrink-0 sm:hidden">
        <button onClick={onBack} className="text-white cursor-pointer shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0 px-3">
          <h2 className="text-base font-semibold text-center truncate">{provider.full_name}</h2>
        </div>
        {!confirmDelete ? (
          messages.length > 0 && (
            <button onClick={() => setConfirmDelete(true)} className="text-white/80 hover:text-white cursor-pointer shrink-0">
              <Trash2 className="h-4 w-4" />
            </button>
          )
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleDelete} disabled={deleting} className="text-xs font-medium text-white cursor-pointer disabled:opacity-50">
              {deleting ? "..." : "Törlés"}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-white/70 hover:text-white cursor-pointer">Mégse</button>
          </div>
        )}
      </div>

      {/* Desktop header */}
      <div className="hidden sm:flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer shrink-0">
          <ArrowLeft className="h-4 w-4" />
          <span>Vissza</span>
        </button>
        <div className="h-4 w-px bg-gray-200 shrink-0" />
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
          {provider.avatar_url
            ? <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{provider.full_name}</p>
          {provider.categories.length > 0 && (
            <p className="text-xs text-[#84AAA6] truncate">
              {provider.categories.map((c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c).join(", ")}
            </p>
          )}
        </div>
        {!confirmDelete ? (
          messages.length > 0 && (
            <button onClick={() => setConfirmDelete(true)} className="text-[#F06C6C] hover:text-[#F06C6C]/70 transition-colors cursor-pointer shrink-0" title="Törlés">
              <Trash2 className="h-4 w-4" />
            </button>
          )
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-600">Biztosan törlöd?</span>
            <button onClick={handleDelete} disabled={deleting} className="text-xs font-medium text-[#F06C6C] cursor-pointer disabled:opacity-50">
              {deleting ? "..." : "Igen"}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Mégse</button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <MessageCircle className="h-12 w-12 mb-3 text-gray-200" strokeWidth={1} />
            <p className="text-sm font-medium text-gray-500">Kezdd el a beszélgetést!</p>
            <p className="text-xs mt-1">Írd meg az első üzeneted {provider.full_name} részére.</p>
          </div>
        )}
        {messages.map((msg) =>
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
      {!hasSystemMessage && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
          <form onSubmit={handleSend} className="flex gap-2 items-end">
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

// ── Main section ──────────────────────────────────────────────────────────────

export function ChatSection({ userId }: Props) {
  const [tab, setTab]                       = useState<Tab>("providers");
  const [providers, setProviders]           = useState<ChatProvider[]>([]);
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [loading, setLoading]               = useState(true);
  const [searchQuery, setSearchQuery]       = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCounty, setFilterCounty]     = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ChatProvider | null>(null);

  const providerUserIds = new Set(providers.map((p) => p.user_id));
  const threads = buildThreads(messages, providerUserIds);
  const unreadConversations = threads.filter((t) => t.hasUnread).length;

  const loadAll = useCallback(() => {
    Promise.all([
      fetch("/api/chat/providers").then((r) => r.json()),
      fetch("/api/messages").then((r) => r.json()),
    ]).then(([provs, msgs]) => {
      if (Array.isArray(provs)) setProviders(provs);
      if (Array.isArray(msgs)) setMessages(msgs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Reload when a message is read or new messages arrive
  useEffect(() => {
    const handler = () => {
      fetch("/api/messages").then((r) => r.json()).then((msgs) => {
        if (Array.isArray(msgs)) setMessages(msgs);
      }).catch(() => {});
    };
    window.addEventListener("messages-unread-count", handler);
    window.addEventListener("messages-read", handler);
    return () => {
      window.removeEventListener("messages-unread-count", handler);
      window.removeEventListener("messages-read", handler);
    };
  }, []);

  const handleToggleFavorite = async (provider: ChatProvider) => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_id: provider.id }),
    });
    const data = await res.json();
    if (res.ok) {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === provider.id ? { ...p, is_favorite: data.action === "added" } : p
        )
      );
    }
  };

  const openChat = (provider: ChatProvider) => {
    setSelectedProvider(provider);
  };

  const openChatFromThread = (thread: ChatThread) => {
    const prov = providers.find((p) => p.user_id === thread.otherUserId);
    setSelectedProvider(prov ?? {
      id: "",
      user_id: thread.otherUserId,
      full_name: thread.otherName,
      avatar_url: thread.otherAvatarUrl,
      categories: [],
      counties: [],
      average_rating: null,
      review_count: null,
      featured: false,
      is_favorite: false,
    });
  };

  // ── Chat view ──
  if (selectedProvider) {
    const providerMessages = messages
      .filter((m) => !(m.is_own && isSystemMsg(m.body)))
      .filter((m) => (m.is_own ? m.recipient_id : m.sender_id) === selectedProvider.user_id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    return (
      <ChatView
        provider={selectedProvider}
        userId={userId}
        initialMessages={providerMessages}
        onBack={() => { setSelectedProvider(null); loadAll(); }}
        onMessagesUpdated={loadAll}
      />
    );
  }

  if (loading) return <p className="text-base text-gray-500">Betöltés...</p>;

  // ── Filtered provider list ──
  const allCategories = [...new Set(providers.flatMap((p) => p.categories))].sort();
  const allCounties = COUNTIES.filter((c) => c !== "Országosan");
  const visibleProviders = providers.filter((p) => {
    if (filterCategory && !p.categories.includes(filterCategory)) return false;
    if (filterCounty && !p.counties.includes(filterCounty) && !p.counties.includes("Országosan")) return false;
    if (searchQuery.trim() && !p.full_name.toLowerCase().includes(searchQuery.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab("providers")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === "providers"
              ? "border-[#84AAA6] text-[#84AAA6]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Szolgáltatók
        </button>
        <button
          onClick={() => setTab("conversations")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === "conversations"
              ? "border-[#84AAA6] text-[#84AAA6]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Beszélgetések
          {unreadConversations > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadConversations > 9 ? "9+" : unreadConversations}
            </span>
          )}
        </button>
      </div>

      {/* ── Providers tab ── */}
      {tab === "providers" && (
        <div className="space-y-3">
          {/* Search + dropdowns */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keresés neve alapján…"
                className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#84AAA6] focus:border-[#84AAA6] transition-colors bg-white"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-10 px-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#84AAA6] focus:border-[#84AAA6] transition-colors cursor-pointer"
            >
              <option value="">Összes kategória</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                </option>
              ))}
            </select>
            <select
              value={filterCounty}
              onChange={(e) => setFilterCounty(e.target.value)}
              className="h-10 px-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#84AAA6] focus:border-[#84AAA6] transition-colors cursor-pointer"
            >
              <option value="">Összes megye</option>
              {allCounties.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* List */}
          {visibleProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <Search className="h-10 w-10 mb-3 text-gray-200" />
              <p className="text-sm">Nincs találat.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              {visibleProviders.map((p) => (
                <ProviderRow
                  key={p.id}
                  provider={p}
                  onChat={() => openChat(p)}
                  onToggleFavorite={() => handleToggleFavorite(p)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Conversations tab ── */}
      {tab === "conversations" && (
        <>
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <MessageCircle className="h-10 w-10 mb-3 text-gray-200" strokeWidth={1} />
              <p className="text-sm">Még nincs aktív chat.</p>
              <p className="text-xs mt-1">Indíts beszélgetést a Szolgáltatók fülről.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              {threads.map((t) => (
                <ConversationRow
                  key={t.otherUserId}
                  thread={t}
                  onSelect={() => openChatFromThread(t)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
