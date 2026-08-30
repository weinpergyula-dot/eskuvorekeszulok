-- ============================================================
-- Látogatottság: a mérés kiterjesztése tetszőleges oldalra
-- ============================================================
-- Eddig csak a főoldalt mértük (home_page_visits). Mostantól a
-- digitális meghívó oldalát (/meghivo) is ugyanígy nézzük, ezért a
-- tábla kap egy `path` oszlopot, és minden függvény útvonalra szűr.
-- A meglévő sorok a főoldalhoz tartoznak, náluk a '/' alapérték marad.

-- 1) A tábla átnevezése, ha még a régi néven van
do $$
begin
  if to_regclass('public.page_visits') is null
     and to_regclass('public.home_page_visits') is not null then
    alter table public.home_page_visits rename to page_visits;
  end if;
end $$;

-- 2) Ha egyik sem létezett (tiszta adatbázis), most jön létre
create table if not exists public.page_visits (
  id            uuid        primary key default gen_random_uuid(),
  ip_hash       text        not null,
  path          text        not null default '/',
  visit_date    date        not null default (timezone('Europe/Budapest', now()))::date,
  hit_count     integer     not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

alter table public.page_visits add column if not exists path text not null default '/';

-- 3) Az egyediség mostantól oldalanként értendő
drop index if exists public.home_page_visits_ip_day_key;
drop index if exists public.home_page_visits_visit_date_idx;

create unique index if not exists page_visits_path_ip_day_key
  on public.page_visits (path, ip_hash, visit_date);

create index if not exists page_visits_path_date_idx
  on public.page_visits (path, visit_date);

-- RLS bekapcsolva, policy nélkül: csak a service-role kulcs éri el
alter table public.page_visits enable row level security;

-- 4) A régi, útvonal nélküli függvények helyett útvonalasak
drop function if exists public.record_home_page_visit(text);
drop function if exists public.home_page_visit_daily_stats(integer);
drop function if exists public.home_page_visit_weekly_stats(integer);
drop function if exists public.home_page_visit_summary();
drop function if exists public.prune_home_page_visits();

-- Látogatás rögzítése (a /api/track/visit hívja)
create or replace function public.record_page_visit(p_ip_hash text, p_path text default '/')
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.page_visits (ip_hash, path)
  values (p_ip_hash, p_path)
  on conflict (path, ip_hash, visit_date) do update
    set hit_count    = public.page_visits.hit_count + 1,
        last_seen_at = now();
$$;

-- Napi bontás – az üres napok is szerepelnek (0 értékkel)
create or replace function public.page_visit_daily_stats(p_path text, days_back integer default 30)
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
  left join public.page_visits v
    on v.visit_date = d::date
   and v.path = p_path
  group by d
  order by d;
$$;

-- Heti bontás – hétfővel kezdődő hetek, üres hetekkel együtt
create or replace function public.page_visit_weekly_stats(p_path text, weeks_back integer default 12)
returns table (week_start date, unique_ips bigint, hits bigint)
language sql
security definer
set search_path = public
as $$
  select
    w::date                                   as week_start,
    count(distinct v.ip_hash)                 as unique_ips,
    coalesce(sum(v.hit_count), 0)::bigint     as hits
  from generate_series(
         date_trunc('week', (timezone('Europe/Budapest', now()))::date)
           - ((greatest(weeks_back, 1) - 1) * interval '1 week'),
         date_trunc('week', (timezone('Europe/Budapest', now()))::date),
         interval '1 week'
       ) as w
  left join public.page_visits v
    on v.visit_date >= w::date
   and v.visit_date <  (w::date + 7)
   and v.path = p_path
  group by w
  order by w;
$$;

-- Összesítő számok az admin felülethez
create or replace function public.page_visit_summary(p_path text)
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
  left join public.page_visits v on v.path = p_path;
$$;

-- Megőrzés: az Adatkezelési tájékoztató 12 hónapot ígér
create or replace function public.prune_page_visits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.page_visits
  where visit_date < (timezone('Europe/Budapest', now()))::date - interval '12 months';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

-- Csak a service-role hívhatja ezeket (a security definer miatt fontos)
revoke execute on function public.record_page_visit(text, text)              from public, anon, authenticated;
revoke execute on function public.page_visit_daily_stats(text, integer)      from public, anon, authenticated;
revoke execute on function public.page_visit_weekly_stats(text, integer)     from public, anon, authenticated;
revoke execute on function public.page_visit_summary(text)                   from public, anon, authenticated;
revoke execute on function public.prune_page_visits()                        from public, anon, authenticated;
