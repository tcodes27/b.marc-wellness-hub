-- ===========================================================
-- B.MARC Portal + Testing System
-- Run in Supabase SQL Editor AFTER db/admin_roles.sql
-- Idempotent: safe to run multiple times.
-- ===========================================================

-- 1. account_type enum
do $$ begin
  create type public.account_type as enum ('demo','customer','admin','member');
exception when duplicate_object then null; end $$;

-- 2. profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  account_type public.account_type not null default 'customer',
  is_test_account boolean not null default false,
  community_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users view own profile" on public.profiles;
create policy "Users view own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "Admins full access profiles" on public.profiles;
create policy "Admins full access profiles" on public.profiles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 3. Auto-create profile on signup; flag demo/test emails
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_test boolean := false;
  v_type public.account_type := 'customer';
begin
  if new.email ilike '%+test@%' or new.email ilike 'demo@%' or new.email ilike '%+demo@%' then
    v_is_test := true;
    v_type := 'demo';
  end if;

  insert into public.profiles (id, email, full_name, account_type, is_test_account)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    v_type,
    v_is_test
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. updated_at trigger for profiles
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 5. event_registrations
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_id uuid not null,
  status text not null default 'registered' check (status in ('registered','attended','cancelled')),
  is_test_account boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

alter table public.event_registrations enable row level security;

drop policy if exists "Users view own regs" on public.event_registrations;
create policy "Users view own regs" on public.event_registrations
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users insert own regs" on public.event_registrations;
create policy "Users insert own regs" on public.event_registrations
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users delete own regs" on public.event_registrations;
create policy "Users delete own regs" on public.event_registrations
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Admins full access regs" on public.event_registrations;
create policy "Admins full access regs" on public.event_registrations
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 6. is_test_account flag on existing tables (skips missing)
do $$
declare t text;
begin
  foreach t in array array['community_members','events','content_posts','leads'] loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      execute format('alter table public.%I add column if not exists is_test_account boolean not null default false;', t);
    end if;
  end loop;
end $$;

-- 7. content_posts visibility column + member-read policy
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='content_posts') then
    execute 'alter table public.content_posts add column if not exists visibility text not null default ''public'' check (visibility in (''public'',''members'',''admin''));';
    execute 'drop policy if exists "Members read member content" on public.content_posts;';
    execute $f$create policy "Members read member content" on public.content_posts
      for select to authenticated
      using (
        status = 'Published'
        and visibility in ('public','members')
      );$f$;
    execute 'drop policy if exists "Anon read public content" on public.content_posts;';
    execute $f$create policy "Anon read public content" on public.content_posts
      for select to anon
      using (status = 'Published' and visibility = 'public');$f$;
  end if;
end $$;

-- 8. Diagnostics ping table for /admin/testing
create table if not exists public._diagnostics (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
alter table public._diagnostics enable row level security;
drop policy if exists "Admins diag" on public._diagnostics;
create policy "Admins diag" on public._diagnostics
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- DONE. Verify with:
-- select * from public.profiles limit 1;
-- select * from public.event_registrations limit 1;
