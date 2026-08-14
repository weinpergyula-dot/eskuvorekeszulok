// Pure, deterministic technical-analysis math. No I/O, no AI.
// All functions take plain number arrays ordered oldest -> newest.

export function sma(vals: number[], period: number): number | null {
  if (vals.length < period) return null;
  let s = 0;
  for (let i = vals.length - period; i < vals.length; i++) s += vals[i];
  return s / period;
}

// EMA over a series that may contain leading NaN (used for MACD signal).
export function emaSeries(vals: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out = new Array<number>(vals.length).fill(NaN);
  let prev: number | null = null;
  let seedCount = 0;
  let seedSum = 0;
  for (let i = 0; i < vals.length; i++) {
    const v = vals[i];
    if (Number.isNaN(v)) continue;
    if (prev === null) {
      seedCount++;
      seedSum += v;
      if (seedCount === period) {
        prev = seedSum / period;
        out[i] = prev;
      }
    } else {
      prev = v * k + prev * (1 - k);
      out[i] = prev;
    }
  }
  return out;
}

export function rsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const ch = closes[i] - closes[i - 1];
    if (ch >= 0) gain += ch;
    else loss -= ch;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  for (let i = period + 1; i < closes.length; i++) {
    const ch = closes[i] - closes[i - 1];
    const g = ch > 0 ? ch : 0;
    const l = ch < 0 ? -ch : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export interface MacdResult {
  hist: number;
  prevHist: number | null;
}

export function macd(
  closes: number[],
  fast = 12,
  slow = 26,
  signal = 9
): MacdResult | null {
  if (closes.length < slow + signal) return null;
  const emaFast = emaSeries(closes, fast);
  const emaSlow = emaSeries(closes, slow);
  const macdLine = closes.map((_, i) => {
    const a = emaFast[i];
    const b = emaSlow[i];
    return Number.isNaN(a) || Number.isNaN(b) ? NaN : a - b;
  });
  const signalLine = emaSeries(macdLine, signal);
  const hist: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    const m = macdLine[i];
    const s = signalLine[i];
    if (!Number.isNaN(m) && !Number.isNaN(s)) hist.push(m - s);
  }
  if (hist.length === 0) return null;
  return {
    hist: hist[hist.length - 1],
    prevHist: hist.length > 1 ? hist[hist.length - 2] : null,
  };
}

export function atr(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14
): number | null {
  if (closes.length < period + 1) return null;
  const tr: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const h = highs[i];
    const l = lows[i];
    const pc = closes[i - 1];
    tr.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }
  let val = 0;
  for (let i = 0; i < period; i++) val += tr[i];
  val /= period;
  for (let i = period; i < tr.length; i++) {
    val = (val * (period - 1) + tr[i]) / period;
  }
  return val;
}

function bandwidthAt(closes: number[], end: number, period: number): number | null {
  if (end < period) return null;
  const slice = closes.slice(end - period, end);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  if (mean === 0) return null;
  const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
  const sd = Math.sqrt(variance);
  return (2 * 2 * sd) / mean; // (upper - lower) / mid, with mult=2
}

export interface BollingerResult {
  bandwidthPctile: number; // 0..100, current bandwidth rank vs lookback
  squeeze: boolean;
}

export function bollinger(
  closes: number[],
  period = 20,
  lookback = 120
): BollingerResult | null {
  const current = bandwidthAt(closes, closes.length, period);
  if (current === null) return null;
  const series: number[] = [];
  const start = Math.max(period, closes.length - lookback);
  for (let end = start; end <= closes.length; end++) {
    const bw = bandwidthAt(closes, end, period);
    if (bw !== null) series.push(bw);
  }
  const below = series.filter((b) => b <= current).length;
  const pctile = Math.round((below / series.length) * 100);
  return { bandwidthPctile: pctile, squeeze: pctile < 20 };
}

export function relativeVolume(volumes: number[], period = 20): number | null {
  if (volumes.length < period + 1) return null;
  const avg = sma(volumes.slice(0, -1), period); // exclude today from the average
  const last = volumes[volumes.length - 1];
  if (!avg || avg === 0) return null;
  return last / avg;
}

// Recent swing support/resistance over `window` sessions, excluding today.
export function swingLevels(
  highs: number[],
  lows: number[],
  window = 20
): { support: number; resistance: number } | null {
  if (highs.length < window + 1) return null;
  const h = highs.slice(-window - 1, -1);
  const l = lows.slice(-window - 1, -1);
  return { support: Math.min(...l), resistance: Math.max(...h) };
}
