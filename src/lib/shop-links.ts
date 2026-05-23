/**
 * Mobile-first link resolver for affiliate shop items.
 *
 * Picks the best URL based on the visitor's environment and appends UTM
 * tracking. Designed to maximize affiliate attribution and minimize broken
 * redirects when traffic arrives from in-app browsers (Instagram, TikTok,
 * Pinterest, YouTube).
 */

export type ShopLinkFields = {
  regular_url?: string | null;
  mobile_deep_link?: string | null;
  app_link?: string | null;
  fallback_url?: string | null;
  affiliate_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  open_behavior?: string | null; // new_tab | same_tab | app_first
  platform?: string | null;
};

export type Env = {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  inApp: "instagram" | "tiktok" | "pinterest" | "youtube" | "facebook" | null;
};

export function detectEnv(ua: string | undefined | null): Env {
  const u = (ua ?? "").toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(u);
  const isAndroid = /android/.test(u);
  const isMobile = isIOS || isAndroid || /mobile/.test(u);

  let inApp: Env["inApp"] = null;
  if (/instagram/.test(u)) inApp = "instagram";
  else if (/tiktok|musical_ly|bytedancewebview/.test(u)) inApp = "tiktok";
  else if (/pinterest/.test(u)) inApp = "pinterest";
  else if (/youtube/.test(u)) inApp = "youtube";
  else if (/fban|fbav|fb_iab/.test(u)) inApp = "facebook";

  return { isMobile, isIOS, isAndroid, inApp };
}

function appendUtm(url: string, link: ShopLinkFields): string {
  try {
    const u = new URL(url);
    if (link.utm_source && !u.searchParams.has("utm_source"))
      u.searchParams.set("utm_source", link.utm_source);
    if (link.utm_medium && !u.searchParams.has("utm_medium"))
      u.searchParams.set("utm_medium", link.utm_medium);
    if (link.utm_campaign && !u.searchParams.has("utm_campaign"))
      u.searchParams.set("utm_campaign", link.utm_campaign);
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Resolve the best target URL. Priority:
 *   1. app_link if env is mobile and open_behavior is app_first
 *   2. mobile_deep_link if mobile
 *   3. affiliate_url
 *   4. fallback_url
 *   5. regular_url
 */
export function resolveShopUrl(link: ShopLinkFields, env: Env): string | null {
  const candidates: Array<string | null | undefined> = [];

  if (env.isMobile && link.open_behavior === "app_first" && link.app_link) {
    candidates.push(link.app_link);
  }
  if (env.isMobile && link.mobile_deep_link) {
    candidates.push(link.mobile_deep_link);
  }
  candidates.push(link.affiliate_url);
  candidates.push(link.fallback_url);
  candidates.push(link.regular_url);

  const chosen = candidates.find((c) => typeof c === "string" && c.trim().length > 0);
  if (!chosen) return null;
  return appendUtm(chosen, link);
}

/**
 * Client-side click handler. Opens the resolved URL with the safest behavior
 * for the current browser. In-app browsers (Instagram, TikTok) need
 * `window.location` rather than `window.open` because pop-ups are blocked.
 */
export function openShopLink(link: ShopLinkFields) {
  if (typeof window === "undefined") return;
  const env = detectEnv(navigator.userAgent);
  const url = resolveShopUrl(link, env);
  if (!url) return;

  // In-app browsers: target=_blank often silently fails — use top-level nav.
  if (env.inApp) {
    window.location.href = url;
    return;
  }

  if (link.open_behavior === "same_tab") {
    window.location.href = url;
    return;
  }

  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) window.location.href = url;
}
