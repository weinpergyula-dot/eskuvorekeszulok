export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { User } from "lucide-react";
import { ProfileLayout } from "./profile-layout";
import type { Provider } from "@/lib/types";

export default async function ProfilPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  const { data: providerStats } = await supabase
    .from("providers_with_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // providers_with_stats is a view created before detailed_description was
  // added to the base table, so it may not include that column. Fetch it
  // explicitly from the base table and merge.
  const { data: providerBase } = await supabase
    .from("providers")
    .select("detailed_description, gallery_urls, pending_changes")
    .eq("user_id", user.id)
    .single();

  const provider = providerStats
    ? {
        ...providerStats,
        detailed_description: providerBase?.detailed_description ?? null,
        gallery_urls: (providerBase?.gallery_urls as string[]) ?? [],
        pending_changes: providerBase?.pending_changes ?? providerStats.pending_changes ?? null,
      }
    : null;

  const { data: favRows } = await supabase
    .from("favorites")
    .select("provider_id")
    .eq("user_id", user.id);

  const favoriteProviderIds = (favRows ?? []).map((r: { provider_id: string }) => r.provider_id);
  let favoriteProviders: Provider[] = [];
  if (favoriteProviderIds.length > 0) {
    const { data: favProviders } = await supabase
      .from("providers_with_stats")
      .select("*")
      .in("id", favoriteProviderIds);
    favoriteProviders = (favProviders as Provider[]) ?? [];
  }

  return (
    <div>
      <PageHeader title="Profilom" icon={User} />
      <Suspense>
        <ProfileLayout
          userId={user.id}
          initialName={profile.full_name ?? ""}
          email={user.email ?? ""}
          role={profile.role}
          provider={(provider as Provider) ?? null}
          initialFavoriteProviders={favoriteProviders}
        />
      </Suspense>
    </div>
  );
}
