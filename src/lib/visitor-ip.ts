import { createHash } from "node:crypto";

/**
 * A látogató IP-címének kinyerése és anonimizálása.
 *
 * A nyers IP-t sehol nem tároljuk: csak egy salt-tal képzett SHA-256
 * hash kerül az adatbázisba. Ez az egyedi látogatók megszámolásához
 * elég (ugyanaz az IP mindig ugyanazt a hash-t adja), de a hash-ből
 * a látogató nem azonosítható vissza.
 */

/**
 * A salt fix értéket kell kapjon, különben a korábban rögzített hash-ek
 * nem lesznek összevethetők az újakkal (és felugrana az "egyedi IP" szám).
 */
function salt(): string {
  return (
    process.env.VISITOR_IP_SALT ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "eskuvorekeszulok-visitor-salt"
  );
}

/**
 * A platform (Vercel) által beállított fejlécekből olvassuk az IP-t.
 * Az `x-real-ip` a legmegbízhatóbb, mert azt a proxy írja felül; az
 * `x-forwarded-for` lánc első eleme csak tartalék.
 */
export function getClientIp(headers: Headers): string | null {
  const realIp = headers.get("x-real-ip");
  if (realIp) return normalizeIp(realIp);

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return normalizeIp(cfIp);

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) return normalizeIp(first);
  }

  return null;
}

/**
 * Egységes alak, hogy ugyanaz a látogató ne számítson kétszer:
 * port levágása, IPv6 szögletes zárójel eltávolítása, kisbetűsítés.
 * Az IPv6-címeket a /64 prefixre vágjuk – a mobilhálózatokon a
 * készülékek gyakran cserélik a cím alsó felét, így egy látogató
 * egyetlen prefix alatt marad (ez egyben adatvédelmi szempontból is
 * kíméletesebb).
 */
function normalizeIp(raw: string): string | null {
  let ip = raw.trim().toLowerCase();
  if (!ip) return null;

  // [2001:db8::1]:443 → 2001:db8::1
  const bracketed = ip.match(/^\[(.+)\](?::\d+)?$/);
  if (bracketed) ip = bracketed[1];

  // 1.2.3.4:5678 → 1.2.3.4 (IPv4 + port; az IPv6-ban több kettőspont van)
  if (ip.split(":").length === 2 && ip.includes(".")) ip = ip.split(":")[0];

  if (ip.includes(":")) {
    // IPv4-mapped IPv6 (::ffff:1.2.3.4) → sima IPv4, különben minden
    // ilyen cím ugyanabba a /64 „vödörbe" esne.
    const mapped = ip.match(/^::(?:ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (mapped) return mapped[1];

    const expanded = expandIpv6(ip);
    if (expanded) {
      // A csoportokból levágjuk a vezető nullákat, hogy a 2001:0db8:…
      // és a 2001:db8:… alak ugyanazt a hash-t adja.
      const prefix = expanded.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, ""));
      return `${prefix.join(":")}::/64`;
    }
    return ip;
  }

  return ip;
}

/** IPv6 rövidített alak („::") kifejtése 8 csoportra. */
function expandIpv6(ip: string): string[] | null {
  const zoneless = ip.split("%")[0];
  const halves = zoneless.split("::");
  if (halves.length > 2) return null;

  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const fill = 8 - head.length - tail.length;
  if (halves.length === 1) return head.length === 8 ? head : null;
  if (fill < 0) return null;

  return [...head, ...Array(fill).fill("0"), ...tail];
}

/** A tárolható, visszafejthetetlen azonosító. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${salt()}:${ip}`).digest("hex");
}

/** Kényelmi függvény: fejlécekből egyből hash (ha van IP). */
export function clientIpHash(headers: Headers): string | null {
  const ip = getClientIp(headers);
  return ip ? hashIp(ip) : null;
}
