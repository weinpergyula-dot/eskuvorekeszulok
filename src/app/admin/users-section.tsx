"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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

export function UsersSection() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleRole = (v: string) => { setRoleFilter(v); setPage(1); };

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

  if (loading) return <p className="text-gray-400 text-sm">Betöltés...</p>;

  return (
    <>
    {/* Confirm delete dialog */}
    {confirmDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
          <h3 className="font-bold text-gray-800 mb-2">Felhasználó törlése</h3>
          <p className="text-sm text-gray-600 mb-1">
            Biztosan véglegesen törlöd ezt a felhasználót?
          </p>
          <p className="text-sm font-medium text-gray-800 mb-4">
            {confirmDelete.full_name || confirmDelete.email}
          </p>
          <p className="text-xs text-red-600 mb-5">
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
        <div className="flex gap-2">
          {["all", "visitor", "provider", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => handleRole(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                roleFilter === r
                  ? "bg-[#2a9d8f] text-white border-[#2a9d8f]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#2a9d8f]"
              }`}
            >
              {r === "all" ? "Összes" : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} felhasználó</p>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {paginated.length === 0 && (
        <p className="text-gray-400 text-sm">Nincs találat.</p>
      )}

      <div className="space-y-3">
        {paginated.map((u) => (
          <div
            key={u.id}
            className="bg-white border border-gray-200 rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-medium text-gray-800 text-sm">{u.full_name || "–"}</span>
                <Badge variant={ROLE_BADGE[u.role]} className="text-xs">
                  {ROLE_LABELS[u.role]}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{u.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">
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
                  className="text-xs cursor-pointer"
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
                  className="text-xs cursor-pointer"
                >
                  Admin jog elvétele
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                disabled={deleting === u.user_id}
                onClick={() => setConfirmDelete(u)}
                className="text-xs cursor-pointer"
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
          <span className="text-sm text-gray-500">
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
