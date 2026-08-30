import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIpHash } from "@/lib/visitor-ip";

export const dynamic = "force-dynamic";

/**
 * A főoldal megnyitásának rögzítése (a HomeVisitTracker hívja).
 *
 * Csak az IP-cím salt-olt hash-e kerül az adatbázisba, naponta és
 * IP-nként egyetlen sorba – ebből jön az admin felület napi/heti
 * "egyedi IP" statisztikája.
 */
export async function POST(req: Request) {
  try {
    const ipHash = clientIpHash(req.headers);
    if (!ipHash) return new NextResponse(null, { status: 204 });

    const admin = createAdminClient();
    const { error } = await admin.rpc("record_home_page_visit", { p_ip_hash: ipHash });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
