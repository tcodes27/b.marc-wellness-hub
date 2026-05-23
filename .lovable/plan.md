# Relational Upgrade: Content Studio ↔ Community Journeys

Non-destructive refinement of the existing admin. No table drops, no auth changes, no CMS rebuild, no data loss. Only additive schema + UI revisions.

## 1. Database — extend only (`db/journeys_content_link.sql`, new file)

Add to existing `public.content_posts`:
- `reusable_in_journeys boolean default false`
- `automation_enabled boolean default false`
- `campaign_type text check in ('broadcast','evergreen','automation','newsletter') default 'broadcast'`
- `send_behavior text check in ('manual','scheduled','trigger_based') default 'manual'`
- `linked_journeys uuid[] default '{}'` (denormalized cache for badges; source of truth = `journey_emails.content_post_id`)

Add to existing `public.journey_emails`:
- `content_post_id uuid references public.content_posts(id) on delete set null` (nullable — null = custom inline, set = reference)
- `override_subject text`
- `override_cta_label text`
- `override_cta_url text`
- `override_sms_text text`
- (existing `delay_days`/`delay_hours` already handle delay override)

New view `public.journey_email_resolved` — returns each step with effective subject/body/cta resolved from `content_posts` when `content_post_id` is set, else inline fields. Used by the dispatcher and admin preview.

New table `public.journey_step_sends` (delivery tracking placeholder):
- `id, journey_email_id, member_id, content_post_id (nullable), channel, status (queued/sent/failed/skipped), provider, error, sent_at, created_at`
- Extends existing `journey_email_sends` semantics — keep that table intact; new table only if needed for cross-source tracking. Otherwise add `content_post_id` column to `journey_email_sends` and stop.

Trigger: when `journey_emails.content_post_id` changes, refresh `content_posts.linked_journeys` cache.

RLS: reuse existing `has_role(auth.uid(),'admin')` policies — no changes to access model.

## 2. Journey step editor (`src/routes/admin.journeys.$id.tsx`)

Per-step "Content Source" toggle:
```
( ) Custom email          ( ) Use Content Studio post
```
- **Custom**: existing subject/body/cta/media editor (unchanged).
- **Reference**: searchable dropdown of `content_posts` where `reusable_in_journeys = true`. Shows resolved preview (read-only) + override fields: subject, CTA label/url, SMS text. Delay + channel + active stay as today.

Add per-step badge: "Linked: <post title>" with link to the post in Content Studio.

## 3. Content Studio post editor (`src/routes/admin.content.$id.tsx`)

New "Automation" panel:
- Toggle `reusable_in_journeys`
- Toggle `automation_enabled`
- Select `campaign_type` and `send_behavior`
- Read-only "Used in journeys" list (from `linked_journeys`) with deep links
- "Duplicate post" button (clone row, new slug)
- "Send Test" button (sends rendered email to admin's own address via the existing provider placeholder)

Post list (`admin.content.index.tsx`): add badges — "Automation", "Used in N journeys", "Reusable".

## 4. Dispatcher behavior (logic only — no provider swap)

Existing journey runner (wherever `journey_emails` get sent) reads from `journey_email_resolved` instead of `journey_emails` directly. Override fields win over post fields when present. Provider placeholders (Resend/SendGrid/Twilio) untouched — abstracted behind the same call site so swap is one-file later.

## 5. Out of scope

- No changes to `community_members`, RLS, admin auth, portal, shop, events, member tiers.
- No real provider integration (still placeholders).
- No new email template engine.
- Existing journey data and existing inline emails keep working unchanged (content_post_id stays null).

## Files

**New:**
- `db/journeys_content_link.sql` — migration above
- `src/components/admin/JourneyStepContentPicker.tsx` — dropdown + override fields
- `src/components/admin/ContentAutomationPanel.tsx` — automation toggles + used-in list

**Edited:**
- `src/routes/admin.journeys.$id.tsx` — Content Source toggle in step editor; resolved preview
- `src/routes/admin.content.$id.tsx` — automation panel, duplicate, send test
- `src/routes/admin.content.index.tsx` — badges
- `src/integrations/supabase/client.ts` — extend `ContentPost` type with new fields; add `JourneyEmail.content_post_id` + overrides
- Journey runner / send helper — switch reads to `journey_email_resolved`

## User action after merge

Run `db/journeys_content_link.sql` in Supabase SQL Editor. Existing journeys and posts continue working immediately; new linking is opt-in per step.
