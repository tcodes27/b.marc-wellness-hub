import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { upcomingEvents } from "@/components/sections/EventsPreview";
import { ArrowUpRight } from "lucide-react";
import { useBooking } from "@/components/booking/BookingProvider";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events, B.MARC Pilates" },
      { name: "description", content: "Reserve your place at B.MARC Pilates events: candlelit reformer flows, coastal retreats, wellness workshops and community meetups." },
      { property: "og:title", content: "Events, B.MARC Pilates" },
      { property: "og:description", content: "In-person Pilates and wellness experiences for modern women." },
    ],
  }),
  component: EventsPage,
});

const filters = ["All", "Pilates", "Wellness", "Community", "Workshops"] as const;

const allEvents = [
  ...upcomingEvents,
  { ...upcomingEvents[0], id: "breath-workshop", title: "Breathwork & Mobility Workshop", category: "Workshops", date: "July 9, 2026", price: "$60" },
  { ...upcomingEvents[1], id: "summer-series", title: "Summer Movement Series", category: "Pilates", date: "July 22, 2026", price: "$48" },
  { ...upcomingEvents[2], id: "garden-social", title: "Garden Wellness Social", category: "Community", date: "Aug 3, 2026", price: "Free" },
];

function EventsPage() {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const { open } = useBooking();
  const visible = active === "All" ? allEvents : allEvents.filter((e) => e.category === active);

  return (
    <SiteLayout>
      <section className="pt-40 pb-16 md:pt-52 md:pb-24 bg-sand/40">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <span className="eyebrow">Events</span>
          <h1 className="mt-5 text-5xl md:text-7xl leading-[1.05]">
            Gatherings rooted in <em className="font-light">movement.</em>
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            From candlelit reformer flows to coastal retreats, every B.MARC experience is curated with intention.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-luxe">
          <div className="flex flex-wrap gap-3 justify-center mb-14">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.25em] border transition-all duration-300 ${
                  active === f
                    ? "bg-espresso text-ivory border-espresso"
                    : "border-border text-espresso hover:border-espresso"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((e, i) => (
              <article
                key={`${e.id}-${i}`}
                className="group bg-card rounded-3xl overflow-hidden border border-border/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-30px_oklch(0.28_0.035_40_/_0.25)]"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
                </div>
                <div className="p-7">
                  <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-clay">
                    <span>{e.category}</span>
                    <span>{e.price}</span>
                  </div>
                  <h3 className="mt-4 text-2xl">{e.title}</h3>
                  <div className="mt-3 text-sm text-muted-foreground">{e.date} · {e.location}</div>
                  <button
                    onClick={() => open({ title: e.title, date: `${e.date} · ${e.location}`, description: `${e.category} · ${e.price}` })}
                    className="mt-6 btn-luxe btn-luxe-hover w-full"
                  >
                    Book Event <ArrowUpRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <div className="container-luxe">
          <div className="text-center mb-12">
            <span className="eyebrow">In Partnership With</span>
            <h2 className="mt-4 text-3xl md:text-4xl">Our wellness collaborators</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {["Atelier", "Maison Noor", "Lumen Co.", "Verde", "Sable & Soul"].map((n) => (
              <div
                key={n}
                className="aspect-[3/1] rounded-xl border border-border bg-card flex items-center justify-center font-serif text-xl text-clay hover:bg-sand/60 transition-colors"
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
