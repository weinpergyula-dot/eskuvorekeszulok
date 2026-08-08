// MVP watchlist — liquid NASDAQ names. 6 symbols + QQQ (regime) = 7 Twelve Data
// credits per "refresh all", which stays under the free tier's 8 req/min cap.
// Add more here, but mind that limit (throttle or upgrade the plan otherwise).
export const WATCHLIST = ["AAPL", "MSFT", "NVDA", "AMZN", "META", "TSLA"];

// Market-regime reference (Nasdaq-100 ETF). Not shown as a card.
export const REGIME_SYMBOL = "QQQ";

export function isKnownSymbol(sym: string): boolean {
  return WATCHLIST.includes(sym);
}
