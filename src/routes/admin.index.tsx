import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase, type CommunityMember } from "@/integrations/supabase/client";
import { LogOut, Search, Download, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard, B.MARC Pilates" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [consentFilter, setConsentFilter] = useState<"all" | "yes" | "no">("all");
  const [selected, setSelected] = useState<CommunityMember | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      const userId = sessionData.session.user.id;
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (!roleRow) {
        setIsAdmin(false);
        setAuthChecked(true);
        return;
      }
      setIsAdmin(true);
      setAuthChecked(true);
      void loadMembers();
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) navigate({ to: "/admin/login" });
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const loadMembers = async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from("community_members")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }
    setMembers((data ?? []) as CommunityMember[]);
    setLoading(false);
  };

  const sources = useMemo(() => {
    const s = new Set<string>();
    members.forEach((m) => m.source && s.add(m.source));
    return Array.from(s).sort();
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (sourceFilter !== "all" && (m.source ?? "") !== sourceFilter) return false;
      if (consentFilter === "yes" && !m.consent_marketing) return false;
      if (consentFilter === "no" && m.consent_marketing) return false;
      if (!q) return true;
      return (
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.city ?? "").toLowerCase().includes(q) ||
        (m.instagram_handle ?? "").toLowerCase().includes(q)
      );
    });
  }, [members, search, sourceFilter, consentFilter]);

  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return {
      total: members.length,
      newThisWeek: members.filter((m) => new Date(m.created_at).getTime() >= weekAgo).length,
      consented: members.filter((m) => m.consent_marketing).length,
    };
  }, [members]);

  const exportCsv = () => {
    const headers = [
      "id","first_name","last_name","email","phone","city","instagram_handle","interests","source","consent_marketing","created_at",
    ];
    const rows = filtered.map((m) => [
      m.id, m.first_name, m.last_name, m.email,
      m.phone ?? "", m.city ?? "", m.instagram_handle ?? "",
      (m.interests ?? []).join("; "),
      m.source ?? "",
      m.consent_marketing ? "yes" : "no",
      m.created_at,
    ]);
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map((c) => escape(String(c))).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bmarc-community-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center bg-white border border-slate-200 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-slate-900">Not authorized</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your account doesn't have admin access. Contact the site owner to be granted the admin role.
          </p>
          <button
            onClick={signOut}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white text-sm px-4 py-2"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">B.MARC Admin</h1>
            <p className="text-xs text-slate-500">Community Management</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total members" value={stats.total} />
          <StatCard label="New this week" value={stats.newThisWeek} />
          <StatCard label="Marketing consented" value={stats.consented} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, city, IG…"
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="all">All sources</option>
                {sources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={consentFilter}
                onChange={(e) => setConsentFilter(e.target.value as "all" | "yes" | "no")}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="all">All consent</option>
                <option value="yes">Consented</option>
                <option value="no">Not consented</option>
              </select>
            </div>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white text-sm px-4 py-2 hover:bg-slate-800"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : loadError ? (
            <div className="p-6 text-sm text-red-600">{loadError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                  <tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>City</Th>
                    <Th>Source</Th>
                    <Th>Interests</Th>
                    <Th>Consent</Th>
                    <Th>Joined</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No members match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() => setSelected(m)}
                        className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                      >
                        <Td>{m.first_name} {m.last_name}</Td>
                        <Td>{m.email}</Td>
                        <Td>{m.city ?? "—"}</Td>
                        <Td>{m.source ?? "—"}</Td>
                        <Td>{(m.interests ?? []).slice(0, 2).join(", ") || "—"}{(m.interests?.length ?? 0) > 2 ? "…" : ""}</Td>
                        <Td>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            m.consent_marketing ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {m.consent_marketing ? "Yes" : "No"}
                          </span>
                        </Td>
                        <Td>{new Date(m.created_at).toLocaleDateString()}</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3 text-xs text-slate-500 border-t border-slate-100">
            Showing {filtered.length} of {members.length}
          </div>
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selected.first_name} {selected.last_name}
                </h2>
                <p className="text-sm text-slate-500">{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-sm">Close</button>
            </div>
            <dl className="mt-6 space-y-4 text-sm">
              <Row label="Phone" value={selected.phone ?? "—"} />
              <Row label="City" value={selected.city ?? "—"} />
              <Row label="Instagram" value={selected.instagram_handle ?? "—"} />
              <Row label="Source" value={selected.source ?? "—"} />
              <Row label="Marketing consent" value={selected.consent_marketing ? "Yes" : "No"} />
              <Row label="Interests" value={(selected.interests ?? []).join(", ") || "—"} />
              <Row label="Joined" value={new Date(selected.created_at).toLocaleString()} />
              <Row label="ID" value={<span className="font-mono text-xs">{selected.id}</span>} />
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium px-4 py-3">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-slate-700">{children}</td>;
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-900">{value}</dd>
    </div>
  );
}
