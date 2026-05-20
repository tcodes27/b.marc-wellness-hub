/**
 * B.MARC PILATES — INSTAGRAM FEED DATA
 * See file header history for usage. Imagery now sourced from
 * branded editorial shoot.
 */

import heroReformer from "@/assets/bmarc-hero-reformer.jpg";
import founderReformer from "@/assets/bmarc-founder-reformer.jpg";
import founderSeated from "@/assets/bmarc-founder-seated.jpg";
import founderMat from "@/assets/bmarc-founder-mat.jpg";
import community from "@/assets/bmarc-community.jpg";
import communityAlt from "@/assets/bmarc-community-alt.jpg";

export type InstagramPostType = "image" | "carousel" | "reel";

export interface InstagramPost {
  image: string;
  caption: string;
  link: string;
  type: InstagramPostType;
  date: string;
  alt?: string;
}

export const INSTAGRAM_HANDLE = "bmarcpilates";
export const INSTAGRAM_URL = "https://www.instagram.com/bmarcpilates/";

export const instagramPosts: InstagramPost[] = [
  {
    image: heroReformer,
    caption: "Sunday reformer ritual — slow, intentional, ours.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-05-12",
    alt: "Founder on the reformer in soft morning light",
  },
  {
    image: community,
    caption: "Golden hour gathering in the studio.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "reel",
    date: "2025-05-08",
    alt: "B.MARC community gathered around a reformer",
  },
  {
    image: founderMat,
    caption: "Slow mornings, mat work and intention.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-05-04",
    alt: "Mat practice with B.MARC towel and bottle",
  },
  {
    image: communityAlt,
    caption: "The B.MARC women — softness as strength.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "carousel",
    date: "2025-04-28",
    alt: "Studio community portrait",
  },
  {
    image: founderSeated,
    caption: "Movement as identity.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-04-22",
    alt: "Founder seated by the studio shelves",
  },
  {
    image: founderReformer,
    caption: "Post-flow stillness.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-04-18",
    alt: "Founder on reformer in neutral light",
  },
  {
    image: community,
    caption: "Soft routines between classes.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "reel",
    date: "2025-04-12",
    alt: "Community in conversation",
  },
  {
    image: founderMat,
    caption: "Quiet practice, linen light.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "carousel",
    date: "2025-04-06",
    alt: "Linen light and quiet practice",
  },
  {
    image: heroReformer,
    caption: "Breathwork and the long inhale.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-03-30",
    alt: "Reformer breathwork",
  },
  {
    image: founderMat,
    caption: "Practice from anywhere — your home, your hour.",
    link: "https://www.instagram.com/bmarcpilates/",
    type: "image",
    date: "2025-03-24",
    alt: "Home-style mat Pilates practice",
  },
];
