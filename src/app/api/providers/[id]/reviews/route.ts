import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("provider_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const reviewerIds = [...new Set((reviews ?? []).map((r) => r.reviewer_id))];
  const adminClient = createAdminClient();
  const { data: profiles } = reviewerIds.length > 0
    ? await adminClient.from("profiles").select("user_id, full_name").in("user_id", reviewerIds)
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  const enriched = (reviews ?? []).map((r) => ({
    ...r,
    reviewer_name: profileMap[r.reviewer_id] || "Névtelen felhasználó",
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Bejelentkezés szükséges." }, { status: 401 });

  const { rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Érvénytelen értékelés." }, { status: 400 });
  }

  // Prevent self-review
  const { data: provider } = await supabase.from("providers").select("user_id").eq("id", id).single();
  if (provider?.user_id === user.id) {
    return NextResponse.json({ error: "Saját magad nem értékelheted." }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").upsert(
    { provider_id: id, reviewer_id: user.id, rating, comment: comment?.trim() || null },
    { onConflict: "provider_id,reviewer_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Recalculate aggregate on providers table
  const adminClient = createAdminClient();
  const { data: agg } = await adminClient.from("reviews").select("rating").eq("provider_id", id);
  const count = agg?.length ?? 0;
  const avg = count > 0 ? (agg!.reduce((s, r) => s + r.rating, 0) / count) : 0;
  await adminClient
    .from("providers")
    .update({ review_count: count, average_rating: Math.round(avg * 10) / 10 })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
