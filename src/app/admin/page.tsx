export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ApproveButton } from "./approve-button";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  // Fetch pending providers
  const { data: pendingProviders } = await supabase
    .from("providers")
    .select("*")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: false });

  // Fetch providers with pending changes
  const { data: pendingChanges } = await supabase
    .from("providers")
    .select("*")
    .eq("approval_status", "approved")
    .not("pending_changes", "is", null)
    .order("updated_at", { ascending: false });

  // Stats
  const { count: totalApproved } = await supabase
    .from("providers")
    .select("*", { count: "exact", head: true })
    .eq("approval_status", "approved");

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Összes felhasználó" value={totalUsers ?? 0} icon="👥" />
        <StatCard label="Jóváhagyott szolgáltató" value={totalApproved ?? 0} icon="✅" />
        <StatCard
          label="Jóváhagyásra vár"
          value={pendingProviders?.length ?? 0}
          icon="⏳"
          highlight={!!pendingProviders?.length}
        />
        <StatCard
          label="Módosítás jóváhagyásra vár"
          value={pendingChanges?.length ?? 0}
          icon="🔄"
          highlight={!!pendingChanges?.length}
        />
      </div>

      {/* Pending registrations */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          Új regisztrációk jóváhagyása
          {!!pendingProviders?.length && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-yellow-400 text-white rounded-full">
              {pendingProviders.length}
            </span>
          )}
        </h2>

        {!pendingProviders?.length ? (
          <p className="text-gray-400 text-sm">Nincs jóváhagyásra váró regisztráció.</p>
        ) : (
          <div className="space-y-4">
            {pendingProviders.map((provider) => (
              <ProviderRow
                key={provider.id}
                provider={provider}
                type="registration"
              />
            ))}
          </div>
        )}
      </section>

      {/* Pending edits */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          Profil módosítások jóváhagyása
          {!!pendingChanges?.length && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-400 text-white rounded-full">
              {pendingChanges.length}
            </span>
          )}
        </h2>

        {!pendingChanges?.length ? (
          <p className="text-gray-400 text-sm">Nincs jóváhagyásra váró módosítás.</p>
        ) : (
          <div className="space-y-4">
            {pendingChanges.map((provider) => (
              <ProviderRow
                key={provider.id}
                provider={provider}
                type="edit"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProviderRow({
  provider,
  type,
}: {
  provider: Record<string, unknown>;
  type: "registration" | "edit";
}) {
  const changes =
    type === "edit"
      ? (provider.pending_changes as Record<string, unknown>)
      : null;

  const displayData = changes ?? provider;
  const categoryLabel =
    CATEGORY_LABELS[displayData.category as ServiceCategory] ??
    String(displayData.category ?? "");

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
            {displayData.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayData.avatar_url as string}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-gray-400">
                {String(displayData.full_name ?? "?").charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-gray-800">
                {String(displayData.full_name ?? "")}
              </span>
              <Badge variant={type === "edit" ? "default" : "pending"} className="text-xs">
                {type === "edit" ? "Módosítás" : "Új regisztráció"}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">{String(displayData.email ?? "")}</p>
            <p className="text-xs text-gray-500 mb-0.5">{String(displayData.phone ?? "")}</p>
            <p className="text-xs text-gray-500 mb-0.5">
              {categoryLabel} – {String(displayData.county ?? "")}
            </p>
            {displayData.description ? (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2 max-w-md">
                {String(displayData.description)}
              </p>
            ) : null}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          <ApproveButton
            providerId={String(provider.id)}
            type={type}
            action="approve"
            changes={changes}
          />
          <ApproveButton
            providerId={String(provider.id)}
            type={type}
            action="reject"
            changes={null}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-lg p-4 ${
        highlight ? "border-yellow-300 bg-yellow-50" : "border-gray-200"
      }`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
