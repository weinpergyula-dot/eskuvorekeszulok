-- ============================================================
-- Ajánlatkéréshez csatolt kép
-- ============================================================
-- Az általános (szolgáltatói) ajánlatkéréshez egyetlen kép csatolható.
-- A fájl a nyilvános `avatars` bucketben landol, itt csak a hivatkozás
-- tárolódik – így minden címzett ugyanazt a képet látja a chatben.
-- A meghívós ajánlatkérésnél nincs csatolás, ott a mező marad NULL.

alter table public.quote_requests
  add column if not exists image_url text;
