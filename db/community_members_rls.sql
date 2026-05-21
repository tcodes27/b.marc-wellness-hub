-- =========================================================
-- Public INSERT policy for community_members
-- Run this in your Supabase Dashboard → SQL Editor.
-- =========================================================

-- Keep RLS enabled
alter table public.community_members enable row level security;

-- Idempotent: drop prior version of this policy if present
drop policy if exists "Public can join community" on public.community_members;

-- ✅ Allow anonymous + authenticated visitors to INSERT only
create policy "Public can join community"
  on public.community_members
  for insert
  to anon, authenticated
  with check (true);

-- ❌ No SELECT / UPDATE / DELETE policy is created for anon.
--    Default-deny means public visitors cannot read, modify, or delete rows.
-- ✅ Admins retain full access via the "Admins full access" policy
--    created in db/admin_roles.sql (has_role(auth.uid(), 'admin')).
