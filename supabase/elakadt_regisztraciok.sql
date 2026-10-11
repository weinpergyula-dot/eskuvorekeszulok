-- ============================================================
-- Elakadt regisztrációk felderítése (Supabase SQL Editor)
--
-- Futtatás: Supabase → SQL Editor → új query → bemásolni és lefuttatni.
-- A blokkok külön-külön is futtathatók.
-- ============================================================


-- ── 1. Meg nem erősített fiókok = félbemaradt regisztrációk ────────────
-- Ez a fő lista. Aki itt szerepel, annak létrejött a fiókja, de sosem
-- aktiválta. A "statusz" oszlop mondja meg, hogy technikai hiba miatt
-- akadt-e el, vagy csak nem kattintott a levélre.
select
  u.email,
  u.raw_user_meta_data ->> 'full_name'                        as nev,
  coalesce(u.raw_user_meta_data ->> 'role', 'visitor')        as tipus,
  u.created_at                                                as regisztralt,
  date_trunc('minute', now() - u.created_at)                  as ota,
  coalesce(i.providerek, 'email')                             as belepes_modja,
  case
    when coalesce(u.raw_user_meta_data ->> 'role', 'visitor') = 'provider'
         and pr.user_id is null
      then 'ELAKADT — szolgáltatói adatlap nem jött létre'
    when p.user_id is null
      then 'ELAKADT — profil sor sem jött létre'
    else 'megerősítésre vár (a levélre nem kattintott)'
  end                                                         as statusz
from auth.users u
left join public.profiles  p  on p.user_id  = u.id
left join public.providers pr on pr.user_id = u.id
left join (
  select user_id, string_agg(distinct provider, ', ') as providerek
  from auth.identities
  group by user_id
) i on i.user_id = u.id
where u.email_confirmed_at is null
order by u.created_at desc;


-- ── 2. Naplózott regisztrációs hibák e-mail cím szerint ────────────────
-- Figyelem: 2026-09-04 előtt CSAK a szolgáltatói ág naplózott
-- ("registration/provider"), a látogatói hibák nem kerültek be.
-- A javítás óta minden elbukott regisztráció ide kerül.
select
  l.details ->> 'email'                as email,
  l.details ->> 'mode'                 as mod,          -- password | oauth | upgrade
  l.source,
  l.message,
  l.created_at
from public.error_logs l
where l.source like 'registration%'
order by l.created_at desc;


-- ── 3. Ugyanez összevonva: kinek hányszor bukott el ────────────────────
select
  l.details ->> 'email'                as email,
  count(*)                             as probalkozasok,
  min(l.created_at)                    as elso,
  max(l.created_at)                    as utolso,
  array_agg(distinct l.message)        as hibauzenetek
from public.error_logs l
where l.source like 'registration%'
group by 1
order by utolso desc;


-- ── 4. Megerősített, mégis befejezetlen fiókok ─────────────────────────
-- A Google-lal belépő és a látogató → szolgáltató váltó felhasználók
-- fiókja eleve megerősített, ezért az 1. listában NEM látszanak.
-- Náluk az elakadás jele: nincs elfogadott feltétel, vagy szolgáltatónak
-- van jelölve, de nincs szolgáltatói adatlapja.
-- (A "The resource already exists" hiba pont ezeken az ágakon csapott le.)
select
  p.email,
  p.full_name                          as nev,
  p.role                               as tipus,
  p.created_at                         as regisztralt,
  p.accepted_tos_at,
  (pr.user_id is not null)             as van_szolgaltatoi_adatlap,
  case
    when p.role = 'provider' and pr.user_id is null
      then 'ELAKADT — szolgáltatói adatlap nem jött létre'
    else 'ELAKADT — a feltételek elfogadása nem mentődött el'
  end                                  as statusz
from public.profiles p
left join public.providers pr on pr.user_id = p.user_id
where p.accepted_tos_at is null
   or (p.role = 'provider' and pr.user_id is null)
order by p.created_at desc;


-- ── 5. Mennyire gyakori? Napi bontás ──────────────────────────────────
select
  date_trunc('day', u.created_at)::date                                    as nap,
  count(*)                                                                 as regisztralt,
  count(*) filter (where u.email_confirmed_at is null)                     as meg_nem_erositett,
  round(100.0 * count(*) filter (where u.email_confirmed_at is null)
        / nullif(count(*), 0), 1)                                          as meg_nem_erositett_szazalek
from auth.users u
where u.created_at > now() - interval '60 days'
group by 1
order by 1 desc;
