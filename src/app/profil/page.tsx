export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountForm } from "./account-form";
import { ProviderForm } from "./provider-form";
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Profilom</h1>

      {/* Block 1: Account */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Fiók adatok</h2>
        <AccountForm
          userId={user.id}
          initialName={profile.full_name ?? ""}
          email={user.email ?? ""}
        />
      </section>

      {/* Block 2: Provider profile */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Szolgáltatói profil
        </h2>
        {profile.role === "visitor" && (
          <p className="text-lg text-gray-900 mb-5">
            Töltsd ki az adatlapot és aktiváld a szolgáltatói profilodat. Az
            adminisztrátor jóváhagyása után megjelensz a listában.
          </p>
        )}
        {profile.role === "provider" && provider?.approval_status === "pending" && (
          <p className="text-lg text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-5">
            A profilod jóváhagyásra vár. Addig nem látható nyilvánosan.
          </p>
        )}
        {profile.role === "provider" && provider?.pending_changes && (
          <p className="text-lg text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5">
            A legutóbbi módosításaid az adminisztrátor jóváhagyásáig nem jelennek meg nyilvánosan.
          </p>
        )}
        <ProviderForm
          userId={user.id}
          role={profile.role}
          provider={provider}
        />
      </section>
    </div>
  );
}
