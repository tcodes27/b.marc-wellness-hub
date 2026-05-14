## Plan: Connect Supabase + Build Community Management System

You shared your Supabase URL and anon JWT key. I'll wire your project to Supabase manually, then build the signup form + admin dashboard.

### 1. Manual Supabase wiring
- Install `@supabase/supabase-js`.
- Create `src/integrations/supabase/client.ts` initialized with:
  - URL: `https://elbjhtnumzyycrqzzgtt.supabase.co`
  - Anon key: the JWT you provided
- Hardcoded in the client file (anon key is safe in the browser; RLS enforces security).

### 2. Database schema — SQL for you to run in Supabase SQL Editor
I'll provide one script that creates:
- `community_members` table: `id` (uuid pk), `first_name`, `last_name`, `email` (unique), `phone`, `city`, `instagram_handle`, `interests` (text[]), `source`, `consent_marketing` (bool), `created_at`.
- `app_role` enum (`admin`, `member`) + `user_roles` table + `has_role()` security-definer function (roles never on profiles — prevents privilege escalation).
- RLS:
  - `community_members`: anon `INSERT` allowed; `SELECT` only for admins.
  - `user_roles`: `SELECT` only for admins.
- A snippet for you to grant yourself admin once you sign up.

### 3. Public website updates
- Keep current luxury design (ivory, beige, mocha, nude).
- "Join the Community" button → opens modal form (first/last name, email, phone, city, Instagram handle, interests checkboxes, marketing consent) → inserts into `community_members`.
- Client-side validation with Zod (length limits, email format, required fields).
- Toast confirmation on success.
- "Reserve Your Spot" / "Book Event" → unchanged, link to Acuity. Not wired to DB.

### 4. Admin auth
- `/admin/login` — email/password sign-in via Supabase Auth.
- Session persistence + `onAuthStateChange` listener.
- `/admin` route guard: requires session AND `has_role(uid, 'admin')`. Otherwise redirect to login.

### 5. Admin dashboard at `/admin`
- Clean professional layout (separate from public luxury aesthetic).
- Stats cards: total members, new this week, marketing-consented count.
- Searchable/sortable table of members (search by name/email/city, filter by source/interests/consent).
- Row click → detail drawer.
- "Export CSV" button — downloads filtered results.
- Sign out.

### Question before I build
Admin login: **email/password only**, or also **Google sign-in**? (Default: email/password only.)

Approve and I'll implement everything in one pass and hand you the SQL to paste.