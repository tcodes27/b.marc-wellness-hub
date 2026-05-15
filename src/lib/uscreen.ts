import { integrations } from "@/config/integrations";

/**
 * Uscreen storefront URL. Sourced from `src/config/integrations.ts`
 * so a rebrand only needs to update the config, not this file.
 */
export const USCREEN_MEMBERSHIP_URL = integrations.uscreen.storefrontUrl ?? "#";

export function goToUscreen() {
  if (typeof window === "undefined") return;
  if (!integrations.uscreen.enabled || !integrations.uscreen.storefrontUrl) return;
  window.open(USCREEN_MEMBERSHIP_URL, "_blank", "noopener,noreferrer");
}
