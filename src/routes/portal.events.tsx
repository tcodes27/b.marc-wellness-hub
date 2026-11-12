import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { usePortal } from "./portal";
import { listMyRegistrations, type EventRegistration } from "@/lib/portal";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/portal/events")({
  head: () => ({ meta: [{"title": "Member Events \u2014 B.MARC Pilates"}, {"name": "description", "content": "Explore Member Events at B.MARC Pilates, a movement and wellness community."}, {"property": "og:title", "content": "Member Events \u2014 B.MARC Pilates"}, {"property": "og:description", "content": "Explore Member Events at B.MARC Pilates, a movement and wellness community."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary_large_image"}, {"name": "robots", "content": "noindex, nofollow"}] }),
  component: EventsPage,
});

function EventsPage() {
  const { userId } = usePortal();
  const [regs, setRegs] = useState<EventRegistration[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    setRegs(null);
    const { data, error } = await listMyRegistrations(userId);
    if (error) setErr(error.message);
    else setRegs((data ?? []) as EventRegistration[]);
  };

  useEffect(() => { if (userId) load(); /* eslint-disable-next-line */ }, [userId]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-clay">My calendar</p>
        <h1 className="font-serif text-3xl mt-2">Events I'm registered for</h1>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
          {err}
          <button onClick={load} className="ml-3 underline">Retry</button>
        </div>
      )}

      {!regs && !err && (
        <div className="space-y-3">{[0,1,2].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
      )}

      {regs && regs.length === 0 && (
        <div className="rounded-2xl border border-tan/30 bg-white p-8 text-center">
          <CalendarDays className="mx-auto text-clay" />
          <p className="mt-3 font-serif text-lg">No registrations yet</p>
          <p className="text-sm text-clay mt-1">When you sign up for an event, it'll show up here.</p>
        </div>
      )}

      {regs && regs.length > 0 && (
        <ul className="space-y-3">
          {regs.map(r => (
            <li key={r.id} className="rounded-2xl bg-white border border-tan/30 p-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-clay">Event {r.event_id.slice(0,8)}…</p>
                <p className="text-sm mt-1">Status: <span className="capitalize">{r.status}</span></p>
              </div>
              <span className="text-xs text-clay">{new Date(r.created_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
