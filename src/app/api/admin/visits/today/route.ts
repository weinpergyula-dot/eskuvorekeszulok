import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";
import { DEFAULT_TRACKED_PATH, TRACKED_PATHS } from "@/lib/tracked-paths";

export const dynamic = "force-dynamic";

interface VisitRow {
  id: string;
  first_seen_at: string;
  last_seen_at: string;
  hit_count: number;
  device: string | null;
  user_id: string | null;
}

/** A mai nap az Europe/Budapest zónában (YYYY-MM-DD), mint a visit_date. */
function todayInBudapest(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Budapest" }).format(new Date());
}

/**
 * A mai látogatók listája a kért oldalra: eszköz, időpont, és ha be
 * volt lépve, a felhasználó neve. A 20261018_page_visits_device_user.sql
 * migráció előtt az eszköz és a felhasználó üres.
 */
export async function GET(req: Request) {
  const { error: forbidden } = await requireAdmin();
  if (forbidden) return forbidden;

  const requested = new URL(req.url).searchParams.get("path");
  const path = requested && TRACKED_PATHS.includes(requested) ? requested : DEFAULT_TRACKED_PATH;
  const admin = createAdminClient();
  const today = todayInBudapest();

  let res = await admin
    .from("page_visits")
    .select("id, first_seen_at, last_seen_at, hit_count, device, user_id")
    .eq("path", path)
    .eq("visit_date", today)
    .order("last_seen_at", { ascending: false });
  if (res.error) {
    res = await admin
      .from("page_visits")
      .select("id, first_seen_at, last_seen_at, hit_count")
      .eq("path", path)
      .eq("visit_date", today)
      .order("last_seen_at", { ascending: false }) as typeof res;
  }
  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });

  const rows = (res.data ?? []) as VisitRow[];
  const userIds = [...new Set(rows.map((r) => r.user_id).filter((id): id is string => !!id))];
  const profiles = new Map<string, { full_name: string | null; email: string | null; role: string | null }>();
  if (userIds.length > 0) {
    const { data } = await admin.from("profiles").select("user_id, full_name, email, role").in("user_id", userIds);
    for (const p of data ?? []) profiles.set(p.user_id, p);
  }

  return NextResponse.json({
    visits: rows.map((r) => {
      const p = r.user_id ? profiles.get(r.user_id) : undefined;
      return {
        id: r.id,
        firstSeenAt: r.first_seen_at,
        lastSeenAt: r.last_seen_at,
        hits: Number(r.hit_count ?? 1),
        device: r.device ?? null,
        user: r.user_id ? { id: r.user_id, name: p?.full_name || p?.email || "Ismeretlen fiók", role: p?.role ?? null } : null,
      };
    }),
  });
}
