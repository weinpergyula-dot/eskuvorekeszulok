import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Hiányzó mezők." }, { status: 400 });
    }
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      message,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Hiba történt az üzenet küldése során." }, { status: 500 });
  }
}
