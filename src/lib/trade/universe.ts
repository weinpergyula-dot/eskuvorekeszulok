// Curated liquid NASDAQ names scanned for the daily AI suggestion.
// Ordered most-relevant first: the Twelve Data free tier (~8 req/min) limits how
// many actually get scanned before rate-limiting, so the top names go first.
// Symbols already on the user's watchlist are skipped at scan time.
export const SUGGESTION_UNIVERSE = [
  "NVDA",
  "TSLA",
  "AMD",
  "AVGO",
  "NFLX",
  "PLTR",
  "MU",
  "COIN",
  "SMCI",
  "GOOGL",
  "INTC",
  "MRVL",
];
