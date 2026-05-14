import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://elbjhtnumzyycrqzzgtt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsYmpodG51bXp5eWNycXp6Z3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjQ0OTUsImV4cCI6MjA5NDM0MDQ5NX0.xc2QU3w04v3BVF7PWmbALT284vr9d4gaF_H6xN0tBOA";

const hasWindow = typeof window !== "undefined";
console.log("[admin-auth] client init", {
  hasWindow,
  storage: hasWindow ? "localStorage" : "none",
});

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: hasWindow ? window.localStorage : undefined,
  },
});

export const SUPABASE_PUBLIC_URL = SUPABASE_URL;

export const MEMBER_STATUSES = [
  "New",
  "Contacted",
  "VIP",
  "Event Attendee",
  "Sponsor Lead",
  "Archived",
] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export type CommunityMember = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  instagram_handle: string | null;
  interests: string[] | null;
  source: string | null;
  consent_marketing: boolean;
  email_consent: boolean;
  sms_consent: boolean;
  sms_opted_out: boolean;
  opted_out_at: string | null;
  consent_timestamp: string | null;
  status: MemberStatus;
  notes: string | null;
  created_at: string;
};

export const CONTENT_TYPES = [
  "Community Update",
  "Pilates Education",
  "Wellness Tips",
  "Event Announcement",
  "Sponsor Feature",
  "Founder Note",
  "Behind The Scenes",
  "Lifestyle Post",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number] | string;

export const AUDIENCE_OPTIONS = [
  "All Members",
  "Pilates Event Members",
  "Beginner Pilates",
  "Online Classes",
  "VIP",
  "Sponsor Leads",
  "Wellness Community",
] as const;
export type AudienceOption = (typeof AUDIENCE_OPTIONS)[number] | string;

export const POST_STATUSES = ["Draft", "Scheduled", "Published", "Archived"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export type ContentPost = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  body: unknown; // Tiptap JSON
  featured_image_url: string | null;
  gallery_images: string[] | null;
  content_type: ContentType;
  audience: AudienceOption;
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export async function trackBookingClick(label: string) {
  try {
    await supabase.from("booking_clicks").insert({
      event_label: label.slice(0, 200),
      source_path: typeof window !== "undefined" ? window.location.pathname : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 400) : null,
    });
  } catch {
    // silent — analytics shouldn't block UX
  }
}
