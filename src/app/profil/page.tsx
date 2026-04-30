export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountForm } from "./account-form";
import { ProviderForm } from "./provider-form";
import { PageHeader } from "@/components/layout/page-header";
import type { Provider } from "@/lib/types";

export default async function ProfilPage() {
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

  if (!profile) redirect("/auth/login");

  let provider: Provider | null = null;
  if (profile.role === "provider" || profile.role === "admin") {
    const { data } = await supabase
      .from("providers")
      .select("*")
      .eq("user_id", user.id)
      .single();
    provider = data as Provider | null;
  }

  return (
    <div>
      <PageHeader title="Profilom" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Block 1: Account */}
        <section className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Fiók adatok</h2>
          <AccountForm
            userId={user.id}
            initialName={profile.full_name ?? ""}
            email={user.email ?? ""}
          />
        </section>

        {/* Block 2: Provider profile */}
        <section className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Szolgáltatói profil
          </h2>

          {/* Status indicator */}
          {provider ? (
            <div className="mb-5 space-y-2">
              {provider.approval_status === "approved" ? (
                <div className="flex items-center gap-2 text-base font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  Aktív – profilod látható a listában
                </div>
              ) : provider.approval_status === "rejected" ? (
                <div className="text-base font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    Elutasítva – profilod nem látható
                  </div>
                  {provider.rejection_reason && (
                    <p className="text-base font-normal text-red-700 pl-4">
                      Indoklás: {provider.rejection_reason}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-base font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                  Jóváhagyásra vár – profilod egyelőre nem látható
                </div>
              )}
              {provider.pending_changes && (
                <div className="flex items-center gap-2 text-base text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  Módosítás jóváhagyásra vár – addig az előző adatok látszódnak
                </div>
              )}
              {!provider.pending_changes && provider.approval_status === "approved" && provider.rejection_reason && (
                <div className="text-base text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    Legutóbbi módosításod elutasítva
                  </div>
                  <p className="text-base font-normal text-red-700 pl-4">
                    Indoklás: {provider.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-base text-gray-900 mb-5">
              Töltsd ki az adatlapot és aktiváld a szolgáltatói profilodat. Az adminisztrátor jóváhagyása után megjelensz a listában.
            </p>
          )}
          <ProviderForm
            userId={user.id}
            role={profile.role}
            provider={provider}
          />
        </section>
      </div>
    </div>
  );
}
