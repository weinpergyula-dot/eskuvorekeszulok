import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Submit a guess. One guess per name (case-insensitive).
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      name?: unknown;
      month?: unknown;
      day?: unknown;
      hour?: unknown;
      minute?: unknown;
      message?: unknown;
    } | null;

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const month = Number(body?.month);
    const day = Number(body?.day);
    const hour = Number(body?.hour);
    const minute = Number(body?.minute);
    let message = typeof body?.message === "string" ? body.message.trim() : "";
    if (message.length > 300) message = message.slice(0, 300);

    if (name.length < 2 || name.length > 60) {
      return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    }
    if (
      !Number.isInteger(month) || month < 1 || month > 12 ||
      !Number.isInteger(day) || day < 1 || day > 31 ||
      !Number.isInteger(hour) || hour < 0 || hour > 23 ||
      !Number.isInteger(minute) || minute < 0 || minute > 59
    ) {
      return NextResponse.json({ error: "invalid_date" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("bella_guesses")
      .insert({ name, month, day, hour, minute, message: message || null });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "duplicate" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "server", detail: String(e) }, { status: 500 });
  }
}

// All guesses — used by /bella_result. Not exposed anywhere else.
export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("bella_guesses")
      .select("name, month, day, hour, minute, message, created_at")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ guesses: data ?? [] });
  } catch (e) {
    return NextResponse.json({ guesses: [], error: String(e) }, { status: 500 });
  }
}
