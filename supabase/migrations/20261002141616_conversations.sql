-- Per-chat conversation memory so Rafiki remembers the thread.
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  chat_id    text not null,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists conversations_chat_idx on public.conversations (chat_id, created_at);
alter table public.conversations enable row level security;
