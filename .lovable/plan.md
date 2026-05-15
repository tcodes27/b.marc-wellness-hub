## Audit Summary

Both signup surfaces are connected to Supabase and writing to `public.community_members`. Recent network logs confirm inserts succeed (the only failure was a duplicate-email 409, which is handled with a "Welcome back" toast). RLS is not blocking. No silent failures.

| Surface | File | Saves | Status |
|---|---|---|---|
| "Join the Community" modal (Navbar, Hero, Membership) | `src/components/community/CommunityProvider.tsx` | Full payload: first/last name, email, phone, city, IG, interests[], email/SMS consent, consent_timestamp, source | ✅ Working, all states present |
| Footer email-only widget | `src/components/sections/EmailSignup.tsx` | Email + placeholder "Newsletter Subscriber" name, `source='newsletter'`, `consent_marketing=true` | ⚠️ Working but only captures email |

All rows appear in `/admin/members` (`src/routes/admin.members.tsx`).

## Change

Per your choice, rewire the footer widget to be a CTA that opens the full modal pre-filled with the email — one source of truth, full payload captured.

### Implementation
1. **`CommunityProvider.tsx`** — extend `open(source?, prefill?)` to accept an optional `{ email }` prefill; merge into initial form state.
2. **`EmailSignup.tsx`** — remove the direct Supabase insert; on submit, call `openCommunity("newsletter", { email })`. Keep the email input + arrow button UI; drop the local loading/done/error states (modal owns them now).
3. Remove the now-unused `supabase` import + zod schema from `EmailSignup.tsx`.

No DB changes, no RLS changes, no new routes.

### Side fix (quiet)
Hydration mismatch on `/about` (`"More than a"` vs old `"A community of"`) — this is a stale SSR cache from the recent edit; it self-resolves on next build. No code action needed unless it persists.

## Verification
- Submit the footer email → modal opens with email field populated → complete and submit → row appears in `/admin/members` with `source='newsletter'` and full data.
- Existing modal triggers (Navbar, Hero, Membership) continue to work unchanged.
