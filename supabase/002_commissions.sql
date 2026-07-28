-- ============================================================================
-- VITROUS — commissions register (optional)
--
-- Stores what visitors describe in "The Register" and the line the atelier
-- (Gemini) recorded back. This is the useful residue of the AI feature: by
-- launch you know, in their own words, what the people on your list want made.
--
-- The site works without this table — /api/engrave ignores a "relation does
-- not exist" error (42P01) and still returns the concept.
--
-- Run in Supabase → SQL Editor → New query → Run.
-- ============================================================================

create table if not exists public.commissions (
  id         uuid primary key default gen_random_uuid(),
  prompt     text        not null check (char_length(prompt) between 3 and 240),
  concept    text        not null,
  created_at timestamptz not null default now()
);

create index if not exists commissions_created_at_idx
  on public.commissions (created_at desc);

-- Same posture as `signups`: the public key may write, never read.
alter table public.commissions enable row level security;

drop policy if exists "anon can record a commission" on public.commissions;
create policy "anon can record a commission"
  on public.commissions
  for insert
  to anon, authenticated
  with check (true);
