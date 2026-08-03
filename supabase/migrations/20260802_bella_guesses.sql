-- Babaváró tippjáték: "mikor születik meg Bella?" guesses.
create table if not exists public.bella_guesses (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  month      int         not null check (month  between 1 and 12),
  day        int         not null check (day    between 1 and 31),
  hour       int         not null check (hour   between 0 and 23),
  minute     int         not null default 0 check (minute between 0 and 59),
  message    text,
  created_at timestamptz not null default now()
);

-- One guess per name (case-insensitive).
create unique index if not exists bella_guesses_name_key
  on public.bella_guesses (lower(name));

-- RLS on with no policies: only the service-role key (server API route) can
-- read or write, so guesses and results are never exposed to anon clients.
alter table public.bella_guesses enable row level security;
