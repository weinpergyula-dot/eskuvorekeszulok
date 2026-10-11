import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email) return NextResponse.json({ exists: false });

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ exists: false });

    // Egy soha meg nem erősített fiók félbemaradt regisztráció: nem lehet vele
    // belépni, és az újbóli regisztráció átveszi (lásd signUpAction). Ezért nem
    // jelezzük foglaltnak – különben a felhasználó végleg kizárná magát.
    const { data: existing } = await adminClient.auth.admin.getUserById(data.user_id);
    const user = existing?.user;
    const confirmed = !!(user?.email_confirmed_at || user?.confirmed_at);

    return NextResponse.json({ exists: confirmed });
  } catch (e) {
    return NextResponse.json({ exists: false, error: String(e) }, { status: 500 });
  }
}
