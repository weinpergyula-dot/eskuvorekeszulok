import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/messages/unread-count
 * Returns the number of unread messages for the current user.
 * Lightweight alternative to GET /api/messages — used by the navbar badge.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ count: 0 });

  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("read", false)
    .eq("deleted_for_recipient", false);

  return NextResponse.json({ count: count ?? 0 });
}
