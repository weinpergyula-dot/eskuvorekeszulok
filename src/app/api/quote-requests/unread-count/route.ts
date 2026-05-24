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
    // Unread incoming quote requests (not yet opened by provider)
    const { count: unreadRecipients } = await admin
      .from("quote_request_recipients")
      .select("*", { count: "exact", head: true })
      .eq("provider_user_id", user.id)
      .eq("read", false)
      .eq("deleted_by_provider", false);

    // Unread visitor reply messages for this provider
    const { count: unreadReplies } = await admin
      .from("quote_messages")
      .select("*", { count: "exact", head: true })
      .eq("provider_id", providerData.id)
      .neq("sender_id", user.id)
      .eq("read", false);

    total += (unreadRecipients ?? 0) + (unreadReplies ?? 0);
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
      .eq("read", false);

    total += unreadVisitor ?? 0;
  }

  return NextResponse.json({ count: total });
}
