import { createFileRoute } from "@tanstack/react-router";
import { useAdmin } from "./admin";
import type { CommunityMember } from "@/integrations/supabase/client";
import { Download } from "lucide-react";

export const Route = createFileRoute("/admin/exports")({
  component: ExportsPage,
});

const HEADERS = [
  "id","first_name","last_name","email","phone","city","instagram_handle",
  "interests","source","consent_marketing","status","notes","created_at",
] as const;

function rowsFromMembers(list: CommunityMember[]) {
  return list.map((m) => [
    m.id, m.first_name, m.last_name, m.email,
    m.phone ?? "", m.city ?? "", m.instagram_handle ?? "",
    (m.interests ?? []).join("; "),
    m.source ?? "",
    m.consent_marketing ? "yes" : "no",
    m.status, m.notes ?? "", m.created_at,
  ]);
}

function downloadCsv(name: string, list: CommunityMember[]) {
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [HEADERS as readonly string[], ...rowsFromMembers(list)]
    .map((r) => r.map((c) => escape(String(c))).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ExportsPage() {
  const { members } = useAdmin();

  const now = Date.now();
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const sponsorLeads = members.filter(
    (m) => m.status === "Sponsor Lead" || (m.interests ?? []).includes("Sponsorship/collaboration"),
  );
  const newThisMonth = members.filter((m) => +new Date(m.created_at) >= monthAgo);
  const eventInterest = members.filter((m) => (m.interests ?? []).includes("Pilates events"));

  const items = [
    { name: "All community members", count: members.length, run: () => downloadCsv("bmarc-all-members", members) },
    { name: "Sponsor leads", count: sponsorLeads.length, run: () => downloadCsv("bmarc-sponsor-leads", sponsorLeads) },
    { name: "Pilates events interest", count: eventInterest.length, run: () => downloadCsv("bmarc-event-interest", eventInterest) },
    { name: "New signups this month", count: newThisMonth.length, run: () => downloadCsv("bmarc-new-this-month", newThisMonth) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Data</p>
        <h1 className="font-serif text-3xl mt-2">Exports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => (
          <div key={i.name} className="bg-white border border-tan/30 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <div className="font-serif text-lg">{i.name}</div>
              <div className="text-xs text-clay mt-1">{i.count} record{i.count === 1 ? "" : "s"}</div>
            </div>
            <button
              onClick={i.run}
              disabled={i.count === 0}
              className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5 disabled:opacity-50"
            >
              <Download size={12} /> CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
