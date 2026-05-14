-- =========================================================
-- B.MARC Content Distribution System
-- Run this in your Supabase Dashboard → SQL Editor.
-- Idempotent: safe to run multiple times.
-- =========================================================

-- 1. community_members: consent + opt-out fields
alter table public.community_members
  add column if not exists email_consent boolean not null default false,
  add column if not exists sms_consent boolean not null default false,
  add column if not exists sms_opted_out boolean not null default false,
  add column if not exists opted_out_at timestamptz,
  add column if not exists consent_timestamp timestamptz;

-- backfill: existing consent_marketing rows are treated as email consent
update public.community_members
   set email_consent = true,
       consent_timestamp = coalesce(consent_timestamp, created_at)
 where consent_marketing = true and email_consent = false;

-- 2. content_posts: distribution + media + send tracking
alter table public.content_posts
  add column if not exists audience_tags text[] not null default '{}',
  add column if not exists delivery_channels text[] not null default '{}',
  add column if not exists email_subject text,
  add column if not exists sms_text text,
  add column if not exists media_images text[] not null default '{}',
  add column if not exists media_videos text[] not null default '{}',
  add column if not exists media_audio  text[] not null default '{}',
  add column if not exists cta_label text,
  add column if not exists cta_url   text,
  add column if not exists send_status text not null default 'draft',
  add column if not exists sent_at timestamptz;

-- 3. content_deliveries
create table if not exists public.content_deliveries (
  id uuid primary key default gen_random_uuid(),
  content_post_id uuid not null references public.content_posts(id) on delete cascade,
  member_id uuid references public.community_members(id) on delete set null,
  delivery_channel text not null check (delivery_channel in ('email','sms')),
  recipient_email text,
  recipient_phone text,
  status text not null default 'queued' check (status in ('queued','sent','failed','skipped')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists content_deliveries_post_idx
  on public.content_deliveries (content_post_id);
create index if not exists content_deliveries_member_idx
  on public.content_deliveries (member_id);

alter table public.content_deliveries enable row level security;
drop policy if exists "Admins full access" on public.content_deliveries;
create policy "Admins full access" on public.content_deliveries
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 4. Storage buckets for media uploads
insert into storage.buckets (id, name, public)
values ('content-images', 'content-images', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
values ('content-videos', 'content-videos', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
values ('content-audio',  'content-audio',  true)
on conflict (id) do nothing;

-- public read, authenticated write for each
do $$
declare b text;
begin
  foreach b in array array['content-images','content-videos','content-audio'] loop
    execute format($f$drop policy if exists "%s public read" on storage.objects;$f$, b);
    execute format($f$create policy "%s public read" on storage.objects
      for select using (bucket_id = %L);$f$, b, b);

    execute format($f$drop policy if exists "%s admin write" on storage.objects;$f$, b);
    execute format($f$create policy "%s admin write" on storage.objects
      for insert to authenticated
      with check (bucket_id = %L and public.has_role(auth.uid(), 'admin'));$f$, b, b);

    execute format($f$drop policy if exists "%s admin update" on storage.objects;$f$, b);
    execute format($f$create policy "%s admin update" on storage.objects
      for update to authenticated
      using (bucket_id = %L and public.has_role(auth.uid(), 'admin'));$f$, b, b);

    execute format($f$drop policy if exists "%s admin delete" on storage.objects;$f$, b);
    execute format($f$create policy "%s admin delete" on storage.objects
      for delete to authenticated
      using (bucket_id = %L and public.has_role(auth.uid(), 'admin'));$f$, b, b);
  end loop;
end $$;
