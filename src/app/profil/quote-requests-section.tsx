"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Send, Trash2, Info, MailOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { CATEGORY_LABELS, COUNTIES } from "@/lib/types";
import { RecipientPicker } from "./quote-recipient-picker";
import { MeghivoQuoteForm } from "./meghivo-quote-form";

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

// ── SendForm ──────────────────────────────────────────────────────────────────

function SendForm({ onSent, onCancel, userId }: { onSent: () => void; onCancel?: () => void; userId?: string }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
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
        const providers = (d.providers ?? []) as Array<{ counties?: string[] }>;
        for (const p of providers) {
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
      {/* text-base (16px) on mobile prevents iOS from zooming when the field is focused */}
      <FloatingInput id="qs-subject" label="Tárgy *" value={subject} onChange={e => setSubject(e.target.value)} compact className="text-base sm:text-sm" />

      {/* Kategória – pill választó, mint a regisztrációnál (egyet választhatsz) */}
      <div>
        <p className="text-xs text-gray-600 mb-2">Válassz kategóriát! <span className="text-[1.2em] font-bold leading-none align-middle">*</span></p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const isSelected = category === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(isSelected ? "" : key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#84AAA6] text-white border-[#84AAA6]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#84AAA6] hover:text-[#84AAA6]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Megye(k) – pill választó, mint a regisztrációnál, az Országosannal együtt */}
      <div>
        <p className="text-xs text-gray-600 mb-2">Jelöld ki a megyé(ke)t! <span className="text-[1.2em] font-bold leading-none align-middle">*</span></p>
        <div className="flex flex-wrap gap-2">
          {geographicCounties.map(county => {
            const isSelected = selectedCounties.includes(county);
            const count = category && countyCountMap[county] != null
              ? countyCountMap[county]
              : null;
            return (
              <button
                key={county}
                type="button"
                onClick={() => toggleCounty(county)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#84AAA6] text-white border-[#84AAA6]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#84AAA6] hover:text-[#84AAA6]"
                }`}
              >
                {county}{count != null && <span className="ml-1 opacity-70 font-normal">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>
      <FloatingTextarea id="qs-message" label="Üzenet *" value={message} onChange={e => setMessage(e.target.value)} rows={4} compact className="text-base sm:text-sm" />
      <RecipientPicker
        category={category}
        counties={selectedCounties}
        userId={userId}
        checkedIds={checkedIds}
        setCheckedIds={setCheckedIds}
      />
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

  // Two messages belong to the same visual group if same sender and sent within
  // 5 minutes of each other (so consecutive bursts share one timestamp + avatar).
  const inSameGroup = (a?: QuoteMessage, b?: QuoteMessage) =>
    !!a && !!b && !isSystemMsg(a.body) && !isSystemMsg(b.body) &&
    a.sender_id === b.sender_id &&
    Math.abs(new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) <= 5 * 60 * 1000;

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
      window.dispatchEvent(new CustomEvent("quotes-read")); // navbar badge frissítése
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
      <div ref={scrollAreaRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-5 bg-gray-50">
        {/* Original request message shown as first chat bubble (standalone block) */}
        {requestContext?.message && (
          <div className={`flex ${requestMsgIsOwn ? "justify-end" : "justify-start"}`}>
            <div className={`flex flex-col gap-1 max-w-[80%] ${requestMsgIsOwn ? "items-end" : "items-start"}`}>
              <div className="flex items-end gap-2">
                {!requestMsgIsOwn && (
                  <div className="w-7 h-7 shrink-0">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                      {otherAvatarUrl
                        ? <img src={otherAvatarUrl} alt={otherName} className="w-full h-full object-cover" />
                        : otherName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                    </div>
                  </div>
                )}
                <div className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line rounded-2xl ${
                  requestMsgIsOwn
                    ? "bg-gray-200 text-gray-900"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}>
                  {requestContext.message}
                </div>
              </div>
            </div>
          </div>
        )}
        {messages.map((msg, i) => {
          if (isSystemMsg(msg.body)) {
            return (
              <div key={msg.id} className={`flex justify-center ${i === 0 && !requestContext?.message ? "" : "mt-4"}`}>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                  <Info className="h-3 w-3 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">{systemText(msg.body)}</p>
                </div>
              </div>
            );
          }
          const isOwn = msg.sender_id === userId;
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const isStart = !inSameGroup(prev, msg);
          const isEnd = !inSameGroup(msg, next);
          const showAvatar = !isOwn && isEnd;
          const corners = isOwn
            ? `rounded-2xl ${!isStart ? "rounded-tr-sm" : ""} ${!isEnd ? "rounded-br-sm" : ""}`
            : `rounded-2xl ${!isStart ? "rounded-tl-sm" : ""} ${!isEnd ? "rounded-bl-sm" : ""}`;
          const firstInList = i === 0 && !requestContext?.message;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} ${firstInList ? "" : isStart ? "mt-4" : "mt-0.5"}`}>
              <div className={`flex flex-col gap-1 max-w-[80%] ${isOwn ? "items-end" : "items-start"}`}>
                <div className="flex items-end gap-2">
                  {!isOwn && (
                    <div className="w-7 h-7 shrink-0">
                      {showAvatar && (
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                          {otherAvatarUrl
                            ? <img src={otherAvatarUrl} alt={otherName} className="w-full h-full object-cover" />
                            : otherName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    isOwn
                      ? `bg-gray-200 text-gray-900 ${corners}`
                      : `bg-white border border-gray-200 text-gray-900 ${corners}`
                  }`}>
                    {msg.body}
                  </div>
                </div>
                {isEnd && (
                  <span className={`text-[10px] text-gray-400 px-1 ${!isOwn ? "ml-9" : ""}`}>{formatDate(msg.created_at)}</span>
                )}
                {msg.id === lastReadOwnId && msg.read_at && (
                  <span className={`text-[10px] text-[#84AAA6] px-1 ${!isOwn ? "ml-9" : ""}`}>Elolvasva: {formatDate(msg.read_at)}</span>
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
  const searchParams = useSearchParams();
  const [sent, setSent] = useState(false);
  /* Két űrlap közül lehet választani: az általános szolgáltatói ajánlatkérés
     és a digitális meghívóra szabott. A /meghivo oldalról érkezve rögtön a
     meghívós nyílik meg (?form=meghivo), a csomag pedig előre kijelölve. */
  const [mode, setMode] = useState<"general" | "meghivo">(
    searchParams.get("form") === "meghivo" ? "meghivo" : "general"
  );

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

  const tabCls = (on: boolean) =>
    `flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
      on
        ? "border-[#84AAA6] bg-[#84AAA6] text-white"
        : "border-gray-300 bg-white text-gray-700 hover:border-[#84AAA6] hover:text-[#84AAA6]"
    }`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setMode("general")} className={tabCls(mode === "general")}>
          <Users className="h-4 w-4" strokeWidth={1.75} />
          Szolgáltatók
        </button>
        <button type="button" onClick={() => setMode("meghivo")} className={tabCls(mode === "meghivo")}>
          <MailOpen className="h-4 w-4" strokeWidth={1.75} />
          Digitális meghívó
        </button>
      </div>

      {mode === "meghivo" ? (
        <>
          <p className="text-base text-gray-700">
            Jelöld be, melyik csomag és milyen extrák érdekelnek – a válaszokat
            a Chat menüpontban találod.
          </p>
          <MeghivoQuoteForm
            onSent={() => setSent(true)}
            initialPackage={searchParams.get("csomag") ?? undefined}
          />
        </>
      ) : (
        <>
          <p className="text-base text-gray-700">
            Kategória és megyeválasztás után egyenként ki tudod választani, hogy melyik szolgáltató kapja meg az ajánlatkérést.
          </p>
          <SendForm onSent={() => setSent(true)} userId={userId} />
        </>
      )}
    </div>
  );
}
