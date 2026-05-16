## Goal

Take B.MARC from "admin-only CRM" to "real-customer-ready platform" with a member portal, demo-data isolation, a self-serve admin testing checklist, and an audit pass on async/RLS/route protection.

---

## 1. Database (one migration via SQL editor)

New file: `db/portal_and_testing.sql` (you run it in Supabase SQL editor, same as `admin_roles.sql`).

- `public.account_type` enum: `demo | customer | admin | member`
- `public.profiles` table — 1:1 with `auth.users`
  - `id uuid PK references auth.users on delete cascade`
  - `email text`, `full_name text`, `phone text`, `avatar_url text`
  - `account_type public.account_type not null default 'customer'`
  - `is_test_account boolean not null default false`
  - `community_status text` (mirrors `community_members.status` when linked)
  - `created_at`, `updated_at`
  - Trigger: auto-insert profile on `auth.users` signup; mark `is_test_account=true` if email matches `*+test@*` or `demo@*`
- `public.event_registrations` table
  - `id`, `user_id`, `event_id`, `status` (`registered|attended|cancelled`), `is_test_account`, `created_at`
- Add `is_test_account boolean default false` to `community_members`, `events`, `content_posts`
- RLS:
  - `profiles`: user can `select/update` own row; admin full access via `has_role`
  - `event_registrations`: user can `select/insert` own rows; admin full access
  - `content_posts`: add policy `to authenticated using (true)` for member-visible posts (a `visibility` column: `public | members | admin`)

## 2. Auth

- Google OAuth via Lovable broker (`supabase--configure_social_auth`) + email/password
- New helper `src/integrations/supabase/portal-auth.ts` — `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `getProfile`, `updateProfile`
- `attachSupabaseAuth` middleware: verify it's registered in `src/start.ts` (add if missing)
- New `_portal` pathless layout route gating `/portal/*` (redirect to `/portal/login` if no session)

## 3. Portal routes (`src/routes/`)

- `portal.tsx` — pathless layout shell, sidebar (Profile, Events, Content, Logout)
- `_portal.portal.index.tsx` → `/portal` dashboard: greeting, status badges, quick links
- `_portal.portal.profile.tsx` → edit full_name, phone, avatar
- `_portal.portal.events.tsx` → list user's `event_registrations`
- `_portal.portal.content.tsx` → member-visible `content_posts`
- `portal_.login.tsx` → email/pw + Google button
- `portal_.signup.tsx` → email/pw + Google button (auto-creates profile via trigger)

All forms: zod validation, loading state on submit button, sonner toasts on success/error, empty/error states on lists.

## 4. Admin updates

- `/admin/testing` (new route `admin.testing.tsx`) — interactive checklist:
  - 12 checkboxes matching your spec (public signup, member signup, member login, profile update, admin visibility, content publish→portal visibility, event create→registration, logout/login persistence, Supabase read/write ping)
  - Each row has a "Run check" button that does a live probe (e.g. read/write a `_diagnostics` row, fetch current session, fetch profile) and shows ✅/❌ with the actual error
  - Checklist state persisted in `localStorage` per admin
- Add **demo-data filter** to `/admin/members`, `/admin/events`, `/admin/content`, `/admin/leads`: segmented control `All | Real | Demo` filtering on `is_test_account`
- New `/admin/members` columns: `account_type` badge, `is_test_account` badge
- "Seed demo data" button in `/admin/testing` → inserts 1 demo member, 1 demo event, 1 demo content post, 1 demo registration (all flagged)
- "Clear demo data" button → deletes everything where `is_test_account = true`

## 5. Async / UX audit

Pass over: `admin.members`, `admin.events`, `admin.content`, `admin.leads`, `Hero` signup, `EmailSignup`, `CommunityFeed`.

For each: skeleton loaders (using existing `Skeleton`), empty states, error states with retry button, disabled buttons while pending, toast confirmation, zod-validated forms.

## 6. Security

- Confirm RLS on every new table
- `/admin/*` already gated by `has_role('admin')` ✅ — verify still works
- `/portal/*` gated by `_portal` layout `beforeLoad` → session check via `supabase.auth.getUser()`
- Customers cannot reach `/admin` (RPC returns false → "Not authorized" screen, already exists)
- Public visitors only see public marketing routes

## 7. Deliverables to you after build

1. **Run `db/portal_and_testing.sql`** in Supabase SQL editor
2. **Enable Google provider** — I'll trigger `configure_social_auth`; you confirm in Lovable Cloud → Users
3. Visit `/admin/testing` → click "Seed demo data" → walk through checklist
4. Sign up a real account at `/portal/signup` → confirm it appears in `/admin/members` as `customer`, not `demo`

---

## Technical notes

- **Files created**: ~14 (1 SQL, 1 auth helper, 7 portal routes, 1 admin testing route, 1 demo-data lib, 3 small components)
- **Files edited**: ~10 (admin list pages for filter, Navbar for portal link, start.ts for middleware verify, members/events/content tables for column)
- **No edge functions**, no new external integrations
- **Build risk**: new routes generate via `routeTree.gen.ts` (auto); RLS errors caught by `/admin/testing` probes
- **Effort**: realistically one focused build pass + one polish pass after you run the SQL

After you approve, I'll execute end-to-end and stop only for the SQL run and Google OAuth confirmation.