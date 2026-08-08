import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/trade/diag        -> which keys the running deployment sees (booleans).
// GET /api/trade/diag?test=anthropic -> also do a live Anthropic ping and return
//     the raw HTTP status + body so the real error is visible in the browser.
// Gated by the /api/trade password; never returns secret values.
export async function GET(request: NextRequest) {
  const base = {
    ok: true,
    provider: "anthropic",
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
    env: {
      anthropic_api_key: !!process.env.ANTHROPIC_API_KEY,
      twelvedata_api_key: !!process.env.TWELVEDATA_API_KEY,
      finnhub_api_key: !!process.env.FINNHUB_API_KEY,
      supabase_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
  };

  if (request.nextUrl.searchParams.get("test") !== "anthropic") {
    return NextResponse.json(base);
  }

  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ ...base, anthropic_test: "no key" });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 16,
        messages: [{ role: "user", content: "Reply with OK" }],
      }),
    });
    const body = await res.text();
    return NextResponse.json({
      ...base,
      anthropic_test: { status: res.status, ok: res.ok, body: body.slice(0, 600) },
    });
  } catch (e) {
    return NextResponse.json({ ...base, anthropic_test: { error: String(e) } });
  }
}
