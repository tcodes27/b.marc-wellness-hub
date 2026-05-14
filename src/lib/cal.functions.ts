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

async function calFetch(path: string): Promise<{ ok: true; data: any } | { ok: false; error: string }> {
  const key = process.env.CAL_API_KEY;
  if (!key) return { ok: false, error: "CAL_API_KEY not configured" };
  try {
    const res = await fetch(`${CAL_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        "cal-api-version": "2024-08-13",
      },
    });
    if (!res.ok) return { ok: false, error: `Cal.com API ${res.status}` };
    return { ok: true, data: await res.json() };
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
    const result = await calFetch(`/event-types?username=${encodeURIComponent(username)}`);
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
