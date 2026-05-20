/**
 * ============================================================
 *  B.MARC PILATES — CENTRAL IMAGE CONFIG
 * ============================================================
 *
 *  Every static image used across the public site is registered
 *  here. To swap an image:
 *
 *  1. Drop the new file into `src/assets/` (use a descriptive
 *     filename like `founder-2025.jpg`).
 *  2. Change the `import` line below to point at the new file.
 *  3. Update the `alt` text to describe the new image accurately.
 *
 *  Alt text rules:
 *  - Meaningful images: describe the subject, context, mood.
 *  - Purely decorative images: use `alt: ""` and add
 *    `aria-hidden="true"` on the <img>.
 *  - Never use "image of…" or "photo of…" — screen readers
 *    already announce the element as an image.
 * ============================================================
 */

import heroJpg from "@/assets/hero.jpg";
import aboutJpg from "@/assets/about.jpg";
import membershipJpg from "@/assets/membership.jpg";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import e1 from "@/assets/event-1.jpg";
import e2 from "@/assets/event-2.jpg";
import e3 from "@/assets/event-3.jpg";

export interface SiteImage {
  src: string;
  alt: string;
}

export const images = {
  /* Hero / homepage */
  hero: {
    src: heroJpg,
    alt: "Founder leading a reformer Pilates class in the B.MARC studio at golden hour",
  } satisfies SiteImage,

  /* Founder / about */
  founder: {
    src: aboutJpg, // TODO: replace with a real founder portrait
    alt: "Erra, founder of B.MARC Pilates, in the Atlanta studio",
  } satisfies SiteImage,
  aboutStudio: {
    src: aboutJpg,
    alt: "B.MARC studio interior with natural light and reformer equipment",
  } satisfies SiteImage,

  /* Membership */
  membership: {
    src: membershipJpg,
    alt: "B.MARC founding members gathered after a community flow class",
  } satisfies SiteImage,

  /* Studio vision split cards (About page) */
  selfGuided: {
    src: g4,
    alt: "A member moving through a self-guided reformer Pilates session",
  } satisfies SiteImage,
  liveClass: {
    src: g5,
    alt: "An instructor leading a live community Pilates class at sunset",
  } satisfies SiteImage,

  /* Community gallery grid */
  gallery: {
    reformer: { src: g1, alt: "Reformer Pilates session in soft morning light" } satisfies SiteImage,
    groupClass: { src: g4, alt: "Group flow class with members on mats" } satisfies SiteImage,
    matcha: { src: g3, alt: "Matcha and a lifestyle moment from a B.MARC event" } satisfies SiteImage,
    friends: { src: g2, alt: "Members connecting after class in the studio" } satisfies SiteImage,
    meditation: { src: g5, alt: "Sunset meditation with the B.MARC community" } satisfies SiteImage,
  },

  /* Event archive thumbnails (used by Instagram feed) */
  events: {
    e1: { src: e1, alt: "B.MARC community event in the park at golden hour" } satisfies SiteImage,
    e2: { src: e2, alt: "Post-class brunch gathering for members" } satisfies SiteImage,
    e3: { src: e3, alt: "Coastal sunrise breathwork session" } satisfies SiteImage,
  },
} as const;

export type ImageKey = keyof typeof images;
