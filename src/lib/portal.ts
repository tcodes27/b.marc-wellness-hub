import { supabase } from "@/integrations/supabase/client";

export type AccountType = "demo" | "customer" | "admin" | "member";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  account_type: AccountType;
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

export async function listMemberContent() {
  return supabase
    .from("content_posts")
    .select("id,title,subtitle,slug,featured_image_url,published_at,visibility,content_type")
    .eq("status", "Published")
    .in("visibility", ["public", "members"])
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(50);
}
