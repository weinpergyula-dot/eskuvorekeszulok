"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Users, Clock as ClockIcon, Mail, Trash2, UserX, AlertTriangle, Send, Check, ChartColumn, ChartPie } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApproveButton } from "./approve-button";
import { UsersSection } from "./users-section";
import { LogsSection } from "./logs-section";
import { VisitsSection } from "./visits-section";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Filter = "pending" | "users" | "contact" | "prereg" | "logs" | "visits";

interface Provider {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  description?: string;
  avatar_url?: string;
  pending_changes?: Record<string, unknown> | null;
  [key: string]: unknown;
}

interface ProviderStatus {
  id: string;
  user_id: string;
  approval_status: string;
  pending_changes: unknown;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  read: boolean;
}

export interface PreRegistration {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface Props {
  totalUsers: number;
  totalApproved: number;
  totalVisitors: number;
  pendingProviders: Provider[];
  pendingChanges: Provider[];
  providerStatuses: ProviderStatus[];
  contactMessages: ContactMessage[];
  preRegistrations: PreRegistration[];
}

export function AdminContent({ totalUsers, totalApproved, totalVisitors, pendingProviders: initialPendingProviders, pendingChanges: initialPendingChanges, providerStatuses, contactMessages: initialContactMessages, preRegistrations: initialPreRegistrations }: Props) {
  const router = useRouter();

  const [pendingProvidersState, setPendingProvidersState] = useState<Provider[]>(initialPendingProviders);
  const [pendingChangesState, setPendingChangesState] = useState<Provider[]>(initialPendingChanges);

  // Sync from server props when router.refresh() updates them
  useEffect(() => { setPendingProvidersState(initialPendingProviders); }, [initialPendingProviders]);
  useEffect(() => { setPendingChangesState(initialPendingChanges); }, [initialPendingChanges]);

  // Poll /api/admin/pending every 10s for live updates
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/admin/pending");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.pendingProviders)) setPendingProvidersState(data.pendingProviders);
          if (Array.isArray(data.pendingChanges)) setPendingChangesState(data.pendingChanges);
        }
      } catch { /* ignore */ }
    };
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, []);

  // Merge first-submissions + edits into one unified list
  type PendingItem = Provider & { kind: "registration" | "edit" };
  const allPending: PendingItem[] = [
    ...pendingProvidersState.map((p) => ({ ...p, kind: "registration" as const })),
    ...pendingChangesState.map((p) => ({ ...p, kind: "edit" as const })),
  ];
  const totalPending = allPending.length;

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(initialContactMessages);
  const unreadContact = contactMessages.filter((m) => !m.read).length;

  const [preRegistrations, setPreRegistrations] = useState<PreRegistration[]>(initialPreRegistrations);
  const [resendingIds, setResendingIds] = useState<Record<string, "loading" | "done" | "error">>({});

  // Sync preRegistrations when server props update (router.refresh)
  useEffect(() => {
    setPreRegistrations(initialPreRegistrations);
  }, [initialPreRegistrations]);

  // Poll pre-registrations every 5 min (auth.users has no real-time support)
  useEffect(() => {
    const fetchPreRegs = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/admin/pre-registrations");
        if (res.ok) setPreRegistrations(await res.json());
      } catch { /* ignore */ }
    };
    const interval = setInterval(fetchPreRegs, 300000);
    return () => clearInterval(interval);
  }, []);

  const [logCount, setLogCount] = useState(0);
  useEffect(() => {
    fetch("/api/admin/logs").then(r => r.ok ? r.json() : []).then(data => setLogCount(Array.isArray(data) ? data.length : 0)).catch(() => {});
  }, []);

  // Főoldal-látogatottság: a stat-kártyán a mai egyedi IP-k száma
  const [uniqueIpsToday, setUniqueIpsToday] = useState(0);
  useEffect(() => {
    fetch("/api/admin/visits")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.available) setUniqueIpsToday(data.summary?.today ?? 0); })
      .catch(() => {});
  }, []);

  const [liveStats, setLiveStats] = useState({ totalUsers, totalApproved, totalVisitors });

  const refreshLiveStats = useCallback(async () => {
    const supabase = createClient();
    const [{ count: u }, { count: a }, { count: v }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("providers").select("*", { count: "exact", head: true }).eq("approval_status", "approved"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "visitor"),
    ]);
    setLiveStats((prev) => ({
      totalUsers: u ?? prev.totalUsers,
      totalApproved: a ?? prev.totalApproved,
      totalVisitors: v ?? prev.totalVisitors,
    }));
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-realtime")
      // profiles változás → stat frissítés
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        refreshLiveStats();
        router.refresh(); // pendingProviders, preRegistrations szerver újratöltése
      })
      // providers változás → stat + pending lista frissítés
      .on("postgres_changes", { event: "*", schema: "public", table: "providers" }, () => {
        refreshLiveStats();
        router.refresh();
      })
      // contact_messages változás → lista azonnali frissítése
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_messages" }, (payload) => {
        setContactMessages((prev) => [payload.new as ContactMessage, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "contact_messages" }, (payload) => {
        setContactMessages((prev) => prev.map((m) => m.id === (payload.new as ContactMessage).id ? (payload.new as ContactMessage) : m));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "contact_messages" }, (payload) => {
        setContactMessages((prev) => prev.filter((m) => m.id !== (payload.old as ContactMessage).id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshLiveStats, router]);

  const defaultFilter: Filter = totalPending > 0 ? "pending" : preRegistrations.length > 0 ? "prereg" : unreadContact > 0 ? "contact" : "users";

  const [filter, setFilter] = useState<Filter>(defaultFilter);

  /* Mobilon a stat-kártyák alatt kezdődő tartalom a képernyőn kívül van,
     ezért kártyaválasztás után odagördítünk. A kártyarács magassága nem
     változik a szűrőtől, így a célpont már a újrarajzolás előtt a helyén van
     – nem kell megvárni a szekció megjelenését. Weben nincs görgetés, ott
     a tartalom amúgy is látszik. */
  const contentRef = useRef<HTMLDivElement>(null);
  const selectFilter = (target: Filter) => {
    setFilter(target);
    if (window.innerWidth >= 768) return;
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const markRead = async (id: string) => {
    await fetch(`/api/admin/contact-messages/${id}`, { method: "PATCH" });
    setContactMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m));
    window.dispatchEvent(new CustomEvent("contact-message-read"));
  };

  const markAllRead = async () => {
    const unreadIds = contactMessages.filter((m) => !m.read).map((m) => m.id);
    if (unreadIds.length === 0) return;
    await Promise.all(unreadIds.map((id) => fetch(`/api/admin/contact-messages/${id}`, { method: "PATCH" })));
    setContactMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    window.dispatchEvent(new CustomEvent("contact-message-read"));
  };

  const deleteMessage = async (id: string) => {
    const res = await fetch(`/api/admin/contact-messages/${id}`, { method: "DELETE" });
    if (res.ok) {
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
      window.dispatchEvent(new CustomEvent("contact-message-read"));
    }
  };

  const stats: { label: string; value: number; icon: React.ReactNode; target: Filter; highlight: boolean }[] = [
    { label: "Összes felhasználó",   value: liveStats.totalUsers,    icon: <Users className="h-6 w-6 text-[#84AAA6]" strokeWidth={1.5} />,        target: "users",   highlight: false },
    { label: "Jóváhagyásra vár",     value: totalPending,             icon: <ClockIcon className="h-6 w-6 text-[#84AAA6]" strokeWidth={1.5} />,    target: "pending", highlight: totalPending > 0 },
    { label: "Előregisztráció",      value: preRegistrations.length,  icon: <UserX className="h-6 w-6 text-[#84AAA6]" strokeWidth={1.5} />,         target: "prereg",  highlight: preRegistrations.length > 0 },
    { label: "Kapcsolati üzenetek",  value: contactMessages.length,   icon: <Mail className="h-6 w-6 text-[#84AAA6]" strokeWidth={1.5} />,          target: "contact", highlight: unreadContact > 0 },
    { label: "Hibanapló",            value: logCount,                  icon: <AlertTriangle className="h-6 w-6 text-[#84AAA6]" strokeWidth={1.5} />, target: "logs",    highlight: logCount > 0 },
    { label: "Látogatottság",        value: uniqueIpsToday,           icon: <ChartColumn className="h-6 w-6 text-[#84AAA6]" strokeWidth={1.5} />,   target: "visits",  highlight: false },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-10">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => selectFilter(s.target)}
            className={`text-left rounded-lg p-4 border transition-all cursor-pointer ${
              filter === s.target
                ? "border-[#84AAA6] bg-[#84AAA6]/5 ring-1 ring-[#84AAA6]"
                : s.highlight
                ? "border-yellow-300 bg-yellow-50 hover:border-[#84AAA6]"
                : "border-gray-200 bg-white hover:border-[#84AAA6]"
            }`}
          >
            <div className="mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-base text-gray-900 mt-0.5">{s.label}</div>
          </button>
        ))}

        {/* Summary tile — mobilon teljes szélességben, két hasábban */}
        <div className="col-span-2 md:col-span-1 rounded-lg border border-[#84AAA6]/30 bg-gradient-to-br from-[#84AAA6]/12 via-[#84AAA6]/5 to-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5 text-[#5C8480]">
            <ChartPie className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="text-sm font-semibold uppercase tracking-wide">Összesítő</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-5 md:grid-cols-1">
            {[
              { label: "Összes felhasználó",        value: liveStats.totalUsers },
              { label: "Jóváhagyott szolgáltató",   value: liveStats.totalApproved },
              { label: "Jóváhagyásra vár",           value: totalPending },
              { label: "Előregisztráció",            value: preRegistrations.length },
              { label: "Látogató",                   value: liveStats.totalVisitors },
              { label: "Kapcsolati üzenetek",        value: contactMessages.length },
            ].map(({ label, value }, i, rows) => {
              /* Az elválasztó vonal az utolsó sorok alól elmarad: mobilon két
                 hasáb van, ezért az utolsó kettő alól, md-től egy hasáb, ott
                 csak a legutolsó alól. */
              const border =
                i < rows.length - 2 ? "border-b" : i === rows.length - 1 ? "" : "md:border-b";
              return (
                <div
                  key={label}
                  className={`flex items-center justify-between gap-2 border-[#84AAA6]/15 py-1 ${border}`}
                >
                  <dt className="text-sm text-[#5C8480] leading-tight">{label}</dt>
                  <dd className="text-sm font-bold text-gray-900 shrink-0">{value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      <div ref={contentRef} className="scroll-mt-20">
      {/* Pending (registrations + edits combined) */}
      {filter === "pending" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Jóváhagyásra váró tételek
            {totalPending > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-sm bg-[#F06C6C] text-white rounded-full font-bold">
                {totalPending}
              </span>
            )}
          </h2>
          {totalPending === 0 ? (
            <p className="text-gray-500 text-base">Nincs jóváhagyásra váró tétel.</p>
          ) : (
            <div className="space-y-4">
              {allPending.map((item) => (
                <ProviderRow key={item.id} provider={item} type={item.kind} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Users */}
      {filter === "users" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Felhasználók kezelése</h2>
          <UsersSection providerStatuses={providerStatuses} />
        </section>
      )}

      {/* Pre-registrations */}
      {filter === "prereg" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            Előregisztrációk
            {preRegistrations.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-sm bg-amber-400 text-white rounded-full font-bold">
                {preRegistrations.length}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-400 mb-4">Regisztráltak, de még nem erősítették meg az e-mail-címüket. 24 óra után automatikusan törlődnek.</p>
          {preRegistrations.length === 0 ? (
            <p className="text-gray-500 text-base">Nincs függő előregisztráció.</p>
          ) : (
            <div className="space-y-3">
              {preRegistrations.map((pr) => {
                const createdAt = new Date(pr.created_at);
                const elapsedMs = Date.now() - createdAt.getTime();
                const elapsedH = Math.floor(elapsedMs / (1000 * 60 * 60));
                const elapsedM = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
                const remainingH = 24 - elapsedH;
                return (
                  <div key={pr.id} className="bg-white border border-amber-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-900">{pr.full_name || "–"}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pr.role === "provider" ? "bg-[#D07AB5]/15 text-[#D07AB5]" : "bg-[#84AAA6]/15 text-[#84AAA6]"}`}>
                            {pr.role === "provider" ? "Szolgáltató" : "Látogató"}
                          </span>
                        </div>
                        <p className="text-base text-gray-600">{pr.email}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Regisztrált: {createdAt.toLocaleString("hu-HU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          {" · "}
                          <span className={remainingH <= 2 ? "text-red-500 font-medium" : "text-gray-400"}>
                            {elapsedH > 0 ? `${elapsedH} órája` : `${elapsedM} perce`} regisztrált · még {remainingH} óra van hátra
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={async () => {
                            setResendingIds((prev) => ({ ...prev, [pr.id]: "loading" }));
                            try {
                              const res = await fetch("/api/admin/pre-registrations/resend", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: pr.email, name: pr.full_name }),
                              });
                              setResendingIds((prev) => ({ ...prev, [pr.id]: res.ok ? "done" : "error" }));
                              setTimeout(() => setResendingIds((prev) => { const n = { ...prev }; delete n[pr.id]; return n; }), 3000);
                            } catch {
                              setResendingIds((prev) => ({ ...prev, [pr.id]: "error" }));
                              setTimeout(() => setResendingIds((prev) => { const n = { ...prev }; delete n[pr.id]; return n; }), 3000);
                            }
                          }}
                          disabled={resendingIds[pr.id] === "loading"}
                          className={`text-sm flex items-center gap-1 transition-colors ${
                            resendingIds[pr.id] === "done" ? "text-green-600" :
                            resendingIds[pr.id] === "error" ? "text-[#F06C6C]" :
                            "text-[#84AAA6] hover:text-[#6B8E8A]"
                          }`}
                        >
                          {resendingIds[pr.id] === "done" ? <Check className="h-4 w-4" strokeWidth={2} /> :
                           resendingIds[pr.id] === "error" ? <Send className="h-4 w-4" strokeWidth={1.5} /> :
                           <Send className="h-4 w-4" strokeWidth={1.5} />}
                          {resendingIds[pr.id] === "done" ? "Elküldve" :
                           resendingIds[pr.id] === "error" ? "Hiba" :
                           resendingIds[pr.id] === "loading" ? "Küldés..." : "Email újraküldés"}
                        </button>
                        <button
                          onClick={async () => {
                            const res = await fetch(`/api/admin/users/${pr.id}`, { method: "DELETE" });
                            if (res.ok) setPreRegistrations((prev) => prev.filter((p) => p.id !== pr.id));
                          }}
                          className="text-sm text-[#F06C6C] hover:text-[#d94f4f] flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          Törlés
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Home page visits */}
      {filter === "visits" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Főoldal látogatottsága</h2>
          <p className="text-sm text-gray-400 mb-4">Egyedi IP-címek napi és heti bontásban.</p>
          <VisitsSection />
        </section>
      )}

      {/* Error logs */}
      {filter === "logs" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hibanapló</h2>
          <LogsSection />
        </section>
      )}

      {/* Contact messages */}
      {filter === "contact" && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Beérkező kapcsolati üzenetek
              {unreadContact > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-sm bg-[#F06C6C] text-white rounded-full font-bold">
                  {unreadContact}
                </span>
              )}
            </h2>
            {unreadContact > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm text-[#84AAA6] hover:underline"
              >
                Összes olvasottnak jelöl
              </button>
            )}
          </div>
          {contactMessages.length === 0 ? (
            <p className="text-gray-500 text-base">Nincs beérkező üzenet.</p>
          ) : (
            <div className="space-y-3">
              {contactMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`bg-white border rounded-lg p-5 transition-colors ${!msg.read ? "border-[#84AAA6] bg-[#84AAA6]/5" : "border-gray-200"}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900">{msg.name}</span>
                        {!msg.read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F06C6C] text-white">Új</span>
                        )}
                        <span className="text-sm text-gray-400">
                          {new Date(msg.created_at).toLocaleString("hu-HU", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-base text-gray-600 mb-0.5">
                        <a href={`mailto:${msg.email}`} className="text-[#84AAA6] hover:underline">{msg.email}</a>
                      </p>
                      {msg.phone && (
                        <p className="text-base text-gray-600 mb-0.5">{msg.phone}</p>
                      )}
                      <p className="text-base text-gray-900 mt-3 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 items-end">
                      {!msg.read && (
                        <button
                          onClick={() => markRead(msg.id)}
                          className="text-sm text-[#84AAA6] hover:underline"
                        >
                          Olvasottnak jelöl
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="text-sm text-[#F06C6C] hover:text-[#d94f4f] flex items-center gap-1"
                        title="Üzenet törlése"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        Törlés
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
      </div>
    </>
  );
}

// ── Field labels for diff display ──────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  full_name:            "Teljes név",
  phone:                "Telefonszám",
  description:          "Rövid bemutatkozás",
  detailed_description: "Részletes bemutatkozás",
  website:              "Weboldal",
  avatar_url:           "Profilkép",
  counties:             "Megyék",
  categories:           "Kategóriák",
  pricing_text:         "Árak szöveg",
  pricing_pdf_url:      "Árlista PDF",
};

function DiffValue({ value, field }: { value: unknown; field?: string }) {
  if (value === null || value === undefined || value === "") return <span className="text-gray-400 italic">–</span>;
  if (Array.isArray(value)) {
    const items = value as string[];
    const labels = field === "categories"
      ? items.map((c) => CATEGORY_LABELS[c as ServiceCategory] ?? c)
      : items;
    return <span className="text-sm">{labels.join(", ") || "–"}</span>;
  }
  const str = String(value);
  if (field === "pricing_pdf_url" && str.startsWith("http")) {
    return (
      <a href={str} target="_blank" rel="noopener noreferrer" className="text-sm text-[#84AAA6] underline hover:text-[#6B8E8A]">
        PDF megtekintése
      </a>
    );
  }
  if (str.startsWith("http") && (str.includes("/avatar") || str.includes("supabase"))) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={str} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 inline-block" />;
  }
  if (str.length > 80) return <span className="text-sm">{str.slice(0, 80)}…</span>;
  return <span className="text-sm">{str}</span>;
}

function EditDiff({ current, proposed }: { current: Provider; proposed: Record<string, unknown> }) {
  const fields = Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[];
  const changed = fields.filter((f) => {
    // Only consider fields that were explicitly included in the pending_changes payload
    if (!(f in proposed)) return false;
    const oldVal = current[f] ?? null;
    const newVal = proposed[f] ?? null;
    const serialize = (v: unknown) => Array.isArray(v) ? JSON.stringify([...v].sort()) : String(v ?? "");
    return serialize(oldVal) !== serialize(newVal);
  });

  const proposedGallery = Array.isArray(proposed.gallery_urls) ? (proposed.gallery_urls as string[]) : null;
  const currentGallery = Array.isArray(current.gallery_urls) ? (current.gallery_urls as string[]) : [];
  const galleryChanged = proposedGallery !== null && JSON.stringify(proposedGallery) !== JSON.stringify(currentGallery);
  const newGallery = galleryChanged ? proposedGallery : null;

  if (changed.length === 0 && !newGallery) {
    return <p className="text-sm text-gray-400 mt-2">Nincs szöveges változtatás.</p>;
  }

  return (
    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
      {changed.map((f) => (
        <div key={f} className="grid grid-cols-[auto_1fr] gap-x-3 items-start text-sm">
          <span className="text-gray-500 font-medium whitespace-nowrap pt-0.5">{FIELD_LABELS[f]}:</span>
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="line-through text-[#F06C6C] break-all"><DiffValue value={current[f]} field={f} /></span>
            <span className="text-gray-400">→</span>
            <span className="text-green-700 font-medium break-all"><DiffValue value={proposed[f]} field={f} /></span>
          </div>
        </div>
      ))}
      {newGallery && (
        <div className="pt-1">
          <span className="text-gray-500 font-medium text-sm">Galéria ({newGallery.length} kép):</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {newGallery.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderRow({ provider, type }: { provider: Provider; type: "registration" | "edit" }) {
  const changes = type === "edit" ? (provider.pending_changes as Record<string, unknown>) : null;
  // For new registrations show the provider data; for edits show current live data in header
  const header = provider;
  const cats = (header.categories as ServiceCategory[] | undefined) ?? [];
  const cnts = (header.counties as string[] | undefined) ?? [];
  const categoryLabels = cats.map((c) => CATEGORY_LABELS[c] ?? String(c)).join(", ");

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-4 min-w-0 flex-1">
          {/* Avatar – show proposed if available */}
          <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
            {(changes?.avatar_url ?? header.avatar_url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(changes?.avatar_url ?? header.avatar_url ?? "")} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-gray-900">
                {String(header.full_name ?? "?").charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-gray-900">{String(header.full_name ?? "")}</span>
              <Badge variant={type === "edit" ? "default" : "pending"} className="text-base">
                {type === "edit" ? "Módosítás" : "Új regisztráció"}
              </Badge>
            </div>
            <p className="text-base text-gray-900 mb-0.5">{String(header.email ?? "")}</p>
            <p className="text-base text-gray-900 mb-0.5">{String(header.phone ?? "")}</p>
            {categoryLabels && (
              <p className="text-base text-gray-900 mb-0.5">{categoryLabels}</p>
            )}
            {cnts.length > 0 && (
              <p className="text-base text-gray-900 mb-0.5">{cnts.join(", ")}</p>
            )}
            {type === "registration" && header.description ? (
              <div className="mt-2 max-w-md">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Rövid bemutatkozás</p>
                <p className="text-base text-gray-900">{String(header.description)}</p>
              </div>
            ) : null}

            {type === "registration" && header.detailed_description ? (
              <div className="mt-2 max-w-md">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Részletes bemutatkozás</p>
                <p className="text-base text-gray-900 whitespace-pre-line">{String(header.detailed_description)}</p>
              </div>
            ) : null}

            {type === "registration" && header.website ? (
              <div className="mt-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Weboldal</p>
                <a href={String(header.website)} target="_blank" rel="noopener noreferrer" className="text-base text-[#84AAA6] hover:underline break-all">
                  {String(header.website)}
                </a>
              </div>
            ) : null}

            {type === "registration" && Array.isArray(header.gallery_urls) && (header.gallery_urls as string[]).length > 0 ? (
              <div className="mt-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Galéria ({(header.gallery_urls as string[]).length} kép)</p>
                <div className="flex flex-wrap gap-2">
                  {(header.gallery_urls as string[]).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Galéria ${i + 1}`} className="w-16 h-16 object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Diff view for edits */}
            {type === "edit" && changes && (
              <EditDiff current={provider} proposed={changes} />
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <ApproveButton providerId={String(provider.id)} type={type} action="approve" changes={changes} />
          <ApproveButton providerId={String(provider.id)} type={type} action="reject" changes={null} />
        </div>
      </div>
    </div>
  );
}
