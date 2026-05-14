## Goal

Make `/admin` work end-to-end on Supabase: visiting `/admin` while signed-out redirects to `/admin/login`, signing in lands on `/admin`, and the dashboard renders with all sub-sections (members, events, leads, content, exports, settings).

## Root cause of the current error

The dashboard code in `src/routes/admin.tsx` queries `public.user_roles` to verify admin access. That table (and the `app_role` enum + `has_role()` SECURITY DEFINER function) does not yet exist in your Supabase project, so the query errors and the layout falls through to "Not authorized" / shows a `bootError`. Same story for the protected reads (`community_members`, etc.) — without RLS policies that allow admins, they return empty/error.

## Plan

### 1. Database migration (Supabase)

Create a migration that:

- Creates `public.app_role` enum (`admin`, `moderator`, `user`).
- Creates `public.user_roles (id, user_id → auth.users, role, unique(user_id, role))`.
- Enables RLS on `user_roles` and adds policy: a user can `SELECT` their own roles.
- Creates `public.has_role(_user_id uuid, _role app_role)` as `SECURITY DEFINER STABLE` with `search_path = public`.
- Seeds the admin role for the current account (UUID you've been testing with).
- Adds RLS policies on existing admin-managed tables (`community_members`, `events`, `leads`/tags, `content_*`) so that `has_role(auth.uid(),'admin')` grants full access. Anon insert remains for the public lead-capture form on `community_members` (kept as-is if already present).

### 2. Routing / auth flow cleanup (`src/routes/admin.tsx`, `src/routes/admin_.login.tsx`)

- Keep `/admin/login` as a public route (already correct via `admin_.login.tsx` — URL is `/admin/login`, outside the admin layout).
- In `admin.tsx`:
  - Replace the direct `user_roles` SELECT with a call to the `has_role` RPC (`supabase.rpc('has_role', { _user_id, _role: 'admin' })`) — works regardless of RLS on `user_roles` and matches the security pattern.
  - On no session → redirect to `/admin/login`.
  - On session but not admin → show "Not authorized" with sign-out (current behavior).
  - On admin → render layout + `<Outlet />`.
  - Remove the noisy red `bootError` panel from the happy-path dashboard view; keep it only on the not-authorized screen for diagnostics.
- In `admin_.login.tsx`: on successful sign-in, navigate to `/admin` (already correct). Keep the "already-signed-in → /admin" effect.

### 3. Sub-routes sanity check

Confirm each tab route exists and renders inside the admin layout via `<Outlet />`:
`/admin` (overview), `/admin/members`, `/admin/events`, `/admin/leads`, `/admin/content`, `/admin/content/new`, `/admin/content/:id`, `/admin/exports`, `/admin/settings`. No new pages — just verify nothing broke.

### 4. Verification

- Visit `/admin` signed-out → redirected to `/admin/login`.
- Sign in with the admin UUID account → land on `/admin` overview, sidebar visible, all tabs navigable.
- Sign in with a non-admin account → "Not authorized" screen.
- Refresh on `/admin/members` while signed-in → stays on the page (no redirect loop).

## Files touched

- `supabase/migrations/<timestamp>_admin_roles.sql` (new)
- `src/routes/admin.tsx` (swap SELECT → RPC, clean error UI)
- `src/routes/admin_.login.tsx` (minor — confirm redirect target)

No changes to Lovable Cloud — pure Supabase via the existing publishable-key client.
