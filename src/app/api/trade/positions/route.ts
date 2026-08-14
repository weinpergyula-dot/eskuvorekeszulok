import { NextRequest, NextResponse } from "next/server";
import {
  createPosition,
  getLatestPrices,
  getSeenSymbols,
  listPositions,
} from "@/lib/trade/positions";
import { getWatchlist } from "@/lib/trade/watchlist";
import { isValidSymbol } from "@/lib/trade/symbols";
import { toMessage } from "@/lib/trade/util";

export const dynamic = "force-dynamic";

// GET -> all positions + every seen symbol + latest known prices.
export async function GET() {
  try {
    const [positions, seen, watchlist, prices] = await Promise.all([
      listPositions(),
      getSeenSymbols(),
      getWatchlist(),
      getLatestPrices(),
    ]);
    const symbols = Array.from(
      new Set([...seen, ...watchlist, ...positions.map((p) => p.symbol)])
    ).sort();
    return NextResponse.json({ positions, symbols, prices });
  } catch (e) {
    return NextResponse.json(
      { positions: [], symbols: [], prices: {}, error: toMessage(e) },
      { status: 500 }
    );
  }
}

// POST { symbol, invested, buy_price } -> open a position.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    symbol?: unknown;
    invested?: unknown;
    buy_price?: unknown;
  } | null;
  const symbol =
    typeof body?.symbol === "string" ? body.symbol.trim().toUpperCase() : "";
  const invested = Number(body?.invested);
  const buy_price = Number(body?.buy_price);

  if (!isValidSymbol(symbol)) {
    return NextResponse.json({ error: "invalid_symbol" }, { status: 400 });
  }
  if (
    !Number.isFinite(invested) ||
    invested <= 0 ||
    !Number.isFinite(buy_price) ||
    buy_price <= 0
  ) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }
  try {
    const position = await createPosition({ symbol, invested, buy_price });
    return NextResponse.json({ position });
  } catch (e) {
    return NextResponse.json({ error: toMessage(e) }, { status: 500 });
  }
}
