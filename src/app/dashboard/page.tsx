export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProviderCard } from "@/components/providers/provider-card";
import { PageHeader } from "@/components/layout/page-header";
import { User, Lock, Briefcase, LayoutDashboard, Eye, Star, BarChart2, ClipboardList, type LucideIcon } from "lucide-react";

export default async function DashboardPage() {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch {
    redirect("/auth/login");
  }

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
    <div>
      <PageHeader title="Dashboard" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row gap-6">

          {/* Sidebar */}
          <aside className="sm:w-52 shrink-0">
            <nav className="flex sm:flex-col gap-1">
              <Link href="/profil" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
                <User className="h-4 w-4 shrink-0" />
                <span>Fiók adatok</span>
              </Link>
              <Link href="/profil" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
                <Lock className="h-4 w-4 shrink-0" />
                <span>Jelszó módosítás</span>
              </Link>
              <Link href="/profil" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-medium text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap">
                <Briefcase className="h-4 w-4 shrink-0" />
                <span>Profil adatok</span>
              </Link>
              <span className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-medium bg-[#84AAA6] text-white whitespace-nowrap">
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Dashboard</span>
              </span>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-900 text-lg">
                Kezeld a szolgáltatói profilodat
              </p>
              <Link href="/dashboard/profile">
                <Button>Profil szerkesztése</Button>
              </Link>
            </div>

            {provider?.approval_status === "pending" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <span className="text-xl">⏳</span>
                <div>
                  <p className="font-semibold text-yellow-800 text-lg">Profil jóváhagyásra vár</p>
                  <p className="text-yellow-700 text-base mt-0.5">
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
                  <p className="font-semibold text-red-800 text-lg">Profil elutasítva</p>
                  <p className="text-red-700 text-base mt-0.5">
                    Az adminisztrátor elutasította a profilodat. Kérjük, módosítsd és küldd be újra.
                  </p>
                </div>
              </div>
            )}

            {provider?.pending_changes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <span className="text-xl">🔄</span>
                <div>
                  <p className="font-semibold text-blue-800 text-lg">Módosítás jóváhagyásra vár</p>
                  <p className="text-blue-700 text-base mt-0.5">
                    A legutóbbi módosításaid az adminisztrátor jóváhagyásáig nem jelennek meg nyilvánosan.
                  </p>
                </div>
              </div>
            )}

            {provider ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-wide mb-3">Előnézet</h2>
                  <ProviderCard provider={provider} showStatus />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-wide mb-3">Statisztikák</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Megtekintések" value={provider.view_count ?? 0} icon={Eye} />
                    <StatCard label="Értékelések" value={provider.review_count ?? 0} icon={Star} />
                    <StatCard
                      label="Átlagos értékelés"
                      value={provider.average_rating ? `${Number(provider.average_rating).toFixed(1)}/5` : "–"}
                      icon={BarChart2}
                    />
                    <StatCard
                      label="Státusz"
                      value={
                        provider.approval_status === "approved" ? "Aktív"
                        : provider.approval_status === "pending" ? "Függőben"
                        : "Elutasítva"
                      }
                      icon={ClipboardList}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-900">Profil nem található.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <Icon className="h-6 w-6 mb-1 text-[#84AAA6]" strokeWidth={1.5} />
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-base text-gray-900 mt-0.5">{label}</div>
    </div>
  );
}
