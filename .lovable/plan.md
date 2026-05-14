## What's actually happening

- `/admin/login` renders fine on its own (verified in the preview).
- The "This page didn't load" screen is the root error boundary in `__root.tsx`. It only triggers when something throws during render or in a route loader.
- The most likely trigger is the redirect to `/admin` after a successful sign-in, where `admin.tsx` queries the `user_roles` table. If that table doesn't exist yet (or RLS blocks the query in a way that throws), the error bubbles up.

## Plan

### 1. Confirm the database state
Quickly verify whether the SQL from earlier actually ran:
- Check if `app_role` enum exists
- Check if `public.user_roles` table exists
- Check if the admin row for UUID `a90c2213-5168-4a16-807b-2c0d081a189c` is present

I'll ask you to run a short SELECT in the Supabase SQL editor (or paste the result here). If anything is missing, re-run the setup SQL.

### 2. Make the admin page fail visibly instead of silently
Right now `admin.tsx` logs errors to console but the actual render-time crash still hits the global error page, which hides the message. I'll:
- Add a small inline error panel inside `AdminLayout` that shows the real Supabase error message (table missing / permission denied / etc.) instead of throwing.
- Same for `admin.index.tsx` so a failing `booking_clicks` / `getCalEventTypes` call doesn't take down the whole dashboard.

### 3. Re-test the flow
After the fix, sign in again at `/admin/login`. You'll either land on the dashboard or see a clear, specific error message we can act on directly.

### Technical details
- Files to edit: `src/routes/admin.tsx`, `src/routes/admin.index.tsx`
- No schema changes from my side — I can't run SQL on your Supabase project. If step 1 shows the table is missing, I'll re-send the exact SQL to paste.
- No changes to `__root.tsx` or auth flow.
