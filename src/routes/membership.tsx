import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Check } from "lucide-react";
import { images } from "@/config/images";
import { useCommunity } from "@/components/community/CommunityProvider";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Founding Community — B.MARC Pilates" },
      { name: "description", content: "B.MARC is currently onboarding founding members. Join the wellness community for free during our growth phase — portal access, early event invitations, and insider updates." },
      { property: "og:title", content: "Founding Community — B.MARC Pilates" },
      { property: "og:description", content: "Complimentary founding-member access during our community growth phase. Portal, events, and wellness updates — built around intentional living." },
    ],
  }),
  component: MembershipPage,
});

// Future-tier architecture intentionally preserved (no prices, no paid CTAs).
const tiers = [
  {
    name: "Community Access",
    tagline: "Your entry into the B.MARC wellness community.",
    features: [
      "B.MARC Portal access",
      "Digital wellness updates",
      "Pilates resources & guidance",
      "Event announcements & previews",
      "Founding-member newsletter",
    ],
    highlight: false,
  },
  {
    name: "Signature Access",
    tagline: "An elevated wellness experience.",
    note: "Founding Tier",
    features: [
      "Everything in Community Access",
      "Priority event communication",
      "Exclusive portal content drops",
      "Community perks & insider previews",
      "Early access to wellness experiences",
    ],
    highlight: true,
  },
  {
    name: "All Access",
    tagline: "Founding-member level access.",
    features: [
      "Everything in Signature Access",
      "Future premium experiences",
      "Curated wellness drops",
      "Intimate community events",
      "Complimentary gift bags at live events",
      "VIP announcements & invitations",
    ],
    highlight: false,
  },
];

const inside = [
  { t: "Online Community", d: "A founding wellness community, gathered around movement and intentional living." },
  { t: "Portal Access", d: "Your private space for wellness content, event updates, and member-only resources." },
  { t: "Live Pilates Events", d: "Booked separately through Cal.com — community members receive priority invitations." },
  { t: "Wellness Insider", d: "Early notifications, VIP announcements, and complimentary perks at live experiences." },
];

function MembershipPage() {
  const { open } = useCommunity();
  const join = () => open("membership");

  return (
    <SiteLayout>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="container-luxe grid gap-16 md:grid-cols-2 items-center">
          <div>
            <span className="eyebrow">Founding Community</span>
            <h1 className="mt-5 text-5xl md:text-7xl leading-[1.02]">
              A wellness community, <em className="font-light">in the making.</em>
            </h1>
            <p className="mt-7 text-muted-foreground leading-relaxed max-w-lg">
              We're currently building our founding wellness community. Founding-member access is complimentary during our growth phase — portal access, event invitations, and insider wellness updates, gathered around movement and intentional living.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <button onClick={join} className="btn-luxe btn-luxe-hover">Join the Community</button>
              <a href="#inside" className="text-sm uppercase tracking-[0.28em] self-center link-underline">What's inside</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[0.65rem] uppercase tracking-[0.3em] text-clay">
              <span>Complimentary access</span>
              <span className="text-border">·</span>
              <span>Founding members</span>
              <span className="text-border">·</span>
              <span>Beginner-welcoming</span>
            </div>
          </div>
          <div className="aspect-[4/5] rounded-3xl overflow-hidden">
            <img src={images.membership.src} alt={images.membership.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section id="inside" className="py-24 bg-sand/40">
        <div className="container-luxe">
          <div className="max-w-2xl mb-14">
            <span className="eyebrow">Inside the Community</span>
            <h2 className="mt-5 text-4xl md:text-5xl">A wellness insider community, not a checkout.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              The B.MARC community is currently complimentary. Future premium access tiers will be introduced as the platform expands — early members will be notified first.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {inside.map((f) => (
              <div key={f.t} className="bg-card rounded-2xl p-7 border border-border/60 hover:border-clay/40 transition-colors">
                <div className="font-serif text-2xl">{f.t}</div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="py-32 md:py-40 bg-gradient-to-b from-ivory via-sand/30 to-ivory">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="eyebrow">Access Levels</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl">
              Three ways to <em className="font-light">belong.</em>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Founding-member access is currently free during our community growth phase. Membership pricing and premium tiers will be introduced in the future — early members will be the first to know.
            </p>
          </div>

          <div className="grid gap-7 lg:gap-8 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`group relative flex flex-col rounded-[2rem] p-10 transition-all duration-500 hover:-translate-y-2 ${
                  t.highlight
                    ? "bg-espresso text-ivory border border-tan/40 shadow-[0_50px_120px_-30px_oklch(0.28_0.035_40_/_0.55)] md:scale-[1.04] md:-my-2 z-10"
                    : "bg-ivory border border-border/70 hover:border-tan/50 hover:shadow-[0_40px_90px_-40px_oklch(0.28_0.035_40_/_0.25)]"
                }`}
              >
                {t.highlight && t.note && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-tan to-clay text-ivory text-[0.6rem] uppercase tracking-[0.32em] px-5 py-2 rounded-full shadow-[0_10px_30px_-10px_oklch(0.28_0.035_40_/_0.5)]">
                      <span className="h-1 w-1 rounded-full bg-ivory/80" />
                      {t.note}
                    </span>
                  </div>
                )}

                <div>
                  <div className="font-serif text-[1.65rem] leading-tight">{t.name}</div>
                  <div className={`mt-2 text-sm italic ${t.highlight ? "text-ivory/70" : "text-clay"}`}>
                    {t.tagline}
                  </div>
                </div>

                <div className="mt-8 pb-8 border-b border-dashed border-current/15">
                  <div className={`text-[0.65rem] uppercase tracking-[0.32em] ${t.highlight ? "text-tan" : "text-clay"}`}>
                    Founding Phase
                  </div>
                  <div className="mt-3 font-serif text-[2rem] leading-tight tracking-[-0.01em]">
                    Complimentary
                  </div>
                  <div className={`mt-2 text-xs ${t.highlight ? "text-ivory/65" : "text-muted-foreground"}`}>
                    Free during our community growth phase.
                  </div>
                </div>

                <ul className="mt-8 space-y-4 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[0.92rem] leading-relaxed">
                      <Check size={14} className={`mt-1 shrink-0 ${t.highlight ? "text-tan" : "text-clay"}`} />
                      <span className={t.highlight ? "text-ivory/90" : "text-espresso/85"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button onClick={join} className="btn-luxe btn-luxe-hover">
              Join the Founding Community
            </button>
            <p className="mt-5 text-xs uppercase tracking-[0.28em] text-clay">
              Currently complimentary during our founding phase
            </p>
          </div>

          <div className="mt-20 max-w-3xl mx-auto rounded-[2rem] border border-border/70 bg-ivory p-10 md:p-12 text-center">
            <span className="eyebrow text-clay">Live Events</span>
            <h3 className="mt-4 font-serif text-3xl md:text-4xl leading-snug">
              Live Pilates events, <em className="font-light">booked separately.</em>
            </h3>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Live, instructor-led Pilates events are booked through Cal.com. Community members receive early access notifications, VIP announcements, priority invitations, and complimentary gift bags at live experiences.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 justify-center text-[0.65rem] uppercase tracking-[0.3em] text-clay">
              <span>Early access</span>
              <span className="text-border">·</span>
              <span>VIP invitations</span>
              <span className="text-border">·</span>
              <span>Community perks</span>
            </div>
          </div>

          <p className="mt-14 text-center text-xs uppercase tracking-[0.32em] text-clay">
            Founding community · Live events via Cal.com · Premium tiers coming soon
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
