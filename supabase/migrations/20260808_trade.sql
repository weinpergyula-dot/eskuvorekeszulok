-- /trade decision-support dashboard.
-- RLS on with no policies: only the service-role key (server routes) can read or
-- write, so the whole feature is invisible to anon clients.

-- Latest cached analysis per symbol (the dashboard reads this).
create table if not exists public.trade_analyses (
  symbol     text        primary key,
  as_of      timestamptz not null,
  data       jsonb       not null,
  updated_at timestamptz not null default now()
);

alter table public.trade_analyses enable row level security;

-- Append-only signal log for later backtesting (did high-score setups play out?).
create table if not exists public.trade_signal_log (
  id          uuid        primary key default gen_random_uuid(),
  symbol      text        not null,
  as_of       timestamptz not null,
  bias        text,
  score_long  int,
  score_short int,
  snapshot    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists trade_signal_log_symbol_idx
  on public.trade_signal_log (symbol, created_at desc);

alter table public.trade_signal_log enable row level security;
