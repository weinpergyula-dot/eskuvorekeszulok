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

  // Pre-registrations: signed up but email not confirmed (via REST API)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allAuthUsers: any[] = [];
  try {
    const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    });
    if (authRes.ok) {
      const authData = await authRes.json();
      allAuthUsers = authData.users ?? [];
    }
  } catch { /* ignore */ }

  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unconfirmed = allAuthUsers.filter((u: any) => !u.confirmed_at && !u.email_confirmed_at);
  // Auto-delete expired (>24h) pre-registrations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expired = unconfirmed.filter((u: any) => now - new Date(u.created_at).getTime() > TWENTY_FOUR_HOURS);
  await Promise.all(expired.map((u: { id: string }) =>
    fetch(`${supabaseUrl}/auth/v1/admin/users/${u.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    })
  ));
  // Remaining active pre-registrations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const preRegistrations = unconfirmed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((u: any) => now - new Date(u.created_at).getTime() <= TWENTY_FOUR_HOURS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((u: any) => ({
      id: u.id,
      email: u.email ?? "",
      full_name: (u.user_metadata?.full_name as string) ?? "",
      role: (u.user_metadata?.role as string) ?? "visitor",
      created_at: u.created_at,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
