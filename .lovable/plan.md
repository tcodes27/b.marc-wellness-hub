## Situation

You ran `db/content_distribution.sql`, which adds `audience_tags`, `delivery_channels`, `send_status`, etc. to `content_posts`. The `NewPostModal` already inserts the full distribution payload first and only falls back to a base payload if PostgREST reports a missing column. So with the columns in place, the primary insert path should now succeed and "Save draft" / "Save & open editor" should both create rows.

PostgREST refreshes its schema cache automatically within a few seconds of a DDL change. No frontend code change is required for that to take effect.

## Plan

1. Confirm in Supabase (Table Editor → `content_posts`) that these columns exist:
   `audience_tags text[]`, `delivery_channels text[]`, `send_status text`, plus `email_subject`, `sms_text`, `media_images/videos/audio`, `cta_label`, `cta_url`, `sent_at`.
2. Force a PostgREST schema reload (covers the rare case where the cache is stale): in the Supabase SQL editor run
   ```sql
   notify pgrst, 'reload schema';
   ```
3. Retry the create flow on `/admin/content`:
   - Click **New post** → modal opens.
   - Fill title, pick an audience tag and a delivery channel.
   - Click **Save draft** → expect the post to appear in the list with audience tags and channels persisted.
   - Click **Save & open editor** → expect navigation to `/admin/content/$id`.
4. Open the browser console and check for:
   - `[content] New post clicked`
   - `[new-post-modal] opened`
   - `[new-post-modal] created <id>`
   - No `[new-post-modal] insert error` and no `distribution columns missing, retrying...` warning. If the warning still appears, the migration didn't actually add those columns — re-run `db/content_distribution.sql` and repeat step 2.
5. Only if step 4 surfaces a real error (e.g. RLS, constraint, or a still-missing column), come back and patch the modal or schema accordingly. Otherwise no code changes are needed.

## Notes

- The modal's existing fallback (`/column|schema cache/i.test(err.message)`) means even a stale cache won't break "Save draft" — it just silently drops the new fields. The console warning is the signal that the cache or migration is the problem, not the UI.
- Nothing in `admin.content.index.tsx` or `NewPostModal.tsx` needs to change for this verification.
