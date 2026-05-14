import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Check } from "lucide-react";
import membership from "@/assets/membership.jpg";
import { useBooking } from "@/components/booking/BookingProvider";

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
  const { open } = useBooking();
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
              <button onClick={() => open({ title: "Join the Community" })} className="btn-luxe btn-luxe-hover">Start Your Journey</button>
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

      <section id="plans" className="py-28">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="eyebrow">Plans</span>
            <h2 className="mt-5 text-4xl md:text-5xl">Choose your rhythm.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative rounded-3xl p-8 border transition-all duration-500 hover:-translate-y-1 ${
                  t.highlight
                    ? "bg-espresso text-ivory border-espresso shadow-[0_30px_70px_-30px_oklch(0.28_0.035_40_/_0.4)]"
                    : "bg-card border-border"
                }`}
              >
                {t.note && (
                  <span className="absolute top-5 right-5 text-[0.6rem] uppercase tracking-[0.25em] bg-tan text-ivory px-3 py-1 rounded-full">
                    {t.note}
                  </span>
                )}
                <div className="font-serif text-2xl">{t.name}</div>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-serif text-5xl">{t.price}</span>
                  <span className={`text-sm ${t.highlight ? "text-ivory/65" : "text-muted-foreground"}`}>{t.cadence}</span>
                </div>
                <ul className="mt-7 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check size={15} className="mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => open({ title: t.name + " Membership", description: `${t.price} ${t.cadence}` })}
                  className={`mt-8 w-full rounded-full py-3.5 text-xs uppercase tracking-[0.25em] font-medium transition-all duration-400 ${
                    t.highlight
                      ? "bg-ivory text-espresso hover:bg-tan hover:text-ivory"
                      : "bg-espresso text-ivory hover:bg-clay"
                  }`}
                >
                  {t.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
