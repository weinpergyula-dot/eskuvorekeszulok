import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";
import { DEFAULT_TRACKED_PATH, TRACKED_PATHS } from "@/lib/tracked-paths";

export const dynamic = "force-dynamic";

const DAYS_BACK = 30;
const WEEKS_BACK = 12;

interface DailyRow { day: string; unique_ips: number; hits: number }
interface WeeklyRow { week_start: string; unique_ips: number; hits: number }
interface SummaryRow {
  today: number;
  yesterday: number;
  this_week: number;
  last_week: number;
  last_30_days: number;
  all_time: number;
  total_hits: number;
}

const EMPTY_SUMMARY: SummaryRow = {
  today: 0, yesterday: 0, this_week: 0, last_week: 0,
  last_30_days: 0, all_time: 0, total_hits: 0,
};

/**
 * Látogatottság: napi és heti bontású egyedi IP számok a kért oldalra
 * (?path=/ vagy /meghivo). A számolás az adatbázisban történik (SQL
 * függvények), így a nyers látogatási sorok soha nem hagyják el a
 * Supabase-t.
 */
export async function GET(req: Request) {
  const { error: forbidden } = await requireAdmin();
  if (forbidden) return forbidden;

  const requested = new URL(req.url).searchParams.get("path");
  const path = requested && TRACKED_PATHS.includes(requested) ? requested : DEFAULT_TRACKED_PATH;
  const admin = createAdminClient();

  // Megőrzési idő (12 hónap) betartatása – az admin ritkán nyitja meg,
  // és a törlés a visit_date indexen fut, ezért olcsó.
  admin.rpc("prune_page_visits").then(() => {}, () => {});

  const [daily, weekly, summary] = await Promise.all([
    admin.rpc("page_visit_daily_stats", { p_path: path, days_back: DAYS_BACK }),
    admin.rpc("page_visit_weekly_stats", { p_path: path, weeks_back: WEEKS_BACK }),
    admin.rpc("page_visit_summary", { p_path: path }),
  ]);

  const error = daily.error ?? weekly.error ?? summary.error;
  if (error) {
    // Ha a migráció még nem futott le, ne dőljön el az admin oldal –
    // a felület kiírja, hogy mit kell megcsinálni.
    return NextResponse.json({ available: false, error: error.message }, { status: 200 });
  }

  const summaryRow = (Array.isArray(summary.data) ? summary.data[0] : summary.data) as SummaryRow | null;

  return NextResponse.json({
    available: true,
    path,
    daily: ((daily.data ?? []) as DailyRow[]).map((r) => ({
      date: r.day,
      uniqueIps: Number(r.unique_ips ?? 0),
      hits: Number(r.hits ?? 0),
    })),
    weekly: ((weekly.data ?? []) as WeeklyRow[]).map((r) => ({
      weekStart: r.week_start,
      uniqueIps: Number(r.unique_ips ?? 0),
      hits: Number(r.hits ?? 0),
    })),
    summary: {
      today:      Number(summaryRow?.today      ?? EMPTY_SUMMARY.today),
      yesterday:  Number(summaryRow?.yesterday  ?? EMPTY_SUMMARY.yesterday),
      thisWeek:   Number(summaryRow?.this_week  ?? EMPTY_SUMMARY.this_week),
      lastWeek:   Number(summaryRow?.last_week  ?? EMPTY_SUMMARY.last_week),
      last30Days: Number(summaryRow?.last_30_days ?? EMPTY_SUMMARY.last_30_days),
      allTime:    Number(summaryRow?.all_time   ?? EMPTY_SUMMARY.all_time),
      totalHits:  Number(summaryRow?.total_hits ?? EMPTY_SUMMARY.total_hits),
    },
  });
}
