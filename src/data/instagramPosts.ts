/**
 * ============================================================
 *  B.MARC PILATES — INSTAGRAM FEED DATA
 * ============================================================
 *
 *  HOW TO ADD OR UPDATE A POST
 *  ---------------------------
 *  1. Open the @bmarcpilates post on Instagram.
 *  2. Right-click the image → "Save image as…" and drop the file
 *     into `src/assets/` (e.g. `ig-2025-05-reformer.jpg`).
 *     OR paste the public Instagram CDN URL directly into `image`.
 *  3. Copy the post URL (e.g. https://www.instagram.com/p/XXXXXXXX/).
 *  4. Add a new entry at the TOP of the `instagramPosts` array
 *     so newest content appears first.
 *  5. Set `type` to "image" | "carousel" | "reel".
 *
 *  FUTURE UPGRADE PATH
 *  -------------------
 *  This file mirrors the shape returned by the Meta Instagram Graph
 *  API (`/me/media` → media_url, caption, permalink, media_type,
 *  timestamp). When you wire the official API, swap this static
 *  array for a server function that fetches and maps to the same
 *  `InstagramPost` shape — no UI changes required.
 * ============================================================
 */

import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import e1 from "@/assets/event-1.jpg";
import e2 from "@/assets/event-2.jpg";
import e3 from "@/assets/event-3.jpg";
import about from "@/assets/about.jpg";
import membership from "@/assets/membership.jpg";

export type InstagramPostType = "image" | "carousel" | "reel";

export interface InstagramPost {
  /** Local import or full Instagram CDN URL */
  image: string;
  /** Short caption shown on hover — keep under ~120 chars */
  caption: string;
  /** Permalink to the original Instagram post */
  link: string;
  /** image | carousel | reel */
  type: InstagramPostType;
  /** ISO date string, e.g. "2025-05-12" */
  date: string;
  /** Optional alt text for accessibility */
  alt?: string;
}

export const INSTAGRAM_HANDLE = "bmarcpilates";
export const INSTAGRAM_URL = "https://www.instagram.com/bmarcpilates/";

/* ============================================================
 *  ADD NEW POSTS HERE  ⬇  (newest first)
 * ============================================================ */
export const instagramPosts: InstagramPost[] = [
  {
    image: g1,
    caption: "Sunday reformer ritual — slow, intentional, ours.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-05-12",
    alt: "Reformer Pilates in soft morning light",
  },
  {
    image: e1,
    caption: "Golden hour gathering in the park.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "reel",
    date: "2025-05-08",
    alt: "B.MARC community event in the park at golden hour",
  },
  {
    image: g3,
    caption: "Slow mornings, matcha and movement.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-05-04",
    alt: "Matcha and a Pilates mat",
  },
  {
    image: about,
    caption: "The B.MARC women — softness as strength.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "carousel",
    date: "2025-04-28",
    alt: "Studio community portrait",
  },
  {
    image: g2,
    caption: "Movement as identity.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-04-22",
    alt: "Braided hair and linen",
  },
  {
    image: e2,
    caption: "Post-flow brunch club.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-04-18",
    alt: "Brunch table after Pilates class",
  },
  {
    image: g5,
    caption: "Soft routines between classes.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "reel",
    date: "2025-04-12",
    alt: "Café pause",
  },
  {
    image: g4,
    caption: "Quiet practice, linen light.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "carousel",
    date: "2025-04-06",
    alt: "Linen light and quiet practice",
  },
  {
    image: e3,
    caption: "Breathwork at sunrise on the coast.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-03-30",
    alt: "Coastal sunrise breathwork",
  },
  {
    image: membership,
    caption: "Practice from anywhere — your home, your hour.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-03-24",
    alt: "Home Pilates practice",
  },
];
/* ============================================================
 *  END OF POSTS  ⬆
 * ============================================================ */
