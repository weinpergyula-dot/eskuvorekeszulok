-- ============================================================
-- Esküvőre Készülök – Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles: minden felhasználóhoz (visitor, provider, admin)
-- ============================================================
create table public.profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  email       text not null,
  full_name   text not null,
  role        text not null default 'visitor' check (role in ('visitor', 'provider', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- providers: szolgáltató adatlapok
-- ============================================================
create table public.providers (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null unique,
  full_name         text not null,
  email             text not null,
  phone             text not null,
  description       text not null,
  category          text not null,
  county            text not null,
  website           text,
  avatar_url        text,
  gallery_urls      text[] default '{}',
  approval_status   text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  pending_changes   jsonb,
  view_count        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.providers enable row level security;

-- Publikusan csak jóváhagyott szolgáltatók látszanak
create policy "Anyone can view approved providers"
  on public.providers for select
  using (approval_status = 'approved');

-- Saját profil mindig látható
create policy "Provider can view own profile"
  on public.providers for select
  using (auth.uid() = user_id);

create policy "Provider can update own profile"
  on public.providers for update
  using (auth.uid() = user_id);

-- Adminok mindent látnak és módosíthatnak
create policy "Admins can manage all providers"
  on public.providers for all
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- reviews: értékelések
-- ============================================================
create table public.reviews (
  id           uuid primary key default uuid_generate_v4(),
  provider_id  uuid references public.providers(id) on delete cascade not null,
  visitor_id   uuid references auth.users(id) on delete cascade not null,
  rating       integer not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  unique (provider_id, visitor_id)
);

alter table public.reviews enable row level security;

create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

create policy "Logged-in visitors can insert review"
  on public.reviews for insert
  with check (auth.uid() = visitor_id);

create policy "Visitors can update own review"
  on public.reviews for update
  using (auth.uid() = visitor_id);

-- ============================================================
-- favorites: kedvencek
-- ============================================================
create table public.favorites (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  provider_id  uuid references public.providers(id) on delete cascade not null,
  created_at   timestamptz not null default now(),
  unique (user_id, provider_id)
);

alter table public.favorites enable row level security;

create policy "Users can manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id);

-- ============================================================
-- Automatikus profil létrehozás regisztrációkor
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'visitor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Average rating view
-- ============================================================
create or replace view public.providers_with_stats as
select
  p.*,
  coalesce(avg(r.rating), 0)::numeric(3,1) as average_rating,
  count(r.id)::integer as review_count
from public.providers p
left join public.reviews r on r.provider_id = p.id
group by p.id;

-- ============================================================
-- Storage bucket: avatars és képek
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict do nothing;

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view gallery"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Authenticated users can upload gallery"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and auth.role() = 'authenticated');
