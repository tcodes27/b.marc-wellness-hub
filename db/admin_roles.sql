-- =========================================================
-- Admin roles for B.MARC Pilates
-- Run this in your Supabase Dashboard → SQL Editor.
-- =========================================================

-- 1. Role enum
do $$ begin
  create type public.app_role as enum ('admin', 'moderator', 'user');
exception when duplicate_object then null; end $$;

-- 2. user_roles table
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- 3. has_role security definer (avoids RLS recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated;

-- 4. Admin RLS on existing admin-managed tables (skips any that don't exist)
do $$
declare t text;
begin
  foreach t in array array[
    'community_members','events','leads','tags','content_posts','content_assets'
  ] loop
    if exists (select 1 from information_schema.tables
               where table_schema='public' and table_name=t) then
      execute format('alter table public.%I enable row level security;', t);
      execute format('drop policy if exists "Admins full access" on public.%I;', t);
      execute format($f$create policy "Admins full access" on public.%I
        for all to authenticated
        using (public.has_role(auth.uid(), 'admin'))
        with check (public.has_role(auth.uid(), 'admin'));$f$, t);
    end if;
  end loop;
end $$;

-- 5. Seed your admin user — replace UUID with your auth.users id, then run:
-- insert into public.user_roles (user_id, role)
-- values ('YOUR-AUTH-USER-UUID-HERE', 'admin')
-- on conflict (user_id, role) do nothing;
