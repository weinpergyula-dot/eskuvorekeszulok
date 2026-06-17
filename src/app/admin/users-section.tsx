"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Eye, Tag, ChevronUp, ChevronDown, ChevronsUpDown, Star, Trash2, RotateCcw, Check } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/types";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: "visitor" | "provider" | "admin";
  created_at: string;
  avatar_url?: string | null;
  phone: string | null;
  providerCategories: string[] | null;
  providerViewCount: number | null;
  providerApprovalStatus?: string | null;
  providerHasPendingChanges?: boolean;
  providerId?: string | null;
  providerFeatured?: "teal" | "silver" | "gold" | null;
}

function OnboardingResetButton({ userId }: { userId: string }) {
  const [done, setDone] = useState(false);
  const reset = () => {
    localStorage.removeItem(`onboarding_done_${userId}`);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };
  return (
    <button
      onClick={reset}
      title="Onboarding tour reset (localStorage törlés)"
      className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-[#84AAA6] hover:text-[#84AAA6] transition-colors cursor-pointer"
    >
      {done ? <Check className="h-3.5 w-3.5 text-green-500" /> : <RotateCcw className="h-3.5 w-3.5" />}
    </button>
  );
}

interface ProviderStatus {
  id: string;
  user_id: string;
  approval_status: string;
  pending_changes: unknown;
}

interface DeletedUser {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  deleted_at: string;
  deleted_by: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  visitor: "Látogató",
  provider: "Szolgáltató",
  admin: "Admin",
};

const ROLE_BADGE: Record<string, "default" | "secondary" | "approved" | "admin"> = {
  visitor: "secondary",
  provider: "default",
  admin: "admin",
};

const PAGE_SIZE_OPTIONS = [10, 50, 100];

type ApprovalFilter = "all" | "provider" | "visitor" | "admin" | "deleted";

const FILTER_LABELS: Record<ApprovalFilter, string> = {
  all:      "Összes",
  provider: "Szolgáltatók",
  visitor:  "Látogatók",
  admin:    "Admin",
  deleted:  "Törölt",
};

type SortKey = "full_name" | "role" | "email" | "created_at" | "providerViewCount";
type SortDir = "asc" | "desc";

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 inline ml-1" />;
  return dir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 text-[#84AAA6] inline ml-1" />
    : <ChevronDown className="h-3.5 w-3.5 text-[#84AAA6] inline ml-1" />;
}

export function UsersSection({ providerStatuses }: { providerStatuses: ProviderStatus[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    void providerStatuses;
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object" && "users" in data) {
          setUsers(Array.isArray(data.users) ? data.users : []);
          setDeletedUsers(Array.isArray(data.deletedUsers) ? data.deletedUsers : []);
        } else {
          // fallback if old shape
          setUsers(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const u of users) {
      for (const c of u.providerCategories ?? []) cats.add(c);
    }
    return [...cats].sort();
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      let matchesFilter = true;
      if (approvalFilter === "provider") {
        matchesFilter = u.role === "provider" || u.providerId != null;
      } else if (approvalFilter === "visitor") {
        matchesFilter = u.role === "visitor";
      } else if (approvalFilter === "admin") {
        matchesFilter = u.role === "admin";
      }

      const matchesCategory =
        !categoryFilter ||
        (u.providerCategories ?? []).includes(categoryFilter);

      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [users, search, approvalFilter, categoryFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "full_name") cmp = a.full_name.localeCompare(b.full_name, "hu");
      else if (sortKey === "role") cmp = a.role.localeCompare(b.role, "hu");
      else if (sortKey === "email") cmp = a.email.localeCompare(b.email, "hu");
      else if (sortKey === "created_at") cmp = a.created_at.localeCompare(b.created_at);
      else if (sortKey === "providerViewCount") cmp = (a.providerViewCount ?? -1) - (b.providerViewCount ?? -1);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (v: ApprovalFilter) => { setApprovalFilter(v); setPage(1); };
  const handleCategory = (v: string | null) => { setCategoryFilter(v); setPage(1); };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const setRole = async (userId: string, role: string) => {
    setUpdating(userId);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Hiba történt.");
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: role as UserProfile["role"] } : u))
      );
      router.refresh();
    }
    setUpdating(null);
  };

  const setFeaturedTier = async (u: UserProfile, tier: "teal" | "silver" | "gold") => {
    if (!u.providerId) return;
    setUpdating(u.user_id);
    setError(null);
    // clicking the active tier removes it; clicking the other switches to it
    const newTier: "teal" | "silver" | "gold" | null = u.providerFeatured === tier ? null : tier;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setFeaturedTier: newTier, providerId: u.providerId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Hiba történt.");
    } else {
      setUsers((prev) =>
        prev.map((x) => x.user_id === u.user_id ? { ...x, providerFeatured: data.featured } : x)
      );
    }
    setUpdating(null);
  };

  const deleteUser = async (u: UserProfile) => {
    setDeleting(u.user_id);
    setError(null);
    setConfirmDelete(null);
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.user_id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Hiba történt.");
    } else {
      setUsers((prev) => prev.filter((x) => x.user_id !== u.user_id));
      router.refresh();
    }
    setDeleting(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-[#84AAA6] rounded-full animate-spin" />
    </div>
  );

  const thClass = "px-4 py-2.5 font-semibold text-gray-700 text-left select-none cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap";
  const thActive = "text-[#84AAA6]";

  return (
    <>
      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-2">Felhasználó törlése</h3>
            <p className="text-lg text-gray-900 mb-1">Biztosan véglegesen törlöd ezt a felhasználót?</p>
            <p className="text-lg font-medium text-gray-900 mb-4">{confirmDelete.full_name || confirmDelete.email}</p>
            <p className="text-base text-[#F06C6C] mb-5">Ez a művelet nem visszavonható. A felhasználó összes adata törlődik.</p>
            <div className="flex gap-3 justify-end">
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)}>Mégse</Button>
              <Button size="sm" variant="destructive" disabled={deleting === confirmDelete.user_id} onClick={() => deleteUser(confirmDelete)}>
                {deleting === confirmDelete.user_id ? "Törlés..." : "Végleges törlés"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Search */}
        <div className="max-w-sm">
          <FloatingInput
            id="admin-search"
            label="Keresés név vagy email alapján..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            compact
          />
        </div>

        {/* Role / status filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "provider", "visitor", "admin", "deleted"] as ApprovalFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                approvalFilter === f
                  ? f === "deleted" ? "bg-[#F06C6C] text-white border-[#F06C6C]" : "bg-[#84AAA6] text-white border-[#84AAA6]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#84AAA6]"
              }`}
            >
              {f === "deleted" && <Trash2 className="h-3.5 w-3.5" />}
              {FILTER_LABELS[f]}
              {f === "deleted" && deletedUsers.length > 0 && (
                <span className={`text-xs font-bold rounded-full px-1.5 ${approvalFilter === "deleted" ? "bg-white/30" : "bg-[#F06C6C]/15 text-[#F06C6C]"}`}>
                  {deletedUsers.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Category filters */}
        {allCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategory(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                categoryFilter === null
                  ? "bg-gray-700 text-white border-gray-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              Minden kategória
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat === categoryFilter ? null : cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-[#84AAA6] text-white border-[#84AAA6]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#84AAA6]"
                }`}
              >
                {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">{sorted.length} felhasználó</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Oldalanként:</span>
            <div className="flex gap-1">
              {PAGE_SIZE_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => { setPageSize(n); setPage(1); }}
                  className={`px-2.5 py-1 rounded text-sm font-medium border transition-colors cursor-pointer ${
                    pageSize === n
                      ? "bg-[#84AAA6] text-white border-[#84AAA6]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#84AAA6]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-sm px-4 py-3 rounded-xl border border-[#F06C6C]/30">
            {error}
          </div>
        )}

        {/* ── Törölt felhasználók nézet ─────────────────────────────────── */}
        {approvalFilter === "deleted" && (
          <>
            {deletedUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">Még senki sem törölte a fiókját.</p>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm hidden sm:table">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-left">Név</th>
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-left">E-mail</th>
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-left">Korábbi szerepkör</th>
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-left">Törölve</th>
                      <th className="px-4 py-2.5 font-semibold text-gray-700 text-left">Ki törölte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deletedUsers.map((d) => (
                      <tr key={d.id} className="bg-white hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-900 font-medium">{d.full_name || "–"}</td>
                        <td className="px-4 py-2.5 text-gray-600">{d.email || "–"}</td>
                        <td className="px-4 py-2.5 text-gray-500">{ROLE_LABELS[d.role ?? ""] ?? d.role ?? "–"}</td>
                        <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                          {new Date(d.deleted_at).toLocaleString("hu-HU")}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {d.deleted_by ? (
                            <span className="text-[#F06C6C] font-medium">Admin</span>
                          ) : (
                            <span className="text-gray-400">Saját maga</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Mobile cards */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {deletedUsers.map((d) => (
                    <div key={d.id} className="px-4 py-3 bg-white space-y-1">
                      <p className="font-medium text-gray-900">{d.full_name || "–"}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {d.email || "–"}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(d.deleted_at).toLocaleString("hu-HU")}
                        {" · "}
                        {d.deleted_by
                          ? <span className="text-[#F06C6C]">Admin törölte</span>
                          : "Saját maga törölte"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {approvalFilter !== "deleted" && paginated.length === 0 && (
          <p className="text-gray-500 text-sm">Nincs találat.</p>
        )}

        {/* Desktop table – aktív felhasználók */}
        {approvalFilter !== "deleted" && <div className="hidden sm:block rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className={`${thClass} ${sortKey === "full_name" ? thActive : ""}`} onClick={() => handleSort("full_name")}>
                  Név <SortIcon col="full_name" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className={`${thClass} ${sortKey === "role" ? thActive : ""}`} onClick={() => handleSort("role")}>
                  Fiók típusa <SortIcon col="role" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className={`${thClass} ${sortKey === "email" ? thActive : ""}`} onClick={() => handleSort("email")}>
                  E-mail <SortIcon col="email" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className={`${thClass} cursor-default hover:bg-gray-50`}>Kategóriák</th>
                <th className={`${thClass} ${sortKey === "created_at" ? thActive : ""}`} onClick={() => handleSort("created_at")}>
                  Regisztrált <SortIcon col="created_at" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className={`${thClass} ${sortKey === "providerViewCount" ? thActive : ""}`} onClick={() => handleSort("providerViewCount")}>
                  <Eye className="h-3.5 w-3.5 inline" /> <SortIcon col="providerViewCount" sortKey={sortKey} dir={sortDir} />
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((u) => (
                <tr key={u.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden bg-[#84AAA6]/20 flex items-center justify-center">
                        {u.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar_url ?? ""} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-semibold text-[#84AAA6]">
                            {(u.full_name || u.email || "?").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("")}
                          </span>
                        )}
                      </div>
                      {u.providerApprovalStatus === "approved" && u.providerId ? (
                        <Link href={`/providers/${u.providerId}`}
                          className="font-medium text-[#84AAA6] hover:underline whitespace-nowrap">
                          {u.full_name || "–"}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900 whitespace-nowrap">{u.full_name || "–"}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={ROLE_BADGE[u.role]} className="text-xs">{ROLE_LABELS[u.role]}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 max-w-[180px] truncate">{u.email}</td>

                  <td className="px-4 py-2.5 text-gray-600 max-w-[200px]">
                    <span className="line-clamp-2 leading-snug">
                      {(u.providerCategories ?? []).length > 0
                        ? (u.providerCategories ?? []).map((c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c).join(", ")
                        : "–"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString("hu-HU")}
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">
                    {u.providerViewCount ?? "–"}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 justify-end">
                      {u.providerApprovalStatus === "approved" && u.providerId && (
                        <>
                          {/* Silver star */}
                          <button
                            disabled={updating === u.user_id}
                            onClick={() => setFeaturedTier(u, "silver")}
                            title={u.providerFeatured === "silver" ? "Ezüst – kattints az eltávolításhoz" : "Ezüst kiemelés"}
                            className={`h-7 w-7 flex items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-50 ${
                              u.providerFeatured === "silver"
                                ? "bg-slate-400 border-slate-400 text-white hover:bg-slate-500"
                                : "bg-white border-gray-200 text-gray-400 hover:border-slate-400 hover:text-slate-400"
                            }`}
                          >
                            <Star className="h-3.5 w-3.5" fill={u.providerFeatured === "silver" ? "currentColor" : "none"} />
                          </button>
                          {/* Teal star */}
                          <button
                            disabled={updating === u.user_id}
                            onClick={() => setFeaturedTier(u, "teal")}
                            title={u.providerFeatured === "teal" ? "Türkiz – kattints az eltávolításhoz" : "Türkiz kiemelés"}
                            className={`h-7 w-7 flex items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-50 ${
                              u.providerFeatured === "teal"
                                ? "bg-[#84AAA6] border-[#84AAA6] text-white hover:bg-[#6B8E8A]"
                                : "bg-white border-gray-200 text-gray-400 hover:border-[#84AAA6] hover:text-[#84AAA6]"
                            }`}
                          >
                            <Star className="h-3.5 w-3.5" fill={u.providerFeatured === "teal" ? "currentColor" : "none"} />
                          </button>
                          {/* Gold star */}
                          <button
                            disabled={updating === u.user_id}
                            onClick={() => setFeaturedTier(u, "gold")}
                            title={u.providerFeatured === "gold" ? "Arany – kattints az eltávolításhoz" : "Arany kiemelés"}
                            className={`h-7 w-7 flex items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-50 ${
                              u.providerFeatured === "gold"
                                ? "bg-amber-500 border-amber-400 text-white hover:bg-amber-600"
                                : "bg-white border-gray-200 text-gray-400 hover:border-amber-400 hover:text-amber-400"
                            }`}
                          >
                            <Star className="h-3.5 w-3.5" fill={u.providerFeatured === "gold" ? "currentColor" : "none"} />
                          </button>
                        </>
                      )}
                      {u.role !== "admin" ? (
                        <Button size="sm" variant="outline" disabled={updating === u.user_id}
                          onClick={() => setRole(u.user_id, "admin")}
                          className="text-xs cursor-pointer h-7 px-2.5 whitespace-nowrap">
                          Admin legyen
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled={updating === u.user_id}
                          onClick={() => setRole(u.user_id, "visitor")}
                          className="text-xs cursor-pointer h-7 px-2.5 whitespace-nowrap">
                          Admin jog elvétele
                        </Button>
                      )}
                      <OnboardingResetButton userId={u.user_id} />
                      <Button size="sm" variant="destructive" disabled={deleting === u.user_id}
                        onClick={() => setConfirmDelete(u)}
                        className="text-xs cursor-pointer h-7 px-2.5">
                        Törlés
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        }

        {/* Mobile cards – aktív felhasználók */}
        {approvalFilter !== "deleted" && <div className="sm:hidden space-y-3">
          {paginated.map((u) => (
            <div key={u.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden bg-[#84AAA6]/20 flex items-center justify-center">
                    {u.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatar_url ?? ""} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-[#84AAA6]">
                        {(u.full_name || u.email || "?").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {u.providerApprovalStatus === "approved" && u.providerId ? (
                      <Link href={`/providers/${u.providerId}`}
                        className="font-semibold text-base text-[#84AAA6] hover:underline truncate">
                        {u.full_name || "–"}
                      </Link>
                    ) : (
                      <span className="font-semibold text-base text-gray-900 truncate">{u.full_name || "–"}</span>
                    )}
                    <Badge variant={ROLE_BADGE[u.role]} className="text-xs shrink-0">{ROLE_LABELS[u.role]}</Badge>
                  </div>
                </div>
                {u.providerViewCount != null && (
                  <span className="flex items-center gap-1 text-sm text-gray-400 shrink-0">
                    <Eye className="h-4 w-4" />
                    {u.providerViewCount}
                  </span>
                )}
              </div>
              <div className="px-4 pb-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>

                {(u.providerCategories ?? []).length > 0 && (
                  <div className="flex items-start gap-1.5 text-xs text-gray-600">
                    <Tag className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {(u.providerCategories ?? []).map((c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c).join(", ")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>Regisztrált: {new Date(u.created_at).toLocaleDateString("hu-HU")}</span>
                </div>
              </div>
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex gap-2 flex-wrap items-center justify-end">
                {u.providerApprovalStatus === "approved" && u.providerId && (
                  <>
                    {/* Silver star */}
                    <button
                      disabled={updating === u.user_id}
                      onClick={() => setFeaturedTier(u, "silver")}
                      title={u.providerFeatured === "silver" ? "Ezüst – kattints az eltávolításhoz" : "Ezüst kiemelés"}
                      className={`h-7 w-7 flex items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-50 ${
                        u.providerFeatured === "silver"
                          ? "bg-slate-400 border-slate-400 text-white"
                          : "bg-white border-gray-200 text-gray-400 hover:border-slate-400 hover:text-slate-400"
                      }`}
                    >
                      <Star className="h-3.5 w-3.5" fill={u.providerFeatured === "silver" ? "currentColor" : "none"} />
                    </button>
                    {/* Teal star */}
                    <button
                      disabled={updating === u.user_id}
                      onClick={() => setFeaturedTier(u, "teal")}
                      title={u.providerFeatured === "teal" ? "Türkiz – kattints az eltávolításhoz" : "Türkiz kiemelés"}
                      className={`h-7 w-7 flex items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-50 ${
                        u.providerFeatured === "teal"
                          ? "bg-[#84AAA6] border-[#84AAA6] text-white"
                          : "bg-white border-gray-200 text-gray-400 hover:border-[#84AAA6] hover:text-[#84AAA6]"
                      }`}
                    >
                      <Star className="h-3.5 w-3.5" fill={u.providerFeatured === "teal" ? "currentColor" : "none"} />
                    </button>
                    {/* Gold star */}
                    <button
                      disabled={updating === u.user_id}
                      onClick={() => setFeaturedTier(u, "gold")}
                      title={u.providerFeatured === "gold" ? "Arany – kattints az eltávolításhoz" : "Arany kiemelés"}
                      className={`h-7 w-7 flex items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-50 ${
                        u.providerFeatured === "gold"
                          ? "bg-amber-500 border-amber-400 text-white"
                          : "bg-white border-gray-200 text-gray-400 hover:border-amber-400 hover:text-amber-400"
                      }`}
                    >
                      <Star className="h-3.5 w-3.5" fill={u.providerFeatured === "gold" ? "currentColor" : "none"} />
                    </button>
                  </>
                )}
                <OnboardingResetButton userId={u.user_id} />
                {u.role !== "admin" ? (
                  <Button size="sm" variant="outline" disabled={updating === u.user_id}
                    onClick={() => setRole(u.user_id, "admin")}
                    className="text-xs cursor-pointer h-7 px-2.5">
                    Admin legyen
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled={updating === u.user_id}
                    onClick={() => setRole(u.user_id, "visitor")}
                    className="text-xs cursor-pointer h-7 px-2.5">
                    Admin jog elvétele
                  </Button>
                )}
                <Button size="sm" variant="destructive" disabled={deleting === u.user_id}
                  onClick={() => setConfirmDelete(u)}
                  className="text-xs cursor-pointer h-7 px-2.5">
                  Törlés
                </Button>
              </div>
            </div>
          ))}
        </div>}

        {/* Pagination – csak aktív nézetben */}
        {approvalFilter !== "deleted" && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="cursor-pointer">
              ← Előző
            </Button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="cursor-pointer">
              Következő →
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
