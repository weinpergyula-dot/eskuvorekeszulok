import { NextRequest, NextResponse } from "next/server";
import { addSymbol, getWatchlist, removeSymbol } from "@/lib/trade/watchlist";
import { isValidSymbol } from "@/lib/trade/symbols";

export const dynamic = "force-dynamic";

// GET -> current watchlist
export async function GET() {
  try {
    return NextResponse.json({ watchlist: await getWatchlist() });
  } catch (e) {
    return NextResponse.json({ watchlist: [], error: String(e) }, { status: 500 });
  }
}

// POST { symbol } -> add a ticker
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { symbol?: unknown } | null;
  const symbol = typeof body?.symbol === "string" ? body.symbol.trim().toUpperCase() : "";
  if (!isValidSymbol(symbol)) {
    return NextResponse.json({ error: "invalid_symbol" }, { status: 400 });
  }
  try {
    await addSymbol(symbol);
    return NextResponse.json({ ok: true, symbol });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE ?symbol=AAPL -> remove a ticker (and its cached analysis)
export async function DELETE(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.toUpperCase() ?? "";
  if (!isValidSymbol(symbol)) {
    return NextResponse.json({ error: "invalid_symbol" }, { status: 400 });
  }
  try {
    await removeSymbol(symbol);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
