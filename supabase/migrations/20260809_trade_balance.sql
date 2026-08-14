-- Trade balance: every symbol ever seen + invested positions with P/L.
-- Service-role only (RLS on, no policies).

-- Every symbol ever added to the watchlist or surfaced by the AI suggestion.
create table if not exists public.trade_symbols (
  symbol     text        primary key,
  first_seen timestamptz not null default now()
);
alter table public.trade_symbols enable row level security;

-- Manually tracked positions: invested amount + buy price, then exit amount.
create table if not exists public.trade_positions (
  id          uuid        primary key default gen_random_uuid(),
  symbol      text        not null,
  invested    numeric     not null,
  buy_price   numeric     not null,
  status      text        not null default 'open', -- 'open' | 'closed'
  exit_amount numeric,
  closed_at   timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists trade_positions_symbol_idx
  on public.trade_positions (symbol);
alter table public.trade_positions enable row level security;
