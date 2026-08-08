import { NextResponse } from "next/server";
import { getCached } from "@/lib/trade/engine";
import { getWatchlist } from "@/lib/trade/watchlist";

export const dynamic = "force-dynamic";

// GET /api/trade -> watchlist + cached analyses + current regime (dashboard).
export async function GET() {
  try {
    const [{ records, regime }, watchlist] = await Promise.all([
      getCached(),
      getWatchlist(),
    ]);
    return NextResponse.json({ records, regime, watchlist });
  } catch (e) {
    return NextResponse.json(
      { records: [], regime: null, watchlist: [], error: String(e) },
      { status: 500 }
    );
  }
}
