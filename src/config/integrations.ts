/**
 * ============================================================================
 *  INTEGRATIONS CONFIG — feature flags for third-party services.
 * ============================================================================
 *
 *  Toggling an integration to `false` should be enough to hide the
 *  corresponding UI affordance (booking button, IG feed, SMS controls,
 *  Stripe checkout, etc.). The runtime credentials still live in
 *  project secrets — this file only declares which features are
 *  *enabled* for the current client.
 *
 *  Pair with `src/lib/integrations.functions.ts` which inspects which
 *  secrets are actually present at runtime; UI should hide a feature
 *  if EITHER its config flag is false OR its secret is missing.
 * ============================================================================
 */

export type IntegrationsConfig = {
  /** Supabase Auth + Postgres + Storage. Effectively always on for this template. */
  supabase: { enabled: true };

  /** Cal.com booking embed used by the BookingProvider. */
  calcom: {
    enabled: boolean;
    /** e.g. "yourname/intro-call" — the namespace path on cal.com. */
    namespace?: string;
  };

  /** Stripe payments / membership checkout. */
  stripe: {
    enabled: boolean;
    /** Optional pricing table ID or product slug. */
    pricingTableId?: string;
  };

  /** YouTube — primary video / class library platform. */
  youtube: {
    enabled: boolean;
    /** Channel ID (UC...). */
    channelId?: string;
    /** Optional default playlist surfaced on the public site. */
    featuredPlaylistId?: string;
  };

  /** Instagram Graph API feed on the homepage. */
  instagram: {
    enabled: boolean;
    /** Public handle for fallback link, no @. */
    handle?: string;
  };

  /** Twilio SMS for community broadcasts + transactional SMS. */
  twilio: { enabled: boolean };

  /** Resend or SendGrid for transactional + marketing email. */
  email: {
    enabled: boolean;
    provider?: "resend" | "sendgrid";
  };
};

export const integrations: IntegrationsConfig = {
  supabase: { enabled: true },
  calcom: { enabled: true },
  stripe: { enabled: false },
  youtube: {
    enabled: true,
    channelId: "UCUafiWbOwgWI7OuRCC7XSDQ",
  },
  instagram: { enabled: true, handle: "bmarcpilates" },
  twilio: { enabled: true },
  email: { enabled: true, provider: "resend" },
};
