export type DeviceType = "desktop" | "ios" | "android";

/** A User-Agent alapján durva eszköztípus a látogatottság-statisztikához. */
export function deviceFromUserAgent(ua: string | null): DeviceType {
  if (!ua) return "desktop";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

/**
 * Robotok, keresők, linkelőnézet-készítők, oldalfigyelők és parancssori
 * kliensek – ezeket a látogatottság-mérés nem számolja. A hiányzó
 * User-Agent is ide tartozik: valódi böngésző mindig küld.
 */
const BOT_PATTERN =
  /\bbot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|pingdom|uptime|monitor|statuscake|site24x7|facebookexternalhit|embedly|preview|vercel|python|curl|wget|httpclient|okhttp|axios|node-fetch|undici|go-http|java\/|libwww|scrapy|phantomjs|puppeteer|playwright/i;

export function isBotUserAgent(ua: string | null): boolean {
  return !ua || BOT_PATTERN.test(ua);
}

/** Operációs rendszer és böngésző a User-Agentből, pl. „Windows · Chrome”. */
export function clientFromUserAgent(ua: string | null): string | null {
  if (!ua) return null;

  const os =
    /iPhone|iPad|iPod/i.test(ua) ? "iOS"
    : /Android/i.test(ua) ? "Android"
    : /CrOS/i.test(ua) ? "ChromeOS"
    : /Windows/i.test(ua) ? "Windows"
    : /Macintosh|Mac OS X/i.test(ua) ? "macOS"
    : /Linux/i.test(ua) ? "Linux"
    : "Egyéb";

  // A sorrend számít: sok böngésző a Chrome és a Safari nevét is beírja.
  const browser =
    /FBAN|FBAV/i.test(ua) ? "Facebook app"
    : /Instagram/i.test(ua) ? "Instagram app"
    : /Edg(e|A|iOS)?\//i.test(ua) ? "Edge"
    : /OPR\/|Opera/i.test(ua) ? "Opera"
    : /SamsungBrowser/i.test(ua) ? "Samsung Internet"
    : /Firefox\/|FxiOS/i.test(ua) ? "Firefox"
    : /Chrome\/|CriOS/i.test(ua) ? "Chrome"
    : /Safari\//i.test(ua) ? "Safari"
    : "Egyéb";

  return `${os} · ${browser}`;
}
