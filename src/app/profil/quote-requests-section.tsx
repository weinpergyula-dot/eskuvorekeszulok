"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Send, Trash2, Star, Heart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { CATEGORY_LABELS, COUNTIES } from "@/lib/types";

const SYSTEM_PREFIX = "__SYSTEM__:";
const isSystemMsg = (body: string) => body.startsWith(SYSTEM_PREFIX);
const systemText  = (body: string) => body.slice(SYSTEM_PREFIX.length);

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface QuoteMessage {
  id: string;
  sender_id: string;
  body: string;
  read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface VisitorChat {
  request_id: string;
  subject: string;
  category: string;
  counties: string[];
  message: string;
  provider_id: string;
  provider_full_name: string;
  provider_avatar_url?: string | null;
  messages: QuoteMessage[];
  unread_count: number;
  last_at: string;
}

export interface ProviderRequest {
  recipient_id: string;
  quote_request_id: string;
  provider_id: string;
  subject: string;
  category: string;
  counties: string[];
  message: string;
  created_at: string;
  read: boolean;
  visitor_name: string;
  visitor_avatar_url?: string | null;
  unread_reply_count: number;
  last_message_at?: string | null;
  last_message_body?: string | null;
  last_message_sender_id?: string | null;
}

interface MatchingProvider {
  id: string;
  full_name: string;
  average_rating: number | null;
  avatar_url?: string | null;
  is_favorite?: boolean;
}

interface Props {
  isProvider: boolean;
  userId: string;
  onUnreadChange: (count: number) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── StarRating ────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-gray-400">Nincs értékelés</span>;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className="h-3 w-3"
          fill={i <= full ? "#f59e0b" : i === full + 1 && half ? "url(#half)" : "none"}
          stroke="#f59e0b"
          strokeWidth={1.5}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

// ── CategorySelect ────────────────────────────────────────────────────────────

function CategorySelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = value ? CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full h-12 border rounded-xl px-4 text-sm outline-none bg-white flex items-center justify-between gap-2 transition-colors"
        style={{ borderColor: open ? "#84AAA6" : "#D1D5DB" }}
      >
        <span style={{ color: selectedLabel ? "#111827" : "#9CA3AF" }}>
          {selectedLabel ?? "Válassz kategóriát..."} <span className="text-[1.2em] font-bold leading-none align-middle">*</span>
        </span>
        <ArrowLeft className="h-4 w-4 shrink-0 -rotate-90 transition-transform" style={{ color: "#9CA3AF", transform: open ? "rotate(90deg)" : "rotate(-90deg)" }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]"
              style={{ color: value === key ? "#84AAA6" : "#111827" }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SendForm ──────────────────────────────────────────────────────────────────

function SendForm({ onSent, onCancel, userId }: { onSent: () => void; onCancel?: () => void; userId?: string }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [matchingProviders, setMatchingProviders] = useState<MatchingProvider[] | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countyCountMap, setCountyCountMap] = useState<Record<string, number>>({});

  // Fetch per-county provider counts when category changes
  useEffect(() => {
    if (!category) { setCountyCountMap({}); return; }
    fetch(`/api/providers/matching-count?category=${encodeURIComponent(category)}`)
      .then(r => r.json())
      .then(d => {
        const map: Record<string, number> = {};
        for (const c of geographicCounties) map[c] = 0;
        for (const p of (d.providers ?? []) as Array<{ counties?: string[] }>) {
          if (p.counties?.includes("Országosan")) {
            for (const c of geographicCounties) map[c]++;
          } else {
            for (const c of p.counties ?? []) {
              if (c in map) map[c]++;
            }
          }
        }
        setCountyCountMap(map);
      })
      .catch(() => {});
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!category || selectedCounties.length === 0) { setMatchingProviders(null); setCheckedIds(new Set()); return; }
    const params = new URLSearchParams({ category, counties: selectedCounties.join(",") });
    if (userId) params.set("userId", userId);
    fetch(`/api/providers/matching-count?${params}`)
      .then(r => r.json())
      .then(d => {
        const providers: MatchingProvider[] = d.providers ?? [];
        setMatchingProviders(providers);
        setCheckedIds(new Set(providers.map(p => p.id)));
      })
      .catch(() => {});
  }, [category, selectedCounties, userId]);

  const toggleCounty = (county: string) => {
    setSelectedCounties(prev =>
      prev.includes(county) ? prev.filter(c => c !== county) : [...prev, county]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) { setError("Add meg a tárgyat!"); return; }
    if (!category) { setError("Válassz kategóriát!"); return; }
    if (!selectedCounties.length) { setError("Válassz legalább egy megyét!"); return; }
    if (!message.trim()) { setError("Írj üzenetet a szolgáltatóknak!"); return; }
    if (checkedIds.size === 0) { setError("Legalább egy szolgáltatót jelölj be."); return; }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, counties: selectedCounties, message, selectedProviderIds: [...checkedIds] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      onSent();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt.");
    } finally {
      setSending(false);
    }
  };

  const geographicCounties = COUNTIES.filter(c => c !== "Országosan");

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Új ajánlatkérés küldése</h3>
      <FloatingInput id="qs-subject" label="Tárgy *" value={subject} onChange={e => setSubject(e.target.value)} compact />
      <CategorySelect value={category} onChange={setCategory} />
      <div>
        <p className="text-xs text-gray-600 mb-2">Megye(k) <span className="text-[1.2em] font-bold leading-none align-middle">*</span></p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {geographicCounties.map(county => (
            <label key={county} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={selectedCounties.includes(county)} onChange={() => toggleCounty(county)} className="rounded accent-[#84AAA6]" />
              <span className="text-xs text-gray-700">
                {county}{countyCountMap[county] != null && category && (
                  <span className="ml-1 opacity-60 font-normal">({countyCountMap[county]})</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>
      <FloatingTextarea id="qs-message" label="Üzenet *" value={message} onChange={e => setMessage(e.target.value)} rows={4} compact />
      {matchingProviders !== null && (
        <div className="space-y-2">
          {matchingProviders.length === 0 ? (
            <p className="text-xs text-gray-400">Nincs egyező szolgáltató a kiválasztott feltételekre.</p>
          ) : (
            <div>
              {matchingProviders.some(p => p.is_favorite) && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Heart className="h-3 w-3 fill-rose-400 stroke-rose-400 shrink-0" />
                  <span className="text-xs text-gray-600 whitespace-nowrap">Csak kedvenceknek</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={favoritesOnly}
                    onClick={() => {
                      const next = !favoritesOnly;
                      setFavoritesOnly(next);
                      if (next) {
                        setCheckedIds(new Set(matchingProviders.filter(p => p.is_favorite).map(p => p.id)));
                      } else {
                        setCheckedIds(new Set(matchingProviders.map(p => p.id)));
                      }
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${favoritesOnly ? "bg-rose-400" : "bg-gray-200"}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${favoritesOnly ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                  </button>
                </div>
              )}
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {matchingProviders.map(p => (
                  <label key={p.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={checkedIds.has(p.id)} onChange={() => { setCheckedIds(prev => { const next = new Set(prev); if (next.has(p.id)) next.delete(p.id); else next.add(p.id); return next; }); }} className="rounded accent-[#84AAA6] shrink-0" />
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                      {p.avatar_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                        : <span className="text-xs font-bold text-gray-500">{p.full_name.charAt(0)}</span>}
                    </div>
                    <span className="flex-1 text-xs font-medium text-gray-900 truncate">{p.full_name}</span>
                    <StarRating rating={p.average_rating} />
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">{checkedIds.size} / {matchingProviders.length} szolgáltató kijelölve</p>
            </div>
          )}
        </div>
      )}
      {error && <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-xs px-4 py-3 rounded-xl border border-[#F06C6C]/30">{error}</div>}
      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={sending}><Send className="h-3.5 w-3.5 mr-1.5" />{sending ? "Küldés..." : "Elküld"}</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Mégse</Button>}
      </div>
      <p className="text-xs text-gray-500"><span className="text-sm font-bold align-middle">*</span> A csillaggal megjelöltek kitöltése kötelező.</p>
    </form>
  );
}

// ── Inbox list item ───────────────────────────────────────────────────────────

function QuoteListItem({
  subject,
  categoryLabel,
  recipientName,
  avatarUrl,
  date,
  unread,
  onSelect,
}: {
  subject: string;
  categoryLabel: string;
  recipientName: string;
  avatarUrl?: string | null;
  date: string;
  unread: number;
  onSelect: () => void;
}) {
  const initials = recipientName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-4 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
          {avatarUrl
            ? <img src={avatarUrl ?? ""} alt={recipientName} className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-sm font-bold truncate ${unread > 0 ? "text-gray-900" : "text-gray-700"}`}>
              {recipientName}
            </p>
            <span className="text-xs text-gray-400 shrink-0">{formatShort(date)}</span>
          </div>
          <p className="text-xs text-[#84AAA6] truncate mb-0.5">{categoryLabel}</p>
          <p className={`text-xs truncate ${unread > 0 ? "font-semibold text-gray-700" : "text-gray-500"}`}>{subject}</p>
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

// ── Unified quote chat view ───────────────────────────────────────────────────

export function QuoteChat({
  requestId,
  providerId,
  subject,
  otherName,
  otherAvatarUrl,
  requestContext,
  requestMsgIsOwn = false,
  userId,
  initialMessages,
  onBack,
  onDeleted,
  onUnreadMarked,
}: {
  requestId: string;
  providerId: string;
  subject: string;
  otherName: string;
  otherAvatarUrl?: string | null;
  requestContext?: { category: string; counties: string[]; message: string } | null;
  requestMsgIsOwn?: boolean;
  userId: string;
  initialMessages: QuoteMessage[];
  onBack: () => void;
  onDeleted: () => void;
  onUnreadMarked: (count: number) => void;
}) {
  const [messages, setMessages]           = useState(initialMessages);
  const [replyBody, setReplyBody]         = useState("");
  const [sending, setSending]             = useState(false);
  const [sendError, setSendError]         = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const bottomRef     = useRef<HTMLDivElement>(null);
  const textareaRef   = useRef<HTMLTextAreaElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const markedAsReadRef = useRef(new Set<string>());

  const hasSystemMessage = messages.some((m) => isSystemMsg(m.body));

  // Lock body scroll on mobile
  useEffect(() => {
    document.body.classList.add("chat-mode");
    return () => { document.body.classList.remove("chat-mode"); };
  }, []);

  // Mobile: resize container to match visual viewport so keyboard doesn't push header up
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

  // Scroll to bottom — desktop scrolls the inner container, mobile uses scrollIntoView
  useEffect(() => {
    if (window.innerWidth >= 640) {
      const el = scrollAreaRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark unread as read — runs on messages change to avoid race condition with initialMessages
  useEffect(() => {
    const unread = messages.filter((m) => !m.read && m.sender_id !== userId && !markedAsReadRef.current.has(m.id));
    if (unread.length === 0) return;
    unread.forEach((m) => markedAsReadRef.current.add(m.id));
    fetch(`/api/quote-requests/${requestId}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "messages", provider_id: providerId }),
    }).then(() => {
      onUnreadMarked(unread.length);
      window.dispatchEvent(new CustomEvent("quotes-unread-count-refresh"));
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Realtime: INSERT for new messages, UPDATE for read receipts (sender sees Elolvasva)
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const reload = () => {
      fetch(`/api/quote-requests/${requestId}`)
        .then((r) => r.json())
        .then((data) => {
          const msgs: QuoteMessage[] | undefined =
            data.messages ??
            (data.providers as Array<{ id: string; messages: QuoteMessage[] }> | undefined)
              ?.find((p) => p.id === providerId)?.messages;
          if (!msgs) return;
          setMessages([...msgs].sort((a, b) => a.created_at.localeCompare(b.created_at)));
        })
        .catch(() => {});
    };
    const channel = supabase
      .channel(`quote-chat-${requestId}-${providerId}-${userId}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "quote_messages", filter: `quote_request_id=eq.${requestId}` },
        reload
      )
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "quote_messages", filter: `quote_request_id=eq.${requestId}` },
        reload
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, providerId, userId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = replyBody.trim();
    if (!body) return;

    // Clear input and keep focus BEFORE the await so keyboard stays open on mobile
    setReplyBody("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }

    // Optimistic message
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(), sender_id: userId,
      body, read: true,
      created_at: new Date().toISOString(),
    }]);

    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/quote-requests/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, provider_id: providerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
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
      handleReply(e as unknown as React.FormEvent);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/quote-requests/${requestId}`, { method: "DELETE" });
    onDeleted();
    onBack();
  };

  // Only show read receipt on the last own sent message that has been read
  let lastReadOwnId: string | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.sender_id === userId && m.read && m.read_at) { lastReadOwnId = m.id; break; }
  }

  return (
    <div ref={containerRef} className="fixed inset-x-0 top-0 z-[100] flex flex-col bg-white h-[100dvh] sm:relative sm:inset-auto sm:z-auto sm:h-[680px]">
      {/* Mobil: teal page header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#84AAA6] text-white shrink-0 sm:hidden">
        <button onClick={onBack} className="text-white cursor-pointer shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/30 flex items-center justify-center text-xs font-semibold text-white shrink-0">
          {otherAvatarUrl
            ? <img src={otherAvatarUrl} alt={otherName} className="w-full h-full object-cover" />
            : otherName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{otherName}</p>
          <p className="text-xs text-white/80 truncate">{subject}</p>
        </div>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="text-white/80 hover:text-white cursor-pointer shrink-0" title="Törlés">
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleDelete} disabled={deleting} className="text-xs font-medium text-white cursor-pointer disabled:opacity-50">
              {deleting ? "..." : "Törlés"}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-white/70 hover:text-white cursor-pointer">Mégse</button>
          </div>
        )}
      </div>
      {/* Desktop: chat header */}
      <div className="hidden sm:flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer shrink-0">
          <ArrowLeft className="h-4 w-4" />
          <span>Vissza</span>
        </button>
        <div className="h-4 w-px bg-gray-200 shrink-0" />
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
          {otherAvatarUrl
            ? <img src={otherAvatarUrl} alt={otherName} className="w-full h-full object-cover" />
            : otherName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{otherName}</p>
          <p className="text-xs text-gray-500 truncate">{subject}</p>
        </div>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="text-[#F06C6C] hover:text-[#F06C6C]/70 transition-colors cursor-pointer shrink-0" title="Törlés">
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-600">Biztosan törlöd?</span>
            <button onClick={handleDelete} disabled={deleting} className="text-xs font-medium text-[#F06C6C] hover:text-[#F06C6C]/80 cursor-pointer disabled:opacity-50">
              {deleting ? "..." : "Igen"}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Mégse</button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollAreaRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4 bg-gray-50">
        {/* Original request message shown as first chat bubble */}
        {requestContext?.message && (
          <div className={`flex ${requestMsgIsOwn ? "justify-end" : "justify-start"}`}>
            <div className={`flex flex-col gap-1 max-w-[75%] ${requestMsgIsOwn ? "items-end" : "items-start"}`}>
              <div className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                requestMsgIsOwn
                  ? "bg-gray-200 text-gray-900 rounded-2xl rounded-tr-sm"
                  : "bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm"
              }`}>
                {requestContext.message}
              </div>
            </div>
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
            <div key={msg.id} className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
              <div className={`flex flex-col gap-1 max-w-[75%] ${msg.sender_id === userId ? "items-end" : "items-start"}`}>
                <div className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender_id === userId
                    ? "bg-gray-200 text-gray-900 rounded-2xl rounded-tr-sm"
                    : "bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm"
                }`}>
                  {msg.body}
                </div>
                <span className="text-[10px] text-gray-400 px-1">{formatDate(msg.created_at)}</span>
                {msg.id === lastReadOwnId && msg.read_at && (
                  <span className="text-[10px] text-[#84AAA6] px-1">Elolvasva: {formatDate(msg.read_at)}</span>
                )}
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply */}
      {!hasSystemMessage && (
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

// ── Provider chat loader (fetches messages before showing chat) ───────────────

export function ProviderChatLoader({
  req,
  userId,
  onBack,
  onDeleted,
  onUnreadMarked,
}: {
  req: ProviderRequest;
  userId: string;
  onBack: () => void;
  onDeleted: () => void;
  onUnreadMarked: () => void;
}) {
  const [messages, setMessages] = useState<QuoteMessage[] | null>(null);

  useEffect(() => {
    fetch(`/api/quote-requests/${req.quote_request_id}`)
      .then(r => r.json())
      .then(data => setMessages(data.messages ?? []))
      .catch(() => setMessages([]));
  }, [req.quote_request_id]);

  if (messages === null) return <p className="text-base text-gray-500 p-4">Betöltés...</p>;

  return (
    <QuoteChat
      requestId={req.quote_request_id}
      providerId={req.provider_id}
      subject={req.subject}
      otherName={req.visitor_name}
      otherAvatarUrl={req.visitor_avatar_url}
      requestContext={{ category: req.category, counties: req.counties, message: req.message }}
      requestMsgIsOwn={false}
      userId={userId}
      initialMessages={messages}
      onBack={onBack}
      onDeleted={onDeleted}
      onUnreadMarked={onUnreadMarked}
    />
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

export function QuoteRequestsSection({ onUnreadChange, userId }: Pick<Props, "onUnreadChange" | "userId">) {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    onUnreadChange(0);
    window.dispatchEvent(new CustomEvent("quotes-unread-count", { detail: 0 }));
  }, [onUnreadChange]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("quotes-form-open", { detail: !sent }));
  }, [sent]);

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="bg-[#84AAA6]/10 border border-[#84AAA6]/30 rounded-xl px-5 py-4">
          <p className="text-base font-medium text-[#84AAA6]">Az ajánlatkérésed elküldve.</p>
          <p className="text-sm text-gray-600 mt-1">A válaszokat a Chat menüpontban találod.</p>
        </div>
        <Button variant="outline" onClick={() => setSent(false)}>+ Újabb ajánlatkérés</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-base text-gray-700">
        Kategória és megyeválasztás után egyenként ki tudod választani, hogy kitől szeretnél árajánlatot kérni.
      </p>
      <SendForm onSent={() => setSent(true)} userId={userId} />
    </div>
  );
}
