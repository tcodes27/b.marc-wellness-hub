## Goal

Add temporary, clearly-prefixed console logging to trace the Supabase auth flow on the admin routes, so we can verify session persistence and redirect behavior across refreshes.

## What gets logged

All logs prefixed with `[admin-auth]` so they're easy to filter and remove later.

### `src/routes/admin.tsx` (AdminLayout effect)

- On mount: `mount, pathname=…`
- After `getSession()`: `getSession ->` `{ hasSession, userId, expiresAt, accessTokenPreview }` (token preview = first 12 chars only, never full token)
- If no session: `no session, redirecting to /admin/login`
- After `has_role` rpc: `has_role ->` `{ isAdminRpc, error }`
- On `onAuthStateChange`: `authStateChange event=<event> hasSession=<bool> userId=<uid|null>`
- On unmount/cleanup: `cleanup`

### `src/routes/admin_.login.tsx` (AdminLogin)

- On mount `getSession()`: `login mount, hasSession=<bool> userId=<uid|null>`
- On submit start: `signIn attempt email=<masked>` (mask: keep first char + domain)
- On submit result: `signIn result ->` `{ ok, error, userId }`
- After successful navigate: `signIn success, navigating to /admin`

### `src/integrations/supabase/client.ts`

Add a one-time module-load log so we can confirm the storage adapter:
- `client init, storage=<localStorage|none>, hasWindow=<bool>`

### Refresh-persistence trace

Add a small `useEffect` in `__root.tsx` (or AdminLayout — whichever already runs on every page) that on mount reads `localStorage` for the supabase auth key and logs:
- `localStorage probe -> hasSupabaseKey=<bool> keyName=<string|null>`

This shows whether the token actually persisted across the hard refresh.

## What stays unchanged

- No behavior changes — only `console.log` / `console.warn` calls.
- No tokens, passwords, or full emails written to logs.
- Logs will be removed in a follow-up once the issue is confirmed fixed.

## Verification steps after the edit

1. Open `/admin` while signed out → expect: client init log, mount log, `getSession -> hasSession=false`, redirect log, login mount log.
2. Sign in → expect: `signIn attempt`, `signIn result ok=true`, navigate log, AdminLayout mount, `getSession -> hasSession=true`, `has_role -> isAdminRpc=true`.
3. Hard-refresh `/admin` → expect: `localStorage probe hasSupabaseKey=true`, `getSession -> hasSession=true` (no redirect).
4. Sign out → expect: `authStateChange event=SIGNED_OUT`, redirect to login.