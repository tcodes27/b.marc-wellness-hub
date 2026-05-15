import { useEffect, useState } from "react";
import { X, Loader2, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createCalEventType } from "@/lib/cal.functions";

export const EVENT_TAGS = [
  "Pilates Event",
  "Wellness Event",
  "Workshop",
  "Private Session",
  "Community Meetup",
] as const;

export const EVENT_TYPES = [
  "Class",
  "Workshop",
  "Private Session",
  "Retreat",
  "Community Meetup",
  "Other",
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  userId: string;
};

export function NewEventModal({ open, onClose, onCreated, userId }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<string>("Class");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [tags, setTags] = useState<string[]>([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [syncToCal, setSyncToCal] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(""); setDescription(""); setEventType("Class");
    setDate(""); setStartTime("09:00"); setEndTime("10:00");
    setLocation(""); setPrice(""); setCapacity(""); setBookingUrl("");
    setStatus("Draft"); setTags([]); setAdminNotes("");
    setSyncToCal(true); setError(null); setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggleTag = (t: string) =>
    setTags((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]);

  const submit = async () => {
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError(null);

    let calEventId: string | null = null;
    let calBookingUrl: string | null = null;
    let syncStatus: "synced" | "failed" | "manual" | "pending" = "pending";
    let syncError: string | null = null;

    if (syncToCal) {
      try {
        const r = await createCalEventType({
          data: {
            title: title.trim(),
            description: description.trim() || null,
            startTime: startTime || null,
            endTime: endTime || null,
            location: location.trim() || null,
            price: price ? Number(price) : null,
          },
        });
        if (r.ok) {
          calEventId = r.calEventId;
          calBookingUrl = r.bookingUrl;
          syncStatus = "synced";
        } else {
          syncStatus = "failed";
          syncError = r.error;
        }
      } catch (e: any) {
        syncStatus = "failed";
        syncError = e?.message ?? "Cal.com request failed";
      }
    } else {
      syncStatus = "manual";
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      event_type: eventType,
      date: date || null,
      start_time: startTime || null,
      end_time: endTime || null,
      location: location.trim() || null,
      price: price ? Number(price) : null,
      capacity: capacity ? Number(capacity) : null,
      booking_url: bookingUrl.trim() || calBookingUrl,
      cal_event_id: calEventId,
      cal_booking_url: calBookingUrl,
      sync_status: syncStatus,
      sync_error: syncError,
      status,
      tags,
      admin_notes: adminNotes.trim() || null,
      created_by: userId || null,
    };

    const { error: err } = await supabase.from("events").insert(payload);
    setSaving(false);

    if (err) {
      console.error("[new-event-modal] insert error", err);
      const msg = err.message;
      setError(msg);
      toast.error("Couldn't save event", { description: msg });
      return;
    }

    if (syncStatus === "failed") {
      toast.warning("Saved locally. Manual Cal.com setup required.", {
        description: syncError ?? undefined,
      });
    } else if (syncStatus === "synced") {
      toast.success("Event created and synced to Cal.com");
    } else {
      toast.success("Event saved");
    }
    onCreated();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-6 bg-espresso/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-ivory w-full sm:max-w-2xl max-h-[100dvh] sm:max-h-[90vh] sm:rounded-2xl shadow-2xl border border-tan/30 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-tan/30 bg-sand/30">
          <div>
            <p className="eyebrow">Bookings</p>
            <h2 className="font-serif text-2xl">New event</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-sand" aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} autoFocus />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Event type">
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={inputCls}>
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Visibility">
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={inputCls}>
                <option>Draft</option>
                <option>Published</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Date">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Start">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
            </Field>
            <Field label="End">
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <Field label="Location or virtual link">
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Studio address or https://…" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (USD)">
              <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Capacity">
              <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <Field label="Booking URL (optional override)">
            <input value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="Leave blank to use Cal.com link" className={inputCls} />
          </Field>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-clay mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {EVENT_TAGS.map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      active ? "bg-espresso text-ivory border-espresso" : "border-tan/40 hover:bg-sand"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Internal admin notes">
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} className={inputCls} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-espresso pt-1">
            <input type="checkbox" checked={syncToCal} onChange={(e) => setSyncToCal(e.target.checked)} />
            Sync to Cal.com as an event type
          </label>
        </div>

        <footer className="flex items-center justify-end gap-2 px-5 sm:px-7 py-4 border-t border-tan/30 bg-sand/20">
          <button onClick={onClose} disabled={saving} className="text-xs uppercase tracking-[0.2em] text-clay hover:text-espresso px-3 py-2 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5 hover:bg-espresso/90 disabled:opacity-50"
          >
            {saving
              ? <Loader2 size={12} className="animate-spin" />
              : (syncToCal ? <RefreshCw size={12} /> : <Save size={12} />)}
            {syncToCal ? "Save & sync" : "Save"}
          </button>
        </footer>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-tan/40 px-3 py-2 text-sm bg-white text-espresso focus:outline-none focus:border-espresso";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.2em] text-clay mb-1.5">{label}</span>
      {children}
    </label>
  );
}
