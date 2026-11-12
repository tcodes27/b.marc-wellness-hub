import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MEMBER_TIERS, TIER_LABEL, type MemberTier, type Profile } from "@/lib/portal";
import { Search, Loader2, Crown, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/portal-members")({
  head: () => ({ meta: [{"title": "Member Access \u2014 B.MARC Pilates"}, {"name": "description", "content": "Explore Member Access at B.MARC Pilates, a movement and wellness community."}, {"property": "og:title", "content": "Member Access \u2014 B.MARC Pilates"}, {"property": "og:description", "content": "Explore Member Access at B.MARC Pilates, a movement and wellness community."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary_large_image"}, {"name": "robots", "content": "noindex, nofollow"}] }),
  component: PortalMembersAdmin,
});

const TIER_BADGE: Record<MemberTier, string> = {
  "public": "bg-stone-200 text-stone-700",
  "community": "bg-tan/30 text-espresso",
  "signature": "bg-espresso text-ivory",
  "all-access": "bg-gradient-to-r from-tan to-clay text-ivory",
};

function PortalMembersAdmin() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | MemberTier>("all");

  const load = async () => {
    setLoading(true); setErr(null);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setErr(error.message);
    else setRows((data ?? []) as Profile[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const setTier = async (p: Profile, tier: MemberTier) => {
    const { error } = await supabase.from("profiles").update({ member_tier: tier }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${p.email ?? "Member"} → ${TIER_LABEL[tier]}`);
    setRows((rs) => rs.map((r) => r.id === p.id ? { ...r, member_tier: tier } : r));
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) =>
      (filter === "all" || r.member_tier === filter) &&
      (!term ||
        (r.email ?? "").toLowerCase().includes(term) ||
        (r.full_name ?? "").toLowerCase().includes(term)),
    );
  }, [rows, q, filter]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Portal Access</p>
        <h1 className="font-serif text-3xl mt-2">Member tier management</h1>
        <p className="text-sm text-clay mt-1 max-w-xl">
          Grant signed-in members access to gated YouTube classes. Tier changes
          take effect immediately and are enforced by the database.
        </p>
      </div>

      <div className="bg-white border border-tan/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-3 border-b border-tan/20 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-clay" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…"
              className="w-full rounded-lg border border-tan/40 pl-9 pr-3 py-2 text-sm bg-ivory focus:outline-none focus:border-espresso" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-lg border border-tan/40 px-3 py-2 text-sm bg-ivory">
            <option value="all">All tiers</option>
            {MEMBER_TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>
        ) : err ? (
          <div className="p-6 text-rose-700 bg-rose-50 text-sm inline-flex gap-2"><AlertCircle size={14} /> {err}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-clay text-sm">No matching members.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-clay text-[0.65rem] uppercase tracking-[0.2em]">
              <tr>
                <th className="text-left font-medium px-4 py-3">Member</th>
                <th className="text-left font-medium px-4 py-3">Email</th>
                <th className="text-left font-medium px-4 py-3">Tier</th>
                <th className="text-left font-medium px-4 py-3">Change</th>
                <th className="text-left font-medium px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-tan/15">
                  <td className="px-4 py-3 text-espresso">
                    {p.full_name || "—"}
                    {p.is_test_account && <span className="ml-2 text-[0.6rem] uppercase tracking-[0.2em] bg-amber-200 text-amber-900 px-2 py-0.5 rounded">demo</span>}
                  </td>
                  <td className="px-4 py-3 text-clay">{p.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.25em] px-3 py-1.5 rounded-full ${TIER_BADGE[p.member_tier]}`}>
                      <Crown size={11} /> {TIER_LABEL[p.member_tier]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={p.member_tier} onChange={(e) => void setTier(p, e.target.value as MemberTier)}
                      className="rounded-lg border border-tan/40 px-2 py-1.5 text-xs bg-white">
                      {MEMBER_TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-clay text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="p-3 text-xs text-clay border-t border-tan/20">{filtered.length} of {rows.length}</div>
      </div>
    </div>
  );
}
