/**
 * ============================================================================
 *  BRANDING CONFIG — single source of truth for white-label rebrand.
 * ============================================================================
 *
 *  This file controls every customer-facing string, link, label and
 *  asset reference used by the marketing site, the community/CRM
 *  dashboard chrome, and SEO metadata. Duplicate this template,
 *  edit ONLY this file, swap the assets in /src/assets/ and you have
 *  a launched client site.
 *
 *  CONVENTIONS
 *  -----------
 *  • Keep this file framework-agnostic — no React, no JSX.
 *  • Colors and fonts live in `src/styles.css` as design tokens.
 *    This file references them by name only.
 *  • Anything that is repeated >1 time in the UI belongs here.
 *  • DO NOT hardcode the brand name, slogans, social handles or
 *    contact email anywhere else. Import from `@/config/branding`.
 *
 *  SUPPORTED VERTICALS
 *  -------------------
 *  Pilates / yoga studios, wellness brands, fitness communities,
 *  beauty / lifestyle brands, coaches, med spas, luxury services.
 *  Override `vertical` and the membership/event terminology to fit.
 * ============================================================================
 */

export type SocialLink = {
  label: string;
  handle?: string;
  url: string;
  /** Lucide icon name. Resolved by the consuming component. */
  icon: "instagram" | "tiktok" | "facebook" | "youtube" | "linkedin" | "x" | "mail";
};

export type NavLink = { to: string; label: string };

export type BrandingConfig = {
  /** Short brand mark — used in nav, footer, document title suffix. */
  name: string;
  /** Full legal/marketing name — used for SEO author + og:site_name. */
  fullName: string;
  /** One-line tagline shown in hero subtext + meta descriptions. */
  tagline: string;
  /** Vertical descriptor: "Pilates", "Yoga", "Wellness", etc. */
  vertical: string;
  /** Three-word ethos shown in the footer baseline. */
  ethos: string;

  contact: {
    email: string;
    phone?: string;
    /** City, region — surfaced in About + footer when set. */
    location?: string;
  };

  /** Social icons rendered in the footer + community modal. */
  socials: SocialLink[];

  /** Primary site navigation. Order matters. */
  nav: ReadonlyArray<NavLink>;

  /** Reusable button copy. Override per-client to match voice. */
  cta: {
    joinCommunity: string;
    startMembership: string;
    viewEvents: string;
    bookSession: string;
    newsletter: string;
  };

  /** Membership terminology — swap for "Members" / "Patients" / "Clients". */
  terminology: {
    member: string;       // singular, e.g. "Member"
    members: string;      // plural
    community: string;    // e.g. "Community", "Tribe", "Circle"
    membership: string;   // e.g. "Membership", "Studio Pass"
    event: string;        // e.g. "Event", "Retreat", "Workshop"
    events: string;
    studio: string;       // e.g. "Studio", "Spa", "Practice"
  };

  /** Hero section copy — homepage. */
  hero: {
    eyebrow: string;
    /** Two-line headline. The second line is rendered in italic light weight. */
    headlineLead: string;
    headlineEm: string;
    subtext: string;
  };

  /** "About the movement" homepage section + About route. */
  about: {
    eyebrow: string;
    headlineLead: string;       // "A practice of"
    headlineEm1: string;        // "presence"
    headlineMid: string;        // ", a culture of"
    headlineEm2: string;        // "care"
    body: string;
    pillars: ReadonlyArray<string>;
  };

  /** Membership / on-demand section. */
  membership: {
    eyebrow: string;
    headlineLead: string;
    headlineEm: string;
    body: string;
    features: ReadonlyArray<{ title: string; description: string }>;
  };

  /** Newsletter / email capture. */
  newsletter: {
    eyebrow: string;
    headlineLead: string;
    headlineEm: string;
    body: string;
  };

  /** Footer description column. */
  footer: {
    description: string;
    exploreLabel: string;
    connectLabel: string;
  };

  /** SEO defaults. Per-route head() can still override. */
  seo: {
    titleTemplate: string;        // e.g. "%s — Brand"
    defaultTitle: string;
    defaultDescription: string;
    twitterHandle?: string;       // include the @
  };
};

/* -------------------------------------------------------------------------- */
/*  ACTIVE BRAND — replace this object when rebranding for a new client.      */
/* -------------------------------------------------------------------------- */

export const branding: BrandingConfig = {
  name: "B.MARC",
  fullName: "B.MARC Pilates",
  tagline: "A hybrid wellness community for modern living — online today, in-studio soon.",
  vertical: "Hybrid Wellness & Movement",
  ethos: "Community · Movement · Wellness",

  contact: {
    email: "team@bmarcpilates.com",
    location: "Atlanta, Georgia",
  },

  socials: [
    {
      label: "Instagram",
      handle: "bmarcpilates",
      url: "https://www.instagram.com/bmarcpilates/",
      icon: "instagram",
    },
    {
      label: "TikTok",
      handle: "bmarcpilates",
      url: "https://www.tiktok.com/@bmarcpilates",
      icon: "tiktok",
    },
    {
      label: "Email team@bmarcpilates.com",
      url: "mailto:team@bmarcpilates.com",
      icon: "mail",
    },
  ],

  nav: [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/events", label: "Events" },
    { to: "/membership", label: "Membership" },
    { to: "/about", label: "About" },
  ],

  cta: {
    joinCommunity: "Join the Community",
    startMembership: "Join the Community",
    viewEvents: "View Events",
    bookSession: "Book a Session",
    newsletter: "Subscribe",
  },

  terminology: {
    member: "Member",
    members: "Members",
    community: "Community",
    membership: "Membership",
    event: "Event",
    events: "Events",
    studio: "Studio",
  },

  hero: {
    eyebrow: "A Wellness Community",
    headlineLead: "More Than a Studio.",
    headlineEm: "A Wellness Ecosystem.",
    subtext:
      "An online community today — and a future studio designed around two ways to move: self-guided digital reformer sessions and live, instructor-led classes. Beginner-friendly, premium, built for real life.",
  },

  about: {
    eyebrow: "The Community",
    headlineLead: "A practice of ",
    headlineEm1: "presence",
    headlineMid: ", a culture of ",
    headlineEm2: "care",
    body: "B.MARC is a modern wellness community built around movement — online today, hybrid tomorrow. We make Pilates, mobility, and intentional living feel less intimidating and more like home, whether you join us on screen, in a pop-up, or one day in our studio for a self-guided or live session.",
    pillars: [
      "Online Community",
      "Self-Guided Movement",
      "Live Classes",
      "Beginner-Welcoming",
      "Wellness Events",
      "Intentional Living",
    ],
  },

  membership: {
    eyebrow: "The Membership",
    headlineLead: "Your wellness, ",
    headlineEm: "your way.",
    body: "Start with our online community and digital wellness library. Step into the studio when we open — choose self-guided reformer sessions on your own time, or live, instructor-led classes when you want the energy of a group. Hybrid by design. Beginner by welcome.",
    features: [
      { title: "Online Community", description: "Guided wellness content, mobility, and beginner-friendly movement on-demand." },
      { title: "Self-Guided Sessions", description: "Future studio access for digital reformer sessions at your own pace." },
      { title: "Live Community Classes", description: "Instructor-led, group-energy classes when you want connection." },
      { title: "Wellness Events", description: "Pop-ups, workshops, and meetups building the community in real life." },
    ],
  },

  newsletter: {
    eyebrow: "Newsletter",
    headlineLead: "Join the ",
    headlineEm: "B.MARC Community",
    body: "Wellness updates, event invites, and early access to the studio launch — sent with intention, never noise.",
  },

  footer: {
    description:
      "A hybrid wellness community — online today, in-studio soon. Self-guided movement, live classes, and pop-up events for people who want wellness to fit into real life.",
    exploreLabel: "Explore",
    connectLabel: "Connect",
  },

  seo: {
    titleTemplate: "%s — B.MARC Pilates",
    defaultTitle: "B.MARC Pilates — A Hybrid Wellness Community for Modern Living",
    defaultDescription:
      "B.MARC Pilates is a hybrid wellness community. Join online today for guided movement and community, and step into our future studio for self-guided reformer sessions and live, instructor-led classes. Beginner-welcoming, premium, and built around real life.",
    twitterHandle: "@Lovable",
  },
};

/** Convenience: primary social link by icon, used by sharing widgets. */
export function getSocial(icon: SocialLink["icon"]): SocialLink | undefined {
  return branding.socials.find((s) => s.icon === icon);
}
