import type { Bar } from "./types";

// Twelve Data daily OHLCV. Free tier: 800 credits/day, 8 req/min.
// One symbol = 1 credit. Returns oldest -> newest (order=ASC) so the indicator
// functions can simply append the newest bar at the end of the series.
export async function fetchDailyBars(
  symbol: string,
  outputsize = 260
): Promise<Bar[]> {
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) throw new Error("TWELVEDATA_API_KEY hiányzik.");

  const url =
    `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}` +
    `&interval=1day&outputsize=${outputsize}&order=ASC&apikey=${key}`;

  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as {
    status?: string;
    message?: string;
    code?: number;
    values?: Array<{
      datetime: string;
      open: string;
      high: string;
      low: string;
      close: string;
      volume: string;
    }>;
  };

  if (json.status === "error" || !Array.isArray(json.values)) {
    const msg = json.message || "ismeretlen hiba";
    // 429 = rate limit; surface it clearly so the caller can back off.
    throw new Error(`Twelve Data hiba (${symbol}): ${msg}`);
  }

  return json.values.map((v) => ({
    time: v.datetime,
    open: Number(v.open),
    high: Number(v.high),
    low: Number(v.low),
    close: Number(v.close),
    volume: Number(v.volume),
  }));
}
