-- ============================================================
-- Ajánlatkérést fogadni nem tudó szolgáltatók
-- ============================================================
-- Tünet: az ajánlatkérés "elmegy", de sem a küldő, sem a szolgáltató
-- chatjében nem jelenik meg, a naplóban pedig ez áll:
--   violates foreign key constraint "quote_request_recipients_provider_user_id_fkey"
--
-- Ok: a szolgáltató user_id-je nem szerepel abban a táblában, amire az
-- idegenkulcs mutat, ezért a címzett sora nem hozható létre – címzett nélkül
-- viszont az ajánlatkérés sehol nem látszik.

-- 1) Mire mutat pontosan az idegenkulcs?
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conname = 'quote_request_recipients_provider_user_id_fkey';

-- 2) Mely aktív szolgáltatóknak nincs profilja?
select p.id, p.full_name, p.email, p.user_id, p.approval_status, p.active
from providers p
left join profiles pr on pr.user_id = p.user_id
where pr.user_id is null
order by p.full_name;

-- 3) Mely szolgáltatók user_id-je hiányzik az auth.users-ből?
--    (Ha az 1) pont szerint az idegenkulcs oda mutat, ez a mérvadó lista.)
select p.id, p.full_name, p.email, p.user_id
from providers p
left join auth.users u on u.id = p.user_id
where u.id is null
order by p.full_name;

-- ------------------------------------------------------------
-- JAVÍTÁS – csak a fenti listák átnézése után futtasd!
-- ------------------------------------------------------------
-- a) Ha a szolgáltató valódi, csak a profilja hiányzik (a 2) ad sort, a 3)
--    nem), a hiányzó profil pótolható:
--
-- insert into profiles (user_id, email, full_name, role)
-- select p.user_id, p.email, p.full_name, 'provider'
-- from providers p
-- left join profiles pr on pr.user_id = p.user_id
-- where pr.user_id is null;
--
-- b) Ha a felhasználó már nem létezik (a 3) is ad sort), a szolgáltatói sor
--    árva: a fiókja megszűnt, de a sor bent maradt. Ilyenkor érdemes
--    inaktívvá tenni, hogy a listákban se szerepeljen:
--
-- update providers set active = false where id = '<a fenti id>';
