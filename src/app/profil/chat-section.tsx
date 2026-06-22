"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Heart, MessageCircle, Send, Trash2, Info, Star, Search, ChevronDown, MapPin, X, Loader2, FileText, SlidersHorizontal } from "lucide-react";
import { QuoteChat, ProviderChatLoader, type VisitorChat, type ProviderRequest } from "./quote-requests-section";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS, COUNTIES } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  featured: "teal" | "silver" | "gold" | null | boolean;
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
  read_at?: string | null;
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
  isProvider?: boolean;
  withProviderUserId?: string;
}

type SelectedView =
  | { kind: "chat"; provider: ChatProvider }
  | { kind: "quote-visitor"; chat: VisitorChat }
  | { kind: "quote-provider"; req: ProviderRequest };

const PROVIDERS_PER_PAGE = 10;

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

function buildThreads(messages: ChatMessage[]): ChatThread[] {
  const filtered = messages.filter((m) => !(m.is_own && isSystemMsg(m.body)));

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

// ── ChatSelect ────────────────────────────────────────────────────────────────

function ChatSelect({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery]   = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const filtered = searchable && query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setQuery(""); }}
        className="h-10 w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 cursor-pointer hover:border-[#84AAA6] transition-colors"
      >
        <span className="flex items-center gap-1.5 truncate">
          <span className="text-gray-500 shrink-0">Szűrés:</span>
          <span className={cn("truncate", selectedLabel ? "text-[#84AAA6]" : "text-gray-500")}>
            {selectedLabel ?? placeholder}
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Keresés..."
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#84AAA6]"
                />
              </div>
            </div>
          )}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setQuery(""); }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer",
                !value ? "bg-[#84AAA6] text-white font-medium" : "text-gray-900 hover:bg-gray-100"
              )}
            >
              {placeholder}
            </button>
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer",
                  value === o.value ? "bg-[#84AAA6] text-white font-medium" : "text-gray-900 hover:bg-gray-100"
                )}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">Nincs találat</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
  onToggleFavorite: () => Promise<void>;
}) {
  const [toggling, setToggling] = useState(false);
  const initials = provider.full_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const handleFavorite = async () => {
    if (toggling) return;
    setToggling(true);
    try { await onToggleFavorite(); } finally { setToggling(false); }
  };
  const categoryLabel = provider.categories
    .map((c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c)
    .join(", ");

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors${provider.featured === "gold" ? " border-l-2 border-l-amber-400" : provider.featured === "silver" ? " border-l-2 border-l-slate-400" : provider.featured === "teal" ? " border-l-2 border-l-[#84AAA6]" : ""}`}>
      {/* Avatar */}
      <a href={`/providers/${provider.id}`} className="shrink-0">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
          <span className="absolute inset-0 flex items-center justify-center select-none">{initials}</span>
          {provider.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.avatar_url ?? ""}
              alt={provider.full_name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </div>
      </a>

      {/* Name + category (+ rating on mobile) */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <a href={`/providers/${provider.id}`} className="text-sm font-semibold text-gray-900 truncate hover:text-[#84AAA6] transition-colors">{provider.full_name}</a>
          {provider.featured && (
            <span className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 shrink-0 border${provider.featured === "silver" ? " text-slate-600 bg-slate-50 border-slate-200" : provider.featured === "teal" ? " text-[#5C8480] bg-[#84AAA6]/10 border-[#84AAA6]/40" : " text-amber-600 bg-amber-50 border-amber-200"}`}>
              Kiemelt
            </span>
          )}
        </div>
        {categoryLabel && (
          <p className="text-xs text-[#84AAA6] truncate mt-0.5">{categoryLabel}</p>
        )}
        {provider.counties.length > 0 && (
          <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {provider.counties[0]}
              {provider.counties.length > 1 && ` +${provider.counties.length - 1}`}
            </span>
          </p>
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
          onClick={handleFavorite}
          disabled={toggling}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-default"
          title={provider.is_favorite ? "Eltávolítás a kedvencekből" : "Hozzáadás a kedvencekhez"}
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Heart
              className="h-4 w-4"
              fill={provider.is_favorite ? "#F06C6C" : "none"}
              stroke={provider.is_favorite ? "#F06C6C" : "#9CA3AF"}
              strokeWidth={1.5}
            />
          )}
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

// ── QuoteConvRow ──────────────────────────────────────────────────────────────

function QuoteConvRow({
  name,
  avatarUrl,
  subject,
  categoryLabel,
  lastAt,
  unread,
  lastMsg,
  lastMsgIsOwn,
  onSelect,
}: {
  name: string;
  avatarUrl: string | null | undefined;
  subject: string;
  categoryLabel: string;
  lastAt: string;
  unread: number;
  lastMsg?: string | null;
  lastMsgIsOwn?: boolean;
  onSelect: () => void;
}) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const preview = lastMsg ?? subject;
  const previewIsOwn = lastMsg ? lastMsgIsOwn : false;
  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-4 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
          {avatarUrl
            ? <img src={avatarUrl ?? ""} alt={name} className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-sm font-bold truncate ${unread > 0 ? "text-gray-900" : "text-gray-700"}`}>{name}</p>
            <span className="text-xs text-gray-400 shrink-0">{formatShort(lastAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#84AAA6] bg-[#84AAA6]/10 rounded px-1.5 py-0.5 shrink-0">
              <FileText className="h-2.5 w-2.5" />
              Ajánlatkérés
            </span>
            <p className="text-xs text-gray-400 truncate">{categoryLabel}</p>
          </div>
          <p className={`text-xs truncate ${unread > 0 ? "font-semibold text-gray-700" : "text-gray-500"}`}>
            {previewIsOwn ? "Te: " : ""}{isSystemMsg(preview) ? systemText(preview) : preview}
          </p>
        </div>
        {unread > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {unread > 9 ? "9+" : unread}
          </span>
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
  const [showInfoBar, setShowInfoBar] = useState(true);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const markedAsReadRef = useRef(new Set<string>());
  const hasSystemMessage = messages.some((m) => !m.is_own && isSystemMsg(m.body));
  const initials = provider.full_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  // Two messages belong to the same visual group if same sender and sent within
  // 5 minutes of each other (so consecutive bursts share one timestamp + avatar).
  const inSameGroup = (a?: ChatMessage, b?: ChatMessage) =>
    !!a && !!b && !isSystemMsg(a.body) && !isSystemMsg(b.body) &&
    a.is_own === b.is_own &&
    Math.abs(new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) <= 5 * 60 * 1000;

  // Scroll to bottom on new messages — on desktop scroll only the inner container
  useEffect(() => {
    if (window.innerWidth >= 640) {
      const el = scrollAreaRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Lock body scroll on mobile via chat-mode class; desktop is fixed-height so no page scroll needed
  useEffect(() => {
    document.body.classList.add("chat-mode");
    return () => { document.body.classList.remove("chat-mode"); };
  }, []);

  // Mobile: resize container to match visual viewport so keyboard doesn't hide input
  useEffect(() => {
    if (window.innerWidth >= 640) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      el.style.top    = `${vv.offsetTop}px`;
      el.style.height = `${vv.height}px`;
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // Mark unread — runs whenever messages updates so it catches messages loaded after mount
  useEffect(() => {
    const unread = messages.filter((m) => !m.read && !m.is_own && !markedAsReadRef.current.has(m.id));
    if (unread.length === 0) return;
    unread.forEach((m) => markedAsReadRef.current.add(m.id));
    Promise.all(unread.map((m) =>
      fetch(`/api/messages/${m.id}/read`, { method: "PATCH" })
    )).then(() => {
      window.dispatchEvent(new CustomEvent("messages-read"));
    });
  }, [messages]);

  // Realtime subscription — INSERT for incoming messages, UPDATE for read receipts
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const reload = () => {
      fetch("/api/messages")
        .then((r) => r.json())
        .then((all: ChatMessage[]) => {
          const filtered = all
            .filter((m) => !(m.is_own && isSystemMsg(m.body)))
            .filter((m) => (m.is_own ? m.recipient_id : m.sender_id) === provider.user_id)
            .sort((a, b) => a.created_at.localeCompare(b.created_at));
          setMessages(filtered);
        })
        .catch(() => {});
    };
    const channel = supabase
      .channel(`chat-view-${provider.user_id}-${userId}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` },
        reload
      )
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "messages", filter: `sender_id=eq.${userId}` },
        reload
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider.user_id, userId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = replyBody.trim();
    if (!body) return;

    // Clear input and keep focus BEFORE the await so keyboard stays open on mobile
    setReplyBody("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }

    const isFirst = messages.length === 0;
    const lastSubject = messages[messages.length - 1]?.subject ?? `Chat – ${provider.full_name}`;
    const subject = isFirst
      ? `Chat – ${provider.full_name}`
      : `Re: ${normalizeSubject(lastSubject)}`;

    // Optimistic message
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
        body,
        read: true,
        created_at: new Date().toISOString(),
      },
    ]);

    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: provider.user_id, subject, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      onMessagesUpdated();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Hiba történt.");
      setReplyBody(body); // restore on failure
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

  // Only show read receipt on the last own sent message that has been read
  let lastReadOwnId: string | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.is_own && m.read && m.read_at) { lastReadOwnId = m.id; break; }
  }

  return (
    <div ref={containerRef} className="fixed inset-x-0 top-0 z-[100] flex flex-col bg-white h-[100dvh] sm:relative sm:inset-auto sm:z-auto sm:h-[680px]">

      {/* Mobile header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#84AAA6] text-white shrink-0 sm:hidden">
        <button onClick={onBack} className="text-white cursor-pointer shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/30 flex items-center justify-center text-xs font-semibold text-white shrink-0">
          {provider.avatar_url
            ? <img src={provider.avatar_url ?? ""} alt={provider.full_name} className="w-full h-full object-cover" />
            : initials}
        </div>
        <p className="flex-1 min-w-0 text-sm font-semibold text-white truncate">{provider.full_name}</p>
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
            ? <img src={provider.avatar_url ?? ""} alt={provider.full_name} className="w-full h-full object-cover" />
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

      {/* Pinned info bar */}
      {showInfoBar && (provider.categories.length > 0 || provider.counties.length > 0) && (
        <div className="shrink-0 border-b border-yellow-200 bg-yellow-50 px-4 py-2.5 flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-0.5">
            {provider.id ? (
              <a href={`/providers/${provider.id}`} className="text-sm font-semibold text-gray-900 hover:text-[#84AAA6] transition-colors">
                {provider.full_name}
              </a>
            ) : (
              <p className="text-sm font-semibold text-gray-900">{provider.full_name}</p>
            )}
            {provider.categories.length > 0 && (
              <p className="text-xs text-[#84AAA6]">
                {provider.categories.map((c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c).join(", ")}
              </p>
            )}
            {provider.counties.length > 0 && (
              <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                {provider.counties.join(", ")}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowInfoBar(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0 mt-0.5"
            title="Bezárás"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollAreaRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-5 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <MessageCircle className="h-12 w-12 mb-3 text-gray-200" strokeWidth={1} />
            <p className="text-sm font-medium text-gray-500">Kezdd el a beszélgetést!</p>
            <p className="text-xs mt-1">Írd meg az első üzeneted {provider.full_name} részére.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          if (isSystemMsg(msg.body)) {
            return (
              <div key={msg.id} className={`flex justify-center ${i === 0 ? "" : "mt-4"}`}>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                  <Info className="h-3 w-3 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">{systemText(msg.body)}</p>
                </div>
              </div>
            );
          }
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const isStart = !inSameGroup(prev, msg);
          const isEnd = !inSameGroup(msg, next);
          // Avatar a blokk elejére (csak bejövőnél); timestamp a blokk végére.
          const showAvatar = !msg.is_own && isStart;
          const corners = msg.is_own
            ? `rounded-2xl ${!isStart ? "rounded-tr-sm" : ""} ${!isEnd ? "rounded-br-sm" : ""}`
            : `rounded-2xl ${!isStart ? "rounded-tl-sm" : ""} ${!isEnd ? "rounded-bl-sm" : ""}`;
          return (
            <div key={msg.id} className={`flex ${msg.is_own ? "justify-end" : "justify-start"} ${i === 0 ? "" : isStart ? "mt-4" : "mt-0.5"}`}>
              <div className={`flex flex-col gap-1 max-w-[80%] ${msg.is_own ? "items-end" : "items-start"}`}>
                <div className="flex items-start gap-2">
                  {!msg.is_own && (
                    <div className="w-7 h-7 shrink-0">
                      {showAvatar && (
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                          {provider.avatar_url
                            ? <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover" />
                            : initials}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.is_own
                      ? `bg-gray-200 text-gray-900 ${corners}`
                      : `bg-white border border-gray-200 text-gray-900 ${corners}`
                  }`}>
                    {msg.body}
                  </div>
                </div>
                {isEnd && (
                  <span className={`text-[10px] text-gray-400 px-1 ${!msg.is_own ? "ml-9" : ""}`}>{formatDate(msg.created_at)}</span>
                )}
                {msg.id === lastReadOwnId && msg.read_at && (
                  <span className={`text-[10px] text-[#84AAA6] px-1 ${!msg.is_own ? "ml-9" : ""}`}>Elolvasva: {formatDate(msg.read_at)}</span>
                )}
              </div>
            </div>
          );
        })}
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

export function ChatSection({ userId, withProviderUserId }: Props) {
  const [tab, setTab]                       = useState<Tab>("providers");
  const [providers, setProviders]           = useState<ChatProvider[]>([]);
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [visitorQuoteChats, setVisitorQuoteChats] = useState<VisitorChat[]>([]);
  const [providerQuoteReqs, setProviderQuoteReqs] = useState<ProviderRequest[]>([]);
  const [loading, setLoading]               = useState(true);
  const [searchQuery, setSearchQuery]       = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCounty, setFilterCounty]     = useState("");
  const [currentPage, setCurrentPage]       = useState(0);
  const [selectedView, setSelectedView]     = useState<SelectedView | null>(null);
  const [convSearchQuery, setConvSearchQuery]       = useState("");
  const [convFilterCategory, setConvFilterCategory] = useState("");
  const [filtersOpen, setFiltersOpen]               = useState(false);
  const hasAutoOpened = useRef(false);
  const autoTabbed = useRef(false);

  const threads = buildThreads(messages);

  const quoteUnread =
    visitorQuoteChats.reduce((s, c) => s + c.unread_count, 0) +
    providerQuoteReqs.filter((r) => !r.read).length +
    providerQuoteReqs.reduce((s, r) => s + (r.unread_reply_count ?? 0), 0);
  const unreadConversations = threads.filter((t) => t.hasUnread).length + quoteUnread;

  const loadAll = useCallback(() => {
    Promise.all([
      fetch("/api/chat/providers").then((r) => r.json()),
      fetch("/api/messages").then((r) => r.json()),
      fetch("/api/quote-requests").then((r) => r.json()),
    ]).then(([provs, msgs, quoteData]) => {
      if (Array.isArray(provs)) setProviders(provs);
      if (Array.isArray(msgs)) setMessages(msgs);
      if (quoteData && typeof quoteData === "object" && !Array.isArray(quoteData)) {
        setProviderQuoteReqs((quoteData.providerRequests ?? []) as ProviderRequest[]);
        setVisitorQuoteChats((quoteData.visitorChats ?? []) as VisitorChat[]);
      } else if (Array.isArray(quoteData)) {
        setVisitorQuoteChats(quoteData as VisitorChat[]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Broadcast whether a conversation is open so the parent can show/hide the section title
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("chat-conversation-open", { detail: selectedView !== null }));
  }, [selectedView]);

  // Scroll to top on desktop when a conversation is opened
  useEffect(() => {
    if (selectedView !== null && window.innerWidth >= 640) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [selectedView]);

  // Default to Conversations tab on first load if any conversations exist
  useEffect(() => {
    if (loading || autoTabbed.current) return;
    autoTabbed.current = true;
    const hasConversations = threads.length > 0 || visitorQuoteChats.length > 0 || providerQuoteReqs.length > 0;
    if (hasConversations) setTab("conversations");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Auto-open chat when navigated here with ?with=providerUserId — fires only once
  useEffect(() => {
    if (!withProviderUserId || loading || hasAutoOpened.current) return;
    const prov = providers.find((p) => p.user_id === withProviderUserId);
    if (prov || !loading) {
      hasAutoOpened.current = true;
      if (prov) setSelectedView({ kind: "chat", provider: prov });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withProviderUserId, providers, loading]);

  // Reload when a message is read or new messages arrive (window events from ChatView)
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

  // Reload quote lists when navbar broadcasts a new quote message
  useEffect(() => {
    const handler = () => loadAll();
    window.addEventListener("quotes-unread-count-refresh", handler);
    window.addEventListener("chat-refresh", handler);
    return () => {
      window.removeEventListener("quotes-unread-count-refresh", handler);
      window.removeEventListener("chat-refresh", handler);
    };
  }, [loadAll]);

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
    setSelectedView({ kind: "chat", provider });
  };

  const openChatFromThread = (thread: ChatThread) => {
    const prov = providers.find((p) => p.user_id === thread.otherUserId);
    setSelectedView({ kind: "chat", provider: prov ?? {
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
    }});
  };

  // ── Selected view ──
  if (selectedView) {
    const goBack = () => { window.history.replaceState(null, "", "?tab=chat"); setSelectedView(null); loadAll(); };

    if (selectedView.kind === "chat") {
      const { provider } = selectedView;
      const providerMessages = messages
        .filter((m) => !(m.is_own && isSystemMsg(m.body)))
        .filter((m) => (m.is_own ? m.recipient_id : m.sender_id) === provider.user_id)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      return (
        <ChatView
          provider={provider}
          userId={userId}
          initialMessages={providerMessages}
          onBack={goBack}
          onMessagesUpdated={loadAll}
        />
      );
    }

    if (selectedView.kind === "quote-visitor") {
      const { chat } = selectedView;
      return (
        <QuoteChat
          requestId={chat.request_id}
          providerId={chat.provider_id}
          subject={chat.subject}
          otherName={chat.provider_full_name}
          otherAvatarUrl={chat.provider_avatar_url}
          requestContext={{ category: chat.category, counties: chat.counties, message: chat.message }}
          requestMsgIsOwn={true}
          userId={userId}
          initialMessages={chat.messages}
          onBack={goBack}
          onDeleted={() => {
            setVisitorQuoteChats((prev) => prev.filter((c) => c.request_id !== chat.request_id));
            setSelectedView(null);
          }}
          onUnreadMarked={(count) => {
            setVisitorQuoteChats((prev) => prev.map((c) =>
              c.request_id === chat.request_id && c.provider_id === chat.provider_id
                ? { ...c, unread_count: Math.max(0, c.unread_count - count) }
                : c
            ));
          }}
        />
      );
    }

    if (selectedView.kind === "quote-provider") {
      const { req } = selectedView;
      return (
        <ProviderChatLoader
          req={req}
          userId={userId}
          onBack={goBack}
          onDeleted={() => {
            setProviderQuoteReqs((prev) => prev.filter((r) => r.recipient_id !== req.recipient_id));
            setSelectedView(null);
          }}
          onUnreadMarked={() => {
            setProviderQuoteReqs((prev) => prev.map((r) =>
              r.recipient_id === req.recipient_id ? { ...r, read: true, unread_reply_count: 0 } : r
            ));
          }}
        />
      );
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-[#84AAA6] rounded-full animate-spin" />
    </div>
  );

  // ── Filtered provider list ──
  const allCategories = [...new Set(providers.flatMap((p) => p.categories))].sort();
  const allCounties = COUNTIES.filter((c) => c !== "Országosan");
  const filteredProviders = providers.filter((p) => {
    if (filterCategory && !p.categories.includes(filterCategory)) return false;
    if (filterCounty && !p.counties.includes(filterCounty) && !p.counties.includes("Országosan")) return false;
    if (searchQuery.trim() && !p.full_name.toLowerCase().includes(searchQuery.trim().toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.ceil(filteredProviders.length / PROVIDERS_PER_PAGE);
  const pagedProviders = filteredProviders.slice(
    currentPage * PROVIDERS_PER_PAGE,
    (currentPage + 1) * PROVIDERS_PER_PAGE
  );

  const resetPage = () => setCurrentPage(0);

  return (
    <div className="space-y-3">
      {/* Tabs + filter toggle */}
      <div className="flex items-center border-b border-gray-200">
        <button
          onClick={() => setTab("providers")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === "providers"
              ? "border-[#84AAA6] text-[#84AAA6]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Új chat indítása
        </button>
        <button
          onClick={() => setTab("conversations")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            tab === "conversations"
              ? "border-[#84AAA6] text-[#84AAA6]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Aktív chatek
          {unreadConversations > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadConversations > 9 ? "9+" : unreadConversations}
            </span>
          )}
        </button>
        {/* Filter toggle — jobb oldal */}
        <div className="ml-auto pr-1 pb-px relative">
          {(() => {
            const hasActiveFilters = tab === "providers"
              ? !!(searchQuery || filterCategory || filterCounty)
              : !!(convSearchQuery || convFilterCategory);
            return (
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                title={filtersOpen ? "Szűrők elrejtése" : "Szűrők megjelenítése"}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  filtersOpen
                    ? "bg-[#84AAA6]/15 text-[#84AAA6]"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F06C6C]" />
                )}
              </button>
            );
          })()}
        </div>
      </div>

      {/* ── Providers tab ── */}
      {tab === "providers" && (
        <div className="space-y-3">
          {/* Search + dropdowns — only when filtersOpen */}
          {filtersOpen && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
                  placeholder="Keresés neve alapján…"
                  className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#84AAA6] focus:border-[#84AAA6] transition-colors bg-white"
                />
              </div>
              <div className="sm:w-64">
                <ChatSelect
                  value={filterCategory}
                  onChange={(v) => { setFilterCategory(v); resetPage(); }}
                  placeholder="Összes kategória"
                  options={allCategories.map((cat) => ({
                    value: cat,
                    label: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat,
                  }))}
                />
              </div>
              <div className="sm:w-52">
                <ChatSelect
                  value={filterCounty}
                  onChange={(v) => { setFilterCounty(v); resetPage(); }}
                  placeholder="Összes megye"
                  options={allCounties.map((c) => ({ value: c, label: c }))}
                />
              </div>
            </div>
          )}

          {/* List */}
          {filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <Search className="h-10 w-10 mb-3 text-gray-200" />
              <p className="text-sm">Nincs találat.</p>
            </div>
          ) : (
            <>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                {pagedProviders.map((p) => (
                  <ProviderRow
                    key={p.id}
                    provider={p}
                    onChat={() => openChat(p)}
                    onToggleFavorite={() => handleToggleFavorite(p)}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Előző
                  </button>
                  <span className="text-sm text-gray-500">
                    {currentPage + 1} / {totalPages}
                    <span className="text-gray-400 ml-1">({filteredProviders.length} szolgáltató)</span>
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Következő →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Conversations tab ── */}
      {tab === "conversations" && (() => {
        // Build combined sorted list
        type ConvItem =
          | { kind: "thread"; data: ChatThread; lastAt: string }
          | { kind: "quote-visitor"; data: VisitorChat; lastAt: string }
          | { kind: "quote-provider"; data: ProviderRequest; lastAt: string };

        const allItemsRaw: ConvItem[] = [
          ...threads.map((t) => ({ kind: "thread" as const, data: t, lastAt: t.lastAt })),
          ...visitorQuoteChats.map((c) => ({ kind: "quote-visitor" as const, data: c, lastAt: c.last_at })),
          ...providerQuoteReqs.map((r) => ({ kind: "quote-provider" as const, data: r, lastAt: r.last_message_at ?? r.created_at })),
        ].sort((a, b) => b.lastAt.localeCompare(a.lastAt));

        const convAllCategories = [...new Set([
          ...visitorQuoteChats.map((c) => c.category),
          ...providerQuoteReqs.map((r) => r.category),
        ])];

        const allItems = allItemsRaw.filter((item) => {
          const nameQ = convSearchQuery.trim().toLowerCase();
          const catQ = convFilterCategory;
          if (item.kind === "thread") {
            if (nameQ && !item.data.otherName.toLowerCase().includes(nameQ)) return false;
            if (catQ) return false; // threads have no category
          } else if (item.kind === "quote-visitor") {
            if (nameQ && !item.data.provider_full_name.toLowerCase().includes(nameQ)) return false;
            if (catQ && item.data.category !== catQ) return false;
          } else {
            if (nameQ && !item.data.visitor_name.toLowerCase().includes(nameQ)) return false;
            if (catQ && item.data.category !== catQ) return false;
          }
          return true;
        });

        if (allItemsRaw.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <MessageCircle className="h-10 w-10 mb-3 text-gray-200" strokeWidth={1} />
              <p className="text-sm">Még nincs aktív chat.</p>
              <p className="text-xs mt-1">Indíts beszélgetést az Új chat indítása fülről.</p>
            </div>
          );
        }
        return (
          <div className="space-y-3">
            {/* Filters — only when filtersOpen */}
            {filtersOpen && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={convSearchQuery}
                    onChange={(e) => setConvSearchQuery(e.target.value)}
                    placeholder="Keresés neve alapján…"
                    className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#84AAA6] focus:border-[#84AAA6] transition-colors bg-white"
                  />
                </div>
                {convAllCategories.length > 0 && (
                  <div className="sm:w-64">
                    <ChatSelect
                      value={convFilterCategory}
                      onChange={setConvFilterCategory}
                      placeholder="Összes kategória"
                      options={convAllCategories.map((cat) => ({
                        value: cat,
                        label: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat,
                      }))}
                    />
                  </div>
                )}
              </div>
            )}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            {allItems.map((item) => {
              if (item.kind === "thread") {
                return (
                  <ConversationRow
                    key={`t-${item.data.otherUserId}`}
                    thread={item.data}
                    onSelect={() => openChatFromThread(item.data)}
                  />
                );
              }
              if (item.kind === "quote-visitor") {
                const c = item.data;
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                  <QuoteConvRow
                    key={`qv-${c.request_id}-${c.provider_id}`}
                    name={c.provider_full_name}
                    avatarUrl={c.provider_avatar_url}
                    subject={c.subject}
                    categoryLabel={CATEGORY_LABELS[c.category as keyof typeof CATEGORY_LABELS] ?? c.category}
                    lastAt={c.last_at}
                    unread={c.unread_count}
                    lastMsg={lastMsg?.body}
                    lastMsgIsOwn={lastMsg?.sender_id === userId}
                    onSelect={() => setSelectedView({ kind: "quote-visitor", chat: c })}
                  />
                );
              }
              // quote-provider
              const r = item.data;
              const unread = (r.read ? 0 : 1) + (r.unread_reply_count ?? 0);
              return (
                <QuoteConvRow
                  key={`qp-${r.recipient_id}`}
                  name={r.visitor_name}
                  avatarUrl={r.visitor_avatar_url}
                  subject={r.subject}
                  categoryLabel={CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] ?? r.category}
                  lastAt={r.last_message_at ?? r.created_at}
                  unread={unread}
                  lastMsg={r.last_message_body}
                  lastMsgIsOwn={r.last_message_sender_id === userId}
                  onSelect={async () => {
                    if (!r.read) {
                      await fetch(`/api/quote-requests/${r.quote_request_id}/read`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "request" }),
                      });
                      setProviderQuoteReqs((prev) => prev.map((x) =>
                        x.recipient_id === r.recipient_id ? { ...x, read: true } : x
                      ));
                    }
                    setSelectedView({ kind: "quote-provider", req: r });
                  }}
                />
              );
            })}
          </div>
          {allItems.length === 0 && allItemsRaw.length > 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Nincs találat a szűrőkre.</p>
          )}
          </div>
        );
      })()}
    </div>
  );
}
