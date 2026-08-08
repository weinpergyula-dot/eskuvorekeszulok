import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_WATCHLIST } from "./symbols";

// Read the watchlist from the DB, falling back to the defaults if the table is
// empty (e.g. right after the migration before any seed).
export async function getWatchlist(): Promise<string[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("trade_watchlist")
    .select("symbol")
    .order("created_at", { ascending: true });
  if (error) throw error;
  const syms = (data ?? []).map((r) => r.symbol as string);
  return syms.length ? syms : DEFAULT_WATCHLIST;
}

export async function addSymbol(symbol: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("trade_watchlist").insert({ symbol });
  // 23505 = already present -> not an error for us.
  if (error && error.code !== "23505") throw error;
}

export async function removeSymbol(symbol: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("trade_watchlist").delete().eq("symbol", symbol);
  // Drop its cached analysis too so the card disappears.
  await admin.from("trade_analyses").delete().eq("symbol", symbol);
}
