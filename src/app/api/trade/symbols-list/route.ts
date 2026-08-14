import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/trade/symbols-list -> [{ symbol, name }] for NASDAQ, from Twelve
// Data reference data. Cached in-memory per instance (reference data is stable).
interface SymOption {
  symbol: string;
  name: string;
}
let cache: { at: number; data: SymOption[] } | null = null;
const TTL = 24 * 60 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL) {
    return NextResponse.json({ symbols: cache.data });
  }
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) return NextResponse.json({ symbols: [] });

  try {
    const res = await fetch(
      `https://api.twelvedata.com/stocks?exchange=NASDAQ&apikey=${key}`,
      { cache: "no-store" }
    );
    const json = (await res.json()) as {
      data?: Array<{ symbol?: string; name?: string; type?: string }>;
    };
    const list = Array.isArray(json.data) ? json.data : [];
    const seen = new Set<string>();
    const data: SymOption[] = [];
    for (const x of list) {
      if (typeof x.symbol !== "string" || seen.has(x.symbol)) continue;
      seen.add(x.symbol);
      data.push({ symbol: x.symbol, name: x.name ?? "" });
    }
    data.sort((a, b) => a.symbol.localeCompare(b.symbol));
    cache = { at: Date.now(), data };
    return NextResponse.json({ symbols: data });
  } catch (e) {
    return NextResponse.json({ symbols: [], error: String(e) });
  }
}
