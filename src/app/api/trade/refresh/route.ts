import { NextRequest, NextResponse } from "next/server";
import { analyzeSymbol, getRegime } from "@/lib/trade/engine";
import { isValidSymbol } from "@/lib/trade/symbols";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/trade/refresh?symbol=AAPL -> re-run the pipeline for one symbol.
export async function POST(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.toUpperCase() ?? "";
  if (!isValidSymbol(symbol)) {
    return NextResponse.json({ error: "invalid_symbol" }, { status: 400 });
  }
  try {
    const regime = await getRegime();
    const record = await analyzeSymbol(symbol, regime);
    return NextResponse.json({ record });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
