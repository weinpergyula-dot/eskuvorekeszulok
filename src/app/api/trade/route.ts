import { NextResponse } from "next/server";
import { getCached } from "@/lib/trade/engine";

export const dynamic = "force-dynamic";

// GET /api/trade -> all cached analyses + current regime (for the dashboard).
export async function GET() {
  try {
    const { records, regime } = await getCached();
    return NextResponse.json({ records, regime });
  } catch (e) {
    return NextResponse.json(
      { records: [], regime: null, error: String(e) },
      { status: 500 }
    );
  }
}
