import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    const now = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let unconfirmedUsers: any[] = [];
    const { data: rpcData } = await adminSupabase.rpc("get_unconfirmed_users");
    unconfirmedUsers = rpcData ?? [];

    const preRegistrations = unconfirmedUsers
      .filter((u: { created_at: string }) => now - new Date(u.created_at).getTime() <= TWENTY_FOUR_HOURS)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((u: any) => ({
        id: u.id,
        email: u.email ?? "",
        full_name: (u.user_metadata?.full_name as string) ?? "",
        role: (u.user_metadata?.role as string) ?? "visitor",
        created_at: u.created_at,
      }));

    return NextResponse.json(preRegistrations);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
