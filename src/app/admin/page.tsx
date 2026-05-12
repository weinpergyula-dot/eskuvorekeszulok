export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AdminContent } from "./admin-content";
import { PageHeader } from "@/components/layout/page-header";
import { ShieldCheck } from "lucide-react";

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

  const { count: totalVisitors } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "visitor");

  // Fetch all provider statuses server-side (bypasses RLS – admin only route)
  const { data: allProviderStatuses } = await supabase
    .from("providers")
    .select("user_id, approval_status, pending_changes");

  const adminSupabase = createAdminClient();

  const { data: contactMessages } = await adminSupabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  // Pre-registrations: signed up but email not confirmed
  const { data: authUsersData } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const allAuthUsers = authUsersData?.users ?? [];
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  // confirmed_at is the canonical field; email_confirmed_at is also checked as fallback
  const unconfirmed = allAuthUsers.filter((u) => !u.confirmed_at && !u.email_confirmed_at);
  // Auto-delete expired (>24h) pre-registrations
  const expired = unconfirmed.filter((u) => now - new Date(u.created_at).getTime() > TWENTY_FOUR_HOURS);
  await Promise.all(expired.map((u) => adminSupabase.auth.admin.deleteUser(u.id)));
  // Remaining active pre-registrations
  const preRegistrations = unconfirmed
    .filter((u) => now - new Date(u.created_at).getTime() <= TWENTY_FOUR_HOURS)
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      full_name: (u.user_metadata?.full_name as string) ?? "",
      role: (u.user_metadata?.role as string) ?? "visitor",
      created_at: u.created_at,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <PageHeader title="Admin" icon={ShieldCheck} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AdminContent
          totalUsers={totalUsers ?? 0}
          totalApproved={totalApproved ?? 0}
          totalVisitors={totalVisitors ?? 0}
          pendingProviders={(pendingProviders ?? []) as Parameters<typeof AdminContent>[0]["pendingProviders"]}
          pendingChanges={(pendingChanges ?? []) as Parameters<typeof AdminContent>[0]["pendingChanges"]}
          providerStatuses={(allProviderStatuses ?? []) as Parameters<typeof AdminContent>[0]["providerStatuses"]}
          contactMessages={(contactMessages ?? []) as Parameters<typeof AdminContent>[0]["contactMessages"]}
          preRegistrations={preRegistrations}
        />
      </div>
    </div>
  );
}
