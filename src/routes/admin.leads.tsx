import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, type CommunityMember } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/leads")({
  component: LeadsPage,
});

const KNOWN_INTERESTS = [
  "Pilates events",
  "Wellness community",
  "Online classes",
  "Beginner Pilates",
  "Brand updates",
  "Sponsorship/collaboration",
];

function LeadsPage() {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error, count } = await supabase
      .from("community_members")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    console.log("[admin/leads] fetch", {
      count,
      returned: data?.length ?? 0,
      error: error?.message ?? null,
    });
    if (error) {
      setLoadError(error.message);
      setMembers([]);
    } else {
      setMembers((data ?? []) as CommunityMember[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    KNOWN_INTERESTS.forEach((k) => map.set(k, 0));
    members.forEach((m) =>
      (m.interests ?? []).forEach((i) => map.set(i, (map.get(i) ?? 0) + 1)),
    );
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [members]);

  const matching = useMemo(() => {
    if (!active) return [];
    return members.filter((m) => (m.interests ?? []).includes(active));
  }, [active, members]);

  const totalTagged = useMemo(
    () => members.reduce((acc, m) => acc + (m.interests?.length ?? 0), 0),
    [members],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow">Segments</p>
          <h1 className="font-serif text-3xl mt-2">Leads · Interest Tags</h1>
          <p className="text-xs text-clay mt-1">
            {members.length} member{members.length === 1 ? "" : "s"} · {totalTagged} interest selection
            {totalTagged === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={fetchMembers}
          className="text-xs uppercase tracking-[0.2em] text-clay hover:text-espresso border border-tan/40 rounded-full px-4 py-2"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-clay">
          <Loader2 size={14} className="animate-spin" /> Loading members…
        </div>
      )}

      {loadError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">Failed to load members</div>
            <div className="text-xs mt-1">{loadError}</div>
          </div>
        </div>
      )}

      {!loading && !loadError && members.length === 0 && (
        <div className="bg-sand/40 border border-tan/30 rounded-2xl p-6 text-sm text-clay">
          No community members yet. Once people fill out the “Join the B.MARC Community” form,
          their interest selections will appear here as tag counts.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {counts.map(([name, count]) => (
          <button
            key={name}
            onClick={() => setActive(name)}
            className={`text-left bg-white border rounded-2xl p-5 shadow-sm transition-all ${
              active === name ? "border-espresso ring-1 ring-espresso" : "border-tan/30 hover:border-tan"
            }`}
          >
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-clay">{name}</div>
            <div className="mt-2 font-serif text-3xl">{count}</div>
            <div className="mt-1 text-xs text-clay">members</div>
          </button>
        ))}
      </div>

      {active && (
        <div className="bg-white border border-tan/30 rounded-2xl shadow-sm">
          <div className="px-5 py-4 border-b border-tan/20 flex justify-between items-center">
            <h2 className="font-serif text-lg">Members interested in “{active}”</h2>
            <button onClick={() => setActive(null)} className="text-xs uppercase tracking-[0.2em] text-clay">
              Clear
            </button>
          </div>
          {matching.length === 0 ? (
            <p className="p-5 text-sm text-clay">No matching members.</p>
          ) : (
            <ul className="divide-y divide-tan/20">
              {matching.map((m) => (
                <li key={m.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm">
                      {m.first_name} {m.last_name}
                    </div>
                    <div className="text-xs text-clay">
                      {m.email}
                      {m.city ? ` · ${m.city}` : ""}
                    </div>
                  </div>
                  <Link
                    to="/admin/members"
                    className="text-xs uppercase tracking-[0.2em] text-clay hover:text-espresso"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
