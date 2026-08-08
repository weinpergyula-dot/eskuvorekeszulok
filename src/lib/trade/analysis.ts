import type { Analysis, Bar, Catalysts, Regime, Scores, Snapshot } from "./types";
import {
  atr,
  bollinger,
  macd,
  relativeVolume,
  rsi,
  sma,
  swingLevels,
} from "./indicators";

const round = (n: number, d = 2) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

// --- Market regime (QQQ) -------------------------------------------------
export function computeRegime(qqqBars: Bar[]): Regime {
  const closes = qqqBars.map((b) => b.close);
  const last = closes[closes.length - 1];
  const ma50 = sma(closes, 50);
  const ma200 = sma(closes, 200);
  let trend: Regime["qqq_trend"] = "range";
  if (ma50 && ma200) {
    if (last > ma50 && ma50 > ma200) trend = "up";
    else if (last < ma50 && ma50 < ma200) trend = "down";
  }
  const vs = ma50 ? ((last - ma50) / ma50) * 100 : 0;
  const sign = vs >= 0 ? "+" : "";
  return { qqq_trend: trend, qqq_vs_50ma: `${sign}${round(vs, 1)}%` };
}

// --- Snapshot ------------------------------------------------------------
export function buildSnapshot(symbol: string, bars: Bar[]): Snapshot {
  if (bars.length < 60) {
    throw new Error(`Túl kevés adat (${symbol}): ${bars.length} nap`);
  }
  const closes = bars.map((b) => b.close);
  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);
  const volumes = bars.map((b) => b.volume);

  const last = closes[closes.length - 1];
  const prev = closes[closes.length - 2];
  const chgPct = ((last - prev) / prev) * 100;

  const ma20 = sma(closes, 20) ?? last;
  const ma50 = sma(closes, 50) ?? last;
  const ma200 = sma(closes, 200) ?? ma50; // fall back if <200 bars
  // Weekly-trend approximation: weekly-30SMA ≈ 150-day SMA, weekly-10SMA ≈ 50-day.
  const sma150 = sma(closes, 150) ?? ma200;

  const ma20Prev = sma(closes.slice(0, -3), 20) ?? ma20;
  const slopePct = ((ma20 - ma20Prev) / ma20) * 100;
  const ma20Slope: Snapshot["trend"]["ma20_slope"] =
    slopePct > 0.15 ? "up" : slopePct < -0.15 ? "down" : "flat";

  let stack = "mixed";
  let regime: Snapshot["trend"]["regime"] = "range";
  if (ma20 > ma50 && ma50 > ma200) {
    stack = "20>50>200";
    regime = "up";
  } else if (ma20 < ma50 && ma50 < ma200) {
    stack = "20<50<200";
    regime = "down";
  }
  let weekly: Snapshot["trend"]["weekly_trend"] = "range";
  if (last > sma150 && ma50 > sma150) weekly = "up";
  else if (last < sma150 && ma50 < sma150) weekly = "down";

  const atr14 = atr(highs, lows, closes, 14) ?? 0;
  const atrPct = last > 0 ? atr14 / last : 0;

  const rsi14 = rsi(closes, 14) ?? 50;
  let rsiZone: Snapshot["momentum"]["rsi_zone"] = "neutral";
  if (rsi14 < 30) rsiZone = "oversold";
  else if (rsi14 < 45) rsiZone = "weak";
  else if (rsi14 <= 55) rsiZone = "neutral";
  else if (rsi14 <= 70) rsiZone = "strong";
  else rsiZone = "overbought";

  const m = macd(closes);
  const hist = m?.hist ?? 0;
  const prevHist = m?.prevHist ?? 0;
  const rising = hist >= prevHist;
  let macdState: Snapshot["momentum"]["macd_state"];
  if (hist >= 0) macdState = rising ? "bullish_rising" : "bullish_fading";
  else macdState = rising ? "bearish_fading" : "bearish_rising";

  const bb = bollinger(closes);
  const relVol = relativeVolume(volumes) ?? 1;

  const swings = swingLevels(highs, lows, 20) ?? {
    support: Math.min(...lows.slice(-20)),
    resistance: Math.max(...highs.slice(-20)),
  };
  const distSupport = atr14 > 0 ? (last - swings.support) / atr14 : 0;
  const distResistance = atr14 > 0 ? (swings.resistance - last) / atr14 : 0;

  const wWindow = Math.min(252, closes.length);
  const high52 = Math.max(...highs.slice(-wWindow));
  const low52 = Math.min(...lows.slice(-wWindow));
  const posPct = high52 > low52 ? ((last - low52) / (high52 - low52)) * 100 : 50;

  const extremeVol = atrPct > 0.06;

  const snapshot: Snapshot = {
    symbol,
    as_of: bars[bars.length - 1].time,
    price: {
      last: round(last),
      chg_pct: round(chgPct),
      atr14: round(atr14),
      atr_pct: round(atrPct * 100, 1),
    },
    trend: {
      ma20: round(ma20),
      ma50: round(ma50),
      ma200: round(ma200),
      stack,
      regime,
      weekly_trend: weekly,
      ma20_slope: ma20Slope,
    },
    momentum: {
      rsi14: round(rsi14, 1),
      rsi_zone: rsiZone,
      macd_hist: round(hist, 3),
      macd_state: macdState,
    },
    volatility: {
      bb_bandwidth_pctile: bb?.bandwidthPctile ?? 50,
      squeeze: bb?.squeeze ?? false,
    },
    volume: { rel_volume: round(relVol) },
    levels: {
      support: round(swings.support),
      resistance: round(swings.resistance),
      dist_to_support_atr: round(distSupport),
      dist_to_resistance_atr: round(distResistance),
      range_52w: { high: round(high52), low: round(low52), pos_pct: round(posPct) },
    },
    setup_tags: [],
    // Earnings not fetched in the MVP (no news/earnings layer yet) -> null = "not checked".
    gates: { earnings_within_hold: null, extreme_volatility: extremeVol },
  };

  snapshot.setup_tags = detectSetups(snapshot);
  return snapshot;
}

// --- Setup detection (rule-based tags) -----------------------------------
function detectSetups(s: Snapshot): string[] {
  const tags: string[] = [];
  const { trend, price, levels, momentum, volatility, volume } = s;
  const atr14 = price.atr14 || 1;

  const nearMa20 = Math.abs(price.last - trend.ma20) / atr14 < 0.7;
  const nearMa50 = Math.abs(price.last - trend.ma50) / atr14 < 0.7;

  // 1) Trend pullback: healthy uptrend, price pulled back to 20/50MA.
  if (
    trend.regime === "up" &&
    price.last > trend.ma50 &&
    (nearMa20 || nearMa50) &&
    momentum.rsi14 >= 35 &&
    momentum.rsi14 <= 58
  ) {
    tags.push("pullback_to_ma");
  }

  // 2) Breakout: at/above recent resistance on expanding volume.
  if (
    levels.dist_to_resistance_atr <= 0.25 &&
    volume.rel_volume >= 1.3 &&
    trend.regime !== "down"
  ) {
    tags.push("breakout");
  }

  // 3) Oversold bounce: RSI<32 but major trend intact (mean reversion long).
  if (momentum.rsi14 < 32 && price.last > trend.ma200) {
    tags.push("oversold_bounce");
  }

  // 4) Squeeze: volatility compressed, energy building.
  if (volatility.squeeze) {
    tags.push("squeeze");
  }

  return tags;
}

// --- Scoring -------------------------------------------------------------
export function computeScores(s: Snapshot, regime: Regime): Scores {
  const t = s.trend;
  const mo = s.momentum;
  const lv = s.levels;

  // Trend (0-30)
  let trend = 0;
  if (t.stack === "20>50>200") trend += 18;
  else if (t.ma50 > t.ma200) trend += 10;
  else if (s.price.last > t.ma200) trend += 6;
  if (t.weekly_trend === "up") trend += 6;
  if (t.ma20_slope === "up") trend += 6;
  trend = clamp(trend, 0, 30);

  // Momentum (0-25)
  let mom = 0;
  if (mo.macd_state === "bullish_rising") mom += 12;
  else if (mo.macd_state === "bullish_fading") mom += 7;
  else if (mo.macd_state === "bearish_fading") mom += 4;
  if (mo.rsi_zone === "neutral") mom += 8;
  else if (mo.rsi_zone === "strong") mom += 10;
  else if (mo.rsi_zone === "weak") mom += 6;
  else if (mo.rsi_zone === "oversold") mom += 4;
  else mom += 2; // overbought
  mom = clamp(mom, 0, 25);

  // Level / risk-reward (0-25): reward vs risk in ATR units.
  const risk = Math.max(lv.dist_to_support_atr, 0.2);
  const rr = lv.dist_to_resistance_atr / risk;
  let level = 4;
  if (rr >= 2.5) level = 25;
  else if (rr >= 2) level = 21;
  else if (rr >= 1.5) level = 16;
  else if (rr >= 1) level = 10;
  if (lv.dist_to_support_atr < 1) level = Math.min(25, level + 3); // near a good entry
  level = clamp(level, 0, 25);

  // Volume confirmation (0-10)
  let volume = 5;
  if (s.volume.rel_volume >= 1.5) volume = 10;
  else if (s.volume.rel_volume >= 1.2) volume = 8;
  else if (s.volume.rel_volume < 0.8) volume = 3;

  // Quality gates (0-10)
  let quality = 10;
  if (s.gates.earnings_within_hold === true) quality -= 6; // gap risk
  if (s.gates.extreme_volatility) quality -= 6;
  if (s.trend.stack === "mixed") quality -= 3;
  quality = clamp(quality, 0, 10);

  let longTotal = trend + mom + level + volume + quality;

  // Regime gate: suppress longs when the market is weak.
  if (regime.qqq_trend === "down") longTotal *= 0.6;
  else if (regime.qqq_trend === "range") longTotal *= 0.85;
  longTotal = clamp(Math.round(longTotal), 0, 100);

  // Short score: mirror of the trend/momentum picture, gated by an up market.
  let shortRaw = 0;
  if (t.stack === "20<50<200") shortRaw += 30;
  else if (t.ma50 < t.ma200) shortRaw += 16;
  if (mo.macd_state === "bearish_rising") shortRaw += 25;
  else if (mo.macd_state === "bearish_fading") shortRaw += 12;
  if (mo.rsi_zone === "overbought") shortRaw += 15;
  else if (mo.rsi_zone === "weak") shortRaw += 8;
  if (s.gates.extreme_volatility) shortRaw -= 6;
  if (regime.qqq_trend === "up") shortRaw *= 0.6;
  const shortTotal = clamp(Math.round(shortRaw), 0, 100);

  return {
    long: { total: longTotal, trend, momentum: mom, level_rr: level, volume, quality },
    short: { total: shortTotal },
  };
}

// --- Bias / conviction helpers -------------------------------------------
export function biasFromScores(scores: Scores): Analysis["bias"] {
  const d = scores.long.total - scores.short.total;
  if (d > 15) return "bullish";
  if (d < -15) return "bearish";
  return "neutral";
}

export function convictionFromScore(total: number): Analysis["conviction"] {
  if (total >= 70) return "high";
  if (total >= 50) return "medium";
  return "low";
}

// --- Deterministic fallback (used when the AI is unavailable/invalid) -----
export function fallbackAnalysis(
  s: Snapshot,
  scores: Scores,
  regime: Regime,
  catalysts?: Catalysts
): Analysis {
  const bias = biasFromScores(scores);
  const setup = s.setup_tags[0] ?? "none";
  const atr14 = s.price.atr14 || 1;
  const last = s.price.last;
  // Price already above the recent resistance -> treat as a breakout.
  const isBreakout = last >= s.levels.resistance;

  // Entry zone: near price on a breakout; otherwise the pullback zone.
  let entryLow: number;
  let entryHigh: number;
  if (isBreakout) {
    entryLow = round(Math.min(last, s.levels.resistance));
    entryHigh = round(Math.max(last, s.levels.resistance));
  } else {
    entryLow = round(Math.min(s.levels.support, s.trend.ma50));
    entryHigh = round(Math.max(entryLow, Math.min(last, s.trend.ma20)));
  }
  const entryMid = (entryLow + entryHigh) / 2;

  // Stop below the breakout level / support, buffered by one ATR.
  const stopBase = isBreakout ? s.levels.resistance : s.levels.support;
  const invalidation = round(stopBase - atr14);

  // Target: measured move for a breakout, else nearest resistance / 52w high.
  let targets: number[];
  if (isBreakout) {
    const rangeH = Math.max(s.levels.resistance - s.levels.support, 2 * atr14);
    targets = [round(last + rangeH)];
  } else {
    targets = [s.levels.resistance, s.levels.range_52w.high]
      .filter((v, i, a) => a.indexOf(v) === i && v > last)
      .map((v) => round(v));
  }

  // Real trade R/R from entry / stop / first target.
  const firstTarget = targets[0];
  const rr =
    firstTarget != null && entryMid > invalidation
      ? round((firstTarget - entryMid) / (entryMid - invalidation), 1)
      : null;

  const risks: string[] = [];
  if (s.gates.earnings_within_hold === true)
    risks.push(
      `Earnings ~${catalysts?.earnings_in_days ?? "?"} napon belül — gap-kockázat.`
    );
  if (s.gates.extreme_volatility)
    risks.push("Magas volatilitás (ATR) — tág stop, kisebb pozíció indokolt.");
  if (regime.qqq_trend === "down")
    risks.push("A QQQ lefelé tart — a long setupok kockázatosabbak.");
  if (s.volume.rel_volume < 0.8)
    risks.push("Átlag alatti volumen — gyenge megerősítés.");

  const catalystList: string[] = [];
  if (catalysts?.next_earnings) {
    const inDays =
      catalysts.earnings_in_days != null
        ? ` (${catalysts.earnings_in_days} nap)`
        : "";
    catalystList.push(`Earnings: ${catalysts.next_earnings}${inDays}`);
  }

  return {
    symbol: s.symbol,
    bias,
    setup,
    conviction: convictionFromScore(scores.long.total),
    key_levels: {
      entry_zone: [entryLow, entryHigh],
      invalidation,
      targets,
    },
    risk_reward: rr,
    rationale:
      `Determinisztikus összegzés (AI nélkül): ${s.trend.stack} állás, ` +
      `RSI ${s.momentum.rsi14}, MACD ${s.momentum.macd_state}. ` +
      `Long score ${scores.long.total}/100, rezsim: QQQ ${regime.qqq_trend}.`,
    plain_summary:
      `Röviden: a technikai összkép ${
        bias === "bullish"
          ? "inkább pozitív"
          : bias === "bearish"
            ? "inkább negatív"
            : "vegyes/semleges"
      }, a beszállás minősége ${
        scores.long.total >= 70
          ? "magas"
          : scores.long.total >= 50
            ? "közepes"
            : "alacsony"
      } (${scores.long.total}/100). ` +
      `Figyeld a ${round(s.levels.support)} támaszt és a ${round(
        s.levels.resistance
      )} ellenállást; ezek áttörése erősítené vagy buktatná a képet. ` +
      `Ez döntéstámogatás — a pozícióméretet és a döntést te mérlegeld.`,
    risks,
    catalysts: catalystList,
    override_reason: null,
    confidence: clamp(scores.long.total / 100, 0, 1),
    not_advice: true,
    source: "fallback",
  };
}
