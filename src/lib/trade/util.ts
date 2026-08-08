// Turn any thrown value (Error, Supabase Postgrest error object, string) into a
// readable message so the UI never shows "[object Object]".
export function toMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    if (typeof o.message === "string") {
      const hint = typeof o.hint === "string" && o.hint ? ` (${o.hint})` : "";
      return o.message + hint;
    }
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
  return String(e);
}
