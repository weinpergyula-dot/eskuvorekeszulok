import { createAdminClient } from "@/lib/supabase/admin";
import { buildSnapshot, computeRegime, computeScores } from "./analysis";
import { generateAnalysis } from "./ai";
import { fetchCatalysts } from "./news";
import { fetchDailyBars } from "./provider";
import { REGIME_SYMBOL } from "./symbols";
import type { Regime, TradeRecord } from "./types";

// Swing hold window: earnings within this many days is a gap risk.
const EARNINGS_WINDOW_DAYS = 10;

// Fetch QQQ once and derive the market regime.
export async function getRegime(): Promise<Regime> {
  const bars = await fetchDailyBars(REGIME_SYMBOL, 260);
  return computeRegime(bars);
}

// Full pipeline for one symbol: data -> snapshot -> score -> AI narrative.
// Persists the result (cache) and appends a signal-log row for backtesting.
export async function analyzeSymbol(
  symbol: string,
  regime: Regime
): Promise<TradeRecord> {
  const [bars, catalysts] = await Promise.all([
    fetchDailyBars(symbol, 260),
    fetchCatalysts(symbol),
  ]);
  const snapshot = buildSnapshot(symbol, bars);

  // Set the earnings gate from real data before scoring.
  if (catalysts.earnings_in_days != null) {
    snapshot.gates.earnings_within_hold =
      catalysts.earnings_in_days >= 0 &&
      catalysts.earnings_in_days <= EARNINGS_WINDOW_DAYS;
  }

  const scores = computeScores(snapshot, regime);
  const analysis = await generateAnalysis(snapshot, scores, regime, catalysts);

  const record: TradeRecord = {
    symbol,
    as_of: snapshot.as_of,
    snapshot,
    regime,
    scores,
    analysis,
    catalysts,
  };

  const admin = createAdminClient();
  const now = new Date().toISOString();

  await admin
    .from("trade_analyses")
    .upsert({ symbol, as_of: snapshot.as_of, data: record, updated_at: now });

  // Fire-and-forget backtest log (never blocks the response on failure).
  await admin
    .from("trade_signal_log")
    .insert({
      symbol,
      as_of: snapshot.as_of,
      bias: analysis.bias,
      score_long: scores.long.total,
      score_short: scores.short.total,
      snapshot,
    })
    .then(
      () => {},
      () => {}
    );

  return { ...record, updated_at: now };
}

// Read all cached records for the dashboard.
export async function getCached(): Promise<{
  records: TradeRecord[];
  regime: Regime | null;
}> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("trade_analyses")
    .select("data, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;

  const records = (data ?? []).map((row) => {
    const rec = row.data as TradeRecord;
    return { ...rec, updated_at: row.updated_at as string };
  });
  const regime = records[0]?.regime ?? null;
  return { records, regime };
}
