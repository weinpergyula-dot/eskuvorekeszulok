import { NextResponse } from "next/server";
import { scanForSuggestions } from "@/lib/trade/engine";
import { toMessage } from "@/lib/trade/util";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// POST /api/trade/suggest -> scan the curated universe and return today's
// day-trade candidates that clear the threshold (up to 5).
export async function POST() {
  try {
    const result = await scanForSuggestions();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: toMessage(e) }, { status: 500 });
  }
}
