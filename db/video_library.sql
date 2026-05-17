-- ===========================================================
-- B.MARC Video Library + Member Tier Gating
-- Run in Supabase SQL Editor AFTER:
--   db/admin_roles.sql
--   db/portal_and_testing.sql
-- Idempotent: safe to re-run.
-- ===========================================================

-- 1. member_tier enum (ordered: public < community < signature < all-access)
do $$ begin
  create type public.member_tier as enum ('public','community','signature','all-access');
exception when duplicate_object then null; end $$;

-- 2. Profiles get a member_tier column (default 'public' = no membership)
alter table public.profiles
  add column if not exists member_tier public.member_tier not null default 'public';

-- 3. Tier ranking helper (used inside policies)
create or replace function public.tier_rank(_t public.member_tier)
returns int
language sql
immutable
as $$
  select case _t
    when 'public'      then 0
    when 'community'   then 1
    when 'signature'   then 2
    when 'all-access'  then 3
  end;
$$;

-- 4. can_access_video(user, required_level)
--    Admins always pass. Otherwise compare the user's tier rank.
create or replace function public.can_access_video(_user_id uuid, _required public.member_tier)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_role(_user_id, 'admin')
    or coalesce(
      (select public.tier_rank(member_tier) from public.profiles where id = _user_id),
      0
    ) >= public.tier_rank(_required);
$$;

grant execute on function public.tier_rank(public.member_tier) to anon, authenticated;
grant execute on function public.can_access_video(uuid, public.member_tier) to anon, authenticated;

-- 5. video_library table
create table if not exists public.video_library (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  -- Public watch URL (or unlisted for higher tiers).
  url text not null,
  -- Optional playlist URL.
  playlist_url text,
  -- Optional override thumbnail (else derived from YouTube ID client-side).
  thumbnail_url text,
  -- Optional private/unlisted distribution link, surfaced only to members
  -- whose tier matches access_level. Whole-row gating via RLS protects this.
  private_link text,
  category text,
  tags text[] not null default '{}',
  access_level public.member_tier not null default 'public',
  sort_order int not null default 0,
  is_active boolean not null default true,
  is_test_account boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists video_library_active_level_idx
  on public.video_library (is_active, access_level, sort_order desc, created_at desc);

alter table public.video_library enable row level security;

-- updated_at trigger
drop trigger if exists video_library_touch on public.video_library;
create trigger video_library_touch before update on public.video_library
  for each row execute function public.touch_updated_at();

-- 6. RLS policies (whole-row gating)

-- Anon can only read active PUBLIC videos.
drop policy if exists "Anon read public videos" on public.video_library;
create policy "Anon read public videos" on public.video_library
  for select to anon
  using (is_active and access_level = 'public');

-- Authenticated members can read every active video at or below their tier.
-- can_access_video() bypasses recursion via security definer.
drop policy if exists "Members read videos by tier" on public.video_library;
create policy "Members read videos by tier" on public.video_library
  for select to authenticated
  using (
    is_active
    and public.can_access_video(auth.uid(), access_level)
  );

-- Admins: full read + write.
drop policy if exists "Admins full access videos" on public.video_library;
create policy "Admins full access videos" on public.video_library
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 7. Locked-preview view.
--    Exposes safe metadata (title, thumbnail, tier badge) for EVERY active
--    video, regardless of viewer tier — but masks the sensitive columns
--    (`url`, `private_link`) when the viewer cannot access them.
--    Runs as the view owner (security_invoker=off) so it bypasses the
--    underlying table RLS in a controlled way; only safe columns leak.
drop view if exists public.video_library_preview;
create view public.video_library_preview
with (security_invoker = off) as
select
  v.id,
  v.title,
  v.description,
  v.thumbnail_url,
  v.category,
  v.tags,
  v.access_level,
  v.sort_order,
  v.created_at,
  public.can_access_video(auth.uid(), v.access_level) as has_access,
  case when public.can_access_video(auth.uid(), v.access_level)
       then v.url else null end as url,
  case when public.can_access_video(auth.uid(), v.access_level)
       then v.playlist_url else null end as playlist_url,
  case when public.can_access_video(auth.uid(), v.access_level)
       then v.private_link else null end as private_link
from public.video_library v
where v.is_active;

grant select on public.video_library_preview to anon, authenticated;

-- 8. Admins can read/update profiles.member_tier (already covered by the
--    "Admins full access profiles" policy in portal_and_testing.sql).

-- DONE. Verify with:
--   select id, title, access_level, has_access, url, private_link
--     from public.video_library_preview;
