import { createServerFn } from "@tanstack/react-start";

/**
 * ============================================================
 *  Instagram Graph API — server function
 * ============================================================
 *
 *  Fetches the latest media for the connected Instagram Business
 *  account (@bmarcpilates) using the Meta Graph API.
 *
 *  ENV (server-only, read inside the handler):
 *    - INSTAGRAM_USER_ID        Numeric Business Account ID
 *    - INSTAGRAM_ACCESS_TOKEN   Long-lived Graph API token
 *
 *  When the token is the placeholder `add_token_here` (or missing),
 *  this function returns `{ ok: false, reason: "missing_token" }`
 *  so the UI can render the configured fallback state without
 *  throwing an error.
 *
 *  Future: cache responses for ~15 minutes via setResponseHeaders
 *  once a real token is in place.
 * ============================================================
 */

export type InstagramMediaType = "image" | "carousel" | "reel";

export interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  link: string;
  type: InstagramMediaType;
  date: string;
  alt?: string;
}

export type InstagramFeedResult =
  | { ok: true; posts: InstagramPost[] }
  | { ok: false; reason: "missing_token" | "api_error"; message?: string };

const GRAPH_VERSION = "v21.0";
const FIELDS = [
  "id",
  "media_type",
  "media_url",
  "thumbnail_url",
  "permalink",
  "caption",
  "timestamp",
].join(",");

interface RawMedia {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

function mapType(media_type: RawMedia["media_type"]): InstagramMediaType {
  if (media_type === "VIDEO") return "reel";
  if (media_type === "CAROUSEL_ALBUM") return "carousel";
  return "image";
}

function shortCaption(caption?: string): string {
  if (!caption) return "";
  const firstLine = caption.split("\n")[0]?.trim() ?? "";
  return firstLine.length > 140 ? `${firstLine.slice(0, 137)}…` : firstLine;
}

export const fetchInstagramFeed = createServerFn({ method: "GET" }).handler(
  async (): Promise<InstagramFeedResult> => {
    const userId = process.env.INSTAGRAM_USER_ID;
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!userId || !token || token === "add_token_here") {
      return { ok: false, reason: "missing_token" };
    }

    const url = `https://graph.instagram.com/${GRAPH_VERSION}/${userId}/media?fields=${FIELDS}&limit=12&access_token=${token}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        console.error("Instagram API error", res.status, text);
        return { ok: false, reason: "api_error", message: `HTTP ${res.status}` };
      }
      const json = (await res.json()) as { data?: RawMedia[] };
      const posts: InstagramPost[] = (json.data ?? []).map((m) => ({
        id: m.id,
        image: m.media_url ?? m.thumbnail_url ?? "",
        caption: shortCaption(m.caption),
        link: m.permalink,
        type: mapType(m.media_type),
        date: m.timestamp,
        alt: shortCaption(m.caption),
      }));
      return { ok: true, posts };
    } catch (err) {
      console.error("Instagram fetch failed", err);
      return {
        ok: false,
        reason: "api_error",
        message: err instanceof Error ? err.message : "Unknown error",
      };
    }
  },
);
