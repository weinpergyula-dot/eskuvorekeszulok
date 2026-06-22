import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/messages/unread-count
 * Returns the number of conversations (distinct senders) that have unread
 * messages for the current user — one notification per chat window, not per
 * message. Lightweight alternative to GET /api/messages — used by the navbar badge.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ count: 0 });

  const { data } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("recipient_id", user.id)
    .eq("read", false)
    .eq("deleted_for_recipient", false);

  const distinctSenders = new Set((data ?? []).map((m: { sender_id: string }) => m.sender_id));
  return NextResponse.json({ count: distinctSenders.size });
}
