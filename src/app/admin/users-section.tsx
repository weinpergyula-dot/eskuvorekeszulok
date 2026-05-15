"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Calendar, Eye, Tag } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/types";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: "visitor" | "provider" | "admin";
  created_at: string;
  phone: string | null;
  providerCategories: string[] | null;
  providerViewCount: number | null;
  providerApprovalStatus?: string | null;
  providerHasPendingChanges?: boolean;
  providerId?: string | null;
}

interface ProviderStatus {
  id: string;
  user_id: string;
  approval_status: string;
  pending_changes: unknown;
}

const ROLE_LABELS: Record<string, string> = {
  visitor: "Látogató",
  provider: "Szolgáltató",
  admin: "Admin",
};

const ROLE_BADGE: Record<string, "default" | "secondary" | "approved"> = {
  visitor: "secondary",
  provider: "default",
  admin: "approved",
};

const PAGE_SIZE = 10;

type ApprovalFilter = "all" | "approved" | "pending" | "visitor" | "admin";

const FILTER_LABELS: Record<ApprovalFilter, string> = {
  all:      "Összes",
  approved: "Jóváhagyott",
  pending:  "Függőben",
  visitor:  "Látogató",
  admin:    "Admin",
};

export function UsersSection({ providerStatuses }: { providerStatuses: ProviderStatus[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // providerStatuses is kept for backwards compat but API now returns merged data
    void providerStatuses;
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // All unique categories from providers
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
      if (approvalFilter === "approved") {
        matchesFilter = u.role === "provider" && u.providerApprovalStatus === "approved" && !u.providerHasPendingChanges;
      } else if (approvalFilter === "pending") {
        matchesFilter = u.providerApprovalStatus === "pending" || !!u.providerHasPendingChanges;
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (v: ApprovalFilter) => { setApprovalFilter(v); setPage(1); };
  const handleCategory = (v: string | null) => { setCategoryFilter(v); setPage(1); };

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
        <Input
          placeholder="Keresés név vagy email alapján..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />

        {/* Role / status filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "approved", "pending", "visitor", "admin"] as ApprovalFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                approvalFilter === f
                  ? "bg-[#84AAA6] text-white border-[#84AAA6]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#84AAA6]"
              }`}
            >
              {FILTER_LABELS[f]}
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

        <p className="text-sm text-gray-500">{filtered.length} felhasználó</p>

        {error && (
          <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-sm px-4 py-3 rounded-xl border border-[#F06C6C]/30">
            {error}
          </div>
        )}

        {paginated.length === 0 && (
          <p className="text-gray-500 text-sm">Nincs találat.</p>
        )}

        <div className="space-y-3">
          {paginated.map((u) => (
            <div key={u.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Card header: name + badge + view count */}
              <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  {u.providerApprovalStatus === "approved" && u.providerId ? (
                    <Link
                      href={`/providers/${u.providerId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-base text-[#84AAA6] hover:underline truncate"
                    >
                      {u.full_name || "–"}
                    </Link>
                  ) : (
                    <span className="font-semibold text-base text-gray-900 truncate">{u.full_name || "–"}</span>
                  )}
                  <Badge variant={ROLE_BADGE[u.role]} className="text-xs shrink-0">
                    {ROLE_LABELS[u.role]}
                  </Badge>
                </div>
                {u.providerViewCount != null && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                    <Eye className="h-3.5 w-3.5" />
                    {u.providerViewCount}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="px-4 pb-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>
                {u.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span>{u.phone}</span>
                  </div>
                )}
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

              {/* Actions */}
              <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex gap-2 flex-wrap">
                {u.role !== "admin" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating === u.user_id}
                    onClick={() => setRole(u.user_id, "admin")}
                    className="text-xs cursor-pointer h-7 px-2.5"
                  >
                    Admin legyen
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating === u.user_id}
                    onClick={() => setRole(u.user_id, "visitor")}
                    className="text-xs cursor-pointer h-7 px-2.5"
                  >
                    Admin jog elvétele
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleting === u.user_id}
                  onClick={() => setConfirmDelete(u)}
                  className="text-xs cursor-pointer h-7 px-2.5"
                >
                  Törlés
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
