## Problem

Public visitors submitting the "Join the Community" form hit:
`new row violates row-level security policy for table community_members`

RLS is enabled on `community_members` but there is no `INSERT` policy granting the `anon` role permission. Supabase RLS denies by default, so the insert is rejected even though the form posts via the public (anon) key.

Admin access already exists via the `db/admin_roles.sql` block that attaches an `"Admins full access"` policy using `has_role(auth.uid(), 'admin')`.

## Fix

Add a dedicated migration that:
1. Ensures RLS stays enabled.
2. Adds a public INSERT policy for `anon` + `authenticated`.
3. Explicitly does NOT add SELECT/UPDATE/DELETE for anon (default-deny handles it; admin policy still covers admins).

### SQL migration (`db/community_members_rls.sql`)

```sql
-- Keep RLS on
alter table public.community_members enable row level security;

-- Remove any prior public-insert policy with this name to keep migration idempotent
drop policy if exists "Public can join community" on public.community_members;

-- ✅ Allow anonymous + authenticated visitors to INSERT only
create policy "Public can join community"
  on public.community_members
  for insert
  to anon, authenticated
  with check (true);

-- ❌ No SELECT / UPDATE / DELETE policy is created for anon.
-- Default-deny means public visitors cannot read, modify, or delete rows.
-- ✅ Admins retain full access via the existing "Admins full access" policy
--    created in db/admin_roles.sql (has_role(auth.uid(), 'admin')).
```

### Resulting active policies on `community_members`

| Policy | Command | Roles | Effect |
|---|---|---|---|
| Public can join community | INSERT | anon, authenticated | allow (with check true) |
| Admins full access | ALL | authenticated | allow when `has_role(auth.uid(),'admin')` |

No SELECT/UPDATE/DELETE policy exists for `anon` → those operations are denied by default.

## Why the error occurred

With RLS enabled, Postgres denies every operation unless a matching policy explicitly allows it. The table had an admin-only `FOR ALL` policy but no `FOR INSERT ... TO anon` policy, so anonymous form submissions failed the `WITH CHECK` evaluation and Postgres returned the RLS violation.

## How to apply

This project applies SQL via the Supabase SQL editor (same pattern as the other files in `db/`). After plan approval I will:

1. Create `db/community_members_rls.sql` with the SQL above.
2. Instruct you to run it in Supabase Dashboard → SQL Editor (one click).
3. Verify by submitting the community form on `/` and confirming a row appears in `community_members` with no console error.

## Verification checklist (post-apply)

- Submit "Join the Community" form as a logged-out visitor → success toast.
- New row visible in `community_members` (check via admin panel `/admin/members` or SQL).
- Anon `select * from community_members` still returns 0 rows / denied.
- Admin user can still view and manage members.

## Notes / non-changes

- No frontend code changes — `CommunityProvider.tsx` already inserts with the correct columns and handles the duplicate-email case (`23505`) gracefully.
- Admin access is preserved via the existing `has_role` policy; no change needed there.
- `consent_marketing`, `email_consent`, `sms_consent`, and `consent_timestamp` are all set in the insert payload, so the public INSERT policy can stay simple (`with check (true)`). If you'd like, we can tighten it to require `email_consent = true` — say the word and I'll add that constraint.
