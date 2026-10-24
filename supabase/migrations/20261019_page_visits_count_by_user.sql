-- ============================================================
-- Látogatottság: belépett felhasználó egyszer számít
-- ============================================================
-- Eddig a látogatót az IP-lenyomat azonosította. Ha egy belépett
-- felhasználó napközben IP-t vált (pl. wifiről mobilnetre), két
-- látogatónak számított. Mostantól a látogató kulcsa:
--   belépett fióknál a fiók, egyébként az IP-lenyomat.
-- A visszatérési típusok nem változnak, ezért elég a create or replace.

create or replace function public.page_visit_daily_stats(p_path text, days_back integer default 30)
returns table (day date, unique_ips bigint, new_ips bigint, hits bigint)
language sql
security definer
set search_path = public
as $$
  with visits as (
    select *, coalesce('u:' || user_id::text, ip_hash) as visitor
    from public.page_visits
    where path = p_path
  ),
  firsts as (
    select visitor, min(visit_date) as first_date from visits group by visitor
  )
  select
    d::date                                                            as day,
    count(distinct v.visitor)                                          as unique_ips,
    count(distinct v.visitor) filter (where f.first_date = d::date)    as new_ips,
    coalesce(sum(v.hit_count), 0)::bigint                              as hits
  from generate_series(
         (timezone('Europe/Budapest', now()))::date - (greatest(days_back, 1) - 1),
         (timezone('Europe/Budapest', now()))::date,
         interval '1 day'
       ) as d
  left join visits v on v.visit_date = d::date
  left join firsts f on f.visitor = v.visitor
  group by d
  order by d;
$$;

create or replace function public.page_visit_weekly_stats(p_path text, weeks_back integer default 12)
returns table (week_start date, unique_ips bigint, new_ips bigint, hits bigint)
language sql
security definer
set search_path = public
as $$
  with visits as (
    select *, coalesce('u:' || user_id::text, ip_hash) as visitor
    from public.page_visits
    where path = p_path
  ),
  firsts as (
    select visitor, min(visit_date) as first_date from visits group by visitor
  )
  select
    w::date                                                   as week_start,
    count(distinct v.visitor)                                 as unique_ips,
    count(distinct v.visitor) filter (
      where f.first_date >= w::date and f.first_date < (w::date + 7)
    )                                                         as new_ips,
    coalesce(sum(v.hit_count), 0)::bigint                     as hits
  from generate_series(
         date_trunc('week', (timezone('Europe/Budapest', now()))::date)
           - ((greatest(weeks_back, 1) - 1) * interval '1 week'),
         date_trunc('week', (timezone('Europe/Budapest', now()))::date),
         interval '1 week'
       ) as w
  left join visits v
    on v.visit_date >= w::date
   and v.visit_date <  (w::date + 7)
  left join firsts f on f.visitor = v.visitor
  group by w
  order by w;
$$;

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
    select *, coalesce('u:' || user_id::text, ip_hash) as visitor
    from public.page_visits
    where path = p_path
  ),
  firsts as (
    select visitor, min(visit_date) as first_date from visits group by visitor
  )
  select
    (select count(distinct visitor) from visits, bounds b where visit_date = b.d_today)                               as today,
    (select count(distinct visitor) from visits, bounds b where visit_date = b.d_today - 1)                           as yesterday,
    (select count(distinct visitor) from visits, bounds b where visit_date >= b.d_week)                               as this_week,
    (select count(distinct visitor) from visits, bounds b where visit_date >= b.d_week - 7 and visit_date < b.d_week) as last_week,
    (select count(distinct visitor) from visits, bounds b where visit_date > b.d_today - 30)                          as last_30_days,
    (select count(distinct visitor) from visits)                                                                     as all_time,
    (select coalesce(sum(hit_count), 0)::bigint from visits)                                                         as total_hits,
    (select count(*) from firsts, bounds b where first_date = b.d_today)                                             as new_today,
    (select count(*) from firsts, bounds b where first_date = b.d_today - 1)                                         as new_yesterday,
    (select count(*) from firsts, bounds b where first_date >= b.d_week)                                             as new_this_week,
    (select count(*) from firsts, bounds b where first_date >= b.d_week - 7 and first_date < b.d_week)               as new_last_week,
    (select count(*) from firsts, bounds b where first_date > b.d_today - 30)                                        as new_last_30_days;
$$;

revoke execute on function public.page_visit_daily_stats(text, integer)  from public, anon, authenticated;
revoke execute on function public.page_visit_weekly_stats(text, integer) from public, anon, authenticated;
revoke execute on function public.page_visit_summary(text)               from public, anon, authenticated;
