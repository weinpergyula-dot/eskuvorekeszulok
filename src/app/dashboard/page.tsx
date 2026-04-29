import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProviderCard } from "@/components/providers/provider-card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "provider") redirect("/");

  const { data: provider } = await supabase
    .from("providers_with_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profilom</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kezeld a szolgáltatói profilodat
          </p>
        </div>
        <Link href="/dashboard/profile">
          <Button>Profil szerkesztése</Button>
        </Link>
      </div>

      {/* Status banner */}
      {provider?.approval_status === "pending" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-xl">⏳</span>
          <div>
            <p className="font-semibold text-yellow-800 text-sm">
              Profil jóváhagyásra vár
            </p>
            <p className="text-yellow-700 text-xs mt-0.5">
              Az adminisztrátor hamarosan elbírálja a profilodat. Amíg ez nem
              történik meg, a profil nem látható nyilvánosan.
            </p>
          </div>
        </div>
      )}

      {provider?.approval_status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-xl">❌</span>
          <div>
            <p className="font-semibold text-red-800 text-sm">
              Profil elutasítva
            </p>
            <p className="text-red-700 text-xs mt-0.5">
              Az adminisztrátor elutasította a profilodat. Kérjük, módosítsd és
              küldd be újra.
            </p>
          </div>
        </div>
      )}

      {provider?.pending_changes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-xl">🔄</span>
          <div>
            <p className="font-semibold text-blue-800 text-sm">
              Módosítás jóváhagyásra vár
            </p>
            <p className="text-blue-700 text-xs mt-0.5">
              A legutóbbi módosításaid az adminisztrátor jóváhagyásáig nem
              jelennek meg nyilvánosan.
            </p>
          </div>
        </div>
      )}

      {provider ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Preview card */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Előnézet
            </h2>
            <ProviderCard provider={provider} showStatus />
          </div>

          {/* Stats */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Statisztikák
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Megtekintések" value={provider.view_count ?? 0} icon="👁️" />
              <StatCard label="Értékelések" value={provider.review_count ?? 0} icon="⭐" />
              <StatCard
                label="Átlagos értékelés"
                value={provider.average_rating ? `${Number(provider.average_rating).toFixed(1)}/5` : "–"}
                icon="📊"
              />
              <StatCard
                label="Státusz"
                value={
                  provider.approval_status === "approved"
                    ? "Aktív"
                    : provider.approval_status === "pending"
                    ? "Függőben"
                    : "Elutasítva"
                }
                icon="📋"
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Profil nem található.</p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
