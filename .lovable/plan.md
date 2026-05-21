## Findings so far

- The public form is using the browser/public Supabase client from `src/integrations/supabase/client.ts`, not the admin/server client.
- The configured Supabase project in code is `https://elbjhtnumzyycrqzzgtt.supabase.co`; the network snapshot also shows requests going to that same project ref, so the preview is connected to that project.
- Direct database shell access is not available in this session, and the schema tool could not fetch table metadata, so I cannot yet list live policies/grants from the database automatically.
- The exact frontend insert payload is:

```ts
{
  first_name,
  last_name,
  email: email.toLowerCase(),
  phone: phone || null,
  city: city || null,
  instagram_handle: instagram_handle || null,
  interests,
  source: source ?? "website",
  consent_marketing: email_consent,
  email_consent,
  sms_consent,
  consent_timestamp: new Date().toISOString(),
}
```

- The payload does not include `id`, `uuid`, `owner_id`, `user_id`, or `created_by`.
- Important likely root cause: the form chains `.insert(...).select("id, first_name").single()`. In Supabase/PostgREST, `insert + select` requires the inserted row to be readable after insert. If there is no `SELECT` policy for anon/authenticated, the write can still fail or return an RLS error even when the `INSERT` policy exists.
- Another possible issue is missing table privileges: Supabase policies are not enough if `GRANT INSERT` / sequence/schema usage is missing for `anon` and `authenticated`.

## Plan

1. Add an audit SQL file that the user can run in Supabase SQL Editor to list:
   - active `community_members` policies
   - RLS status
   - grants for `anon` and `authenticated`
   - table columns, required columns, defaults, and checks

2. Update the RLS fix SQL to cover the actual frontend behavior:
   - keep RLS enabled
   - ensure schema/table privileges exist
   - allow public `INSERT` for `anon` and `authenticated`
   - add a narrow `SELECT` policy only for rows just submitted by the same browser request, or alternatively change the frontend to avoid `.select()` after insert

3. Prefer the more private frontend-safe fix:
   - change the community form insert to remove `.select("id, first_name").single()`
   - use the already-validated first name for the success toast
   - this means public visitors only need `INSERT`, not public `SELECT`, preserving privacy

4. Final SQL fix will be:

```sql
alter table public.community_members enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.community_members to anon, authenticated;

drop policy if exists "Public can join community" on public.community_members;
create policy "Public can join community"
  on public.community_members
  for insert
  to anon, authenticated
  with check (true);

-- Keep public reads closed unless admin policy allows them.
-- No anon SELECT/UPDATE/DELETE policy.
```

5. Verification:
   - submit the community form logged out
   - confirm the request goes to `elbjhtnumzyycrqzzgtt.supabase.co`
   - confirm no RLS error appears in network/console
   - confirm success UI/toast appears
   - confirm public reads remain blocked unless an admin policy applies

## Files to change after approval

- `src/components/community/CommunityProvider.tsx` — remove the post-insert `.select(...).single()` dependency.
- `db/community_members_rls.sql` — strengthen the migration with explicit grants and clarify that public read remains disabled.
- Optional: add `db/community_members_audit.sql` for live policy/grant inspection.