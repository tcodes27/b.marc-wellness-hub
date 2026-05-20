# Image & Accessibility Audit — B.MARC Pilates

A two-track pass: (1) make every image easy for you to swap from one file, with proper alt text; (2) bring the public site, portal, and admin up to WCAG AA on the items that actually fail today. No visual redesign — luxury aesthetic stays intact.

## Part 1 — Image inventory (current state)

All site imagery lives in `src/assets/` and is imported by component. Eleven local images, plus YouTube thumbnails (admin-only) and user-uploaded avatars / featured images (Supabase storage). No CSS background-image usage, no hardcoded external image URLs on public pages.

| File | Used in | Purpose | Current alt | Status |
|---|---|---|---|---|
| `hero.jpg` | `components/sections/Hero.tsx` | Home hero | "B.MARC Pilates hero" | OK, refine |
| `about.jpg` | `sections/AboutMovement.tsx`, `routes/about.tsx` | About / movement | "B.MARC studio" / "B.MARC community" | OK, refine |
| `membership.jpg` | `sections/MembershipPreview.tsx`, `routes/membership.tsx` | Membership | "B.MARC founding wellness community" | OK |
| `gallery-1…5.jpg` | `sections/Gallery.tsx`, `routes/about.tsx`, `data/instagramPosts.ts` | Community grid + IG feed | Generic ("Reformer Pilates", "Group flow class", etc.) | Refine, dedupe usage |
| `event-1…3.jpg` | `data/instagramPosts.ts` only (events page itself is now data-driven) | IG feed entries | varies | Keep |

Dynamic images (no local file):
- YouTube thumbnails — `admin.videos.tsx` (admin-only, decorative `alt=""` is correct)
- Profile avatars — `portal.profile.tsx` (`alt="Profile"` — fix to user's name)
- Featured post images — admin/portal content (`alt=""` everywhere — needs post title)

No mock/demo images remain after the prior cleanup.

## Part 2 — Centralized image config

Create `src/config/images.ts` as the single source of truth:

```ts
// One import per image. Each entry: { src, alt, role: 'meaningful' | 'decorative' }
export const images = {
  hero:        { src: heroJpg,       alt: 'Founder leading a reformer Pilates class in the B.MARC studio at golden hour' },
  aboutStudio: { src: aboutJpg,      alt: 'B.MARC studio interior with natural light and reformer equipment' },
  membership:  { src: membershipJpg, alt: 'B.MARC founding members gathered after a community flow class' },
  founder:     { src: aboutJpg,      alt: 'Brianna Marc, founder of B.MARC Pilates' }, // placeholder until real photo
  gallery: {
    reformer:    { src: g1, alt: 'Reformer Pilates session in progress' },
    groupClass:  { src: g4, alt: 'Group flow class with members on mats' },
    matcha:      { src: g3, alt: 'Matcha and lifestyle moment from a B.MARC event' },
    friends:     { src: g2, alt: 'Members connecting after class in the studio' },
    meditation:  { src: g5, alt: 'Sunset meditation with the B.MARC community' },
  },
  events: { e1: {src: e1, alt: '…'}, e2: {…}, e3: {…} },
  fallback: { decorative: { src: heroJpg, alt: '' } },
} as const;
```

Then refactor `Hero`, `AboutMovement`, `Gallery`, `MembershipPreview`, `routes/about.tsx`, `routes/membership.tsx`, and `data/instagramPosts.ts` to read from `images`. You can swap any image by editing the one import line in `src/config/images.ts`.

## Part 3 — Alt text fixes

- Replace vague alts ("B.MARC studio", "B.MARC community") with the descriptive copy in the config above.
- Admin/portal `<img alt="">` for **featured post images** → use the post title.
- `portal.profile.tsx` avatar → `alt={\`${displayName}'s profile photo\`}`.
- YouTube thumbnails in admin videos table → keep `alt=""` (decorative; video title is next to it).
- Featured images that are purely decorative inside an article body (admin content preview) → keep `alt=""`.

## Part 4 — Accessibility fixes (the real issues, by file)

Sitewide
- Add a **skip-to-content** link in `__root.tsx` shell (visible on focus).
- Ensure exactly one `<main>` per page. Public pages use `SiteLayout` — wrap its `<Outlet />` in `<main id="main">`. `admin.tsx` and `portal.tsx` each get their own `<main>`. Remove any duplicates.
- Add `lang="en"` to `<html>` in `__root.tsx`.
- Honor reduced motion: in `src/styles.css` add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }`.
- Add a visible focus ring utility (`:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }`) and stop suppressing focus rings on links/buttons.

Icon-only buttons missing `aria-label` (fix in place)
- `admin.events.tsx`: copy-link, resync (have `title`, add `aria-label`).
- `admin.journeys.index.tsx`: edit, duplicate, delete row actions.
- `admin.journeys.$id.tsx`: move up, move down, preview, edit, delete, close (X) buttons.
- `admin.content.$id.tsx`: clear featured image, tag toggles, close (X), preview.
- `admin.videos.tsx`: delete row button.
- `portal.profile.tsx`: avatar upload/remove buttons.
- `Navbar.tsx`: mobile menu toggle (verify `aria-expanded` + `aria-controls`).

Forms & modals (community signup, portal login/signup/forgot/reset, profile, admin content/events/journeys)
- Every `<input>` gets an associated `<label htmlFor>` (visible or `sr-only`), not just `placeholder`.
- Required fields: add `aria-required="true"` and a visible `*`.
- Error messages: render with `role="alert"` and link via `aria-describedby={errorId}`.
- Modals: use the existing shadcn `Dialog` (already correct Radix ARIA + focus trap + Esc) — replace any hand-rolled overlays (e.g. `admin.members.tsx` "Close" panel, journey preview/edit overlays) with `Dialog` so focus returns correctly.
- Toasts: `sonner` already announces — verify `Toaster` is mounted once in `__root.tsx`.

Color & contrast
- Audit `text-clay` / `text-ivory/70` / `text-muted-foreground/50` against their backgrounds. Replace any below 4.5:1 with a slightly darker token (introduce `--clay-strong` in `styles.css` if needed). Hero subtitle `text-ivory/85` on dark gradient — keep.
- Form errors: keep red color **and** add an icon + text prefix ("Error:").
- Filter/tag chips (admin content, members): ensure selected state is not color-only — add border weight or check icon.
- Link underlines: keep `link-underline` utility on body links so links are distinguishable without color.

Keyboard / semantics
- No `onClick` on `<div>` / `<span>` found in scanned routes — verify in `CommunityFeed`, `Testimonials`, `YouTubeShowcase` and convert any to `<button>`.
- Tab order: confirm mobile nav (`Navbar`) and admin sidebar (`admin.tsx`) close on Esc and return focus to the toggle.
- Heading order: confirm one `<h1>` per page (Hero has h1; secondary pages — about, membership, events — must each define their own h1, currently they do).

Images
- Lazy-loading: already on most. Add `loading="lazy"` + `decoding="async"` to remaining `<img>` (admin tables, portal content) — perf-adjacent a11y win.
- Decorative images inside hero gradients: `alt=""` and `aria-hidden="true"`.

## Part 5 — Deliverable: QA report

After the edits I'll output a markdown report in chat (no separate file unless you want one) with:
- ✅ Fixed (per file, per fix)
- 🟡 Needs manual review (e.g. real photo of founder for `images.founder`, contrast tweaks you want to keep for brand reasons)
- 🚨 Critical (none expected post-fix)
- 🎯 Recommended next (real `<picture>` + AVIF/WEBP, automated axe CI)
- Launch-readiness score out of 100

## Out of scope (explicit)

- No visual redesign, no palette change.
- No changes to Content Studio behavior, Cal.com flow, portal auth, community signup logic, YouTube integration, or CRM/journeys logic. Only labels, ARIA, semantic wrappers, and the image-config refactor touch those files.
- No new dependencies.

## Technical notes

- Files touched (estimate): `src/config/images.ts` (new), `src/styles.css`, `src/routes/__root.tsx`, `src/components/SiteLayout.tsx`, `Navbar.tsx`, `Footer.tsx`, all `sections/*`, `routes/about.tsx`, `routes/membership.tsx`, `routes/events.tsx`, `routes/portal*.tsx`, `routes/admin*.tsx` (label/aria edits only), `data/instagramPosts.ts`.
- No DB migrations, no server function changes.
- No route additions.
