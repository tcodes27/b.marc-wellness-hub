## Root cause

After signing out (or visiting `/admin` without a session) the admin layout calls:

```ts
navigate({ to: "/admin_/login" })
```

The login route file is `admin_.login.tsx`. The trailing `_` in `admin_` is a TanStack flat-route convention that escapes the parent `admin` layout — the resulting **URL** is `/admin/login`, while `/admin_/login` is only the route **id**.

TanStack accepts both strings in the typed `to` union, but uses the value literally as the URL. So the redirect lands on `/admin_/login`, which doesn't exist → root `notFoundComponent` renders the 404 page. Login also can't be reached, and after signing in successfully `signOut`/auth listener bounces the user back to the same broken URL.

I confirmed this in the preview: visiting `/admin` briefly shows the loading spinner, then the URL flips to `/admin_/login` and the 404 page renders. No XHR to Supabase ever fires because the user is on the 404 screen.

## Fix

Replace the three `to: "/admin_/login"` occurrences in `src/routes/admin.tsx` with the actual path `to: "/admin/login"`:

- line 88 — initial unauth redirect
- line 125 — `onAuthStateChange` sign-out redirect
- line 139 — manual `signOut` button

No other files need changes. The login route itself (`admin_.login.tsx`) keeps its `createFileRoute("/admin_/login")` declaration — that's the file-id contract; only the navigation calls were using the wrong string.

## Verification

After the edit, navigate to `/admin` in the preview:
1. Spinner → URL changes to `/admin/login` → login form renders.
2. Sign in → redirects to `/admin` → dashboard loads with members list.
3. Sign-out button returns to `/admin/login`.