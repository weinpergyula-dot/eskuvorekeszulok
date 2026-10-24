-- ============================================================
-- Látogatottság: eszköztípus és belépett felhasználó
-- ============================================================
-- Az admin felületen a mai látogatók listája megmutatja, milyen
-- eszközről (desktop / iOS / Android) jött a látogató, és ha be volt
-- lépve, melyik fiókkal. A sor továbbra is IP-lenyomat + nap + oldal;
-- az eszköz a legutóbbi megnyitásé, a felhasználó pedig az utolsó
-- ismert belépett fiók (kijelentkezett megnyitás nem törli).

alter table public.page_visits add column if not exists device text;
alter table public.page_visits add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists page_visits_path_date_seen_idx
  on public.page_visits (path, visit_date, last_seen_at desc);

drop function if exists public.record_page_visit(text, text);

create or replace function public.record_page_visit(
  p_ip_hash text,
  p_path    text default '/',
  p_device  text default null,
  p_user_id uuid default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.page_visits (ip_hash, path, device, user_id)
  values (p_ip_hash, p_path, p_device, p_user_id)
  on conflict (path, ip_hash, visit_date) do update
    set hit_count    = public.page_visits.hit_count + 1,
        last_seen_at = now(),
        device       = coalesce(excluded.device, public.page_visits.device),
        user_id      = coalesce(excluded.user_id, public.page_visits.user_id);
$$;

revoke execute on function public.record_page_visit(text, text, text, uuid) from public, anon, authenticated;
