export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
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

  const { data: provider } = await supabase
    .from("providers_with_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div>
      <PageHeader title="Profilom" />
      <ProfileLayout
        userId={user.id}
        initialName={profile.full_name ?? ""}
        email={user.email ?? ""}
        role={profile.role}
        provider={(provider as Provider) ?? null}
      />
    </div>
  );
}
