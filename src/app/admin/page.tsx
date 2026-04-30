export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminContent } from "./admin-content";
import { PageHeader } from "@/components/layout/page-header";

export default async function AdminPage() {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch {
    redirect("/auth/login");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const { data: pendingProviders } = await supabase
    .from("providers")
    .select("*")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: false });

  const { data: pendingChanges } = await supabase
    .from("providers")
    .select("*")
    .eq("approval_status", "approved")
    .not("pending_changes", "is", null)
    .order("updated_at", { ascending: false });

  const { count: totalApproved } = await supabase
    .from("providers")
    .select("*", { count: "exact", head: true })
    .eq("approval_status", "approved");

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Fetch all provider statuses server-side (bypasses RLS – admin only route)
  const { data: allProviderStatuses } = await supabase
    .from("providers")
    .select("user_id, approval_status, pending_changes");

  return (
    <div>
      <PageHeader title="Admin" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AdminContent
          totalUsers={totalUsers ?? 0}
          totalApproved={totalApproved ?? 0}
          pendingProviders={(pendingProviders ?? []) as Parameters<typeof AdminContent>[0]["pendingProviders"]}
          pendingChanges={(pendingChanges ?? []) as Parameters<typeof AdminContent>[0]["pendingChanges"]}
          providerStatuses={(allProviderStatuses ?? []) as Parameters<typeof AdminContent>[0]["providerStatuses"]}
        />
      </div>
    </div>
  );
}
