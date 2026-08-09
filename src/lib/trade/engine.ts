import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildSnapshot,
  computeRegime,
  computeScores,
  dayTradeScore,
} from "./analysis";
import { generateAnalysis } from "./ai";
import { fetchCatalysts } from "./news";
import { fetchDailyBars } from "./provider";
import { REGIME_SYMBOL } from "./symbols";
import { SUGGESTION_UNIVERSE } from "./universe";
import { getWatchlist } from "./watchlist";
import type { Catalysts, Regime, Scores, Snapshot, TradeRecord } from "./types";

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

// Scan a curated NASDAQ universe (excluding the watchlist) for today's best
// day-trade candidates. Pre-filters cheaply with the deterministic score, then
// runs the full AI only on the top picks that clear the threshold. Never throws
// per symbol (rate limit / bad ticker are skipped).
const SUGGEST_THRESHOLD = 70; // AI % at/above this counts as a strong signal
const SUGGEST_MAX = 5; // how many top picks to show
const AI_EVAL_MAX = 8; // how many pre-filtered candidates to run the AI on

export async function scanForSuggestions(): Promise<{
  records: TradeRecord[];
  regime: Regime;
  scanned: number;
  qualifying: number;
}> {
  const [regime, watchlist] = await Promise.all([getRegime(), getWatchlist()]);
  const wl = new Set(watchlist);
  const candidates = SUGGESTION_UNIVERSE.filter((s) => !wl.has(s));

  type Scored = {
    symbol: string;
    snapshot: Snapshot;
    scores: Scores;
    catalysts: Catalysts;
    dts: number;
  };
  const scored: Scored[] = [];

  for (const symbol of candidates) {
    try {
      const [bars, catalysts] = await Promise.all([
        fetchDailyBars(symbol, 260),
        fetchCatalysts(symbol),
      ]);
      const snapshot = buildSnapshot(symbol, bars);
      if (catalysts.earnings_in_days != null) {
        snapshot.gates.earnings_within_hold =
          catalysts.earnings_in_days >= 0 &&
          catalysts.earnings_in_days <= EARNINGS_WINDOW_DAYS;
      }
      const scores = computeScores(snapshot, regime);
      scored.push({
        symbol,
        snapshot,
        scores,
        catalysts,
        dts: dayTradeScore(snapshot, regime),
      });
    } catch {
      // skip: rate-limited or unavailable
    }
  }

  // Evaluate (full AI) the strongest few by the cheap pre-filter, then rank by
  // the AI's day-trade %. Show the top picks; report how many clear the
  // threshold on the AI score (so the displayed % and the count always agree).
  const ranked = [...scored].sort((a, b) => b.dts - a.dts).slice(0, AI_EVAL_MAX);

  const now = new Date().toISOString();
  const evaluated: TradeRecord[] = [];
  for (const x of ranked) {
    const analysis = await generateAnalysis(
      x.snapshot,
      x.scores,
      regime,
      x.catalysts
    );
    evaluated.push({
      symbol: x.symbol,
      as_of: x.snapshot.as_of,
      snapshot: x.snapshot,
      regime,
      scores: x.scores,
      analysis,
      catalysts: x.catalysts,
      updated_at: now,
    });
  }
  evaluated.sort(
    (a, b) => b.analysis.day_trade_score - a.analysis.day_trade_score
  );
  const qualifying = evaluated.filter(
    (r) => r.analysis.day_trade_score >= SUGGEST_THRESHOLD
  ).length;

  return {
    records: evaluated.slice(0, SUGGEST_MAX),
    regime,
    scanned: scored.length,
    qualifying,
  };
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
