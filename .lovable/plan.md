## Goal

Reposition B.MARC Pilates from "Pilates studio" to a **modern, hybrid wellness community platform** — online-first today, with a future studio that will offer both **self-guided digital reformer sessions** and **live community classes**. Beginner-friendly, premium, technology-enhanced, lifestyle-driven.

No new routes. No tier price changes. Refresh existing pages, copy, and a few visual sections only.

---

## Scope of changes

### 1. `src/config/branding.ts` — single source of truth rewrite
The whole site reads from here, so most copy changes flow from this one file.

- `tagline`, `ethos`: shift from "modern women / Pilates" to hybrid wellness community language.
- `vertical`: `"Hybrid Wellness & Movement"` (still surfaces "Pilates" in product copy).
- `hero`: new headline + subtext. Example direction:
  - Eyebrow: `"A Wellness Community"`
  - Headline: `"More Than a Studio."` / em: `"A Wellness Ecosystem."`
  - Subtext: online community today, self-guided + live studio experiences coming — built for beginners and modern lifestyles.
- `about`: rewrite around "presence, community, and intentional movement — online and in real life."
- `membership` section: features become **Online Community**, **Self-Guided Sessions**, **Live Community Classes**, **Wellness Events** (instead of "On-Demand / Beginner / Wellness / Lifestyle"). Add a beginner-welcoming line.
- `newsletter`, `footer.description`: community-first language.
- `seo.defaultTitle` / `defaultDescription`: "B.MARC Pilates — A Hybrid Wellness Community for Modern Living."
- `cta.startMembership`: `"Join the Community"` variant; keep button labels short.

### 2. `src/routes/index.tsx` + home sections
Reorder/retitle existing sections so the home page tells the hybrid story without adding routes:

```text
Hero  →  AboutMovement (community ethos)  →  MembershipPreview (hybrid pillars)
     →  YouTubeShowcase (online today)  →  EventsPreview (in-person now)
     →  CommunityFeed  →  Testimonials  →  EmailSignup
```

Adjustments per section (copy only, no new components):
- `Hero.tsx`: pulls new headline from `branding`. Add a small "Beginner-friendly · Online + In-person · Community-led" trio under the CTAs (3 inline pills using existing `eyebrow` style).
- `AboutMovement.tsx`: copy now reads from `branding.about` (already does). New pillar list will include **Self-Guided**, **Live Classes**, **Digital Wellness**, **Beginner-Welcoming**, **Community**, **Intentional Living**.
- `MembershipPreview.tsx`: features array becomes the 4 hybrid pillars (Online Community / Self-Guided Reformer / Live Classes / Wellness Events). Headline shifts to "Your wellness, your way."
- `YouTubeShowcase.tsx`: reframe as "Online Community, available today" — same component, updated heading + subtext, keep cards.
- `EventsPreview.tsx`: reframe as "In-Person Pop-Ups & Community Activations" — copy only.

### 3. `src/routes/membership.tsx`
- Keep tier names, prices ($85 / $185 / $385) and structure.
- Rewrite each tier's `tagline` and `features` to reflect the hybrid model:
  - **Community Access ($85)** — Online community, beginner library, event previews, newsletter.
  - **Signature Membership ($185)** — Full online library, live virtual classes, seasonal guides, priority event booking, member discounts.
  - **B.MARC All Access ($385)** — Everything in Signature + future studio access (self-guided reformer sessions + live community classes), premium wellness experiences, 1:1 onboarding, founding-member perks.
- Add a short intro band above the tiers explaining the hybrid model: "Start online today. Step into the studio when we open — self-guided or live, your pace."
- Add a "Beginner Welcome" reassurance card below the tiers (uses existing card styles).

### 4. `src/routes/about.tsx`
- Rewrite the long-form story to reflect the hybrid wellness vision: online community first, future studio with two experiences (self-guided digital reformer + live community classes), beginner-first ethos.
- Replace one image block with a "Two ways to experience B.MARC" split (Self-Guided vs Live) using existing gallery images and the current grid styles — no new components.

### 5. `src/routes/events.tsx`
- Reframe intro copy as "Pop-up wellness events, community activations, and beginner workshops — how we're building the community before the studio opens." No structural changes.

### 6. Visual language
- Keep existing tokens (`ivory`, `sand`, `espresso`, `clay`, `tan`) — they already match the soft-luxury / warm-minimalism brief.
- No new design system work. No new fonts. No new components. Tone shifts come from copy + minor section reordering.

---

## Out of scope (explicitly)

- No new routes (no `/experience`, `/beginners`, `/community`).
- No rename — staying with **B.MARC Pilates**.
- No tier price changes.
- No backend / auth / DB changes. No edits to `db/`, `portal.*`, `admin.*`, or `src/lib/youtube.ts`.
- No new images generated; reuse existing assets.

---

## Files touched

- `src/config/branding.ts` (largest change — drives ~70% of visible copy)
- `src/components/sections/Hero.tsx` (add inline pills)
- `src/components/sections/MembershipPreview.tsx` (headline tweak)
- `src/components/sections/YouTubeShowcase.tsx` (heading + subtext)
- `src/components/sections/EventsPreview.tsx` (intro copy)
- `src/routes/membership.tsx` (tier features + intro + beginner card)
- `src/routes/about.tsx` (story rewrite + hybrid split block)
- `src/routes/events.tsx` (intro copy)

## Verification
- Visit `/`, `/membership`, `/about`, `/events` in the preview — confirm new copy renders, no layout regressions, SEO titles updated.
