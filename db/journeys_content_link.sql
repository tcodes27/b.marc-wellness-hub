-- =========================================================
-- B.MARC — Content Studio ↔ Community Journeys link
-- Additive, non-destructive. Safe to re-run.
-- Run in Supabase Dashboard → SQL Editor.
-- Requires: db/journeys.sql + db/content_distribution.sql
-- =========================================================

-- 1) Content Studio: automation / reuse metadata ----------
alter table public.content_posts
  add column if not exists reusable_in_journeys boolean not null default false,
  add column if not exists automation_enabled   boolean not null default false,
  add column if not exists campaign_type        text    not null default 'broadcast'
    check (campaign_type in ('broadcast','evergreen','automation','newsletter')),
  add column if not exists send_behavior        text    not null default 'manual'
    check (send_behavior in ('manual','scheduled','trigger_based')),
  add column if not exists linked_journeys      uuid[]  not null default '{}';

create index if not exists content_posts_reusable_idx
  on public.content_posts (reusable_in_journeys) where reusable_in_journeys = true;

-- 2) Journey steps: optional reference + per-step overrides
alter table public.journey_emails
  add column if not exists content_post_id    uuid references public.content_posts(id) on delete set null,
  add column if not exists override_subject   text,
  add column if not exists override_cta_label text,
  add column if not exists override_cta_url   text,
  add column if not exists override_sms_text  text;

create index if not exists journey_emails_content_post_idx
  on public.journey_emails (content_post_id) where content_post_id is not null;

-- 3) Delivery log: optional content_post reference for cross-source tracking
alter table public.journey_email_sends
  add column if not exists content_post_id uuid references public.content_posts(id) on delete set null;

-- 4) Resolved view: effective subject/body/cta per step ----
create or replace view public.journey_email_resolved as
select
  je.id,
  je.journey_id,
  je.position,
  je.channel,
  je.delay_days,
  je.delay_hours,
  je.active,
  je.content_post_id,
  coalesce(je.override_subject,   cp.email_subject, je.subject)             as effective_subject,
  coalesce(je.preview_text, null)                                           as effective_preview,
  coalesce(je.body_markdown, null)                                          as effective_body_markdown,
  coalesce(je.override_cta_label, cp.cta_label, je.cta_label)               as effective_cta_label,
  coalesce(je.override_cta_url,   cp.cta_url,   je.cta_url)                 as effective_cta_url,
  coalesce(je.override_sms_text,  cp.sms_text)                              as effective_sms_text,
  coalesce(je.featured_image_url, cp.featured_image_url)                    as effective_featured_image,
  cp.id    as resolved_post_id,
  cp.title as resolved_post_title,
  cp.slug  as resolved_post_slug
from public.journey_emails je
left join public.content_posts cp on cp.id = je.content_post_id;

-- 5) Trigger: keep content_posts.linked_journeys cache in sync
create or replace function public.sync_content_post_linked_journeys()
returns trigger language plpgsql as $$
declare
  affected uuid[];
begin
  affected := array_remove(array[
    case when tg_op = 'DELETE' then old.content_post_id else new.content_post_id end,
    case when tg_op = 'UPDATE' then old.content_post_id else null end
  ], null);

  if array_length(affected, 1) is not null then
    update public.content_posts cp
       set linked_journeys = coalesce(
         (select array_agg(distinct je.journey_id)
            from public.journey_emails je
           where je.content_post_id = cp.id),
         '{}'::uuid[]
       )
     where cp.id = any(affected);
  end if;

  return coalesce(new, old);
end $$;

drop trigger if exists journey_emails_sync_linked on public.journey_emails;
create trigger journey_emails_sync_linked
  after insert or update of content_post_id or delete on public.journey_emails
  for each row execute function public.sync_content_post_linked_journeys();

-- backfill cache once
update public.content_posts cp
   set linked_journeys = coalesce(
     (select array_agg(distinct je.journey_id)
        from public.journey_emails je
       where je.content_post_id = cp.id),
     '{}'::uuid[]
   );

-- 6) Grant view read to existing roles (RLS on base tables still applies)
grant select on public.journey_email_resolved to authenticated, anon;
