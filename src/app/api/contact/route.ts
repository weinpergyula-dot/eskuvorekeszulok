import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { notifyContactMessage } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Hiányzó mezők." }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      message,
    });
    if (error) throw error;

    // Adminok értesítése (fire-and-forget)
    const origin = new URL(req.url).origin;
    notifyContactMessage({ senderName: name, senderEmail: email, senderPhone: phone || undefined, message, origin }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Hiba történt az üzenet küldése során." }, { status: 500 });
  }
}
