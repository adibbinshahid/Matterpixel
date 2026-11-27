-- Matterpixel: the `inbound` table every quote is saved to first
-- (app/api/quote/route.ts, step 1). Run once in Supabase → SQL Editor.
-- Safe to re-run.

create table if not exists public.inbound (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  type         text not null check (type in ('quote')),
  status       text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost', 'spam')),
  name         text not null check (char_length(name) between 2 and 80),
  email        text not null check (char_length(email) <= 320),
  website      text,
  service      text not null,
  details      text not null check (char_length(details) <= 3000),
  budget       text,
  timeline     text,
  link         text,
  selection    text,             -- package / stack the visitor came from
  src          text,             -- which CTA sent them (e.g. services-cta-banner)
  source_page  text,             -- referer path of the form
  utm          jsonb not null default '{}'::jsonb,
  country      text,             -- x-vercel-ip-country
  user_agent   text
);

-- Inbox view: newest leads per status.
create index if not exists inbound_status_created_at_idx
  on public.inbound (status, created_at desc);

-- Only the server writes here, with the secret key (service_role, which
-- bypasses RLS). RLS on with no policies means the public anon and
-- authenticated roles can neither read nor write a single row.
alter table public.inbound enable row level security;

revoke all on table public.inbound from anon, authenticated;

-- Needed when the project's Data API doesn't auto-expose new tables;
-- without it even the secret key gets a 42501 permission error.
grant select, insert, update, delete on table public.inbound to service_role;
