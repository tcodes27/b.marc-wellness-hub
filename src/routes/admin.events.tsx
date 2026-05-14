import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { getCalEventTypes, getCalBookings, getCalStatus, type CalEventType, type CalBooking } from "@/lib/cal.functions";

export const Route = createFileRoute("/admin/events")({
  component: EventsPage,
});

function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [username, setUsername] = useState("bmarcpilates");
  const [eventTypes, setEventTypes] = useState<CalEventType[]>([]);
  const [bookings, setBookings] = useState<CalBooking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const status = await getCalStatus();
      setConfigured(status.configured);
      setUsername(status.username);
      if (!status.configured) {
        setLoading(false);
        return;
      }
      const [et, bk] = await Promise.all([getCalEventTypes(), getCalBookings()]);
      setEventTypes(et.eventTypes);
      setBookings(bk.bookings);
      setError(et.error || bk.error);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Bookings</p>
        <h1 className="font-serif text-3xl mt-2">Events</h1>
        <p className="text-sm text-clay mt-1">Synced from Cal.com · @{username}</p>
      </div>

      {!configured ? (
        <div className="bg-white border border-tan/30 rounded-2xl p-8 text-center shadow-sm">
          <h2 className="font-serif text-xl">Connect Cal.com API key to sync live event data.</h2>
          <p className="mt-2 text-sm text-clay">
            Add <code className="px-1.5 py-0.5 bg-sand rounded">CAL_API_KEY</code> in Settings to view your event types and bookings here.
          </p>
          <a
            href="https://app.cal.com/settings/developer/api-keys"
            target="_blank" rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5"
          >
            Get API key <ExternalLink size={12} />
          </a>
        </div>
      ) : loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>
      ) : (
        <>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <Section title="Event types">
            {eventTypes.length === 0 ? (
              <p className="text-sm text-clay">No event types found.</p>
            ) : (
              <ul className="divide-y divide-tan/20">
                {eventTypes.map((e) => (
                  <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm">{e.title} {e.hidden && <span className="text-[10px] text-clay">(hidden)</span>}</div>
                      <div className="text-xs text-clay">{e.length ? `${e.length} min · ` : ""}{e.bookingLink}</div>
                    </div>
                    <a href={e.bookingLink} target="_blank" rel="noreferrer"
                       className="text-xs uppercase tracking-[0.2em] text-clay hover:text-espresso inline-flex items-center gap-1">
                      Open <ExternalLink size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Recent bookings (${bookings.length})`}>
            {bookings.length === 0 ? (
              <p className="text-sm text-clay">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-clay text-[0.65rem] uppercase tracking-[0.2em]">
                    <tr><th className="text-left px-3 py-2">Title</th><th className="text-left px-3 py-2">When</th><th className="text-left px-3 py-2">Attendee</th><th className="text-left px-3 py-2">Status</th></tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-t border-tan/15">
                        <td className="px-3 py-2">{b.title}</td>
                        <td className="px-3 py-2 text-clay">{b.start ? new Date(b.start).toLocaleString() : "—"}</td>
                        <td className="px-3 py-2">{b.attendeeName ?? "—"}</td>
                        <td className="px-3 py-2 text-xs uppercase tracking-wider text-clay">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <a
            href="https://app.cal.com/bmarcpilates"
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5"
          >
            Manage in Cal.com <ExternalLink size={12} />
          </a>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-tan/30 rounded-2xl shadow-sm">
      <div className="px-5 py-4 border-b border-tan/20">
        <h2 className="font-serif text-lg">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
