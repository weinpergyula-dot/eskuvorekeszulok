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
    return NextResponse.json({ exists: !!data });
  } catch (e) {
    return NextResponse.json({ exists: false, error: String(e) }, { status: 500 });
  }
}
