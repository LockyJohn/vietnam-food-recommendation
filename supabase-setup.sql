create table if not exists public.restaurant_recommendations (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 2 and 20),
  name text not null check (char_length(name) between 2 and 60),
  maps_url text not null,
  city text not null,
  area text not null,
  cuisine text not null,
  reason text not null check (char_length(reason) between 10 and 300),
  status text not null default 'published' check (status in ('published', 'hidden')),
  want_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.restaurant_recommendations
  add column if not exists google_place_id text,
  add column if not exists rating numeric(2, 1),
  add column if not exists review_count integer,
  add column if not exists photo_url text,
  add column if not exists google_data_updated_at timestamptz;

alter table public.restaurant_recommendations enable row level security;

insert into storage.buckets (id, name, public)
values ('restaurant-photos', 'restaurant-photos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Anyone can read published recommendations" on public.restaurant_recommendations;
create policy "Anyone can read published recommendations"
on public.restaurant_recommendations
for select
to anon
using (status = 'published');

drop policy if exists "Anyone can submit published recommendations" on public.restaurant_recommendations;
create policy "Anyone can submit published recommendations"
on public.restaurant_recommendations
for insert
to anon
with check (status = 'published');
