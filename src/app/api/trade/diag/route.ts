import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/trade/diag -> which keys the RUNNING deployment actually sees.
// Booleans only, never the secret values. Gated by the /api/trade password.
// If this route 404s, the deployment is still on old code.
export function GET() {
  return NextResponse.json({
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
  });
}
