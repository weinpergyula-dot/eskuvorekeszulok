import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { provider_id, body } = await request.json();
  if (!provider_id || !body?.trim()) return NextResponse.json({ error: "Hiányzó mezők." }, { status: 400 });

  const admin = createAdminClient();

  const { error } = await admin.from("quote_messages").insert({
    quote_request_id: id,
    provider_id,
    sender_id: user.id,
    body,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
