// Canonical audience tags for content distribution targeting.
// Used by the Content Studio editor and the recipient resolver.

export const AUDIENCE_TAGS = [
  "All Members",
  "Pilates Events",
  "Wellness Community",
  "Online Classes",
  "Beginner Pilates",
  "Brand Updates",
  "Sponsorship/Collaboration",
  "VIP Members",
  "Event Attendees",
  "Sponsor Leads",
] as const;

export type AudienceTag = (typeof AUDIENCE_TAGS)[number];

// Tags that match against community_members.status (not interests)
export const STATUS_TAGS: Record<string, string> = {
  "VIP Members": "VIP",
  "Event Attendees": "Event Attendee",
  "Sponsor Leads": "Sponsor Lead",
};

// Normalized lookup against the join-form interest labels (which use
// sentence case). The audience tag list above uses Title Case for display.
const INTEREST_TAG_MAP: Record<string, string> = {
  "Pilates Events": "Pilates events",
  "Wellness Community": "Wellness community",
  "Online Classes": "Online classes",
  "Beginner Pilates": "Beginner Pilates",
  "Brand Updates": "Brand updates",
  "Sponsorship/Collaboration": "Sponsorship/collaboration",
};

export function tagToInterest(tag: string): string | null {
  return INTEREST_TAG_MAP[tag] ?? null;
}

export function isAllMembers(tags: string[]): boolean {
  return tags.includes("All Members");
}
