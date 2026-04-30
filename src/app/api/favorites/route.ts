import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider_id } = await req.json();

  const { data: existing } = await supabase
    .from("favorites")
    .select("provider_id")
    .eq("user_id", user.id)
    .eq("provider_id", provider_id)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("provider_id", provider_id);
    return NextResponse.json({ action: "removed" });
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, provider_id });
    return NextResponse.json({ action: "added" });
  }
}
