-- Rafiki — Supabase schema
-- Run this in the Supabase SQL editor for a NEW project (never Upfleet's DB).

create table if not exists public.reports (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('scam','rent','landlord','clinic','other')),
  area       text not null,
  detail     text not null,
  lat        double precision not null,
  lng        double precision not null,
  source     text not null default 'whatsapp',
  created_at timestamptz not null default now()
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);

-- Realtime: let the map receive INSERTs live
alter publication supabase_realtime add table public.reports;

-- Row level security: anyone can READ (so the public map + realtime work);
-- writes happen server-side with the service role key, which bypasses RLS.
alter table public.reports enable row level security;

drop policy if exists "public read reports" on public.reports;
create policy "public read reports"
  on public.reports
  for select
  using (true);
