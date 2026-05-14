import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://elbjhtnumzyycrqzzgtt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsYmpodG51bXp5eWNycXp6Z3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjQ0OTUsImV4cCI6MjA5NDM0MDQ5NX0.xc2QU3w04v3BVF7PWmbALT284vr9d4gaF_H6xN0tBOA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

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
  created_at: string;
};
