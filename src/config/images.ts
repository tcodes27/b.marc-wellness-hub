/**
 * ============================================================
 *  B.MARC PILATES — CENTRAL IMAGE CONFIG
 * ============================================================
 *  All site imagery is registered here. To swap an image:
 *  1. Add the real image file to `src/assets/` (bundled at build time).
 *  2. Update the import below.
 *  3. Update the `alt` text accurately.
 * ============================================================
 */

import matStudio from "@/assets/bmarc-sunlit-mat-studio.webp";
import essentials from "@/assets/bmarc-movement-essentials.webp";
import ringFlow from "@/assets/bmarc-pilates-ring-flow.webp";
import spa from "@/assets/bmarc-spa-ritual.webp";
import reformers from "@/assets/bmarc-sunlit-reformers.webp";
import skincare from "@/assets/bmarc-natural-self-care.webp";
import community from "@/assets/bmarc-community-vision.jpg";
import mobility from "@/assets/bmarc-gentle-mobility.jpg";

export interface SiteImage {
  src: string;
  alt: string;
}

export const images = {
  /* Hero / homepage */
  hero: {
    src: ringFlow,
    alt: "Woman balancing on a Pilates mat with a ring in a sunlit, neutral-toned studio",
  } satisfies SiteImage,

  /* Founder / about */
  founder: {
    src: matStudio,
    alt: "Sunlit studio concept with mats, Pilates rings, folded towels, and arched mirrors",
  } satisfies SiteImage,
  aboutStudio: {
    src: reformers,
    alt: "Wooden reformers beside arched mirrors and an olive tree in a sunlit studio concept",
  } satisfies SiteImage,

  /* Membership */
  membership: {
    src: essentials,
    alt: "Pilates mat, exercise ball, resistance band, towel, and water glass in natural light",
  } satisfies SiteImage,

  /* Studio vision split cards (About page) */
  selfGuided: {
    src: reformers,
    alt: "Wooden reformers arranged in a calm studio concept with warm sunlight",
  } satisfies SiteImage,
  liveClass: {
    src: community,
    alt: "Three women seated on Pilates mats sharing a relaxed conversation in a studio concept",
  } satisfies SiteImage,

  /* Community gallery grid */
  gallery: {
    reformer: { src: reformers, alt: "Sunlight across wooden Pilates reformers" } satisfies SiteImage,
    groupClass: { src: community, alt: "Women connecting over conversation on Pilates mats" } satisfies SiteImage,
    matcha: { src: essentials, alt: "Mat, ball, resistance band, towel, and water for a quiet practice" } satisfies SiteImage,
    friends: { src: mobility, alt: "Woman practicing a side-lying leg lift on a mat" } satisfies SiteImage,
    meditation: { src: spa, alt: "B.MARC body oil, soap, body scrub, and dry brush in a sunlit product concept" } satisfies SiteImage,
  },

  /* Event archive thumbnails (used by Instagram feed) */
  events: {
    e1: { src: community, alt: "Women sharing a moment of connection in a studio concept" } satisfies SiteImage,
    e2: { src: matStudio, alt: "Mats and Pilates rings prepared in a sunlit studio concept" } satisfies SiteImage,
    e3: { src: reformers, alt: "Wooden reformers in a studio concept" } satisfies SiteImage,
  },
  studio: { src: matStudio, alt: "Mats, towels, and Pilates rings arranged beneath arched studio mirrors" } satisfies SiteImage,
  movement: {
    flow: { src: ringFlow, alt: "Woman holding a Pilates ring while balancing on a mat" } satisfies SiteImage,
    mobility: { src: mobility, alt: "Woman performing a controlled side-lying leg lift on a mat" } satisfies SiteImage,
    essentials: { src: essentials, alt: "Pilates ball, resistance band, mat, and towel in soft sunlight" } satisfies SiteImage,
  },
  wellness: {
    ritual: { src: spa, alt: "B.MARC body oil, natural soap, body scrub, and dry brush in a product concept" } satisfies SiteImage,
    skincare: { src: skincare, alt: "Natural soaps, oil, facial brushes, scrub, and balm arranged on stone" } satisfies SiteImage,
  },
} as const;

export type ImageKey = keyof typeof images;
