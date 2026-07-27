-- ============================================================================
-- VITROUS — database schema
-- Run this in Supabase → SQL Editor → New query → Run.
-- ============================================================================

-- Enum for the honorific. Only MR / MRS, per spec.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'honorific') then
    create type honorific as enum ('MR', 'MRS');
  end if;
end$$;

-- Distinguishes a plain waitlist signup from an intent-to-buy pre-order.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'signup_kind') then
    create type signup_kind as enum ('WAITLIST', 'PREORDER');
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- signups: one row per person on the list
-- ---------------------------------------------------------------------------
create table if not exists public.signups (
  id           uuid primary key default gen_random_uuid(),
  title        honorific   not null,
  first_name   text        not null check (char_length(trim(first_name)) between 1 and 80),
  email        text        not null check (position('@' in email) > 1),
  kind         signup_kind not null default 'WAITLIST',
  -- provenance, useful later and harmless now
  source       text        default 'web',
  user_agent   text,
  created_at   timestamptz not null default now()
);

-- One signup per email address.
create unique index if not exists signups_email_key
  on public.signups (lower(email));

create index if not exists signups_created_at_idx
  on public.signups (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The site writes with the ANON key from the browser-facing API route, so we
-- allow INSERT for anon but deliberately grant NO select/update/delete. That
-- means the public can join the list, but nobody can read the list back out
-- (or edit it) with the public key — you read it in the Supabase dashboard,
-- or from a server using the service-role key.
-- ---------------------------------------------------------------------------
alter table public.signups enable row level security;

drop policy if exists "anon can join the list" on public.signups;
create policy "anon can join the list"
  on public.signups
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for product imagery (public read, dashboard-only write)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vitrous-assets', 'vitrous-assets', true)
on conflict (id) do nothing;

drop policy if exists "public can read vitrous assets" on storage.objects;
create policy "public can read vitrous assets"
  on storage.objects
  for select
  to public
  using (bucket_id = 'vitrous-assets');
