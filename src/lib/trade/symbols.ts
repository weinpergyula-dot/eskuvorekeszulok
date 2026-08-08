// Default watchlist used to seed the DB. Liquid NASDAQ names. 6 symbols + QQQ
// (regime) = 7 Twelve Data credits per "refresh all", under the free tier's
// 8 req/min cap. Add more from the dashboard, but mind that limit.
export const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "NVDA", "AMZN", "META", "TSLA"];

// Market-regime reference (Nasdaq-100 ETF). Not shown as a card.
export const REGIME_SYMBOL = "QQQ";

// Ticker sanity check (1-6 chars, letters + optional dot, e.g. BRK.B).
export function isValidSymbol(sym: string): boolean {
  return /^[A-Z][A-Z.]{0,5}$/.test(sym);
}
