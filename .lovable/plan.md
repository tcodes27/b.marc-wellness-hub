## What's actually happening

Two separate things, both labeled "Instagram":

**1. Footer Instagram icon → "blocked" message (Instagram's side)**
The link `https://www.instagram.com/bmarcpilates/` is correct. The block message comes from Instagram itself when a logged-out visitor (or a browser without IG cookies) lands on a profile — IG either redirects to a login wall or shows "Restricted page". Nothing in the codebase causes this; we cannot bypass IG's logged-out gate. The link works for any visitor who is signed into Instagram.

No code fix is necessary for the icon. Optional polish: on mobile we can use `instagram://user?username=bmarcpilates` to open the native app instead of the web wall. I'll add that as a tiny enhancement.

**2. Homepage "Inside the B.MARC Community" feed → not loading**
The server function (`src/lib/instagram.functions.ts`) returns `{ ok: false, reason: "missing_token" }` because `INSTAGRAM_USER_ID` and `INSTAGRAM_ACCESS_TOKEN` are not configured. That's why the fallback panel shows. To make real posts appear, we need a long-lived Instagram Graph API token + the IG Business Account ID.

## Plan

### Step A — Footer icon (small UX polish)
Update the Instagram footer link to try the native app first on mobile, fall back to web. No behavior change on desktop. Add a one-line note for the user that the "blocked" page is Instagram's logged-out wall, not a site bug.

### Step B — Wire up the live Instagram feed
The code is already built — it just needs credentials. Two things are required from Meta:

1. **Instagram Business Account ID** (numeric, e.g. `17841400000000000`)
2. **Long-lived Access Token** (60-day token from Graph API)

How to obtain them (you do this in Meta's developer console):
- Convert @bmarcpilates to a **Business** or **Creator** Instagram account (free, in Instagram app → Settings → Account type).
- Connect it to a **Facebook Page** you own.
- Go to https://developers.facebook.com → create a new app (type: "Business").
- Add the **Instagram Graph API** product.
- Use the **Graph API Explorer** to generate a User Access Token with scopes: `instagram_basic`, `pages_show_list`, `pages_read_engagement`.
- Exchange it for a **long-lived token** (60 days) via the docs.
- Use `/me/accounts` then `/{page-id}?fields=instagram_business_account` to get the IG Business Account ID.

Once you have both, I'll add them as project secrets:
- `INSTAGRAM_USER_ID`
- `INSTAGRAM_ACCESS_TOKEN`

After that, the homepage feed will render real posts automatically — no further code change needed.

### Step C — Token refresh (later)
Long-lived tokens last ~60 days. We'll add a note + (optionally later) a scheduled refresh server route. Not required for first launch.

## Verification
- After secrets are added, refresh `/` → "Inside the B.MARC Community" section should show real IG thumbnails with captions, dates, and reel/carousel badges.
- If the API errors, the section falls back to the existing "Follow @bmarcpilates" panel — no broken UI.

## Question for you
Setting up the Meta developer app + token can take 15–20 minutes. Do you want to:
- **(a)** Go through that setup now and I'll guide you step-by-step, or
- **(b)** Skip the live feed for now (keep the current "Follow @bmarcpilates" fallback panel), or
- **(c)** Replace the section with a curated grid of images you upload to Supabase storage (no Meta dependency)?
