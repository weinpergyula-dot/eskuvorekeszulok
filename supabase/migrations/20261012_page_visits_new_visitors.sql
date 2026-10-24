-- ============================================================
-- Látogatottság: „új látogatók” – a visszatérők nélkül
-- ============================================================
-- Eddig minden nap minden egyedi IP-lenyomat számított. Mostantól a
-- függvények egy új_ips oszlopot is adnak: egy lenyomat csak azon a
-- napon számít, amikor (az adott oldalon) először jelent meg; a
-- későbbi napokon már nem. A meglévő adatokból visszamenőleg is
-- kiszámolható, új tárolt adat nem kell hozzá.
--
-- Az „első nap” a megőrzött 12 hónapon belül értendő (a régebbi sorokat
-- a prune_page_visits törli).
--
-- A visszatérési típus változik, ezért a függvényeket újra kell
-- létrehozni (create or replace ehhez nem elég).

drop function if exists public.page_visit_daily_stats(text, integer);
drop function if exists public.page_visit_weekly_stats(text, integer);
drop function if exists public.page_visit_summary(text);

-- Lenyomatonként az első látogatás napja az adott oldalon
create index if not exists page_visits_path_ip_date_idx
  on public.page_visits (path, ip_hash, visit_date);

-- Napi bontás – az üres napok is szerepelnek (0 értékkel)
create or replace function public.page_visit_daily_stats(p_path text, days_back integer default 30)
returns table (day date, unique_ips bigint, new_ips bigint, hits bigint)
language sql
security definer
set search_path = public
as $$
  with firsts as (
    select ip_hash, min(visit_date) as first_date
    from public.page_visits
    where path = p_path
    group by ip_hash
  )
  select
    d::date                                                   as day,
    count(v.ip_hash)                                          as unique_ips,
    count(v.ip_hash) filter (where f.first_date = d::date)    as new_ips,
    coalesce(sum(v.hit_count), 0)::bigint                     as hits
  from generate_series(
         (timezone('Europe/Budapest', now()))::date - (greatest(days_back, 1) - 1),
         (timezone('Europe/Budapest', now()))::date,
         interval '1 day'
       ) as d
  left join public.page_visits v
    on v.visit_date = d::date
   and v.path = p_path
  left join firsts f on f.ip_hash = v.ip_hash
  group by d
  order by d;
$$;

-- Heti bontás – hétfővel kezdődő hetek, üres hetekkel együtt
create or replace function public.page_visit_weekly_stats(p_path text, weeks_back integer default 12)
returns table (week_start date, unique_ips bigint, new_ips bigint, hits bigint)
language sql
security definer
set search_path = public
as $$
  with firsts as (
    select ip_hash, min(visit_date) as first_date
    from public.page_visits
    where path = p_path
    group by ip_hash
  )
  select
    w::date                                                   as week_start,
    count(distinct v.ip_hash)                                 as unique_ips,
    count(distinct v.ip_hash) filter (
      where f.first_date >= w::date and f.first_date < (w::date + 7)
    )                                                         as new_ips,
    coalesce(sum(v.hit_count), 0)::bigint                     as hits
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
  left join firsts f on f.ip_hash = v.ip_hash
  group by w
  order by w;
$$;

-- Összesítő számok az admin felülethez (egyedi és új látogatók)
create or replace function public.page_visit_summary(p_path text)
returns table (
  today            bigint,
  yesterday        bigint,
  this_week        bigint,
  last_week        bigint,
  last_30_days     bigint,
  all_time         bigint,
  total_hits       bigint,
  new_today        bigint,
  new_yesterday    bigint,
  new_this_week    bigint,
  new_last_week    bigint,
  new_last_30_days bigint
)
language sql
security definer
set search_path = public
as $$
  with bounds as (
    select
      (timezone('Europe/Budapest', now()))::date                                   as d_today,
      date_trunc('week', (timezone('Europe/Budapest', now()))::date)::date          as d_week
  ),
  visits as (
    select * from public.page_visits where path = p_path
  ),
  firsts as (
    select ip_hash, min(visit_date) as first_date from visits group by ip_hash
  )
  select
    (select count(distinct ip_hash) from visits, bounds b where visit_date = b.d_today)                               as today,
    (select count(distinct ip_hash) from visits, bounds b where visit_date = b.d_today - 1)                           as yesterday,
    (select count(distinct ip_hash) from visits, bounds b where visit_date >= b.d_week)                               as this_week,
    (select count(distinct ip_hash) from visits, bounds b where visit_date >= b.d_week - 7 and visit_date < b.d_week) as last_week,
    (select count(distinct ip_hash) from visits, bounds b where visit_date > b.d_today - 30)                          as last_30_days,
    (select count(distinct ip_hash) from visits)                                                                     as all_time,
    (select coalesce(sum(hit_count), 0)::bigint from visits)                                                         as total_hits,
    (select count(*) from firsts, bounds b where first_date = b.d_today)                                             as new_today,
    (select count(*) from firsts, bounds b where first_date = b.d_today - 1)                                         as new_yesterday,
    (select count(*) from firsts, bounds b where first_date >= b.d_week)                                             as new_this_week,
    (select count(*) from firsts, bounds b where first_date >= b.d_week - 7 and first_date < b.d_week)               as new_last_week,
    (select count(*) from firsts, bounds b where first_date > b.d_today - 30)                                        as new_last_30_days;
$$;

-- Csak a service-role hívhatja ezeket (a security definer miatt fontos)
revoke execute on function public.page_visit_daily_stats(text, integer)  from public, anon, authenticated;
revoke execute on function public.page_visit_weekly_stats(text, integer) from public, anon, authenticated;
revoke execute on function public.page_visit_summary(text)               from public, anon, authenticated;
