-- =========================================================
-- B.MARC Pilates — events table
-- Run in Supabase Dashboard → SQL Editor.
-- Safe to re-run.
-- =========================================================

create table if not exists public.events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  event_type      text,
  date            date,
  start_time      time,
  end_time        time,
  location        text,
  price           numeric(10,2),
  capacity        integer,
  booking_url     text,
  cal_event_id    text,
  cal_booking_url text,
  sync_status     text not null default 'pending'
                    check (sync_status in ('pending','synced','failed','manual')),
  sync_error      text,
  status          text not null default 'Draft'
                    check (status in ('Draft','Published','Archived')),
  tags            text[] not null default '{}',
  admin_notes     text,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists events_date_idx   on public.events (date);
create index if not exists events_status_idx on public.events (status);

-- updated_at trigger
create or replace function public.events_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
before update on public.events
for each row execute function public.events_set_updated_at();

-- RLS: admins full access; published events readable publicly
alter table public.events enable row level security;

drop policy if exists "Admins full access" on public.events;
create policy "Admins full access" on public.events
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events" on public.events
  for select to anon, authenticated
  using (status = 'Published');
