import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const adminSupabase = createAdminClient();
    const { data, error: rpcError } = await adminSupabase.rpc("get_unconfirmed_users");

    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = (data ?? []).map((u: any) => ({
      id: u.id,
      email: u.email,
      confirmed_at: u.confirmed_at,
      email_confirmed_at: u.email_confirmed_at,
      created_at: u.created_at,
      role: u.user_metadata?.role,
    }));

    return NextResponse.json({ total: users.length, users });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
