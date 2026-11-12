import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import {
  EmptyEventsState,
  formatEventDate,
  formatEventPrice,
  usePublishedEvents,
} from "@/components/sections/EventsPreview";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useBooking } from "@/components/booking/BookingProvider";
import { useCommunity } from "@/components/community/CommunityProvider";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Events, B.MARC Pilates" },
      { name: "description", content: "Pop-up wellness events, beginner workshops, mobility meetups, and community activations — how B.MARC is building the wellness community before our studio opens." },
      { property: "og:title", content: "Events, B.MARC Pilates" },
      { property: "og:description", content: "Pop-up wellness events and community activations for beginners and modern lifestyles." },
    ],
  }),
  component: EventsPage,
});

const filters = ["All", "Pilates", "Wellness", "Community", "Workshops"] as const;

function EventsPage() {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const { open } = useBooking();
  const { open: openCommunity } = useCommunity();
  const { events, loading } = usePublishedEvents();

  const matchesFilter = (e: { event_type: string | null; tags: string[] }) => {
    if (active === "All") return true;
    const needle = active.toLowerCase();
    if (e.event_type && e.event_type.toLowerCase().includes(needle)) return true;
    return e.tags?.some((t) => t.toLowerCase().includes(needle));
  };
  const visible = events.filter(matchesFilter);

  return (
    <SiteLayout>
      <section className="pt-40 pb-16 md:pt-52 md:pb-24 bg-sand/40">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <span className="eyebrow">Pop-Ups & Community</span>
          <h1 className="mt-5 text-5xl md:text-7xl leading-[1.05]">
            Wellness, <em className="font-light">in real life.</em>
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Pop-up wellness events, beginner workshops, stretch & mobility meetups, and community activations — how we're building the B.MARC community before our studio opens.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-luxe">
          {events.length > 0 && (
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
          )}

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>
          ) : visible.length === 0 ? (
            <EmptyEventsState onJoin={() => openCommunity("events-page")} />
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((e) => {
                const url = e.cal_booking_url || e.booking_url;
                return (
                  <article
                    key={e.id}
                    className="group bg-card rounded-3xl overflow-hidden border border-border/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-30px_oklch(0.28_0.035_40_/_0.25)]"
                  >
                    <div className="p-8">
                      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-clay">
                        <span>{e.event_type ?? e.tags[0] ?? "Event"}</span>
                        <span>{formatEventPrice(e.price)}</span>
                      </div>
                      <h3 className="mt-5 font-serif text-2xl">{e.title}</h3>
                      <div className="mt-3 text-sm text-muted-foreground">
                        {formatEventDate(e.date)}{e.location ? ` · ${e.location}` : ""}
                      </div>
                      {e.description && (
                        <p className="mt-4 text-sm text-muted-foreground line-clamp-4 leading-relaxed">{e.description}</p>
                      )}
                      <button
                        onClick={() =>
                          url
                            ? window.open(url, "_blank", "noopener,noreferrer")
                            : open({ title: e.title, date: `${formatEventDate(e.date)}${e.location ? ` · ${e.location}` : ""}`, description: e.description ?? "" })
                        }
                        className="mt-6 btn-luxe btn-luxe-hover w-full"
                      >
                        Book Event <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
