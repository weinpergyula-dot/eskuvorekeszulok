import { createAdminClient } from "@/lib/supabase/admin";

export interface Position {
  id: string;
  symbol: string;
  invested: number;
  buy_price: number;
  status: "open" | "closed";
  exit_amount: number | null;
  closed_at: string | null;
  created_at: string;
}

// Remember every symbol we've dealt with (watchlist add / AI suggestion).
export async function recordSymbols(symbols: string[]): Promise<void> {
  if (!symbols.length) return;
  const admin = createAdminClient();
  await admin
    .from("trade_symbols")
    .upsert(
      symbols.map((symbol) => ({ symbol })),
      { onConflict: "symbol", ignoreDuplicates: true }
    );
}

export async function getSeenSymbols(): Promise<string[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("trade_symbols")
    .select("symbol")
    .order("first_seen", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => r.symbol as string);
}

export async function listPositions(): Promise<Position[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("trade_positions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Position[];
}

// Latest known price per symbol, from the cached analyses (approximate).
export async function getLatestPrices(): Promise<Record<string, number>> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("trade_analyses").select("symbol, data");
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const row of data ?? []) {
    const rec = row.data as { snapshot?: { price?: { last?: number } } };
    const p = rec?.snapshot?.price?.last;
    if (typeof p === "number") out[row.symbol as string] = p;
  }
  return out;
}

export async function createPosition(input: {
  symbol: string;
  invested: number;
  buy_price: number;
}): Promise<Position> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("trade_positions")
    .insert({
      symbol: input.symbol,
      invested: input.invested,
      buy_price: input.buy_price,
      status: "open",
    })
    .select("*")
    .single();
  if (error) throw error;
  await recordSymbols([input.symbol]);
  return data as Position;
}

export async function closePosition(
  id: string,
  exit_amount: number
): Promise<Position> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("trade_positions")
    .update({
      status: "closed",
      exit_amount,
      closed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Position;
}

export async function deletePosition(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("trade_positions").delete().eq("id", id);
  if (error) throw error;
}
