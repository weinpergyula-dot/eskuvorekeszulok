import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIpHash } from "@/lib/visitor-ip";
import { TRACKED_PATHS, type TrackedPath } from "@/lib/tracked-paths";

export const dynamic = "force-dynamic";

/**
 * Oldalmegnyitás rögzítése (a VisitTracker hívja).
 *
 * Csak az IP-cím salt-olt hash-e kerül az adatbázisba, oldalanként,
 * naponta és IP-nként egyetlen sorba – ebből jön az admin felület
 * napi/heti "egyedi IP" statisztikája. Az útvonalat zárt listához
 * kötjük, hogy a végpont ne legyen tetszőleges adattal tölthető.
 */
export async function POST(req: Request) {
  try {
    const { path } = (await req.json().catch(() => ({}))) as { path?: string };
    if (!path || !TRACKED_PATHS.includes(path as TrackedPath)) {
      return NextResponse.json({ error: "Unknown path" }, { status: 400 });
    }

    const ipHash = clientIpHash(req.headers);
    if (!ipHash) return new NextResponse(null, { status: 204 });

    const admin = createAdminClient();
    const { error } = await admin.rpc("record_page_visit", { p_ip_hash: ipHash, p_path: path });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
