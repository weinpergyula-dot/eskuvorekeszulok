"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: "visitor" | "provider" | "admin";
  created_at: string;
  // joined from providers table
  providerApprovalStatus?: string | null;
  providerHasPendingChanges?: boolean;
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
  pending:  "Jóváhagyásra váró",
  visitor:  "Látogató",
  admin:    "Admin",
};

export function UsersSection() {
  const router = useRouter();
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      supabase.from("providers").select("user_id, approval_status, pending_changes"),
    ]).then(([profileData, { data: providerData }]) => {
      const profiles: UserProfile[] = Array.isArray(profileData) ? profileData : [];
      const providerMap = new Map(
        (providerData ?? []).map((p) => [p.user_id, p])
      );
      setUsers(profiles.map((u) => {
        const prov = providerMap.get(u.user_id);
        return {
          ...u,
          providerApprovalStatus: prov?.approval_status ?? null,
          providerHasPendingChanges: !!prov?.pending_changes,
        };
      }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      let matchesFilter = true;
      if (approvalFilter === "approved") {
        matchesFilter = u.role === "provider"
          && u.providerApprovalStatus === "approved"
          && !u.providerHasPendingChanges;
      } else if (approvalFilter === "pending") {
        matchesFilter = u.role === "provider"
          && (u.providerApprovalStatus === "pending" || !!u.providerHasPendingChanges);
      } else if (approvalFilter === "visitor") {
        matchesFilter = u.role === "visitor";
      } else if (approvalFilter === "admin") {
        matchesFilter = u.role === "admin";
      }
      // "all" → matchesFilter stays true

      return matchesSearch && matchesFilter;
    });
  }, [users, search, approvalFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (v: ApprovalFilter) => { setApprovalFilter(v); setPage(1); };

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
          <p className="text-lg text-gray-900 mb-1">
            Biztosan véglegesen törlöd ezt a felhasználót?
          </p>
          <p className="text-lg font-medium text-gray-900 mb-4">
            {confirmDelete.full_name || confirmDelete.email}
          </p>
          <p className="text-base text-red-600 mb-5">
            Ez a művelet nem visszavonható. A felhasználó összes adata törlődik.
          </p>
          <div className="flex gap-3 justify-end">
            <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)}>
              Mégse
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={deleting === confirmDelete.user_id}
              onClick={() => deleteUser(confirmDelete)}
            >
              {deleting === confirmDelete.user_id ? "Törlés..." : "Végleges törlés"}
            </Button>
          </div>
        </div>
      </div>
    )}
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Keresés név vagy email alapján..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", "approved", "pending", "visitor", "admin"] as ApprovalFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-3 py-1.5 rounded-md text-base font-medium border transition-colors cursor-pointer ${
                approvalFilter === f
                  ? "bg-[#84AAA6] text-white border-[#84AAA6]"
                  : "bg-white text-gray-900 border-gray-200 hover:border-[#84AAA6]"
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-base text-gray-900">{filtered.length} felhasználó</p>

      {error && (
        <div className="bg-red-50 text-red-700 text-lg px-4 py-3 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {paginated.length === 0 && (
        <p className="text-gray-900 text-lg">Nincs találat.</p>
      )}

      <div className="space-y-3">
        {paginated.map((u) => (
          <div
            key={u.id}
            className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-medium text-gray-900 text-lg">{u.full_name || "–"}</span>
                <Badge variant={ROLE_BADGE[u.role]} className="text-base">
                  {ROLE_LABELS[u.role]}
                </Badge>
              </div>
              <p className="text-base text-gray-900">{u.email}</p>
              <p className="text-base text-gray-900 mt-0.5">
                Regisztrált: {new Date(u.created_at).toLocaleDateString("hu-HU")}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap shrink-0">
              {u.role !== "admin" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating === u.user_id}
                  onClick={() => setRole(u.user_id, "admin")}
                  className="text-base cursor-pointer"
                >
                  Admin legyen
                </Button>
              )}
              {u.role === "admin" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating === u.user_id}
                  onClick={() => setRole(u.user_id, "visitor")}
                  className="text-base cursor-pointer"
                >
                  Admin jog elvétele
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                disabled={deleting === u.user_id}
                onClick={() => setConfirmDelete(u)}
                className="text-base cursor-pointer"
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
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="cursor-pointer"
          >
            ← Előző
          </Button>
          <span className="text-lg text-gray-900">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="cursor-pointer"
          >
            Következő →
          </Button>
        </div>
      )}
    </div>
    </>
  );
}
