-- User-managed watchlist for /trade. Service-role only (RLS on, no policies).
create table if not exists public.trade_watchlist (
  symbol     text        primary key,
  created_at timestamptz not null default now()
);

alter table public.trade_watchlist enable row level security;

-- Seed the MVP defaults (idempotent).
insert into public.trade_watchlist (symbol) values
  ('AAPL'), ('MSFT'), ('NVDA'), ('AMZN'), ('META'), ('TSLA')
on conflict (symbol) do nothing;
