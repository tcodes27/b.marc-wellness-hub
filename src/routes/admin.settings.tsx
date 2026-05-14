import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCalStatus } from "@/lib/cal.functions";
import { getIntegrationStatus, type IntegrationStatus } from "@/lib/integrations.functions";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

type Status = { ok: boolean; label: string; detail?: string };

function SettingsPage() {
  const [supa, setSupa] = useState<Status | null>(null);
  const [cal, setCal] = useState<Status | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);

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
    getIntegrationStatus().then(setIntegrations).catch((e) => console.error(e));
  }, []);

  const coreItems: (Status | null)[] = [
    supa,
    cal,
    { ok: true, label: "Instagram feed", detail: "Server function active" },
    { ok: true, label: "Community signup form", detail: "Enabled · email + SMS consent" },
  ];

  const emailDetail = integrations
    ? integrations.email.resend
      ? "RESEND_API_KEY configured"
      : integrations.email.sendgrid
      ? "SENDGRID_API_KEY configured"
      : "Set RESEND_API_KEY or SENDGRID_API_KEY"
    : "Checking…";

  const smsBits: string[] = [];
  if (integrations) {
    if (!integrations.sms.twilioAccountSid) smsBits.push("TWILIO_ACCOUNT_SID");
    if (!integrations.sms.twilioAuthToken) smsBits.push("TWILIO_AUTH_TOKEN");
    if (!integrations.sms.twilioPhoneNumber && !integrations.sms.twilioMessagingServiceSid)
      smsBits.push("TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID");
  }
  const smsDetail = !integrations
    ? "Checking…"
    : integrations.sms.configured
    ? "Twilio credentials configured"
    : `Missing: ${smsBits.join(", ")}`;

  const distributionItems: Status[] = integrations
    ? [
        { ok: integrations.email.configured, label: "Email provider", detail: emailDetail },
        { ok: integrations.sms.configured, label: "SMS (Twilio)", detail: smsDetail },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">System</p>
        <h1 className="font-serif text-3xl mt-2">Settings</h1>
      </div>

      <section>
        <p className="eyebrow text-clay mb-3">Core</p>
        <div className="bg-white border border-tan/30 rounded-2xl shadow-sm divide-y divide-tan/20">
          {coreItems.map((s, i) => (
            <Row key={i} s={s} />
          ))}
        </div>
      </section>

      <section>
        <p className="eyebrow text-clay mb-3">Distribution</p>
        <div className="bg-white border border-tan/30 rounded-2xl shadow-sm divide-y divide-tan/20">
          {distributionItems.length === 0 ? (
            <div className="px-5 py-4 text-sm text-clay">Checking integrations…</div>
          ) : (
            distributionItems.map((s, i) => <Row key={i} s={s} />)
          )}
        </div>
        <p className="mt-3 text-xs text-clay leading-relaxed">
          Send buttons in the Content Studio stay disabled until the matching provider is configured.
          SMS additionally requires the recipient's <code className="px-1 bg-white rounded">sms_consent</code> and
          a non-empty phone number.
        </p>
      </section>

      <div className="bg-sand/40 border border-tan/30 rounded-2xl p-5 text-sm text-clay">
        <p>
          API keys (<code className="px-1 bg-white rounded">CAL_API_KEY</code>,{" "}
          <code className="px-1 bg-white rounded">CAL_USERNAME</code>,{" "}
          <code className="px-1 bg-white rounded">RESEND_API_KEY</code>,{" "}
          <code className="px-1 bg-white rounded">TWILIO_*</code>) are stored as server-side secrets
          and never sent to the browser. To rotate, update them in your Lovable project secrets.
        </p>
      </div>
    </div>
  );
}

function Row({ s }: { s: Status | null }) {
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <div className="font-serif">{s?.label ?? "…"}</div>
        <div className="text-xs text-clay mt-0.5">{s?.detail ?? "Checking…"}</div>
      </div>
      {s ? (
        s.ok ? <CheckCircle2 className="text-emerald-600" size={20} />
             : <AlertCircle className="text-amber-600" size={20} />
      ) : null}
    </div>
  );
}
