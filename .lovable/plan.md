## Fix: `public.has_role` does not exist

Your `db/events.sql` references `public.has_role(auth.uid(), 'admin')`, but that function (and the `app_role` enum + `user_roles` table it depends on) hasn't been created in your Supabase project yet. It lives in `db/admin_roles.sql`, which never got run.

Fix = run the admin-roles SQL once, then (optionally) re-run the events SQL. No code changes needed.

### Step 1 — Run this in Supabase SQL Editor

Creates the `app_role` enum, `user_roles` table with RLS, and the `has_role` security-definer function. Safe to re-run.

```sql
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
```

### Step 2 — Grant yourself admin

Find your user id in Supabase → Authentication → Users, then run:

```sql
insert into public.user_roles (user_id, role)
values ('YOUR-AUTH-USER-UUID-HERE', 'admin')
on conflict (user_id, role) do nothing;
```

### Step 3 — Re-run `db/events.sql`

Now that `has_role` exists, the events table policies will create successfully. The script is idempotent — safe to re-run.

### Why not change the policy instead?

Your project already standardizes on `has_role` (used by `community_members`, `content_posts`, etc. via `db/admin_roles.sql`, and called from `src/routes/admin.tsx` via `supabase.rpc("has_role", ...)`). Inlining a different check in `events` would diverge from the rest of the schema. Creating the missing function keeps everything consistent.
