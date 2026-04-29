import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({
      status: "error",
      message: "Env vars hiányoznak",
      url: url ? "van" : "HIÁNYZIK",
      key: key ? "van" : "HIÁNYZIK",
    });
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("providers")
      .select("*", { count: "exact", head: true })
      .eq("approval_status", "approved");

    return NextResponse.json({
      status: "ok",
      url: url.slice(0, 30) + "...",
      keyPrefix: key.slice(0, 20) + "...",
      providerCount: count,
      queryError: error?.message ?? null,
    });
  } catch (e: unknown) {
    return NextResponse.json({
      status: "exception",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
