import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/lib/log-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [{ data: providers, error }, { data: favorites }] = await Promise.all([
      supabase
        .from("providers")
        .select("id, user_id, full_name, avatar_url, categories, counties, average_rating, review_count, featured")
        .eq("approval_status", "approved")
        .order("featured", { ascending: false })
        .order("average_rating", { ascending: false, nullsFirst: false }),
      supabase
        .from("favorites")
        .select("provider_id")
        .eq("user_id", user.id),
    ]);

    if (error) {
      await logError("api/chat/providers GET", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const favoriteIds = new Set((favorites ?? []).map((f) => f.provider_id));
    const enriched = (providers ?? [])
      .filter((p) => p.user_id !== user.id)
      .map((p) => ({ ...p, is_favorite: favoriteIds.has(p.id) }));

    return NextResponse.json(enriched);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
