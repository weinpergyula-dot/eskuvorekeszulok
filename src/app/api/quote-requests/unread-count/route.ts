import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/quote-requests/unread-count
 * Returns the total unread quote-request count for the current user.
 * Lightweight alternative to GET /api/quote-requests — used by the navbar badge.
 *
 * Unread = new incoming requests (read=false) + unread reply messages, for both
 * the provider and visitor roles of the current user.
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
    // hidden from the chat list, so their unread messages must not feed the badge.
    const { data: recipientRows } = await admin
      .from("quote_request_recipients")
      .select("quote_request_id, read")
      .eq("provider_user_id", user.id)
      .eq("deleted_by_provider", false);

    // Unread incoming quote requests (not yet opened by provider)
    const unreadRecipients = (recipientRows ?? []).filter(
      (r: { read: boolean }) => !r.read,
    ).length;

    // Unread visitor reply messages, restricted to non-deleted conversations and
    // excluding system notices (withdrawals etc.) which aren't real messages.
    let unreadReplies = 0;
    const activeReqIds = (recipientRows ?? []).map(
      (r: { quote_request_id: string }) => r.quote_request_id,
    );
    if (activeReqIds.length > 0) {
      const { count } = await admin
        .from("quote_messages")
        .select("*", { count: "exact", head: true })
        .eq("provider_id", providerData.id)
        .in("quote_request_id", activeReqIds)
        .neq("sender_id", user.id)
        .eq("read", false)
        .not("body", "like", "__SYSTEM__:%");
      unreadReplies = count ?? 0;
    }

    total += unreadRecipients + unreadReplies;
  }

  // Unread provider reply messages received as a visitor
  const { data: visitorRequests } = await admin
    .from("quote_requests")
    .select("id")
    .eq("visitor_id", user.id)
    .eq("deleted_by_visitor", false);

  if (visitorRequests && visitorRequests.length > 0) {
    const reqIds = visitorRequests.map((r: { id: string }) => r.id);
    const { count: unreadVisitor } = await admin
      .from("quote_messages")
      .select("*", { count: "exact", head: true })
      .in("quote_request_id", reqIds)
      .neq("sender_id", user.id)
      .eq("read", false)
      .not("body", "like", "__SYSTEM__:%");

    total += unreadVisitor ?? 0;
  }

  return NextResponse.json({ count: total });
}
