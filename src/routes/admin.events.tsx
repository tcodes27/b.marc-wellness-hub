import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Plus, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getCalEventTypes, getCalBookings, getCalStatus, createCalEventType,
  type CalEventType, type CalBooking,
} from "@/lib/cal.functions";
import { useAdmin } from "./admin";
import { NewEventModal } from "@/components/admin/NewEventModal";

export const Route = createFileRoute("/admin/events")({
  component: EventsPage,
});

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  price: number | null;
  capacity: number | null;
  booking_url: string | null;
  cal_event_id: string | null;
  cal_booking_url: string | null;
  sync_status: "pending" | "synced" | "failed" | "manual";
  sync_error: string | null;
  status: "Draft" | "Published" | "Archived";
  tags: string[];
  admin_notes: string | null;
  created_at: string;
};

function EventsPage() {
  const { userId } = useAdmin();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);

  const [calConfigured, setCalConfigured] = useState(false);
  const [calUsername, setCalUsername] = useState("bmarcpilates");
  const [calLoading, setCalLoading] = useState(true);
  const [calEventTypes, setCalEventTypes] = useState<CalEventType[]>([]);
  const [calBookings, setCalBookings] = useState<CalBooking[]>([]);
  const [calError, setCalError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoadingEvents(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true, nullsFirst: false });
    if (error) {
      console.error("[admin/events] loadEvents", error);
      if (/relation .* does not exist|schema cache/i.test(error.message)) {
        setTableMissing(true);
      }
      setEventsError(error.message);
    } else {
      setTableMissing(false);
      setEventsError(null);
      setEvents((data ?? []) as EventRow[]);
    }
    setLoadingEvents(false);
  };

  const loadCal = async () => {
    setCalLoading(true);
    const status = await getCalStatus();
    setCalConfigured(status.configured);
    setCalUsername(status.username);
    if (!status.configured) { setCalLoading(false); return; }
    const [et, bk] = await Promise.all([getCalEventTypes(), getCalBookings()]);
    setCalEventTypes(et.eventTypes);
    setCalBookings(bk.bookings);
    setCalError(et.error || bk.error);
    setCalLoading(false);
  };

  useEffect(() => { loadEvents(); loadCal(); }, []);

  const bookingCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of calBookings) {
      const k = b.title.toLowerCase().trim();
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, [calBookings]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => !e.date || e.date >= today);
  const past = events.filter((e) => e.date && e.date < today);
  const list = tab === "upcoming" ? upcoming : past;

  const resync = async (e: EventRow) => {
    toast.loading("Syncing to Cal.com…", { id: e.id });
    const r = await createCalEventType({
      data: {
        title: e.title,
        description: e.description,
        startTime: e.start_time,
        endTime: e.end_time,
        location: e.location,
        price: e.price,
      },
    });
    if (!r.ok) {
      await supabase.from("events").update({ sync_status: "failed", sync_error: r.error }).eq("id", e.id);
      toast.error("Sync failed", { id: e.id, description: r.error ?? undefined });
    } else {
      await supabase.from("events").update({
        sync_status: "synced",
        sync_error: null,
        cal_event_id: r.calEventId,
        cal_booking_url: r.bookingUrl,
        booking_url: e.booking_url || r.bookingUrl,
      }).eq("id", e.id);
      toast.success("Synced to Cal.com", { id: e.id });
    }
    loadEvents();
  };

  const copyLink = async (url: string | null) => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast.success("Booking link copied");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Bookings</p>
          <h1 className="font-serif text-3xl mt-2">Events</h1>
          <p className="text-sm text-clay mt-1">
            Managed locally · {calConfigured ? `synced with Cal.com @${calUsername}` : "Cal.com not configured"}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5 hover:bg-espresso/90"
        >
          <Plus size={14} /> Create event
        </button>
      </div>

      {tableMissing && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl px-4 py-3">
          The <code className="px-1 bg-white rounded">events</code> table doesn't exist yet. Run{" "}
          <code className="px-1 bg-white rounded">db/events.sql</code> in your Supabase SQL editor, then refresh.
        </div>
      )}
      {eventsError && !tableMissing && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
          {eventsError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tan/30">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.2em] border-b-2 -mb-px ${
              tab === t ? "border-espresso text-espresso" : "border-transparent text-clay hover:text-espresso"
            }`}
          >
            {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {loadingEvents ? (
        <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-tan/30 rounded-2xl p-10 text-center">
          <p className="font-serif text-lg">No {tab} events</p>
          <p className="text-sm text-clay mt-1">
            {tab === "upcoming" ? "Click \"Create event\" to add one." : "Past events will appear here."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-tan/30 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-clay text-[0.65rem] uppercase tracking-[0.2em] bg-sand/30">
              <tr>
                <th className="text-left px-4 py-3">Event</th>
                <th className="text-left px-4 py-3">When</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Capacity</th>
                <th className="text-left px-4 py-3">Bookings</th>
                <th className="text-left px-4 py-3">Sync</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => {
                const url = e.booking_url || e.cal_booking_url;
                const count = bookingCounts.get(e.title.toLowerCase().trim()) ?? 0;
                return (
                  <tr key={e.id} className="border-t border-tan/15 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{e.title}</div>
                      {e.event_type && <div className="text-xs text-clay">{e.event_type}</div>}
                    </td>
                    <td className="px-4 py-3 text-clay whitespace-nowrap">
                      {e.date ?? "—"}
                      {e.start_time && <div className="text-xs">{e.start_time}{e.end_time ? `–${e.end_time}` : ""}</div>}
                    </td>
                    <td className="px-4 py-3">{e.price != null ? `$${e.price}` : "—"}</td>
                    <td className="px-4 py-3">{e.capacity ?? "—"}</td>
                    <td className="px-4 py-3">{count}</td>
                    <td className="px-4 py-3"><SyncBadge status={e.sync_status} error={e.sync_error} /></td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {url && (
                          <>
                            <button onClick={() => copyLink(url)} aria-label="Copy booking link" title="Copy booking link" className="p-1.5 rounded hover:bg-sand">
                              <Copy size={14} aria-hidden="true" />
                            </button>
                            <a href={url} target="_blank" rel="noreferrer" aria-label="Open booking link in a new tab" title="Open booking link" className="p-1.5 rounded hover:bg-sand">
                              <ExternalLink size={14} aria-hidden="true" />
                            </a>
                          </>
                        )}
                        <button onClick={() => resync(e)} aria-label="Sync event to Cal.com" title="Sync to Cal.com" className="p-1.5 rounded hover:bg-sand">
                          <RefreshCw size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cal.com summary */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl">Cal.com</h2>
        {!calConfigured ? (
          <div className="bg-white border border-tan/30 rounded-2xl p-6 text-sm text-clay">
            Cal.com API key not configured. Add <code className="px-1 bg-sand rounded">CAL_API_KEY</code> to enable sync.
          </div>
        ) : calLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>
        ) : (
          <>
            {calError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">{calError}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SummaryCard title={`Event types (${calEventTypes.length})`}>
                {calEventTypes.length === 0 ? (
                  <p className="text-sm text-clay">No event types yet.</p>
                ) : (
                  <ul className="divide-y divide-tan/20">
                    {calEventTypes.slice(0, 6).map((e) => (
                      <li key={e.id} className="py-2 flex justify-between gap-3">
                        <span className="text-sm truncate">{e.title}</span>
                        <a href={e.bookingLink} target="_blank" rel="noreferrer" className="text-xs text-clay hover:text-espresso inline-flex items-center gap-1">
                          Open <ExternalLink size={11} />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </SummaryCard>
              <SummaryCard title={`Recent bookings (${calBookings.length})`}>
                {calBookings.length === 0 ? (
                  <p className="text-sm text-clay">No bookings yet.</p>
                ) : (
                  <ul className="divide-y divide-tan/20">
                    {calBookings.slice(0, 6).map((b) => (
                      <li key={b.id} className="py-2 text-sm">
                        <div className="truncate">{b.title}</div>
                        <div className="text-xs text-clay">
                          {b.start ? new Date(b.start).toLocaleString() : "—"} · {b.attendeeName ?? "—"}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SummaryCard>
            </div>
          </>
        )}
      </section>

      <NewEventModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={loadEvents}
        userId={userId}
      />
    </div>
  );
}

function SyncBadge({ status, error }: { status: EventRow["sync_status"]; error: string | null }) {
  const map: Record<EventRow["sync_status"], string> = {
    synced: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-800",
    failed: "bg-rose-100 text-rose-700",
    manual: "bg-slate-100 text-slate-600",
  };
  return (
    <span title={error ?? undefined} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${map[status]}`}>
      {status === "synced" && <Check size={10} />}
      {status}
    </span>
  );
}

function StatusBadge({ status }: { status: EventRow["status"] }) {
  const map: Record<EventRow["status"], string> = {
    Draft: "bg-slate-100 text-slate-600",
    Published: "bg-emerald-100 text-emerald-700",
    Archived: "bg-stone-100 text-stone-600",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] ${map[status]}`}>{status}</span>;
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-tan/30 rounded-2xl shadow-sm">
      <div className="px-4 py-3 border-b border-tan/20"><h3 className="font-serif text-base">{title}</h3></div>
      <div className="p-4">{children}</div>
    </div>
  );
}
