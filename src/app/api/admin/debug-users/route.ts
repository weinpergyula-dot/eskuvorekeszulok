import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
    });

    const data = await res.json();

    if (!res.ok) return NextResponse.json({ error: data }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = (data.users ?? []).map((u: any) => ({
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
