import { supabase, type CommunityMember } from "@/integrations/supabase/client";
import { AUDIENCE_TAGS, STATUS_TAGS, isAllMembers, tagToInterest } from "./audience-tags";

export type DeliveryChannel = "email" | "sms";

export type RecipientBreakdown = {
  total: number;          // unique members matched by audience
  email: number;          // matched + email-eligible
  sms: number;            // matched + sms-eligible
  members: CommunityMember[];
};

/**
 * Resolves which community members match the selected audience tags,
 * and how many are eligible for each delivery channel given consent rules.
 *
 * Eligibility:
 *  - Email: email_consent = true AND email is set
 *  - SMS:   sms_consent = true AND sms_opted_out = false AND phone is set
 */
export async function resolveRecipients(audienceTags: string[]): Promise<RecipientBreakdown> {
  if (audienceTags.length === 0) {
    return { total: 0, email: 0, sms: 0, members: [] };
  }

  const { data, error } = await supabase
    .from("community_members")
    .select("*");

  if (error || !data) {
    console.error("[recipients] query error:", error);
    return { total: 0, email: 0, sms: 0, members: [] };
  }

  const members = data as CommunityMember[];
  const all = isAllMembers(audienceTags);

  const matched = members.filter((m) => {
    if (all) return true;
    for (const tag of audienceTags) {
      if (tag === "All Members") return true;
      const status = STATUS_TAGS[tag];
      if (status && m.status === status) return true;
      const interest = tagToInterest(tag);
      if (interest && Array.isArray(m.interests) && m.interests.includes(interest)) return true;
    }
    return false;
  });

  const email = matched.filter((m) => m.email && (m as any).email_consent).length;
  const sms = matched.filter(
    (m) => m.phone && (m as any).sms_consent && !(m as any).sms_opted_out,
  ).length;

  return { total: matched.length, email, sms, members: matched };
}

export { AUDIENCE_TAGS };
