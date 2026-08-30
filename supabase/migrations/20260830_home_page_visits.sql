-- ============================================================
-- Főoldal-látogatottság: napi és heti egyedi IP statisztika
-- ============================================================
-- Egy sor = egy IP-cím + egy nap. A nyers IP-t soha nem tároljuk,
-- csak egy salt-tal képzett SHA-256 hash-t (GDPR: az egyedi
-- látogatók megszámolásához elég, a látogató nem azonosítható).
-- A nap az Europe/Budapest zónában értendő, hogy az admin
-- felületen látott "ma" a magyar naptári nappal egyezzen.

create table if not exists public.home_page_visits (
  id           uuid        primary key default gen_random_uuid(),
  ip_hash      text        not null,
  visit_date   date        not null default (timezone('Europe/Budapest', now()))::date,
  hit_count    integer     not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

-- Naponta és IP-nként pontosan egy sor -> az egyedi IP-k száma
-- egy egyszerű count(), a heti egyedi szám pedig count(distinct ip_hash).
create unique index if not exists home_page_visits_ip_day_key
  on public.home_page_visits (ip_hash, visit_date);

create index if not exists home_page_visits_visit_date_idx
  on public.home_page_visits (visit_date);

-- RLS bekapcsolva, policy nélkül: csak a service-role kulcs
-- (szerveroldali API route-ok) írhatja és olvashatja.
alter table public.home_page_visits enable row level security;

-- ============================================================
-- Látogatás rögzítése (a /api/track/home-visit hívja)
-- ============================================================
create or replace function public.record_home_page_visit(p_ip_hash text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.home_page_visits (ip_hash)
  values (p_ip_hash)
  on conflict (ip_hash, visit_date) do update
    set hit_count    = public.home_page_visits.hit_count + 1,
        last_seen_at = now();
$$;

-- ============================================================
-- Napi bontás – az üres napok is szerepelnek (0 értékkel)
-- ============================================================
create or replace function public.home_page_visit_daily_stats(days_back integer default 30)
returns table (day date, unique_ips bigint, hits bigint)
language sql
security definer
set search_path = public
as $$
  select
    d::date                                   as day,
    count(v.ip_hash)                          as unique_ips,
    coalesce(sum(v.hit_count), 0)::bigint     as hits
  from generate_series(
         (timezone('Europe/Budapest', now()))::date - (greatest(days_back, 1) - 1),
         (timezone('Europe/Budapest', now()))::date,
         interval '1 day'
       ) as d
  left join public.home_page_visits v on v.visit_date = d::date
  group by d
  order by d;
$$;

-- ============================================================
-- Heti bontás – hétfővel kezdődő hetek, üres hetekkel együtt
-- ============================================================
create or replace function public.home_page_visit_weekly_stats(weeks_back integer default 12)
returns table (week_start date, unique_ips bigint, hits bigint)
language sql
security definer
set search_path = public
as $$
  select
    w::date                                     as week_start,
    count(distinct v.ip_hash)                   as unique_ips,
    coalesce(sum(v.hit_count), 0)::bigint       as hits
  from generate_series(
         date_trunc('week', (timezone('Europe/Budapest', now()))::date)
           - ((greatest(weeks_back, 1) - 1) * interval '1 week'),
         date_trunc('week', (timezone('Europe/Budapest', now()))::date),
         interval '1 week'
       ) as w
  left join public.home_page_visits v
    on v.visit_date >= w::date
   and v.visit_date <  (w::date + 7)
  group by w
  order by w;
$$;

-- ============================================================
-- Összesítő számok az admin stat-kártyákhoz
-- ============================================================
create or replace function public.home_page_visit_summary()
returns table (
  today        bigint,
  yesterday    bigint,
  this_week    bigint,
  last_week    bigint,
  last_30_days bigint,
  all_time     bigint,
  total_hits   bigint
)
language sql
security definer
set search_path = public
as $$
  with bounds as (
    select
      (timezone('Europe/Budapest', now()))::date                                   as d_today,
      date_trunc('week', (timezone('Europe/Budapest', now()))::date)::date          as d_week
  )
  select
    count(distinct v.ip_hash) filter (where v.visit_date = b.d_today)               as today,
    count(distinct v.ip_hash) filter (where v.visit_date = b.d_today - 1)           as yesterday,
    count(distinct v.ip_hash) filter (where v.visit_date >= b.d_week)               as this_week,
    count(distinct v.ip_hash) filter (
      where v.visit_date >= b.d_week - 7 and v.visit_date < b.d_week)               as last_week,
    count(distinct v.ip_hash) filter (where v.visit_date > b.d_today - 30)          as last_30_days,
    count(distinct v.ip_hash)                                                       as all_time,
    coalesce(sum(v.hit_count), 0)::bigint                                           as total_hits
  from bounds b
  left join public.home_page_visits v on true;
$$;

-- ============================================================
-- Megőrzés: az Adatkezelési tájékoztató 12 hónapot ígér
-- ============================================================
create or replace function public.prune_home_page_visits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.home_page_visits
  where visit_date < (timezone('Europe/Budapest', now()))::date - interval '12 months';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

-- Csak a service-role hívhatja ezeket (a security definer miatt fontos).
revoke execute on function public.record_home_page_visit(text)          from public, anon, authenticated;
revoke execute on function public.home_page_visit_daily_stats(integer)  from public, anon, authenticated;
revoke execute on function public.home_page_visit_weekly_stats(integer) from public, anon, authenticated;
revoke execute on function public.home_page_visit_summary()             from public, anon, authenticated;
revoke execute on function public.prune_home_page_visits()              from public, anon, authenticated;
