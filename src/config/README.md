# Luxury Wellness Platform — Template Configuration

This project is a **white-label luxury wellness CRM + membership + events platform**.
The B.MARC Pilates content shipped in `branding.ts` is a reference implementation —
swap it out per client.

Suitable verticals: Pilates / yoga studios, wellness brands, fitness communities,
beauty + lifestyle brands, coaches & creators, med spas, luxury service businesses.

## Rebrand checklist (≈ 30 minutes)

1. **Branding** — edit `src/config/branding.ts`
   - `name`, `fullName`, `tagline`, `vertical`, `ethos`
   - `contact` (email, phone, location)
   - `socials[]` (icon must be one of: `instagram`, `tiktok`, `facebook`,
     `youtube`, `linkedin`, `x`, `mail`)
   - `nav[]` — primary site navigation
   - `cta` — button labels (Join the Community, Start Your Journey…)
   - `terminology` — swap "Member" → "Patient" / "Client", "Event" → "Retreat", etc.
   - `hero`, `about`, `membership`, `newsletter`, `footer` — section copy
   - `seo` — default title / description / twitter handle

2. **Integrations** — edit `src/config/integrations.ts`
   - Toggle features on/off (`stripe`, `youtube`, `instagram`, `twilio`, `email`)
   - Set `youtube.channelId`, `instagram.handle`, `email.provider`
   - Add corresponding **runtime secrets** in Project Settings → Secrets
     (e.g. `INSTAGRAM_ACCESS_TOKEN`, `STRIPE_SECRET_KEY`, `TWILIO_AUTH_TOKEN`,
     `RESEND_API_KEY`).
   - The UI hides a feature when EITHER the config flag is `false` OR the
     required secret is missing (see `src/lib/integrations.functions.ts`).

3. **Design tokens** — edit `src/styles.css`
   - All colors live as OKLCH semantic tokens (`--background`, `--primary`,
     `--espresso`, `--ivory`, `--tan`, `--clay`, etc.)
   - Type pairing (display + body fonts) is set here too.
   - **Never hardcode hex/rgb in components** — always use the tokens.

4. **Assets** — replace files in `src/assets/` keeping the same filenames
   (`hero.jpg`, `about.jpg`, `membership.jpg`, `gallery-*.jpg`).
   Keep aspect ratios close to the originals to preserve layout.

5. **Database** — re-apply migrations under `db/`:
   - `admin_roles.sql` — RBAC + `has_role()` security definer function
   - `content_distribution.sql` — Content Studio + audience tags + deliveries
   - `events.sql` — Events table + booking_clicks analytics

6. **First admin** — sign up via `/admin/login`, then run in SQL editor:
   ```sql
   insert into public.user_roles (user_id, role)
   values ('<your-auth-user-id>', 'admin');
   ```

## Architecture

```
src/
  config/
    branding.ts        ← single source of truth for copy, colors, links
    integrations.ts    ← per-client feature flags
  components/
    Navbar.tsx         ┐  consume `branding.*`
    Footer.tsx         ┤  no hardcoded brand strings
    sections/Hero.tsx  ┘
    admin/             ← reusable CRM components
    community/         ← join-flow modal
    booking/           ← Cal.com provider
  routes/
    index.tsx          ← homepage (composed of /sections)
    about, events, membership
    admin.*            ← gated by `requireAdmin` server middleware
    api/public/        ← webhooks (e.g. Twilio inbound SMS)
  lib/
    *.functions.ts     ← TanStack server functions (RPC)
    audience-tags.ts   ← configurable audience targeting
    recipients.ts      ← resolves audience → email/SMS recipients
  integrations/
    supabase/          ← browser + server + admin clients
```

## CRM extensibility

- **Tags / audiences** — edit `src/lib/audience-tags.ts` (`AUDIENCE_TAGS`,
  `STATUS_TAGS`, `INTEREST_TAG_MAP`). The Content Studio composer reads from
  this list and the recipient resolver matches against it.
- **Membership tiers** — currently free-form on `community_members.status`.
  For per-client tiers, extend that column's allowed values + UI dropdown.
- **Event categories** — see `db/events.sql`. Add a `category` column +
  enum if a client needs them.

## Deployment

1. Connect the project repo to Lovable or your edge host of choice
   (template targets Cloudflare Workers via `wrangler.jsonc`).
2. Add runtime secrets per the integrations checklist above.
3. Apply DB migrations.
4. Publish.

## Files still containing the legacy "B.MARC" reference

The marketing-critical surfaces are fully config-driven. A handful of admin
labels, demo copy and seed data still mention B.MARC by name — these are
safe to leave for quick demos and easy to find with:

```bash
rg "B\.MARC|bmarcpilates" src/
```

When prepping a real client launch, do a final sweep with that command.
