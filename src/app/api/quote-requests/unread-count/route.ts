import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/quote-requests/unread-count
 * Returns the total unread quote-request count for the current user.
 * Lightweight alternative to GET /api/quote-requests — used by the navbar badge.
 *
 * Counts CONVERSATIONS (chat windows) that have anything unread — one
 * notification per chat window, not per message — for both the provider and
 * visitor roles of the current user.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ count: 0 });

  const admin = createAdminClient();

  // Check if the user has a provider profile
  const { data: providerData } = await admin
    .from("providers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let total = 0;

  if (providerData) {
    // The provider's own (non-deleted) recipient rows. Deleted conversations are
    // hidden from the chat list, so they must not feed the badge.
    const { data: recipientRows } = await admin
      .from("quote_request_recipients")
      .select("quote_request_id, read")
      .eq("provider_user_id", user.id)
      .eq("deleted_by_provider", false);

    const activeReqIds = (recipientRows ?? []).map(
      (r: { quote_request_id: string }) => r.quote_request_id,
    );

    // Conversations (quote_request_id) that have unread visitor messages,
    // excluding system notices (withdrawals etc.) which aren't real messages.
    const reqIdsWithUnread = new Set<string>();
    if (activeReqIds.length > 0) {
      const { data: unreadMsgs } = await admin
        .from("quote_messages")
        .select("quote_request_id")
        .eq("provider_id", providerData.id)
        .in("quote_request_id", activeReqIds)
        .neq("sender_id", user.id)
        .eq("read", false)
        .not("body", "like", "__SYSTEM__:%");
      for (const m of (unreadMsgs ?? []) as { quote_request_id: string }[]) {
        reqIdsWithUnread.add(m.quote_request_id);
      }
    }

    // One per conversation that is either an unopened request or has unread messages.
    const unreadConvs = new Set<string>();
    for (const r of (recipientRows ?? []) as { quote_request_id: string; read: boolean }[]) {
      if (!r.read || reqIdsWithUnread.has(r.quote_request_id)) unreadConvs.add(r.quote_request_id);
    }
    total += unreadConvs.size;
  }

  // As a visitor: conversations (quote_request_id + provider_id) with unread
  // provider replies — one per chat window.
  const { data: visitorRequests } = await admin
    .from("quote_requests")
    .select("id")
    .eq("visitor_id", user.id)
    .eq("deleted_by_visitor", false);

  if (visitorRequests && visitorRequests.length > 0) {
    const reqIds = visitorRequests.map((r: { id: string }) => r.id);
    const { data: unreadMsgs } = await admin
      .from("quote_messages")
      .select("quote_request_id, provider_id")
      .in("quote_request_id", reqIds)
      .neq("sender_id", user.id)
      .eq("read", false)
      .not("body", "like", "__SYSTEM__:%");

    const unreadConvs = new Set(
      (unreadMsgs ?? []).map((m: { quote_request_id: string; provider_id: string }) => `${m.quote_request_id}__${m.provider_id}`),
    );
    total += unreadConvs.size;
  }

  return NextResponse.json({ count: total });
}
