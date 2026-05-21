-- =========================================================
-- B.MARC Pilates — community_members RLS/grants audit
-- Run this in Supabase Dashboard → SQL Editor.
-- =========================================================

-- 1. Confirm table and RLS status
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'community_members';

-- 2. Active policies
select
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'community_members'
order by policyname;

-- 3. Grants for public insert roles
select
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'community_members'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;

-- 4. Required/defaulted columns that can affect INSERT
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'community_members'
order by ordinal_position;

-- 5. Check constraints that can reject payloads
select
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
from pg_constraint
where conrelid = 'public.community_members'::regclass
  and contype = 'c'
order by conname;
