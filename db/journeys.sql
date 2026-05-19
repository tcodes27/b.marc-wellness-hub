-- =========================================================
-- B.MARC — Community Journeys (CRM automation)
-- Run in Supabase Dashboard → SQL Editor.
-- Safe to re-run (idempotent).
-- Requires: db/admin_roles.sql (public.has_role + community_members table)
-- =========================================================

-- ---------- journeys ----------
create table if not exists public.journeys (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text,
  status              text not null default 'draft'
                        check (status in ('draft','active','paused','archived')),
  trigger_type        text not null default 'manual'
                        check (trigger_type in (
                          'community_signup','portal_signup','delay_after_join',
                          'event_registration','manual','tag_added','birthday_month'
                        )),
  trigger_config      jsonb not null default '{}'::jsonb,
  audience_tags       text[] not null default '{}',
  audience_interests  text[] not null default '{}',
  from_name           text,
  from_email          text,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists journeys_status_idx  on public.journeys (status);
create index if not exists journeys_trigger_idx on public.journeys (trigger_type);

-- ---------- journey_emails (sequence steps) ----------
create table if not exists public.journey_emails (
  id                  uuid primary key default gen_random_uuid(),
  journey_id          uuid not null references public.journeys(id) on delete cascade,
  position            integer not null default 1,
  channel             text not null default 'email'
                        check (channel in ('email','sms')),
  delay_days          integer not null default 0,
  delay_hours         integer not null default 0,
  subject             text,
  preview_text        text,
  body_markdown       text,
  body_html           text,
  featured_image_url  text,
  attachments         jsonb not null default '[]'::jsonb,
  cta_label           text,
  cta_url             text,
  signature_html      text,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists journey_emails_journey_idx
  on public.journey_emails (journey_id, position);

-- ---------- journey_enrollments ----------
create table if not exists public.journey_enrollments (
  id                  uuid primary key default gen_random_uuid(),
  journey_id          uuid not null references public.journeys(id) on delete cascade,
  member_id           uuid not null references public.community_members(id) on delete cascade,
  status              text not null default 'active'
                        check (status in ('active','paused','completed','unsubscribed','failed')),
  current_step        integer not null default 0,
  next_send_at        timestamptz,
  enrolled_at         timestamptz not null default now(),
  completed_at        timestamptz,
  manual              boolean not null default false,
  source              text,
  unique (journey_id, member_id)
);

create index if not exists journey_enrollments_next_send_idx
  on public.journey_enrollments (next_send_at) where status = 'active';

-- ---------- journey_email_sends (delivery log) ----------
create table if not exists public.journey_email_sends (
  id                    uuid primary key default gen_random_uuid(),
  enrollment_id         uuid not null references public.journey_enrollments(id) on delete cascade,
  journey_email_id      uuid not null references public.journey_emails(id) on delete cascade,
  member_id             uuid not null references public.community_members(id) on delete cascade,
  scheduled_at          timestamptz not null default now(),
  sent_at               timestamptz,
  status                text not null default 'queued'
                          check (status in ('queued','sending','sent','failed','skipped','suppressed')),
  provider              text,
  provider_message_id   text,
  error_message         text,
  attempts              integer not null default 0,
  opened_at             timestamptz,
  clicked_at            timestamptz,
  unsubscribed_at       timestamptz,
  created_at            timestamptz not null default now()
);

create index if not exists journey_email_sends_status_idx
  on public.journey_email_sends (status, scheduled_at);

-- ---------- email_templates (reusable blocks) ----------
create table if not exists public.email_templates (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text,
  subject         text,
  body_markdown   text,
  body_html       text,
  thumbnail_url   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function public.journeys_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists journeys_updated_at on public.journeys;
create trigger journeys_updated_at before update on public.journeys
  for each row execute function public.journeys_set_updated_at();

drop trigger if exists journey_emails_updated_at on public.journey_emails;
create trigger journey_emails_updated_at before update on public.journey_emails
  for each row execute function public.journeys_set_updated_at();

drop trigger if exists email_templates_updated_at on public.email_templates;
create trigger email_templates_updated_at before update on public.email_templates
  for each row execute function public.journeys_set_updated_at();

-- ---------- RLS: admin-only ----------
alter table public.journeys              enable row level security;
alter table public.journey_emails        enable row level security;
alter table public.journey_enrollments   enable row level security;
alter table public.journey_email_sends   enable row level security;
alter table public.email_templates       enable row level security;

drop policy if exists "Admins full access" on public.journeys;
create policy "Admins full access" on public.journeys for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

drop policy if exists "Admins full access" on public.journey_emails;
create policy "Admins full access" on public.journey_emails for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

drop policy if exists "Admins full access" on public.journey_enrollments;
create policy "Admins full access" on public.journey_enrollments for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

drop policy if exists "Admins full access" on public.journey_email_sends;
create policy "Admins full access" on public.journey_email_sends for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

drop policy if exists "Admins full access" on public.email_templates;
create policy "Admins full access" on public.email_templates for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- Seed: Founding Member Welcome Journey (idempotent)
-- =========================================================
do $seed$
declare j_id uuid;
begin
  select id into j_id from public.journeys
   where title = 'Founding Member Welcome Journey' limit 1;

  if j_id is null then
    insert into public.journeys (title, description, status, trigger_type, from_name)
    values (
      'Founding Member Welcome Journey',
      'Default 3-email onboarding flow for new community signups. Warm, editorial, founder-led.',
      'draft',
      'community_signup',
      'Erra — B.MARC'
    )
    returning id into j_id;
  end if;

  -- Only seed emails if none exist for this journey
  if not exists (select 1 from public.journey_emails where journey_id = j_id) then
    insert into public.journey_emails
      (journey_id, position, delay_days, delay_hours, subject, preview_text, body_markdown, cta_label, cta_url)
    values
    (j_id, 1, 0, 0,
      'Welcome to the B.MARC Community',
      'A personal note from Erra — and an invitation into something more.',
$$Hi {{first_name}},

I'm so glad you're here.

B.MARC began as a vision — to build a space where movement, wellness, and intentional living come together for the modern woman. Pilates is the foundation, but the community is the heart.

You're now part of an inner circle of women who care about strength, softness, accountability, and showing up for themselves. Thank you for stepping in.

Over the coming days I'll share more about what this community offers — wellness rituals, mental health resources, events, and a portal built just for you.

With warmth,
Erra$$,
      'Explore the Portal', '/portal'),

    (j_id, 2, 2, 0,
      'More Than Movement',
      'Why B.MARC is more than Pilates — and a small gift for you.',
$$Hi {{first_name}},

B.MARC is more than Pilates. It's a quiet rebellion against burnout — a place to balance ambition with softness, discipline with rest, career with wellbeing.

Our community shows up for each other in mindset, nutrition, mental health, and the aesthetics of an intentional life. Whether you're easing into a new chapter or doubling down on the one you're in, you belong here.

I put together a short wellness guide as a thank you for joining. You can find it inside the portal.

Take care of yourself this week,
Erra$$,
      'Open My Wellness Guide', '/portal/content'),

    (j_id, 3, 5, 0,
      'Your Wellness Ritual Starts Here',
      'Three small ways to step deeper into the community this week.',
$$Hi {{first_name}},

A ritual is just a small thing, repeated with intention. Here are three ways to begin yours with B.MARC:

1. Explore the portal — your library of practices, classes, and resources.
2. Save a seat at one of our upcoming events.
3. Watch this week's class on the B.MARC YouTube channel.

I can't wait to see you move with us.

With love,
Erra$$,
      'See Upcoming Events', '/events');
  end if;
end
$seed$;
