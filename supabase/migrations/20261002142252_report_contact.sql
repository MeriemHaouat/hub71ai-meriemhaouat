-- Store the poster's contact so Rafiki can connect people to live community posts.
alter table public.reports add column if not exists contact text;
