import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAdmin, ADMIN_STATUS_COLORS } from "./admin";
import { getCalEventTypes, type CalEventType } from "@/lib/cal.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{"title": "Admin Dashboard \u2014 B.MARC Pilates"}, {"name": "description", "content": "Explore Admin Dashboard at B.MARC Pilates, a movement and wellness community."}, {"property": "og:title", "content": "Admin Dashboard \u2014 B.MARC Pilates"}, {"property": "og:description", "content": "Explore Admin Dashboard at B.MARC Pilates, a movement and wellness community."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary_large_image"}, {"name": "robots", "content": "noindex, nofollow"}] }),
  component: Overview,
});

function Overview() {
  const { members } = useAdmin();
  const [clicks, setClicks] = useState<number>(0);
  const [events, setEvents] = useState<CalEventType[]>([]);

  useEffect(() => {
    supabase
      .from("booking_clicks")
      .select("id", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (error) console.error("[admin/overview] booking_clicks error:", error);
        setClicks(count ?? 0);
      });
    getCalEventTypes()
      .then((r) => setEvents(r.eventTypes ?? []))
      .catch((err) => console.error("[admin/overview] getCalEventTypes threw:", err));
  }, []);

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = members.filter((m) => +new Date(m.created_at) >= weekAgo).length;
  const interestCounts = new Map<string, number>();
  members.forEach((m) => (m.interests ?? []).forEach((i) => interestCounts.set(i, (interestCounts.get(i) ?? 0) + 1)));
  const topInterest = [...interestCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const recent = members.slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Dashboard</p>
        <h1 className="font-serif text-3xl mt-2">Overview</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total signups" value={members.length} />
        <Stat label="New this week" value={newThisWeek} />
        <Stat label="Booking clicks" value={clicks} />
        <Stat label="Top interest" value={topInterest ? `${topInterest[0]}` : "—"} small />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent signups" cta={{ to: "/admin/members", label: "View all" }}>
          {recent.length === 0 ? (
            <p className="text-sm text-clay">No signups yet.</p>
          ) : (
            <ul className="divide-y divide-tan/20">
              {recent.map((m) => (
                <li key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-espresso truncate">
                      {m.first_name} {m.last_name}
                    </div>
                    <div className="text-xs text-clay truncate">{m.email}</div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${ADMIN_STATUS_COLORS[m.status] ?? "bg-sand"}`}>
                    {m.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Upcoming events" cta={{ to: "/admin/events", label: "Manage events" }}>
          {events.length === 0 ? (
            <p className="text-sm text-clay">
              Connect your Cal.com API key in Settings to sync live event data.
            </p>
          ) : (
            <ul className="divide-y divide-tan/20">
              {events.slice(0, 5).map((e) => (
                <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm truncate">{e.title}</div>
                    <div className="text-xs text-clay">{e.length ? `${e.length} min` : ""}</div>
                  </div>
                  <a href={e.bookingLink} target="_blank" rel="noreferrer" className="text-xs underline text-clay">
                    Open
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="bg-white border border-tan/30 rounded-2xl p-5 shadow-sm">
      <div className="text-[0.65rem] uppercase tracking-[0.25em] text-clay">{label}</div>
      <div className={`mt-3 font-serif text-espresso ${small ? "text-xl" : "text-3xl"}`}>{value}</div>
    </div>
  );
}

function Card({
  title,
  cta,
  children,
}: {
  title: string;
  cta?: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-tan/30 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-tan/20">
        <h2 className="font-serif text-lg">{title}</h2>
        {cta && (
          <Link to={cta.to} className="text-xs uppercase tracking-[0.2em] text-clay hover:text-espresso">
            {cta.label}
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
