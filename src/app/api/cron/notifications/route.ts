import { NextResponse } from "next/server";
import { processPendingNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/notifications
 * Percenként fut le a Vercel cron job.
 * Feldolgozza a lejárt, el nem küldött értesítéseket.
 */
export async function GET(req: Request) {
  // Vercel automatikusan beállítja a CRON_SECRET env változót és
  // az Authorization: Bearer <secret> fejléccel hívja a route-ot.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    await processPendingNotifications();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cron/notifications]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
