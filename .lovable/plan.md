## B.MARC Content Studio → Targeted Distribution System

Backend-only upgrade. No live email/SMS sends until integrations are configured. Build the data model, admin UI, media uploads, audience targeting, recipient estimation, previews, and consent capture — all wired through Supabase.

---

### 1. Database migrations

**Extend `community_members`:**
- `email_consent boolean default false`
- `sms_consent boolean default false`
- `sms_opted_out boolean default false`
- `opted_out_at timestamptz`
- `consent_timestamp timestamptz`

Backfill: set `email_consent = consent_marketing` for existing rows.

**Extend `content_posts`:**
- `audience_tags text[] default '{}'` (replaces single `audience` for targeting; keep `audience` for back-compat)
- `delivery_channels text[] default '{}'` — values: `email`, `sms`
- `email_subject text`
- `sms_text text` (max 320 chars enforced client-side)
- `media_images text[] default '{}'`
- `media_videos text[] default '{}'`
- `media_audio text[] default '{}'`
- `cta_label text`
- `cta_url text`
- `send_status text default 'draft'` — `draft | scheduled | sending | sent | failed`
- `sent_at timestamptz`

**New table `content_deliveries`:**
```
id uuid pk, content_post_id uuid fk, member_id uuid fk,
delivery_channel text ('email'|'sms'),
recipient_email text, recipient_phone text,
status text ('queued'|'sent'|'failed'|'skipped'),
error_message text, sent_at timestamptz, created_at timestamptz default now()
```
RLS: admin-only read/write (uses existing `has_role` helper / admin pattern).

**Storage buckets** (public read):
- `content-images`, `content-videos`, `content-audio`
- RLS: authenticated insert; public select.

---

### 2. Audience tags (canonical list)

Defined as a const in `src/lib/audience-tags.ts`:
```
All Members, Pilates Events, Wellness Community, Online Classes,
Beginner Pilates, Brand Updates, Sponsorship/Collaboration,
VIP Members, Event Attendees, Sponsor Leads
```
Map "All Members" → no filter. Map VIP Members / Event Attendees / Sponsor Leads → match against `status` column. The rest match against `interests` array.

Helper `getMatchingMembers(tags, channel)` returns members where:
- audience tags match (interest OR status)
- if `channel === 'email'`: `email_consent = true`
- if `channel === 'sms'`: `phone IS NOT NULL AND sms_consent = true AND sms_opted_out = false`

---

### 3. Community signup form

Update `CommunityProvider` (or wherever the join form lives) to add two separate checkboxes (Email + SMS consent) with the exact copy from the brief. On submit, write `email_consent`, `sms_consent`, `consent_timestamp = now()`.

---

### 4. Media upload helpers

Extend `src/lib/content-uploads.ts` with `uploadVideo()`, `uploadAudio()` for the new buckets. Accept multiple file selection. Validate MIME types: jpg/png/webp; mp4/mov; mp3/wav/m4a.

---

### 5. Content editor (`src/routes/admin.content.$id.tsx`)

New form sections:
- **Basics**: title, subtitle, content type
- **Body**: existing rich editor
- **Media**: featured image (existing) + galleries for images/videos/audio (chips with remove)
- **Call to action**: cta_label + cta_url
- **Audience targeting**: multi-select chips for audience_tags + live recipient count (email + SMS breakdown)
- **Delivery**: checkboxes for Email / SMS, conditional `email_subject` and `sms_text` fields with previews
- **Send actions**: 4 disabled buttons (Send Email / Send SMS / Send Both / Save Draft) — Save always enabled. Tooltip explains why send is disabled (integration not configured).

Recipient count: query `community_members` filtered by tags+channel on every audience/channel change (debounced).

---

### 6. Settings tab additions

Add integration status checks for:
- `RESEND_API_KEY` (or `SENDGRID_API_KEY`)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `TWILIO_MESSAGING_SERVICE_SID`

Use a server function `getIntegrationStatus()` that returns booleans (never the values). Show ✓/⚠ in `/admin/settings`.

---

### 7. Future-ready opt-out structure

Add a placeholder server route `src/routes/api/public/twilio-sms-webhook.ts` that:
- Validates Twilio signature (skipped if secret missing → 503)
- Parses `From` and `Body`; if body is `STOP`/`UNSUBSCRIBE`, sets `sms_opted_out = true`, `opted_out_at = now()` for matching member
- Otherwise returns empty TwiML

Not wired to Twilio until user configures it.

---

### Out of scope (per brief)
- No live email/SMS dispatching code
- No public exposure of drafts
- No automatic broadcasts

---

### Files touched
- migrations: schema + storage buckets
- `src/lib/audience-tags.ts` (new)
- `src/lib/content-uploads.ts` (extend)
- `src/lib/recipients.ts` (new — matching logic)
- `src/components/community/CommunityProvider.tsx` (consent checkboxes)
- `src/routes/admin.content.$id.tsx` (editor rebuild)
- `src/routes/admin.content.tsx` (show audience_tags + send_status badges)
- `src/routes/admin.settings.tsx` (integration status rows)
- `src/integrations/supabase/client.ts` (extend ContentPost + CommunityMember types, add `AUDIENCE_TAGS`)
- `src/routes/api/public/twilio-sms-webhook.ts` (new, stub)
