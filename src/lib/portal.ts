import { supabase } from "@/integrations/supabase/client";
import type { VideoAccessLevel, VideoLibraryEntry } from "@/lib/youtube";

export type AccountType = "demo" | "customer" | "admin" | "member";
export type MemberTier = VideoAccessLevel; // 'public' | 'community' | 'signature' | 'all-access'
export const MEMBER_TIERS: MemberTier[] = ["public", "community", "signature", "all-access"];

export const TIER_LABEL: Record<MemberTier, string> = {
  "public": "Public",
  "community": "Community Access",
  "signature": "Signature Member",
  "all-access": "All Access",
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  account_type: AccountType;
  member_tier: MemberTier;
  is_test_account: boolean;
  community_status: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRegistration = {
  id: string;
  user_id: string;
  event_id: string;
  status: "registered" | "attended" | "cancelled";
  is_test_account: boolean;
  created_at: string;
};

const siteOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : "";

export async function signUpEmail(email: string, password: string, fullName: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteOrigin()}/portal`,
      data: { full_name: fullName },
    },
  });
}

export async function signInEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteOrigin()}/portal` },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function upsertOwnProfile(userId: string, email: string | null) {
  // Safety net if the trigger didn't fire (e.g. older auth users).
  return supabase.from("profiles").upsert(
    { id: userId, email, account_type: "customer", is_test_account: false },
    { onConflict: "id", ignoreDuplicates: true }
  );
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>
) {
  return supabase.from("profiles").update(patch).eq("id", userId).select().single();
}

export async function listMyRegistrations(userId: string) {
  return supabase
    .from("event_registrations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

/**
 * List videos the current viewer is allowed to see.
 *
 * RLS on `video_library` enforces:
 *   - anon → only access_level='public', is_active=true
 *   - authenticated → rows where can_access_video(uid, access_level) is true
 *
 * So this query is safe to call from any client — the database returns
 * exactly the rows (and the `private_link`) the caller is entitled to.
 */
export async function listAccessibleVideos(): Promise<{
  data: VideoLibraryEntry[] | null;
  error: { message: string } | null;
}> {
  const { data, error } = await supabase
    .from("video_library_preview")
    .select("id,title,description,url,playlist_url,thumbnail_url,private_link,category,tags,access_level,sort_order,has_access")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);
  return {
    data: (data as VideoLibraryEntry[] | null) ?? null,
    error: error ? { message: error.message } : null,
  };
}

/** Public-only video feed for the marketing site (no auth needed). */
export async function listPublicVideos(limit = 6): Promise<VideoLibraryEntry[]> {
  const { data } = await supabase
    .from("video_library")
    .select("id,title,description,url,playlist_url,thumbnail_url,category,tags,access_level,sort_order")
    .eq("is_active", true)
    .eq("access_level", "public")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as VideoLibraryEntry[] | null) ?? [];
}

export async function listMemberContent() {
  return supabase
    .from("content_posts")
    .select("id,title,subtitle,slug,featured_image_url,published_at,visibility,content_type")
    .eq("status", "Published")
    .in("visibility", ["public", "members"])
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(50);
}
