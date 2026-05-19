## Problem

In `src/routes/admin.testing.tsx`, the `has_role_admin` and `diag_write_read` probes guard on `userId` from `useAdmin()` context. The first probe (`supabase_session`) calls `supabase.auth.getSession()` directly and succeeds, but the context `userId` can be stale or empty in the closure when the probes run — producing the false "No authenticated user — sign in as admin first." message even though the session is live.

The admin layout does eventually set `userId`, but probes should not depend on parent context being hydrated at the right moment. They should resolve the current user themselves from the Supabase auth client (single source of truth, same client everywhere).

## Fix

Edit `src/routes/admin.testing.tsx` only. No schema, no auth flow, no other routes touched.

1. **Add a small helper** at the top of the component:
   ```ts
   const resolveUserId = async (): Promise<string | null> => {
     const { data: s } = await supabase.auth.getSession();
     if (s.session?.user?.id) return s.session.user.id;
     const { data: u } = await supabase.auth.getUser();
     return u.user?.id ?? null;
   };
   ```
   This prefers the cached session (fast) and falls back to `getUser()` (network) so it never returns an empty string.

2. **Rewrite the two failing probes** to call `resolveUserId()` instead of reading `userId` from context:
   - `has_role_admin`: `const uid = await resolveUserId(); if (!uid) return { ok:false, detail:"No authenticated user — sign in as admin first." }` then `supabase.rpc("has_role", { _user_id: uid, _role: "admin" })`.
   - `diag_write_read`: same `resolveUserId()` guard, then insert `{ created_by: uid, note: ... }`.

3. **Drop `userId` from the `useMemo` deps** for `checks` (probes no longer close over it). Keep `useAdmin()` only for the `storageKey`.

4. **Loading state for probes**: if `resolveUserId()` returns null, return a friendly `{ ok:false, detail:"Authentication still hydrating — try again in a moment." }` instead of a hard failure.

5. **No changes** to: avatar upload, db-setup functions, SETUP_FILES, admin layout, RLS, video library, YouTube/Cal.com flows, OAuth.

## Expected QA

- `Supabase session is live` ✅ (unchanged)
- `has_role('admin') returns true` ✅ (now reads same session)
- `Supabase write + read (_diagnostics)` ✅ (uses same UUID)
- No UUID syntax errors, no false "No authenticated user" messages, no new console errors.
