import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import e1 from "@/assets/event-1.jpg";
import e2 from "@/assets/event-2.jpg";
import e3 from "@/assets/event-3.jpg";
import { useBooking } from "@/components/booking/BookingProvider";

export const upcomingEvents = [
  {
    id: "candlelit-flow",
    image: e1,
    title: "Candlelit Reformer Flow",
    date: "May 24, 2026",
    location: "B.MARC Studio · Los Angeles",
    category: "Pilates",
    price: "$48",
  },
  {
    id: "coastal-retreat",
    image: e2,
    title: "Coastal Sunrise Retreat",
    date: "June 14, 2026",
    location: "Malibu Cliffs",
    category: "Wellness",
    price: "$220",
  },
  {
    id: "matcha-meetup",
    image: e3,
    title: "Matcha & Movement Meetup",
    date: "June 28, 2026",
    location: "The Beverly · Brunch Room",
    category: "Community",
    price: "Free",
  },
];

export function EventsPreview() {
  const { open } = useBooking();
  return (
    <section className="py-28 md:py-36">
      <div className="container-luxe">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div class‌Name="max-w-2xl">
            <span className="eyebrow">In-Person Pop-Ups & Community</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl">
              Gather. Move. <em className="font-light">Belong.</em>
            </h2>
          </div>
          <Link to="/events" className="text-sm uppercase tracking-[0.28em] link-underline">
            All events
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {upcomingEvents.map((e) => (
            <article
              key={e.id}
              className="group relative bg-card rounded-3xl overflow-hidden border border-border/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-30px_oklch(0.28_0.035_40_/_0.25)]"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={e.image}
                  alt={e.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />
              </div>
              <div className="p-7">
                <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-clay">
                  <span>{e.category}</span>
                  <span>{e.price}</span>
                </div>
                <h3 className="mt-4 text-2xl leading-tight">{e.title}</h3>
                <div className="mt-3 text-sm text-muted-foreground">
                  {e.date} · {e.location}
                </div>
                <button
                  onClick={() => open({ title: e.title, date: `${e.date} · ${e.location}`, description: `${e.category} · ${e.price}` })}
                  className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.22em] font-medium link-underline"
                >
                  Reserve Your Spot <ArrowUpRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
