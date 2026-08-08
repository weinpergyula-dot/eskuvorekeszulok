// Shared types for the /trade decision-support pipeline.
// The pipeline is deterministic: data -> indicators -> features -> score.
// The AI only writes narrative on top of these computed numbers.

export interface Bar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Regime {
  qqq_trend: "up" | "down" | "range";
  qqq_vs_50ma: string; // e.g. "+2.1%"
}

export interface Snapshot {
  symbol: string;
  as_of: string;
  price: { last: number; chg_pct: number; atr14: number; atr_pct: number };
  trend: {
    ma20: number;
    ma50: number;
    ma200: number;
    stack: string; // "20>50>200" etc.
    regime: "up" | "down" | "range";
    weekly_trend: "up" | "down" | "range";
    ma20_slope: "up" | "down" | "flat";
  };
  momentum: {
    rsi14: number;
    rsi_zone: "oversold" | "weak" | "neutral" | "strong" | "overbought";
    macd_hist: number;
    macd_state:
      | "bullish_rising"
      | "bullish_fading"
      | "bearish_fading"
      | "bearish_rising";
  };
  volatility: { bb_bandwidth_pctile: number; squeeze: boolean };
  volume: { rel_volume: number };
  levels: {
    support: number;
    resistance: number;
    dist_to_support_atr: number;
    dist_to_resistance_atr: number;
    range_52w: { high: number; low: number; pos_pct: number };
  };
  setup_tags: string[];
  gates: { earnings_within_hold: boolean | null; extreme_volatility: boolean };
}

export interface Scores {
  long: {
    total: number;
    trend: number;
    momentum: number;
    level_rr: number;
    volume: number;
    quality: number;
  };
  short: { total: number };
}

export interface Analysis {
  symbol: string;
  bias: "bullish" | "neutral" | "bearish";
  setup: string;
  conviction: "low" | "medium" | "high";
  key_levels: {
    entry_zone: [number, number] | null;
    invalidation: number | null;
    targets: number[];
  };
  risk_reward: number | null;
  rationale: string;
  risks: string[];
  catalysts: string[];
  override_reason: string | null;
  confidence: number;
  not_advice: true;
  source: "ai" | "fallback";
}

// The full record cached per symbol and returned to the dashboard.
export interface TradeRecord {
  symbol: string;
  as_of: string;
  snapshot: Snapshot;
  regime: Regime;
  scores: Scores;
  analysis: Analysis;
  updated_at?: string;
}
