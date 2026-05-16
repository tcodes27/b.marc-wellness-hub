import { supabase } from "@/integrations/supabase/client";

export async function seedDemoData() {
  const results: { table: string; ok: boolean; error?: string }[] = [];

  // Demo community member
  {
    const { error } = await supabase.from("community_members").insert({
      first_name: "Demo",
      last_name: "Member",
      email: `demo+${Date.now()}@bmarc.test`,
      consent_marketing: true,
      email_consent: true,
      sms_consent: false,
      status: "New",
      source: "demo-seed",
      is_test_account: true,
    });
    results.push({ table: "community_members", ok: !error, error: error?.message });
  }

  // Demo event
  {
    const { error } = await supabase.from("events").insert({
      title: "[DEMO] Reformer Class",
      description: "Sample event seeded for testing.",
      starts_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      is_test_account: true,
    });
    results.push({ table: "events", ok: !error, error: error?.message });
  }

  // Demo content post
  {
    const slug = `demo-post-${Date.now()}`;
    const { error } = await supabase.from("content_posts").insert({
      title: "[DEMO] Welcome to B.MARC",
      slug,
      content_type: "Community Update",
      audience: "All Members",
      status: "Published",
      visibility: "members",
      body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Demo content for portal preview." }] }] },
      published_at: new Date().toISOString(),
      audience_tags: [],
      delivery_channels: [],
      media_images: [],
      media_videos: [],
      media_audio: [],
      send_status: "draft",
      is_test_account: true,
    });
    results.push({ table: "content_posts", ok: !error, error: error?.message });
  }

  return results;
}

export async function clearDemoData() {
  const tables = ["event_registrations", "content_posts", "events", "community_members"];
  const results: { table: string; deleted: number; error?: string }[] = [];
  for (const t of tables) {
    const { error, count } = await supabase
      .from(t)
      .delete({ count: "exact" })
      .eq("is_test_account", true);
    results.push({ table: t, deleted: count ?? 0, error: error?.message });
  }
  return results;
}
