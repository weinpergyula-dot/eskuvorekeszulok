-- Add exact minute + optional message to Bella guesses (for DBs where the
-- original table was already created without these columns).
alter table public.bella_guesses
  add column if not exists minute int not null default 0 check (minute between 0 and 59);

alter table public.bella_guesses
  add column if not exists message text;
