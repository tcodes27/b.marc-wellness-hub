import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Check } from "lucide-react";
import membership from "@/assets/membership.jpg";
import { goToUscreen } from "@/lib/uscreen";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership, B.MARC Pilates" },
      { name: "description", content: "Unlimited online Pilates classes, wellness rituals and community access. The B.MARC membership, powered by Uscreen." },
      { property: "og:title", content: "Membership, B.MARC Pilates" },
      { property: "og:description", content: "Your studio, in your pocket. On-demand Pilates and wellness for modern women." },
    ],
  }),
  component: MembershipPage,
});

const tiers = [
  {
    name: "Community Access",
    tagline: "An invitation in.",
    price: "$85",
    cadence: "/ month",
    features: [
      "Monthly wellness newsletter",
      "Private community access",
      "Event updates & previews",
      "Member-only content",
      "Select online Pilates sessions",
      "Early access to events",
    ],
    cta: "Begin Here",
    highlight: false,
  },
  {
    name: "Signature Membership",
    tagline: "The full B.MARC practice.",
    price: "$185",
    cadence: "/ month",
    note: "Most Popular",
    valueNote: "≈ 20% saved vs. à la carte",
    features: [
      "Full online Pilates library",
      "Monthly live virtual classes",
      "Seasonal wellness guides",
      "Priority event booking",
      "Member community challenges",
      "Lifestyle content & rituals",
      "Member-only brand discounts",
      "Exclusive wellness drops",
    ],
    cta: "Become a Signature Member",
    highlight: true,
  },
  {
    name: "B.MARC All Access",
    tagline: "The flagship membership.",
    price: "$385",
    cadence: "/ month",
    features: [
      "Everything in Signature",
      "In-person event access",
      "Premium community experiences",
      "Priority booking on every release",
      "VIP wellness experiences",
      "Early access to limited events",
      "Premium digital content",
      "Concierge-style member care",
    ],
    cta: "Request All Access",
    highlight: false,
  },
];

const inside = [
  { t: "On-Demand Library", d: "New classes added weekly across reformer, mat and sculpt." },
  { t: "Beginner Pathways", d: "Guided 4-week starts to build form and confidence." },
  { t: "Wellness Routines", d: "Morning rituals, breathwork, sleep stories." },
  { t: "Lifestyle Edits", d: "Recipes, journaling prompts and the women we love." },
];

function MembershipPage() {
  return (
    <SiteLayout>
      <section className="pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="container-luxe grid gap-16 md:grid-cols-2 items-center">
          <div>
            <span className="eyebrow">Membership</span>
            <h1 className="mt-5 text-5xl md:text-7xl leading-[1.02]">
              The studio that <em className="font-light">moves with you.</em>
            </h1>
            <p className="mt-7 text-muted-foreground leading-relaxed max-w-lg">
              Unlimited on-demand Pilates, wellness rituals, and a soft community of women, powered by Uscreen, ready when you are.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <button onClick={() => openCommunity("membership-page")} className="btn-luxe btn-luxe-hover">Start Your Journey</button>
              <a href="#inside" className="text-sm uppercase tracking-[0.28em] self-center link-underline">What's inside</a>
            </div>
          </div>
          <div className="aspect-[4/5] rounded-3xl overflow-hidden">
            <img src={membership} alt="Online Pilates classes" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section id="inside" className="py-24 bg-sand/40">
        <div className="container-luxe">
          <div className="max-w-2xl mb-14">
            <span className="eyebrow">Inside the Membership</span>
            <h2 className="mt-5 text-4xl md:text-5xl">A practice library, plus a way of living.</h2>
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
            <span className="eyebrow">Membership</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl">
              Three ways to <em className="font-light">belong.</em>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Curated tiers for every stage of your practice, from quiet entry to flagship access.
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
                {t.highlight && (
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
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif text-[3.5rem] leading-none tracking-[-0.02em]">{t.price}</span>
                    <span className={`text-sm ${t.highlight ? "text-ivory/65" : "text-muted-foreground"}`}>
                      {t.cadence}
                    </span>
                  </div>
                  {t.valueNote && (
                    <div className={`mt-3 text-[0.7rem] uppercase tracking-[0.28em] ${t.highlight ? "text-tan" : "text-clay"}`}>
                      {t.valueNote}
                    </div>
                  )}
                </div>

                <ul className="mt-8 space-y-4 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[0.92rem] leading-relaxed">
                      <Check size={14} className={`mt-1 shrink-0 ${t.highlight ? "text-tan" : "text-clay"}`} />
                      <span className={t.highlight ? "text-ivory/90" : "text-espresso/85"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => open({ title: t.name, description: `${t.price} ${t.cadence}` })}
                  className={`mt-10 w-full rounded-full py-4 text-[0.7rem] uppercase tracking-[0.3em] font-medium transition-all duration-500 ${
                    t.highlight
                      ? "bg-ivory text-espresso hover:bg-tan hover:text-ivory"
                      : "bg-espresso text-ivory hover:bg-clay border border-espresso"
                  }`}
                >
                  {t.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="mt-14 text-center text-xs uppercase tracking-[0.32em] text-clay">
            By invitation · Cancel anytime · Billed in USD
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
