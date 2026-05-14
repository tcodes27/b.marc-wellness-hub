import { createServerFn } from "@tanstack/react-start";

const CAL_BASE = "https://api.cal.com/v2";

async function calFetch(path: string) {
  const key = process.env.CAL_API_KEY;
  if (!key) return { ok: false as const, status: 0, error: "CAL_API_KEY not configured" };
  const res = await fetch(`${CAL_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      "cal-api-version": "2024-08-13",
    },
  });
  if (!res.ok) {
    return { ok: false as const, status: res.status, error: `Cal.com API ${res.status}` };
  }
  const json = await res.json();
  return { ok: true as const, data: json };
}

export const getCalStatus = createServerFn({ method: "GET" }).handler(async () => {
  return {
    configured: Boolean(process.env.CAL_API_KEY),
    username: process.env.CAL_USERNAME ?? "bmarcpilates",
  };
});

export const getCalEventTypes = createServerFn({ method: "GET" }).handler(async () => {
  const username = process.env.CAL_USERNAME ?? "bmarcpilates";
  const result = await calFetch(`/event-types?username=${encodeURIComponent(username)}`);
  if (!result.ok) return { eventTypes: [] as Array<Record<string, unknown>>, error: result.error };
  // v2 wraps data as { status, data: { eventTypeGroups: [...] } } or { data: [...] }
  // Normalize defensively.
  const raw: any = result.data;
  let list: any[] = [];
  if (Array.isArray(raw?.data)) {
    list = raw.data;
  } else if (Array.isArray(raw?.data?.eventTypeGroups)) {
    list = raw.data.eventTypeGroups.flatMap((g: any) => g.eventTypes ?? []);
  } else if (Array.isArray(raw?.eventTypes)) {
    list = raw.eventTypes;
  }
  const eventTypes = list.map((e: any) => ({
    id: String(e.id ?? e.uid ?? ""),
    title: e.title ?? e.name ?? "Untitled",
    slug: e.slug ?? "",
    length: e.length ?? e.lengthInMinutes ?? null,
    hidden: Boolean(e.hidden),
    bookingLink: `https://cal.com/${username}/${e.slug ?? ""}`,
  }));
  return { eventTypes, error: null as string | null };
});

export const getCalBookings = createServerFn({ method: "GET" }).handler(async () => {
  const result = await calFetch(`/bookings?take=50`);
  if (!result.ok) return { bookings: [] as Array<Record<string, unknown>>, error: result.error };
  const raw: any = result.data;
  const list: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.bookings) ? raw.bookings : [];
  const bookings = list.map((b: any) => ({
    id: String(b.id ?? b.uid ?? ""),
    title: b.title ?? b.eventType?.title ?? "Booking",
    start: b.start ?? b.startTime ?? null,
    end: b.end ?? b.endTime ?? null,
    status: b.status ?? "ACCEPTED",
    attendeeName: b.attendees?.[0]?.name ?? b.user?.name ?? null,
    attendeeEmail: b.attendees?.[0]?.email ?? null,
  }));
  return { bookings, error: null as string | null };
});
