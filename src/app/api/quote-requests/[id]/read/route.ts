import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, provider_id } = await request.json();
  const admin = createAdminClient();

  if (type === "request") {
    await admin
      .from("quote_request_recipients")
      .update({ read: true })
      .eq("quote_request_id", id)
      .eq("provider_user_id", user.id);
  } else if (type === "messages" && provider_id) {
    await admin
      .from("quote_messages")
      .update({ read: true })
      .eq("quote_request_id", id)
      .eq("provider_id", provider_id)
      .neq("sender_id", user.id);
  }

  return NextResponse.json({ ok: true });
}
