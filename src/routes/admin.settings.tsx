import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCalStatus } from "@/lib/cal.functions";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

type Status = { ok: boolean; label: string; detail?: string };

function SettingsPage() {
  const [supa, setSupa] = useState<Status | null>(null);
  const [cal, setCal] = useState<Status | null>(null);

  useEffect(() => {
    supabase.from("community_members").select("id", { head: true, count: "exact" }).then(({ error, count }) => {
      setSupa(error
        ? { ok: false, label: "Supabase", detail: error.message }
        : { ok: true, label: "Supabase", detail: `Connected · ${count ?? 0} members` });
    });
    getCalStatus().then((s) =>
      setCal(s.configured
        ? { ok: true, label: "Cal.com", detail: `API key configured · @${s.username}` }
        : { ok: false, label: "Cal.com", detail: "CAL_API_KEY not set" }),
    ).catch((e) => setCal({ ok: false, label: "Cal.com", detail: String(e) }));
  }, []);

  const items: (Status | null)[] = [
    supa,
    cal,
    { ok: true, label: "Instagram feed", detail: "Server function active" },
    { ok: true, label: "Community signup form", detail: "Enabled" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">System</p>
        <h1 className="font-serif text-3xl mt-2">Settings</h1>
      </div>

      <div className="bg-white border border-tan/30 rounded-2xl shadow-sm divide-y divide-tan/20">
        {items.map((s, i) => (
          <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-serif">{s?.label ?? "…"}</div>
              <div className="text-xs text-clay mt-0.5">{s?.detail ?? "Checking…"}</div>
            </div>
            {s ? (
              s.ok ? <CheckCircle2 className="text-emerald-600" size={20} />
                   : <AlertCircle className="text-amber-600" size={20} />
            ) : null}
          </div>
        ))}
      </div>

      <div className="bg-sand/40 border border-tan/30 rounded-2xl p-5 text-sm text-clay">
        <p>
          API keys (<code className="px-1 bg-white rounded">CAL_API_KEY</code>,{" "}
          <code className="px-1 bg-white rounded">CAL_USERNAME</code>) are stored as server-side secrets and
          never sent to the browser. To rotate, update them in your Lovable project secrets.
        </p>
      </div>
    </div>
  );
}
