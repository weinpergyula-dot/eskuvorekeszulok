import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/trade/cost         -> current-month org API cost (USD).
// GET /api/trade/cost?debug=1 -> also include the raw Anthropic response so the
//     exact field shape can be calibrated.
// Needs an Anthropic ADMIN key (sk-ant-admin...) in ANTHROPIC_ADMIN_KEY.
// Gated by the /api/trade password; never returns the key itself.
export async function GET(request: NextRequest) {
  const key = process.env.ANTHROPIC_ADMIN_KEY?.trim();
  const debug = request.nextUrl.searchParams.get("debug") === "1";
  if (!key) return NextResponse.json({ error: "no_admin_key" });

  try {
    const now = new Date();
    const startsAt = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    ).toISOString();

    const url = new URL("https://api.anthropic.com/v1/organizations/cost_report");
    url.searchParams.set("starting_at", startsAt);
    url.searchParams.set("bucket_width", "1d");

    const res = await fetch(url, {
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      cache: "no-store",
    });

    const body = (await res.json()) as unknown;
    if (!res.ok) {
      return NextResponse.json({
        error: "api",
        status: res.status,
        detail: debug ? body : undefined,
      });
    }

    // Sum every "amount" found under data[].results[]. Amounts are USD decimals.
    let total = 0;
    let currency = "USD";
    const data =
      (body as { data?: Array<{ results?: Array<Record<string, unknown>> }> })
        .data ?? [];
    for (const bucket of data) {
      for (const r of bucket.results ?? []) {
        const amt = Number(r.amount ?? r.cost ?? 0);
        if (Number.isFinite(amt)) total += amt;
        if (typeof r.currency === "string") currency = r.currency;
      }
    }

    return NextResponse.json({
      total: Math.round(total * 100) / 100,
      currency,
      period: "current_month",
      starts_at: startsAt,
      ...(debug ? { raw: body } : {}),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
