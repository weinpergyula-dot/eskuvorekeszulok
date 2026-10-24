-- ============================================================
-- Látogatottság: operációs rendszer és böngésző
-- ============================================================
-- A mai látogatók listájában a „Desktop / iOS / Android” mellett a
-- pontosabb kliens is látszik, pl. „Windows · Chrome”. Az eszköz
-- (device) marad a durva bontáshoz; a client a legutóbbi megnyitásé.

alter table public.page_visits add column if not exists client text;

drop function if exists public.record_page_visit(text, text, text, uuid);

create or replace function public.record_page_visit(
  p_ip_hash text,
  p_path    text default '/',
  p_device  text default null,
  p_user_id uuid default null,
  p_client  text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.page_visits (ip_hash, path, device, user_id, client)
  values (p_ip_hash, p_path, p_device, p_user_id, p_client)
  on conflict (path, ip_hash, visit_date) do update
    set hit_count    = public.page_visits.hit_count + 1,
        last_seen_at = now(),
        device       = coalesce(excluded.device, public.page_visits.device),
        user_id      = coalesce(excluded.user_id, public.page_visits.user_id),
        client       = coalesce(excluded.client, public.page_visits.client);
$$;

revoke execute on function public.record_page_visit(text, text, text, uuid, text) from public, anon, authenticated;
