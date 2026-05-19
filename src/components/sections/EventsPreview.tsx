import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBooking } from "@/components/booking/BookingProvider";
import { useCommunity } from "@/components/community/CommunityProvider";

export type PublicEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  price: number | null;
  booking_url: string | null;
  cal_booking_url: string | null;
  tags: string[];
};

export function formatEventDate(date: string | null): string {
  if (!date) return "Date TBA";
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      month: "long", day: "numeric", year: "numeric",
    });
  } catch { return date; }
}

export function formatEventPrice(price: number | null): string {
  if (price == null) return "Reserve";
  if (Number(price) === 0) return "Complimentary";
  return `$${price}`;
}

export function usePublishedEvents() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("events")
        .select("id,title,description,event_type,date,start_time,end_time,location,price,booking_url,cal_booking_url,tags")
        .eq("status", "Published")
        .or(`date.gte.${today},date.is.null`)
        .order("date", { ascending: true, nullsFirst: false });
      if (!cancelled) {
        setEvents((data ?? []) as PublicEvent[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return { events, loading };
}

export function EventsPreview() {
  const { open } = useBooking();
  const { open: openCommunity } = useCommunity();
  const { events, loading } = usePublishedEvents();
  const visible = events.slice(0, 3);

  return (
    <section className="py-28 md:py-36">
      <div className="container-luxe">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div className="max-w-2xl">
            <span className="eyebrow">In-Person Pop-Ups & Community</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl">
              Gather. Move. <em className="font-light">Belong.</em>
            </h2>
          </div>
          <Link to="/events" className="text-sm uppercase tracking-[0.28em] link-underline">
            All events
          </Link>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>
        ) : visible.length === 0 ? (
          <EmptyEventsState onJoin={() => openCommunity("events-preview")} />
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {visible.map((e) => {
              const url = e.cal_booking_url || e.booking_url;
              return (
                <article
                  key={e.id}
                  className="group relative bg-card rounded-3xl overflow-hidden border border-border/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-30px_oklch(0.28_0.035_40_/_0.25)]"
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-clay">
                      <span>{e.event_type ?? e.tags[0] ?? "Event"}</span>
                      <span>{formatEventPrice(e.price)}</span>
                    </div>
                    <h3 className="mt-5 font-serif text-2xl leading-tight">{e.title}</h3>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {formatEventDate(e.date)}{e.location ? ` · ${e.location}` : ""}
                    </div>
                    {e.description && (
                      <p className="mt-4 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{e.description}</p>
                    )}
                    <button
                      onClick={() =>
                        url
                          ? window.open(url, "_blank", "noopener,noreferrer")
                          : open({ title: e.title, date: `${formatEventDate(e.date)}${e.location ? ` · ${e.location}` : ""}`, description: e.description ?? "" })
                      }
                      className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.22em] font-medium link-underline"
                    >
                      Reserve Your Spot <ArrowUpRight size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function EmptyEventsState({ onJoin }: { onJoin: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-gradient-to-br from-sand/60 via-ivory to-sand/40 px-8 py-20 md:px-16 md:py-24 text-center">
      <div className="absolute -top-32 -right-32 size-[26rem] rounded-full bg-tan/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -left-32 size-[26rem] rounded-full bg-clay/15 blur-3xl" aria-hidden />
      <div className="relative max-w-2xl mx-auto">
        <span className="eyebrow text-clay">In Curation</span>
        <h3 className="mt-5 font-serif text-3xl md:text-5xl leading-[1.1] text-espresso">
          Upcoming wellness experiences <em className="font-light">are being curated.</em>
        </h3>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Our next live Pilates and wellness gathering will be announced soon. Founding community members will receive first access to future events — early invitations, VIP announcements, and complimentary gift bags at live experiences.
        </p>
        <div className="mt-9 flex flex-wrap gap-4 justify-center">
          <button onClick={onJoin} className="btn-luxe btn-luxe-hover">
            Join the Community
          </button>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 justify-center text-[0.65rem] uppercase tracking-[0.3em] text-clay">
          <span>Early access</span>
          <span className="text-border">·</span>
          <span>Priority invitations</span>
          <span className="text-border">·</span>
          <span>Community perks</span>
        </div>
      </div>
    </div>
  );
}
