// Official Uscreen membership URL for B.MARC Pilates.
// Replace this value with the live Uscreen URL when provided.
export const USCREEN_MEMBERSHIP_URL = "https://bmarcpilates.uscreen.io";

export function goToUscreen() {
  if (typeof window === "undefined") return;
  window.open(USCREEN_MEMBERSHIP_URL, "_blank", "noopener,noreferrer");
}
