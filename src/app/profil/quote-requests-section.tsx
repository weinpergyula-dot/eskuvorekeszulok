"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, FileText, Send, Trash2, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { CATEGORY_LABELS, COUNTIES } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const SYSTEM_PREFIX = "__SYSTEM__:";
const isSystemMsg = (body: string) => body.startsWith(SYSTEM_PREFIX);
const systemText  = (body: string) => body.slice(SYSTEM_PREFIX.length);

// ── Interfaces ────────────────────────────────────────────────────────────────

interface QuoteMessage {
  id: string;
  sender_id: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface VisitorChat {
  request_id: string;
  subject: string;
  category: string;
  counties: string[];
  message: string;
  provider_id: string;
  provider_full_name: string;
  messages: QuoteMessage[];
  unread_count: number;
  last_at: string;
}

interface ProviderRequest {
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
  unread_reply_count: number;
}

interface MatchingProvider { id: string; full_name: string; average_rating: number | null; }

interface Props {
  isProvider: boolean;
  userId: string;
  onUnreadChange: (count: number) => void;
}

// ── Navigation state ──────────────────────────────────────────────────────────

type View =
  | { mode: "list" }
  | { mode: "provider-chat"; req: ProviderRequest }
  | { mode: "visitor-chat"; chat: VisitorChat };

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

function broadcastUnread(count: number, onChange: (n: number) => void) {
  onChange(count);
  window.dispatchEvent(new CustomEvent("quotes-unread-count", { detail: count }));
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
        className="w-full h-14 border rounded-xl px-4 text-base outline-none bg-white flex items-center justify-between gap-2 transition-colors"
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
              className="w-full text-left px-4 py-2.5 text-base transition-colors cursor-pointer hover:bg-[#84AAA6]/10 hover:text-[#84AAA6]"
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

function SendForm({ onSent, onCancel }: { onSent: () => void; onCancel: () => void }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [matchingProviders, setMatchingProviders] = useState<MatchingProvider[] | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category || selectedCounties.length === 0) { setMatchingProviders(null); setCheckedIds(new Set()); return; }
    const params = new URLSearchParams({ category, counties: selectedCounties.join(",") });
    fetch(`/api/providers/matching-count?${params}`)
      .then(r => r.json())
      .then(d => {
        const providers: MatchingProvider[] = d.providers ?? [];
        setMatchingProviders(providers);
        setCheckedIds(new Set(providers.map(p => p.id)));
      })
      .catch(() => {});
  }, [category, selectedCounties]);

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
      <h3 className="text-base font-semibold text-gray-900">Új ajánlatkérés küldése</h3>
      <FloatingInput id="qs-subject" label="Tárgy *" value={subject} onChange={e => setSubject(e.target.value)} />
      <CategorySelect value={category} onChange={setCategory} />
      <div>
        <p className="text-sm text-gray-600 mb-2">Megye(k) <span className="text-[1.2em] font-bold leading-none align-middle">*</span></p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {geographicCounties.map(county => (
            <label key={county} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={selectedCounties.includes(county)} onChange={() => toggleCounty(county)} className="rounded accent-[#84AAA6]" />
              <span className="text-sm text-gray-700">{county}</span>
            </label>
          ))}
        </div>
      </div>
      <FloatingTextarea id="qs-message" label="Üzenet *" value={message} onChange={e => setMessage(e.target.value)} rows={4} />
      {matchingProviders !== null && (
        <div className="space-y-2">
          {matchingProviders.length === 0 ? (
            <p className="text-sm text-gray-400">Nincs egyező szolgáltató a kiválasztott feltételekre.</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">Ezek a szolgáltatók kapják meg az ajánlatkérést — vedd ki a pipát, akit ki szeretnél hagyni:</p>
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {matchingProviders.map(p => (
                  <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={checkedIds.has(p.id)} onChange={() => { setCheckedIds(prev => { const next = new Set(prev); if (next.has(p.id)) next.delete(p.id); else next.add(p.id); return next; }); }} className="rounded accent-[#84AAA6] shrink-0" />
                    <span className="flex-1 text-sm font-medium text-gray-900 truncate">{p.full_name}</span>
                    <StarRating rating={p.average_rating} />
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{checkedIds.size} / {matchingProviders.length} szolgáltató kijelölve</p>
            </div>
          )}
        </div>
      )}
      {error && <div className="bg-[#F06C6C]/10 text-[#F06C6C] px-4 py-3 rounded-xl border border-[#F06C6C]/30">{error}</div>}
      <div className="flex gap-3">
        <Button type="submit" disabled={sending}><Send className="h-4 w-4 mr-2" />{sending ? "Küldés..." : "Elküld"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Mégse</Button>
      </div>
      <p className="text-sm text-gray-500"><span className="text-base font-bold align-middle">*</span> A csillaggal megjelöltek kitöltése kötelező.</p>
    </form>
  );
}

// ── Inbox list item ───────────────────────────────────────────────────────────

function QuoteListItem({
  subject,
  categoryLabel,
  recipientName,
  lastMessage,
  date,
  unread,
  onSelect,
}: {
  subject: string;
  categoryLabel: string;
  recipientName: string;
  lastMessage: string;
  date: string;
  unread: number;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left px-4 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0">
          <FileText className={`h-4 w-4 ${unread > 0 ? "text-gray-500" : "text-gray-300"}`} />
        </div>
        <div className="flex-1 min-w-0">
          {/* Tárgy + dátum */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className={`text-base truncate ${unread > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
              {subject}
            </p>
            <span className="text-sm text-gray-400 shrink-0">{formatShort(date)}</span>
          </div>
          {/* Kategória */}
          <p className="text-sm text-[#84AAA6] truncate mb-0.5">{categoryLabel}</p>
          {/* Címzett */}
          <p className="text-sm text-gray-500 truncate mb-0.5">{recipientName}</p>
          {/* Utolsó üzenet */}
          <p className="text-sm text-gray-400 truncate">{lastMessage}</p>
        </div>
        {unread > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F06C6C] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </div>
    </button>
  );
}

// ── Unified quote chat view ───────────────────────────────────────────────────

function QuoteChat({
  requestId,
  providerId,
  subject,
  otherName,
  requestContext,
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
  requestContext?: { category: string; counties: string[]; message: string } | null;
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
  const [showContext, setShowContext]      = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasSystemMessage = messages.some((m) => isSystemMsg(m.body));

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark unread as read on mount
  useEffect(() => {
    const unread = initialMessages.filter((m) => !m.read && m.sender_id !== userId);
    if (unread.length > 0) {
      fetch(`/api/quote-requests/${requestId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "messages", provider_id: providerId }),
      }).then(() => {
        onUnreadMarked(unread.length);
        window.dispatchEvent(new CustomEvent("quotes-unread-count-refresh"));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime: new incoming quote messages
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`quote-chat-${requestId}-${providerId}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "quote_messages",
          filter: `quote_request_id=eq.${requestId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const raw = payload.new;
          if (raw.provider_id !== providerId) return;
          if (raw.sender_id === userId) return; // own message already shown optimistically
          const newMsg: QuoteMessage = {
            id: raw.id, sender_id: raw.sender_id, body: raw.body,
            read: false, created_at: raw.created_at,
          };
          setMessages((prev) => [...prev, newMsg]);
          // Auto-mark as read
          fetch(`/api/quote-requests/${requestId}/read`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "messages", provider_id: providerId }),
          }).then(() => window.dispatchEvent(new CustomEvent("quotes-unread-count-refresh")))
            .catch(() => {});
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, providerId, userId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/quote-requests/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody.trim(), provider_id: providerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), sender_id: userId,
        body: replyBody.trim(), read: true,
        created_at: new Date().toISOString(),
      }]);
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
    await fetch(`/api/quote-requests/${requestId}`, { method: "DELETE" });
    onDeleted();
    onBack();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white sm:relative sm:inset-auto sm:z-auto sm:h-[680px]">
      {/* Mobil: teal page header */}
      <div className="flex items-center px-4 py-3 bg-[#84AAA6] text-white shrink-0 sm:hidden">
        <button onClick={onBack} className="text-white cursor-pointer shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0 px-3">
          <h2 className="text-base font-semibold text-center truncate">Ajánlatkérés – Chat</h2>
          <p className="text-xs text-white/80 text-center truncate">{subject} · {otherName}</p>
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
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{subject}</p>
          <p className="text-xs text-gray-500 truncate">{otherName}</p>
        </div>
        {requestContext && (
          <button
            onClick={() => setShowContext(v => !v)}
            className="text-xs text-gray-400 hover:text-[#84AAA6] transition-colors cursor-pointer shrink-0"
            title="Ajánlatkérés részletei"
          >
            <FileText className="h-4 w-4" />
          </button>
        )}
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

      {/* Request context (collapsible) */}
      {requestContext && showContext && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 shrink-0">
          <p className="text-xs font-medium text-gray-500 mb-1">
            {CATEGORY_LABELS[requestContext.category as keyof typeof CATEGORY_LABELS] ?? requestContext.category}
            {" · "}{requestContext.counties.join(", ")}
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-line">{requestContext.message}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Még nem volt üzenetváltás.</p>
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

function ProviderChatLoader({
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
      requestContext={{ category: req.category, counties: req.counties, message: req.message }}
      userId={userId}
      initialMessages={messages}
      onBack={onBack}
      onDeleted={onDeleted}
      onUnreadMarked={onUnreadMarked}
    />
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

export function QuoteRequestsSection({ isProvider, userId, onUnreadChange }: Props) {
  const [visitorChats, setVisitorChats]       = useState<VisitorChat[]>([]);
  const [providerRequests, setProviderRequests] = useState<ProviderRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [view, setView]               = useState<View>({ mode: "list" });
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const loadRequests = useCallback(() => {
    fetch("/api/quote-requests")
      .then(r => r.json())
      .then(data => {
        if (isProvider) {
          const reqs = data as ProviderRequest[];
          setProviderRequests(reqs);
          const unread = reqs.filter(r => !r.read).length + reqs.reduce((s, r) => s + (r.unread_reply_count ?? 0), 0);
          broadcastUnread(unread, onUnreadChange);
        } else {
          const chats = data as VisitorChat[];
          setVisitorChats(chats);
          broadcastUnread(chats.reduce((s, c) => s + (c.unread_count ?? 0), 0), onUnreadChange);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isProvider, onUnreadChange]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  // Compact footer in chat/detail views + scroll to top on desktop
  useEffect(() => {
    const inChat = view.mode !== "list";
    if (inChat) {
      document.body.classList.add("chat-mode");
      if (window.innerWidth >= 640) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      document.body.classList.remove("chat-mode");
    }
    return () => document.body.classList.remove("chat-mode");
  }, [view.mode]);

  // Listen for realtime quote count refresh
  useEffect(() => {
    const handler = () => loadRequests();
    window.addEventListener("quotes-unread-count-refresh", handler);
    return () => window.removeEventListener("quotes-unread-count-refresh", handler);
  }, [loadRequests]);

  if (loading) return <p className="text-base text-gray-500">Betöltés...</p>;

  // ── Provider: chat view ──
  if (view.mode === "provider-chat") {
    const req = view.req;
    return (
      <ProviderChatLoader
        req={req}
        userId={userId}
        onBack={() => setView({ mode: "list" })}
        onDeleted={() => {
          setProviderRequests(prev => prev.filter(r => r.recipient_id !== req.recipient_id));
          const updated = providerRequests.filter(r => r.recipient_id !== req.recipient_id);
          broadcastUnread(
            updated.filter(r => !r.read).length + updated.reduce((s, r) => s + (r.unread_reply_count ?? 0), 0),
            onUnreadChange
          );
        }}
        onUnreadMarked={() => {
          const updated = providerRequests.map(r =>
            r.recipient_id === req.recipient_id ? { ...r, read: true, unread_reply_count: 0 } : r
          );
          setProviderRequests(updated);
          broadcastUnread(
            updated.filter(r => !r.read).length + updated.reduce((s, r) => s + (r.unread_reply_count ?? 0), 0),
            onUnreadChange
          );
        }}
      />
    );
  }

  // ── Visitor: chat view ──
  if (view.mode === "visitor-chat") {
    const { chat } = view;
    return (
      <QuoteChat
        requestId={chat.request_id}
        providerId={chat.provider_id}
        subject={chat.subject}
        otherName={chat.provider_full_name}
        requestContext={{ category: chat.category, counties: chat.counties, message: chat.message }}
        userId={userId}
        initialMessages={chat.messages}
        onBack={() => setView({ mode: "list" })}
        onDeleted={() => {
          // Törlés: az összes chat eltávolítása ugyanazzal a request_id-vel
          const updated = visitorChats.filter(c => c.request_id !== chat.request_id);
          setVisitorChats(updated);
          broadcastUnread(updated.reduce((s, c) => s + c.unread_count, 0), onUnreadChange);
        }}
        onUnreadMarked={(count) => {
          const updated = visitorChats.map(c =>
            c.request_id === chat.request_id && c.provider_id === chat.provider_id
              ? { ...c, unread_count: Math.max(0, c.unread_count - count) }
              : c
          );
          setVisitorChats(updated);
          broadcastUnread(updated.reduce((s, c) => s + c.unread_count, 0), onUnreadChange);
        }}
      />
    );
  }

  // ── Provider: list view ──
  if (isProvider) {
    const providerCategories = [...new Set(providerRequests.map(r => r.category))];
    const visibleProviderReqs = filterCategory
      ? providerRequests.filter(r => r.category === filterCategory)
      : providerRequests;

    return (
      <div className="space-y-3">
        {providerRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <FileText className="h-10 w-10 mb-3 text-gray-300" strokeWidth={1.5} />
            <p className="text-base">Még nem érkezett ajánlatkérés.</p>
          </div>
        ) : (
          <>
            {providerCategories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory(null)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCategory === null ? "bg-[#84AAA6] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  Összes
                </button>
                {providerCategories.map(cat => (
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
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              {visibleProviderReqs.map(req => {
                const unread = (req.read ? 0 : 1) + (req.unread_reply_count ?? 0);
                return (
                  <QuoteListItem
                    key={req.recipient_id}
                    subject={req.subject}
                    categoryLabel={CATEGORY_LABELS[req.category as keyof typeof CATEGORY_LABELS] ?? req.category}
                    recipientName={req.visitor_name}
                    lastMessage={req.message.slice(0, 100)}
                    date={req.created_at}
                    unread={unread}
                    onSelect={async () => {
                      if (!req.read) {
                        await fetch(`/api/quote-requests/${req.quote_request_id}/read`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ type: "request" }),
                        });
                        setProviderRequests(prev => prev.map(r =>
                          r.recipient_id === req.recipient_id ? { ...r, read: true } : r
                        ));
                      }
                      setView({ mode: "provider-chat", req });
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Visitor: list view ──
  const visitorCategories = [...new Set(visitorChats.map(c => c.category))];
  const visibleVisitorChats = filterCategory
    ? visitorChats.filter(c => c.category === filterCategory)
    : visitorChats;

  return (
    <div className="space-y-4">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full sm:w-auto">
          + Új ajánlatkérés
        </Button>
      )}
      {showForm && (
        <SendForm onSent={() => { setShowForm(false); loadRequests(); }} onCancel={() => setShowForm(false)} />
      )}
      {visitorChats.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
          <FileText className="h-10 w-10 mb-3 text-gray-300" strokeWidth={1.5} />
          <p className="text-base">Még nem küldtél ajánlatkérést.</p>
          <p className="text-sm mt-1">Kattints a gombra, hogy elküldd az első ajánlatkérésedet több szolgáltatónak egyszerre.</p>
        </div>
      ) : (
        <>
          {visitorCategories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCategory === null ? "bg-[#84AAA6] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Összes
              </button>
              {visitorCategories.map(cat => (
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
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            {visibleVisitorChats.map(chat => {
              const lastMsg = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
              let lastMessage: string;
              if (lastMsg) {
                if (isSystemMsg(lastMsg.body)) {
                  lastMessage = systemText(lastMsg.body);
                } else {
                  const prefix = lastMsg.sender_id === userId ? "Te" : chat.provider_full_name;
                  lastMessage = `${prefix}: ${lastMsg.body}`;
                }
              } else {
                lastMessage = `Te: ${chat.message}`;
              }
              return (
                <QuoteListItem
                  key={`${chat.request_id}__${chat.provider_id}`}
                  subject={chat.subject}
                  categoryLabel={CATEGORY_LABELS[chat.category as keyof typeof CATEGORY_LABELS] ?? chat.category}
                  recipientName={chat.provider_full_name}
                  lastMessage={lastMessage}
                  date={chat.last_at}
                  unread={chat.unread_count}
                  onSelect={() => setView({ mode: "visitor-chat", chat })}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
