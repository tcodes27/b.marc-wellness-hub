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
  tagline: "Movement, connection, and intentional living for modern women.",
  vertical: "Pilates",
  ethos: "Movement · Community · Intention",

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
    { to: "/events", label: "Events" },
    { to: "/membership", label: "Membership" },
    { to: "/about", label: "About" },
  ],

  cta: {
    joinCommunity: "Join the Community",
    startMembership: "Start Your Journey",
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
    eyebrow: "B.MARC Pilates",
    headlineLead: "More Than Pilates.",
    headlineEm: "A Wellness Culture.",
    subtext: "Movement, connection, and intentional living designed for modern women.",
  },

  about: {
    eyebrow: "The Movement",
    headlineLead: "A practice of ",
    headlineEm1: "presence",
    headlineMid: ", a culture of ",
    headlineEm2: "care",
    body: "B.MARC was born from a simple belief, that movement is a love language. We build strength on the mat and a softer, more intentional life off of it. This is Pilates as ritual, community as medicine.",
    pillars: [
      "Wellness",
      "Confidence",
      "Discipline",
      "Feminine Energy",
      "Community",
      "Intentional Living",
    ],
  },

  membership: {
    eyebrow: "The Membership",
    headlineLead: "Your studio, ",
    headlineEm: "in your pocket.",
    body: "Stream Pilates classes and wellness rituals anytime on our YouTube channel, with private member-only sessions delivered straight to you.",
    features: [
      { title: "On-Demand Classes", description: "Reformer, mat & sculpt sessions, anywhere." },
      { title: "Beginner Programs", description: "Step-by-step paths to build a confident practice." },
      { title: "Wellness Routines", description: "Morning rituals, breathwork & sleep flows." },
      { title: "Lifestyle Content", description: "Recipes, edits and conversations on living well." },
    ],
  },

  newsletter: {
    eyebrow: "Newsletter",
    headlineLead: "Join the ",
    headlineEm: "B.MARC Community",
    body: "Get wellness updates, event access, and exclusive movement experiences delivered with intention.",
  },

  footer: {
    description:
      "A movement, a community, a way of living. Pilates, wellness and intention, designed for the modern woman.",
    exploreLabel: "Explore",
    connectLabel: "Connect",
  },

  seo: {
    titleTemplate: "%s — B.MARC Pilates",
    defaultTitle: "B.MARC Pilates, A Wellness Culture for Modern Women",
    defaultDescription:
      "B.MARC Pilates is a luxury wellness community for modern women. Join in-person Pilates events, online classes and a movement built on intention.",
    twitterHandle: "@Lovable",
  },
};

/** Convenience: primary social link by icon, used by sharing widgets. */
export function getSocial(icon: SocialLink["icon"]): SocialLink | undefined {
  return branding.socials.find((s) => s.icon === icon);
}
