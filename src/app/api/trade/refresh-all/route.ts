import { NextResponse } from "next/server";
import { analyzeSymbol, getRegime } from "@/lib/trade/engine";
import { WATCHLIST } from "@/lib/trade/symbols";
import type { TradeRecord } from "@/lib/trade/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// POST /api/trade/refresh-all -> re-run the pipeline for the whole watchlist.
// Sequential to stay within the Twelve Data free-tier rate limit; on a
// rate-limit / provider error we return whatever succeeded plus the errors.
export async function POST() {
  try {
    const regime = await getRegime();
    const records: TradeRecord[] = [];
    const errors: Record<string, string> = {};

    for (const symbol of WATCHLIST) {
      try {
        records.push(await analyzeSymbol(symbol, regime));
      } catch (e) {
        errors[symbol] = String(e);
      }
    }

    return NextResponse.json({
      records,
      regime,
      errors: Object.keys(errors).length ? errors : undefined,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
