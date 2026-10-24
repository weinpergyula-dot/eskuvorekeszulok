import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clientIpHash } from "@/lib/visitor-ip";
import { clientFromUserAgent, deviceFromUserAgent, isBotUserAgent } from "@/lib/device-type";
import { TRACKED_PATHS, type TrackedPath } from "@/lib/tracked-paths";

export const dynamic = "force-dynamic";

/**
 * Oldalmegnyitás rögzítése (a VisitTracker hívja).
 *
 * Csak az IP-cím salt-olt hash-e kerül az adatbázisba, oldalanként,
 * naponta és IP-nként egyetlen sorba – ebből jön az admin felület
 * napi/heti "egyedi IP" statisztikája. Az útvonalat zárt listához
 * kötjük, hogy a végpont ne legyen tetszőleges adattal tölthető.
 * Mellé kerül az eszköztípus (desktop / iOS / Android) és – ha a
 * látogató be van lépve – a fiókja, az admin „mai látogatók” listájához.
 * Robotok (keresők, linkelőnézet-készítők, oldalfigyelők) nem számítanak.
 */
export async function POST(req: Request) {
  try {
    const { path } = (await req.json().catch(() => ({}))) as { path?: string };
    if (!path || !TRACKED_PATHS.includes(path as TrackedPath)) {
      return NextResponse.json({ error: "Unknown path" }, { status: 400 });
    }

    const ua = req.headers.get("user-agent");
    if (isBotUserAgent(ua)) return new NextResponse(null, { status: 204 });

    const ipHash = clientIpHash(req.headers);
    if (!ipHash) return new NextResponse(null, { status: 204 });

    const device = deviceFromUserAgent(ua);
    const client = clientFromUserAgent(ua);
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    } catch {
      // kijelentkezett látogatóként rögzítjük
    }

    const admin = createAdminClient();
    let { error } = await admin.rpc("record_page_visit", { p_ip_hash: ipHash, p_path: path, p_device: device, p_user_id: userId, p_client: client });
    // A régebbi migrációk után még a korábbi függvényváltozat létezik:
    // 20261020 előtt kliens nélkül, 20261018 előtt eszköz és felhasználó nélkül.
    if (error) ({ error } = await admin.rpc("record_page_visit", { p_ip_hash: ipHash, p_path: path, p_device: device, p_user_id: userId }));
    if (error) ({ error } = await admin.rpc("record_page_visit", { p_ip_hash: ipHash, p_path: path }));

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
