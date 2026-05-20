/**
 * ============================================================
 *  B.MARC PILATES — CENTRAL IMAGE CONFIG
 * ============================================================
 *  All site imagery is registered here. To swap an image:
 *  1. Drop the new file into `src/assets/`.
 *  2. Update the import below.
 *  3. Update the `alt` text accurately.
 * ============================================================
 */

import heroReformer from "@/assets/bmarc-hero-reformer.jpg";
import founderReformer from "@/assets/bmarc-founder-reformer.jpg";
import founderSeated from "@/assets/bmarc-founder-seated.jpg";
import founderMat from "@/assets/bmarc-founder-mat.jpg";
import community from "@/assets/bmarc-community.jpg";
import communityAlt from "@/assets/bmarc-community-alt.jpg";

export interface SiteImage {
  src: string;
  alt: string;
}

export const images = {
  /* Hero / homepage */
  hero: {
    src: heroReformer,
    alt: "B.MARC Pilates founder seated on a reformer in the studio, soft natural light",
  } satisfies SiteImage,

  /* Founder / about */
  founder: {
    src: founderSeated,
    alt: "Erra, founder of B.MARC Pilates, seated in the Atlanta studio",
  } satisfies SiteImage,
  aboutStudio: {
    src: founderReformer,
    alt: "Founder on a reformer in the B.MARC studio with warm neutral lighting",
  } satisfies SiteImage,

  /* Membership */
  membership: {
    src: founderMat,
    alt: "Founder seated on a mat with B.MARC water bottle and towel — calm studio practice",
  } satisfies SiteImage,

  /* Studio vision split cards (About page) */
  selfGuided: {
    src: founderMat,
    alt: "A self-guided mat Pilates moment at the B.MARC studio",
  } satisfies SiteImage,
  liveClass: {
    src: community,
    alt: "Live community Pilates class with members gathered around a reformer",
  } satisfies SiteImage,

  /* Community gallery grid */
  gallery: {
    reformer: { src: heroReformer, alt: "Reformer Pilates session in soft morning light" } satisfies SiteImage,
    groupClass: { src: community, alt: "Group flow class with members on reformers" } satisfies SiteImage,
    matcha: { src: founderMat, alt: "Slow studio moment with mat, towel and water bottle" } satisfies SiteImage,
    friends: { src: communityAlt, alt: "Members connecting in conversation after class" } satisfies SiteImage,
    meditation: { src: founderSeated, alt: "Quiet pause and reflection in the B.MARC studio" } satisfies SiteImage,
  },

  /* Event archive thumbnails (used by Instagram feed) */
  events: {
    e1: { src: community, alt: "B.MARC community event in the studio" } satisfies SiteImage,
    e2: { src: founderMat, alt: "Post-class gathering for members" } satisfies SiteImage,
    e3: { src: founderReformer, alt: "Reformer session at the B.MARC studio" } satisfies SiteImage,
  },
} as const;

export type ImageKey = keyof typeof images;
