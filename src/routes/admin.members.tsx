import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useAdmin, ADMIN_STATUS_COLORS, ALL_MEMBER_STATUSES } from "./admin";
import { supabase, type CommunityMember, type MemberStatus } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/members")({
  component: MembersPage,
});

function MembersPage() {
  const { members, reloadMembers } = useAdmin();
  const [search, setSearch] = useState("");
  const [interestFilter, setInterestFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MemberStatus>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selected, setSelected] = useState<CommunityMember | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setNotesDraft(selected?.notes ?? "");
  }, [selected?.id, selected?.notes]);

  const allInterests = useMemo(() => {
    const s = new Set<string>();
    members.forEach((m) => (m.interests ?? []).forEach((i) => s.add(i)));
    return Array.from(s).sort();
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = members.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (interestFilter !== "all" && !(m.interests ?? []).includes(interestFilter)) return false;
      if (!q) return true;
      return (
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.city ?? "").toLowerCase().includes(q) ||
        (m.instagram_handle ?? "").toLowerCase().includes(q)
      );
    });
    list.sort((a, b) =>
      sort === "newest"
        ? +new Date(b.created_at) - +new Date(a.created_at)
        : +new Date(a.created_at) - +new Date(b.created_at),
    );
    return list;
  }, [members, search, interestFilter, statusFilter, sort]);

  const updateStatus = async (m: CommunityMember, status: MemberStatus) => {
    await supabase.from("community_members").update({ status }).eq("id", m.id);
    if (selected?.id === m.id) setSelected({ ...m, status });
    await reloadMembers();
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    await supabase.from("community_members").update({ notes: notesDraft || null }).eq("id", selected.id);
    setSavingNotes(false);
    setSelected({ ...selected, notes: notesDraft || null });
    await reloadMembers();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Community</p>
        <h1 className="font-serif text-3xl mt-2">Community Members</h1>
      </div>

      <div className="bg-white border border-tan/30 rounded-2xl shadow-sm">
        <div className="p-4 border-b border-tan/20 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-clay" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, city, IG…"
              className="w-full rounded-lg border border-tan/40 pl-9 pr-3 py-2 text-sm bg-ivory focus:outline-none focus:border-espresso"
            />
          </div>
          <select
            value={interestFilter}
            onChange={(e) => setInterestFilter(e.target.value)}
            className="rounded-lg border border-tan/40 px-3 py-2 text-sm bg-ivory"
          >
            <option value="all">All interests</option>
            {allInterests.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | MemberStatus)}
            className="rounded-lg border border-tan/40 px-3 py-2 text-sm bg-ivory"
          >
            <option value="all">All statuses</option>
            {ALL_MEMBER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="rounded-lg border border-tan/40 px-3 py-2 text-sm bg-ivory"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-clay text-[0.65rem] uppercase tracking-[0.2em]">
              <tr>
                <Th>Name</Th><Th>Email</Th><Th>City</Th><Th>Status</Th><Th>Interests</Th><Th>Joined</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-clay">No members match.</td></tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} onClick={() => setSelected(m)} className="border-t border-tan/15 hover:bg-sand/30 cursor-pointer">
                    <Td>{m.first_name} {m.last_name}</Td>
                    <Td>{m.email}</Td>
                    <Td>{m.city ?? "—"}</Td>
                    <Td>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${ADMIN_STATUS_COLORS[m.status] ?? "bg-sand"}`}>
                        {m.status}
                      </span>
                    </Td>
                    <Td>{(m.interests ?? []).slice(0, 2).join(", ") || "—"}{(m.interests?.length ?? 0) > 2 ? "…" : ""}</Td>
                    <Td>{new Date(m.created_at).toLocaleDateString()}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 text-xs text-clay border-t border-tan/15">
          Showing {filtered.length} of {members.length}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-espresso/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-ivory h-full overflow-y-auto p-6 border-l border-tan/30">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-xl">{selected.first_name} {selected.last_name}</h2>
                <p className="text-sm text-clay">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-clay hover:text-espresso text-sm">Close</button>
            </div>

            <div className="mt-6">
              <label className="block text-[10px] uppercase tracking-[0.25em] text-clay mb-2">Status</label>
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected, e.target.value as MemberStatus)}
                className="w-full rounded-lg border border-tan/40 px-3 py-2 text-sm bg-white"
              >
                {ALL_MEMBER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <Row label="Phone" value={selected.phone ?? "—"} />
              <Row label="City" value={selected.city ?? "—"} />
              <Row label="Instagram" value={selected.instagram_handle ?? "—"} />
              <Row label="Source" value={selected.source ?? "—"} />
              <Row label="Marketing consent" value={selected.consent_marketing ? "Yes" : "No"} />
              <Row label="Interests" value={(selected.interests ?? []).join(", ") || "—"} />
              <Row label="Joined" value={new Date(selected.created_at).toLocaleString()} />
            </dl>

            <div className="mt-6">
              <label className="block text-[10px] uppercase tracking-[0.25em] text-clay mb-2">Internal notes</label>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-tan/40 px-3 py-2 text-sm bg-white focus:outline-none focus:border-espresso"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={saveNotes}
                  disabled={savingNotes || (notesDraft || "") === (selected.notes ?? "")}
                  className="rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5 disabled:opacity-50"
                >
                  {savingNotes ? "Saving…" : "Save notes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium px-4 py-3">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-espresso">{children}</td>;
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.25em] text-clay">{label}</dt>
      <dd className="mt-1 text-espresso">{value}</dd>
    </div>
  );
}
