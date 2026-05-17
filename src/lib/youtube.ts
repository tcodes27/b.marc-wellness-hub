/**
 * ============================================================================
 *  YOUTUBE — primary video / class library platform for B.MARC Pilates.
 * ============================================================================
 *
 *  Free / public Pilates and wellness content lives on the public YouTube
 *  channel. Paid / member-only content is distributed as private or
 *  unlisted YouTube links, surfaced through the member portal.
 *
 *  This module is the single source of truth for:
 *    - the channel URL
 *    - playlist + video URL builders
 *    - embed URL helpers
 *    - ID extraction from arbitrary YouTube URLs
 *    - the "open the channel" CTA used by membership/journey buttons
 * ============================================================================
 */

import { integrations } from "@/config/integrations";

export const YOUTUBE_CHANNEL_ID = "UCUafiWbOwgWI7OuRCC7XSDQ";
export const YOUTUBE_HANDLE = "bmarcpilates";
export const YOUTUBE_CHANNEL_URL = `https://www.youtube.com/@${YOUTUBE_HANDLE}`;
export const YOUTUBE_CHANNEL_URL_BY_ID = `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`;

/** Public channel destinations the membership CTAs can route to. */
export const YOUTUBE_DESTINATIONS = {
  channel: YOUTUBE_CHANNEL_URL,
  videos: `${YOUTUBE_CHANNEL_URL}/videos`,
  playlists: `${YOUTUBE_CHANNEL_URL}/playlists`,
  featured: `${YOUTUBE_CHANNEL_URL}/featured`,
} as const;

export type YouTubeDestination = keyof typeof YOUTUBE_DESTINATIONS;

/** Open the channel (or a specific destination) in a new tab. */
export function goToYouTube(destination: YouTubeDestination = "channel") {
  if (typeof window === "undefined") return;
  if (!integrations.youtube.enabled) return;
  const url = YOUTUBE_DESTINATIONS[destination] ?? YOUTUBE_CHANNEL_URL;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Extract a video ID from any common YouTube URL shape. */
export function extractVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  // Already an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {
    // not a URL
  }
  return null;
}

/** Extract a playlist ID from any common YouTube URL. */
export function extractPlaylistId(input: string): string | null {
  if (!input) return null;
  try {
    const u = new URL(input.trim());
    return u.searchParams.get("list");
  } catch {
    return null;
  }
}

/** Build the canonical watch URL. */
export function videoUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Build the canonical playlist URL. */
export function playlistUrl(id: string): string {
  return `https://www.youtube.com/playlist?list=${id}`;
}

/**
 * Build an embed URL. Works for both public and unlisted videos.
 * Private videos cannot be embedded — they must be opened on YouTube
 * by the signed-in member who has been granted access.
 */
export function embedVideoUrl(idOrUrl: string, opts: { autoplay?: boolean; controls?: boolean } = {}): string | null {
  const id = extractVideoId(idOrUrl);
  if (!id) return null;
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    ...(opts.autoplay ? { autoplay: "1" } : {}),
    ...(opts.controls === false ? { controls: "0" } : {}),
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function embedPlaylistUrl(idOrUrl: string): string | null {
  const id = extractPlaylistId(idOrUrl) ?? (/^PL[a-zA-Z0-9_-]+$/.test(idOrUrl) ? idOrUrl : null);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${id}&rel=0&modestbranding=1`;
}

/** Best-effort thumbnail URL for a given video. */
export function videoThumbnail(idOrUrl: string, quality: "default" | "hq" | "max" = "hq"): string | null {
  const id = extractVideoId(idOrUrl);
  if (!id) return null;
  const map = { default: "hqdefault", hq: "hqdefault", max: "maxresdefault" } as const;
  return `https://i.ytimg.com/vi/${id}/${map[quality]}.jpg`;
}

/**
 * Access levels for the future-ready protected video library.
 * Mirrors the planned `video_library.access_level` column.
 */
export type VideoAccessLevel = "public" | "community" | "signature" | "all-access";

export type VideoLibraryEntry = {
  id: string;
  title: string;
  url: string;
  playlist_url?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  tags?: string[];
  access_level: VideoAccessLevel;
  private_link?: string | null;
};
