# Repair the six broken site photos

## What's wrong
Six photos (ringFlow, matStudio, reformers, essentials, spa, skincare) only exist as pointer files that link to a Lovable-hosted address. That address doesn't exist on Netlify, so the photos break there. The two working photos (community vision, gentle mobility) are real files bundled into the site.

## Original files found
All six original uploads are still available:

| Image | Original upload | Pointer file |
|---|---|---|
| ringFlow | Minimalist_Pilates_Studio_Workout-1.png | bmarc-pilates-ring-flow.webp |
| matStudio | Sunlit_Minimal_Pilates_Studio-4.png | bmarc-sunlit-mat-studio.webp |
| reformers | Sunlit_Minimalist_Pilates_Studio.webp | bmarc-sunlit-reformers.webp |
| essentials | Warm_Minimalist_Wellness_Still_Life-2.png | bmarc-movement-essentials.webp |
| spa | Sunlit_B.MARĆ_Spa_Ritual.webp | bmarc-spa-ritual.webp |
| skincare | Natural_Skincare_Spa_Still_Life.webp | bmarc-natural-self-care.webp |

The pointers list optimized WebP versions (88–185 KB) that came from these uploads.

## Steps
1. Get the exact optimized WebP files the site uses now by downloading them from the preview CDN. That keeps the photos the same and the page weight the same. If a download fails, convert that one from its original upload to WebP at the same size, with no edits to the image, and report it.
2. Check each file: make sure it really is a WebP image, its size matches the pointer, and its dimensions look right. Save them as `src/assets/bmarc-*.webp`.
3. In `src/config/images.ts`, change the six imports to the real files and replace `x.url` with `x`. Keep every export, key, and alt text the same. Update the header comment so it says to use real files.
4. Search the codebase for other uses of the pointers. Delete each pointer file only once nothing uses it. Use a plain file delete, not the CDN delete, so older previews still work.
5. Leave the community-vision and gentle-mobility images alone.

## Validation
- Run the production build in a temporary copy so it doesn't touch the project output. Confirm the six hashed `.webp` files are in the build output.
- Search the source and build output for `/__l5e/assets-v1/`. There should be none.
- Load the home, About, Membership and Shop pages in Playwright. Confirm every image request returns 200 and each image has a real size once loaded.
- Deployment: Netlify deploys come from GitHub, so I can't verify the live Netlify site from here. I'll report the live site as not yet verified until it redeploys and someone checks it.

## Files changed
- `src/assets/bmarc-{pilates-ring-flow,sunlit-mat-studio,sunlit-reformers,movement-essentials,spa-ritual,natural-self-care}.webp` (added)
- `src/config/images.ts` (imports only)
- six `*.webp.asset.json` pointers (removed once confirmed unused)
