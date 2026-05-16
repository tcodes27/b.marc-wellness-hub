## One-click database setup

Add a **"Run database setup"** button to `/admin/testing` that executes the four SQL files in the correct order and reports per-file success/errors inline.

### How it works

1. **Bundle the SQL** — import each file as a raw string with Vite's `?raw` suffix so it ships with the server function (no filesystem reads at runtime, Worker-safe):
   ```ts
   import adminRoles from "../../db/admin_roles.sql?raw";
   import events from "../../db/events.sql?raw";
   import contentDist from "../../db/content_distribution.sql?raw";
   import portalTesting from "../../db/portal_and_testing.sql?raw";
   ```

2. **Bootstrap a SQL executor in Postgres** (one tiny manual step — unavoidable, because `supabase-js` cannot run raw multi-statement SQL on its own). The button's first run instructs the user to paste this 6-line snippet into the Supabase SQL Editor once:
   ```sql
   create or replace function public.exec_sql(sql text)
   returns void language plpgsql security definer
   set search_path = public as $$ begin execute sql; end; $$;
   revoke all on function public.exec_sql(text) from public, anon, authenticated;
   ```
   After that, the server fn calls it via `supabaseAdmin.rpc("exec_sql", { sql })`.

3. **Server function** `runDatabaseSetup` in `src/lib/db-setup.functions.ts`:
   - Uses `supabaseAdmin` (service role, bypasses RLS).
   - Runs the four files **in order**: `admin_roles → events → content_distribution → portal_and_testing`.
   - Catches errors per file, continues to the next, returns `[{ file, ok, error?, durationMs }]`.
   - All SQL is idempotent (uses `if not exists`, `drop policy if exists`, etc.) so re-running is safe.

4. **UI on `/admin/testing`** — new card above the probes list:
   - **Run database setup** button (primary).
   - Live status list with each file name + spinner → ✅/❌ + error message.
   - If `exec_sql` is missing, the first call surfaces a clear error with the bootstrap snippet to copy.
   - Toast summary: "4/4 migrations applied" or "3/4 — see details".

### Files

- **New** `src/lib/db-setup.functions.ts` — the `runDatabaseSetup` server fn + `?raw` SQL imports.
- **Edit** `src/routes/admin.testing.tsx` — add the setup card + run handler + status state. No other page logic changes.
- **No new SQL files** — uses the existing four.

### Why not a CLI script?

You asked for **one-click**. A `bun run db:setup` script would need `DATABASE_URL` + `pg` package + you running it locally. Doing it from the admin UI uses the service role you already have, runs from anywhere, and surfaces results in the same place as the rest of the readiness checks.

### After implementation

1. Paste the 6-line `exec_sql` snippet into Supabase SQL Editor (one-time).
2. Visit `/admin/testing` → click **Run database setup** → watch all four turn green.
3. Click **Run all probes** → confirm RLS, profiles, registrations all pass.