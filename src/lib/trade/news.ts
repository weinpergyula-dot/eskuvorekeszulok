import type { Catalysts, NewsItem } from "./types";

const EMPTY: Catalysts = { next_earnings: null, earnings_in_days: null, news: [] };
const DAY = 86_400_000;
const fmt = (d: Date) => d.toISOString().slice(0, 10);

// Company news + next earnings date from Finnhub (free tier). If no key is set
// the whole layer is skipped gracefully so the app still runs on Twelve Data
// alone. Never throws — catalysts are enrichment, not a hard dependency.
export async function fetchCatalysts(symbol: string): Promise<Catalysts> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return EMPTY;

  try {
    const today = new Date();
    const from = new Date(today.getTime() - 14 * DAY);
    const to90 = new Date(today.getTime() + 90 * DAY);

    const [newsRes, earnRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fmt(from)}&to=${fmt(today)}&token=${key}`,
        { cache: "no-store" }
      ),
      fetch(
        `https://finnhub.io/api/v1/calendar/earnings?from=${fmt(today)}&to=${fmt(to90)}&symbol=${symbol}&token=${key}`,
        { cache: "no-store" }
      ),
    ]);

    // News: newest first, top 5.
    let news: NewsItem[] = [];
    if (newsRes.ok) {
      const raw = (await newsRes.json()) as Array<{
        headline?: string;
        source?: string;
        url?: string;
        datetime?: number; // unix seconds
      }>;
      if (Array.isArray(raw)) {
        news = raw
          .slice()
          .sort((a, b) => (b.datetime ?? 0) - (a.datetime ?? 0))
          .slice(0, 5)
          .map((n) => ({
            headline: String(n.headline ?? ""),
            source: String(n.source ?? ""),
            url: String(n.url ?? ""),
            datetime: n.datetime ? new Date(n.datetime * 1000).toISOString() : "",
          }))
          .filter((n) => n.headline);
      }
    }

    // Earnings: earliest upcoming date.
    let next_earnings: string | null = null;
    if (earnRes.ok) {
      const ej = (await earnRes.json()) as {
        earningsCalendar?: Array<{ date?: string }>;
      };
      const dates = (ej.earningsCalendar ?? [])
        .map((c) => c.date)
        .filter((d): d is string => typeof d === "string")
        .sort();
      next_earnings = dates[0] ?? null;
    }

    let earnings_in_days: number | null = null;
    if (next_earnings) {
      earnings_in_days = Math.round(
        (new Date(`${next_earnings}T00:00:00Z`).getTime() - today.getTime()) / DAY
      );
    }

    return { next_earnings, earnings_in_days, news };
  } catch {
    return EMPTY;
  }
}
