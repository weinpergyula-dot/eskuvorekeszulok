export type DeviceType = "desktop" | "ios" | "android";

/** A User-Agent alapján durva eszköztípus a látogatottság-statisztikához. */
export function deviceFromUserAgent(ua: string | null): DeviceType {
  if (!ua) return "desktop";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}
