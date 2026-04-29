"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

export function UsersSection() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  if (loading) return <p className="text-gray-400 text-sm">Betöltés...</p>;

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-sm border border-red-200">
          {error}
        </div>
      )}
      {users.length === 0 && (
        <p className="text-gray-400 text-sm">Nincs felhasználó.</p>
      )}
      {users.map((u) => (
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
                className="text-xs"
              >
                Admin legyen
              </Button>
            )}
            {u.role === "admin" && (
              <Button
                size="sm"
                variant="destructive"
                disabled={updating === u.user_id}
                onClick={() => setRole(u.user_id, "visitor")}
                className="text-xs"
              >
                Admin jog elvétele
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
