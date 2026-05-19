# Community Journeys — Build Plan

A new admin-only automation system at `/admin/journeys` for building onboarding sequences, nurture campaigns, and wellness flows for B.MARC community members. Modeled on ConvertKit / Flodesk / Kajabi, styled to match the existing luxury editorial admin aesthetic.

This is large — I'll deliver it in **3 phases** so you can review and steer between each. All phases are additive; nothing existing breaks.

---

## Phase 1 — Foundation (DB + Admin shell + Journey CRUD)

**Database (new tables, idempotent SQL in `db/journeys.sql`):**
- `journeys` — id, title, description, status (draft/active/paused), trigger_type, trigger_config (jsonb), audience_tags (text[]), audience_interests (text[]), created_at/updated_at, created_by
- `journey_emails` — id, journey_id, position (int), delay_days, delay_hours, subject, preview_text, body_json (Tiptap), body_html (rendered), featured_image_url, attachments (jsonb), cta_label, cta_url, signature_html, active
- `journey_enrollments` — id, journey_id, member_id, status (active/paused/completed/unsubscribed), enrolled_at, current_step, next_send_at, completed_at, manual (bool), source
- `journey_email_sends` — id, enrollment_id, journey_email_id, member_id, scheduled_at, sent_at, status (queued/sent/failed/skipped), provider_message_id, error, opened_at, clicked_at
- `email_templates` — id, name, category, body_json, body_html, thumbnail_url (reusable blocks/full templates)
- RLS: admin-only via existing `has_role('admin')`
- Trigger types stored as enum-like text: `community_signup`, `portal_signup`, `delay_after_join`, `event_registration`, `manual`, `tag_added`, `birthday_month`

**Admin shell:**
- New sidebar tab "Community Journeys" → `/admin/journeys` (icon: `Workflow` from lucide)
- Index route: list of journeys (cards/table), status badges, enrollment count, "New Journey" button, duplicate/pause/delete actions
- Detail route: `/admin/journeys/$id` — journey settings (title, description, trigger, audience, active toggle) + email sequence list

---

## Phase 2 — Email Sequence Builder + Default Welcome Journey

**Sequence builder (inside journey detail):**
- Ordered list of emails with drag-to-reorder (simple up/down buttons; no heavy DnD lib)
- Each email editor modal:
  - Subject + preview text
  - Delay (days/hours from previous step or from enrollment)
  - Rich text editor (reuse existing `RichEditor.tsx`)
  - Featured image upload (Supabase storage `content-media` bucket — reuse existing)
  - PDF attachment upload
  - CTA label + URL
  - Signature block (HTML)
  - Personalization tokens: `{{first_name}}`, `{{email}}`, `{{city}}`, `{{interests}}` (insert buttons + render preview)
- Preview pane: ivory bg, serif headings, warm-brown accents — matches B.MARC editorial style
- "Send test email to…" button

**Default seeded journey:**
- `db/journeys.sql` includes an idempotent seed for "Founding Member Welcome Journey" with the 3 emails you specified (Welcome / More Than Movement / Your Wellness Ritual Starts Here), full copy, day-0/day-2/day-5 timing
- Trigger: `community_signup`, active=false by default (so you can review before enabling)

---

## Phase 3 — Delivery System + Enrollment + Analytics

**Enrollment:**
- Hook into `CommunityProvider` signup success: server fn `enrollMemberInJourneys` finds all active journeys with matching trigger + audience, creates `journey_enrollments` rows with `next_send_at` computed
- Same for portal signup
- Admin can manually enroll a member from `/admin/members` (new action) or from the journey detail page (multi-select members)

**Delivery (queue-based, retry-safe):**
- Architecture supports Resend / SendGrid / Lovable Email (provider abstracted behind `sendEmail(provider, payload)`)
- Default provider: **Lovable Emails** (built-in, no API key) — recommend enabling Lovable Cloud email infra
- Server fn `processJourneyQueue` selects due `journey_email_sends`, renders HTML with member personalization, calls provider, logs result, schedules next step
- Cron via pg_cron (every 5 min) — or manual "Run queue now" button in admin until cron is wired
- Retry: failed sends retried up to 3x with exponential backoff
- Unsubscribe: token-based per-member; sets enrollment status to `unsubscribed` and adds to suppression
- Open/click tracking: tracking pixel + redirect endpoint at `/api/public/journey-track`

**Twilio/SMS:** schema includes `channel` column (`email`|`sms`) on `journey_emails` set to `email` for now — not wired, just future-ready

**Admin features:**
- Duplicate / pause / activate journeys
- Manual enroll members
- Preview email (rendered with sample data)
- Send test email
- Reorder sequence
- Enrollment list per journey with status
- Delivery log table (latest 100 sends per journey)

---

## Technical Details

- **Stack:** TanStack Start server functions (`createServerFn` + `requireSupabaseAuth`), Supabase RLS, existing `RichEditor`, existing storage buckets
- **Email provider:** Lovable Emails by default (will require enabling Lovable Cloud email domain — I'll prompt you when we get to Phase 3 if not set up). Resend/SendGrid pluggable.
- **Routes added:** `/admin/journeys`, `/admin/journeys/$id`, `/api/public/journey-track`, `/api/public/journey-unsubscribe`
- **Files added (~):** `db/journeys.sql`, `src/routes/admin.journeys.tsx`, `src/routes/admin.journeys.$id.tsx`, `src/lib/journeys.functions.ts`, `src/lib/journey-delivery.server.ts`, `src/components/admin/JourneyEmailEditor.tsx`, `src/components/admin/JourneyTriggerPicker.tsx`
- **Files touched:** `src/routes/admin.tsx` (sidebar nav), `src/components/community/CommunityProvider.tsx` (enrollment hook on signup), `src/routes/portal_.signup.tsx` (portal-signup enrollment hook)
- **Untouched:** Content Studio, portal auth, community signup UI, YouTube, Cal.com, existing CRM

---

## What I need from you before starting

1. **Email provider preference** — Lovable Emails (recommended, zero config), Resend, or SendGrid? If unsure, I'll go Lovable Emails.
2. **Phasing** — ship all 3 phases in one go, or stop after Phase 1 / Phase 2 for review?
3. **Default welcome journey** — should it be **active by default** after install, or **draft** so you can review the copy first? (I lean draft.)

Reply with answers (or "go ahead, all 3 phases, Lovable Emails, draft" works) and I'll start building.
