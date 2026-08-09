import { NextResponse } from "next/server";
import { analyzeSymbol, getRegime } from "@/lib/trade/engine";
import { getWatchlist } from "@/lib/trade/watchlist";
import { toMessage } from "@/lib/trade/util";
import type { TradeRecord } from "@/lib/trade/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// POST /api/trade/refresh-all -> re-run the pipeline for the whole watchlist.
// Runs symbols concurrently (mostly bounded by the slow AI call) so the request
// fits the function timeout; per-symbol errors (rate limit) are isolated.
export async function POST() {
  try {
    const [regime, watchlist] = await Promise.all([getRegime(), getWatchlist()]);

    const settled = await Promise.all(
      watchlist.map(async (symbol) => {
        try {
          return { symbol, record: await analyzeSymbol(symbol, regime) };
        } catch (e) {
          return { symbol, error: toMessage(e) };
        }
      })
    );

    const records: TradeRecord[] = [];
    const errors: Record<string, string> = {};
    for (const s of settled) {
      if ("record" in s) records.push(s.record);
      else errors[s.symbol] = s.error;
    }

    return NextResponse.json({
      records,
      regime,
      errors: Object.keys(errors).length ? errors : undefined,
    });
  } catch (e) {
    return NextResponse.json({ error: toMessage(e) }, { status: 500 });
  }
}
