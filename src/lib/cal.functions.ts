import { createServerFn } from "@tanstack/react-start";

const CAL_BASE = "https://api.cal.com/v2";

export type CalEventType = {
  id: string;
  title: string;
  slug: string;
  length: number | null;
  hidden: boolean;
  bookingLink: string;
};

export type CalBooking = {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  status: string;
  attendeeName: string | null;
  attendeeEmail: string | null;
};

async function calFetch(
  path: string,
  init?: RequestInit & { apiVersion?: string },
): Promise<{ ok: true; data: any } | { ok: false; error: string; status?: number }> {
  const key = process.env.CAL_API_KEY;
  if (!key) return { ok: false, error: "CAL_API_KEY not configured" };
  const { apiVersion, ...rest } = init ?? {};
  try {
    const res = await fetch(`${CAL_BASE}${path}`, {
      ...rest,
      headers: {
        Authorization: `Bearer ${key}`,
        "cal-api-version": apiVersion ?? "2024-08-13",
        "Content-Type": "application/json",
        ...(rest?.headers ?? {}),
      },
    });
    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
      const msg = (data && (data.error?.message || data.message)) || `Cal.com API ${res.status}`;
      return { ok: false, error: msg, status: res.status };
    }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Cal.com request failed" };
  }
}

export const getCalStatus = createServerFn({ method: "GET" }).handler(async () => {
  return {
    configured: Boolean(process.env.CAL_API_KEY),
    username: process.env.CAL_USERNAME ?? "bmarcpilates",
  };
});

export const getCalEventTypes = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ eventTypes: CalEventType[]; error: string | null }> => {
    const username = process.env.CAL_USERNAME ?? "bmarcpilates";
    // v2 /event-types requires apiVersion 2024-06-14 and a username query param.
    const result = await calFetch(`/event-types?username=${encodeURIComponent(username)}`, { apiVersion: "2024-06-14" });
    if (!result.ok) return { eventTypes: [], error: result.error };
    const raw: any = result.data;
    let list: any[] = [];
    if (Array.isArray(raw?.data)) list = raw.data;
    else if (Array.isArray(raw?.data?.eventTypeGroups))
      list = raw.data.eventTypeGroups.flatMap((g: any) => g.eventTypes ?? []);
    else if (Array.isArray(raw?.eventTypes)) list = raw.eventTypes;
    const eventTypes: CalEventType[] = list.map((e: any) => ({
      id: String(e.id ?? e.uid ?? ""),
      title: String(e.title ?? e.name ?? "Untitled"),
      slug: String(e.slug ?? ""),
      length: typeof e.length === "number" ? e.length : typeof e.lengthInMinutes === "number" ? e.lengthInMinutes : null,
      hidden: Boolean(e.hidden),
      bookingLink: `https://cal.com/${username}/${e.slug ?? ""}`,
    }));
    return { eventTypes, error: null };
  },
);

export const getCalBookings = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ bookings: CalBooking[]; error: string | null }> => {
    const result = await calFetch(`/bookings?take=50`);
    if (!result.ok) return { bookings: [], error: result.error };
    const raw: any = result.data;
    const list: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.bookings) ? raw.bookings : [];
    const bookings: CalBooking[] = list.map((b: any) => ({
      id: String(b.id ?? b.uid ?? ""),
      title: String(b.title ?? b.eventType?.title ?? "Booking"),
      start: b.start ?? b.startTime ?? null,
      end: b.end ?? b.endTime ?? null,
      status: String(b.status ?? "ACCEPTED"),
      attendeeName: b.attendees?.[0]?.name ?? b.user?.name ?? null,
      attendeeEmail: b.attendees?.[0]?.email ?? null,
    }));
    return { bookings, error: null };
  },
);

// Compute event length in minutes from start/end times.
function lengthFromTimes(start?: string | null, end?: string | null): number {
  if (!start || !end) return 60;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return mins > 0 ? mins : 60;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 60) || `event-${Date.now()}`;

export type CreateCalEventInput = {
  title: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  price?: number | null;
};

export type CreateCalEventResult = {
  ok: boolean;
  calEventId: string | null;
  bookingUrl: string | null;
  error: string | null;
};

// Sync an internal event to Cal.com as an Event Type.
// Cal.com Event Types are booking templates (no fixed date); we store the
// concrete date/time in Supabase and use Cal.com purely for the booking link.
export const createCalEventType = createServerFn({ method: "POST" })
  .inputValidator((input: CreateCalEventInput) => input)
  .handler(async ({ data }): Promise<CreateCalEventResult> => {
    const username = process.env.CAL_USERNAME ?? "bmarcpilates";
    const slug = `${slugify(data.title)}-${Math.random().toString(36).slice(2, 6)}`;
    const lengthInMinutes = lengthFromTimes(data.startTime, data.endTime);
    const body: Record<string, unknown> = {
      title: data.title.slice(0, 100),
      slug,
      lengthInMinutes,
      description: (data.description ?? "").slice(0, 500) || undefined,
    };
    if (data.location) {
      body.locations = [{ type: "link", link: data.location, public: true }];
    }
    const res = await calFetch(`/event-types`, { method: "POST", body: JSON.stringify(body) });
    if (!res.ok) {
      return { ok: false, calEventId: null, bookingUrl: null, error: res.error };
    }
    const raw: any = res.data;
    const eventType = raw?.data ?? raw;
    const id = eventType?.id ?? eventType?.uid ?? null;
    const finalSlug = eventType?.slug ?? slug;
    return {
      ok: true,
      calEventId: id ? String(id) : null,
      bookingUrl: `https://cal.com/${username}/${finalSlug}`,
      error: null,
    };
  });
