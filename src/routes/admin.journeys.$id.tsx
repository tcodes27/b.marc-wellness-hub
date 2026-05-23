import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Plus, Save, Trash2, ChevronUp, ChevronDown,
  Mail, Eye, X, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin/journeys/$id")({
  component: JourneyDetailPage,
});

type Journey = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "active" | "paused" | "archived";
  trigger_type: string;
  trigger_config: any;
  audience_tags: string[];
  audience_interests: string[];
  from_name: string | null;
  from_email: string | null;
};

type Email = {
  id: string;
  journey_id: string;
  position: number;
  channel: "email" | "sms";
  delay_days: number;
  delay_hours: number;
  subject: string | null;
  preview_text: string | null;
  body_markdown: string | null;
  cta_label: string | null;
  cta_url: string | null;
  signature_html: string | null;
  featured_image_url: string | null;
  active: boolean;
  // Content Studio link (db/journeys_content_link.sql)
  content_post_id: string | null;
  override_subject: string | null;
  override_cta_label: string | null;
  override_cta_url: string | null;
  override_sms_text: string | null;
};

type ReusablePost = {
  id: string;
  title: string;
  slug: string;
  email_subject: string | null;
  cta_label: string | null;
  cta_url: string | null;
  featured_image_url: string | null;
  sms_text: string | null;
};

const TRIGGER_OPTIONS = [
  { value: "community_signup",   label: "Immediately after community signup" },
  { value: "portal_signup",      label: "After portal signup" },
  { value: "delay_after_join",   label: "X days after joining" },
  { value: "event_registration", label: "Event registration" },
  { value: "manual",             label: "Manual trigger by admin" },
  { value: "tag_added",          label: "Tag-based trigger" },
  { value: "birthday_month",     label: "Birthday month (future)" },
];

const TOKENS = ["{{first_name}}", "{{email}}", "{{city}}", "{{interests}}"];

function JourneyDetailPage() {
  const { id } = Route.useParams();
  
  const [journey, setJourney] = useState<Journey | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Email | null>(null);
  const [previewing, setPreviewing] = useState<Email | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: j, error: je }, { data: e, error: ee }] = await Promise.all([
      supabase.from("journeys").select("*").eq("id", id).single(),
      supabase.from("journey_emails").select("*").eq("journey_id", id).order("position", { ascending: true }),
    ]);
    if (je) { toast.error(je.message); setLoading(false); return; }
    if (ee) { toast.error(ee.message); }
    setJourney(j as Journey);
    setEmails((e ?? []) as Email[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [id]);

  const saveJourney = async (patch: Partial<Journey>) => {
    if (!journey) return;
    setSaving(true);
    const { error } = await supabase.from("journeys").update(patch).eq("id", journey.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setJourney({ ...journey, ...patch });
  };

  const addEmail = async () => {
    const nextPos = (emails[emails.length - 1]?.position ?? 0) + 1;
    const { data, error } = await supabase
      .from("journey_emails")
      .insert({
        journey_id: id,
        position: nextPos,
        delay_days: emails.length === 0 ? 0 : 2,
        subject: "New email",
        body_markdown: "Hi {{first_name}},\n\n",
      })
      .select("*").single();
    if (error) { toast.error(error.message); return; }
    setEmails([...emails, data as Email]);
    setEditing(data as Email);
  };

  const moveEmail = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= emails.length) return;
    const a = emails[idx]; const b = emails[target];
    const updates = [
      supabase.from("journey_emails").update({ position: b.position }).eq("id", a.id),
      supabase.from("journey_emails").update({ position: a.position }).eq("id", b.id),
    ];
    await Promise.all(updates);
    void load();
  };

  const deleteEmail = async (eid: string) => {
    if (!confirm("Delete this email from the sequence?")) return;
    const { error } = await supabase.from("journey_emails").delete().eq("id", eid);
    if (error) { toast.error(error.message); return; }
    setEmails(emails.filter((e) => e.id !== eid));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-clay" /></div>;
  }
  if (!journey) {
    return (
      <div className="text-center py-20">
        <p className="text-clay">Journey not found.</p>
        <Link to="/admin/journeys" className="text-xs uppercase tracking-[0.2em] underline mt-3 inline-block">Back to Journeys</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <Link to="/admin/journeys" className="text-xs uppercase tracking-[0.2em] text-clay inline-flex items-center gap-1.5 hover:text-espresso">
          <ArrowLeft size={12} /> All Journeys
        </Link>
      </div>

      {/* Settings */}
      <section className="bg-white border border-tan/30 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <input
              value={journey.title}
              onChange={(e) => setJourney({ ...journey, title: e.target.value })}
              onBlur={(e) => saveJourney({ title: e.target.value })}
              className="font-serif text-3xl text-espresso w-full bg-transparent border-0 focus:outline-none focus:ring-0 px-0"
            />
            <textarea
              value={journey.description ?? ""}
              onChange={(e) => setJourney({ ...journey, description: e.target.value })}
              onBlur={(e) => saveJourney({ description: e.target.value })}
              placeholder="Internal description (only admins see this)…"
              rows={2}
              className="text-sm text-clay w-full bg-transparent border-0 focus:outline-none mt-2 resize-none"
            />
          </div>
          <div className="flex flex-col gap-2 items-end shrink-0">
            <select
              value={journey.status}
              onChange={(e) => saveJourney({ status: e.target.value as Journey["status"] })}
              className="text-xs uppercase tracking-[0.18em] border border-tan/40 rounded-full px-3 py-1.5 bg-ivory"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
            {saving && <span className="text-[0.65rem] text-clay">Saving…</span>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 pt-4 border-t border-tan/20">
          <Field label="Trigger">
            <select
              value={journey.trigger_type}
              onChange={(e) => saveJourney({ trigger_type: e.target.value })}
              className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-ivory"
            >
              {TRIGGER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="From name">
            <input
              value={journey.from_name ?? ""}
              onChange={(e) => setJourney({ ...journey, from_name: e.target.value })}
              onBlur={(e) => saveJourney({ from_name: e.target.value || null })}
              placeholder="Erra — B.MARC"
              className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-ivory"
            />
          </Field>
          <Field label="Audience tags (comma-separated)">
            <input
              value={journey.audience_tags.join(", ")}
              onChange={(e) => setJourney({ ...journey, audience_tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              onBlur={(e) => saveJourney({ audience_tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="All Members, VIP…"
              className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-ivory"
            />
          </Field>
          <Field label="Audience interests (comma-separated)">
            <input
              value={journey.audience_interests.join(", ")}
              onChange={(e) => setJourney({ ...journey, audience_interests: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              onBlur={(e) => saveJourney({ audience_interests: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Pilates events, Wellness community…"
              className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-ivory"
            />
          </Field>
        </div>
      </section>

      {/* Sequence */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-2xl text-espresso">Email sequence</h2>
            <p className="text-sm text-clay mt-1">{emails.length} email{emails.length === 1 ? "" : "s"}</p>
          </div>
          <button
            onClick={addEmail}
            className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory px-4 py-2 text-xs uppercase tracking-[0.2em]"
          >
            <Plus size={12} /> Add email
          </button>
        </div>

        {emails.length === 0 ? (
          <div className="text-center py-12 bg-sand/30 rounded-2xl border border-dashed border-tan/40">
            <Mail className="mx-auto text-clay mb-3" size={24} />
            <p className="text-sm text-clay">No emails in this sequence yet.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {emails.map((e, idx) => (
              <li key={e.id} className="bg-white border border-tan/30 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-sand text-espresso font-serif text-sm flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-clay mb-0.5">
                    {idx === 0 && e.delay_days === 0 && e.delay_hours === 0
                      ? "Immediately"
                      : `After ${e.delay_days}d ${e.delay_hours}h`}
                  </div>
                  <div className="font-serif text-lg text-espresso truncate">{e.subject || "(no subject)"}</div>
                  {e.preview_text && <div className="text-sm text-clay truncate mt-0.5">{e.preview_text}</div>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveEmail(idx, -1)} disabled={idx === 0} className="p-1.5 rounded hover:bg-sand text-clay disabled:opacity-30">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => moveEmail(idx, 1)} disabled={idx === emails.length - 1} className="p-1.5 rounded hover:bg-sand text-clay disabled:opacity-30">
                    <ChevronDown size={14} />
                  </button>
                  <button onClick={() => setPreviewing(e)} className="p-1.5 rounded hover:bg-sand text-clay" title="Preview">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => setEditing(e)} className="px-3 py-1.5 rounded-lg bg-espresso text-ivory text-xs uppercase tracking-[0.18em]">
                    Edit
                  </button>
                  <button onClick={() => deleteEmail(e.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {editing && (
        <EmailEditor
          email={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setEmails(emails.map((e) => e.id === updated.id ? updated : e));
            setEditing(null);
          }}
        />
      )}
      {previewing && (
        <EmailPreview email={previewing} fromName={journey.from_name} onClose={() => setPreviewing(null)} />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-clay">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function EmailEditor({ email, onClose, onSaved }: {
  email: Email; onClose: () => void; onSaved: (e: Email) => void;
}) {
  const [draft, setDraft] = useState<Email>(email);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("journey_emails")
      .update({
        subject: draft.subject, preview_text: draft.preview_text,
        body_markdown: draft.body_markdown,
        cta_label: draft.cta_label, cta_url: draft.cta_url,
        signature_html: draft.signature_html,
        featured_image_url: draft.featured_image_url,
        delay_days: Number(draft.delay_days) || 0,
        delay_hours: Number(draft.delay_hours) || 0,
      })
      .eq("id", draft.id)
      .select("*").single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Email saved");
    onSaved(data as Email);
  };

  const insertToken = (token: string) => {
    setDraft({ ...draft, body_markdown: (draft.body_markdown ?? "") + token });
  };

  return (
    <div className="fixed inset-0 z-50 bg-espresso/40 flex items-stretch sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-ivory w-full max-w-3xl rounded-none sm:rounded-2xl flex flex-col max-h-screen sm:max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-tan/30">
          <h3 className="font-serif text-xl text-espresso">Edit email</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-sand text-clay"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Delay days">
              <input type="number" min={0} value={draft.delay_days}
                onChange={(e) => setDraft({ ...draft, delay_days: Number(e.target.value) })}
                className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-white" />
            </Field>
            <Field label="Delay hours">
              <input type="number" min={0} max={23} value={draft.delay_hours}
                onChange={(e) => setDraft({ ...draft, delay_hours: Number(e.target.value) })}
                className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-white" />
            </Field>
          </div>
          <Field label="Subject">
            <input value={draft.subject ?? ""} onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-white" />
          </Field>
          <Field label="Preview text">
            <input value={draft.preview_text ?? ""} onChange={(e) => setDraft({ ...draft, preview_text: e.target.value })}
              className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-white" />
          </Field>
          <Field label="Featured image URL">
            <input value={draft.featured_image_url ?? ""} onChange={(e) => setDraft({ ...draft, featured_image_url: e.target.value })}
              placeholder="https://…"
              className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-white" />
          </Field>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-clay">Body</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {TOKENS.map((t) => (
                  <button key={t} type="button" onClick={() => insertToken(t)}
                    className="text-[0.65rem] px-2 py-0.5 rounded-full bg-sand hover:bg-tan/40 text-espresso">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={draft.body_markdown ?? ""}
              onChange={(e) => setDraft({ ...draft, body_markdown: e.target.value })}
              rows={12}
              className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-white font-mono"
              placeholder="Write your email here. Use blank lines between paragraphs."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA label"><input value={draft.cta_label ?? ""} onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })}
              className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-white" /></Field>
            <Field label="CTA URL"><input value={draft.cta_url ?? ""} onChange={(e) => setDraft({ ...draft, cta_url: e.target.value })}
              className="w-full border border-tan/40 rounded-lg px-3 py-2 text-sm bg-white" /></Field>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-tan/30 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs uppercase tracking-[0.2em] text-clay hover:text-espresso">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory px-5 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailPreview({ email, fromName, onClose }: {
  email: Email; fromName: string | null; onClose: () => void;
}) {
  const sample = { first_name: "Jane", email: "jane@example.com", city: "Atlanta", interests: "Pilates, Wellness" };
  const render = (s: string | null) => (s ?? "").replace(/\{\{(\w+)\}\}/g, (_, k) => (sample as any)[k] ?? `{{${k}}}`);
  const paragraphs = render(email.body_markdown).split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 bg-espresso/50 flex items-stretch sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-ivory w-full max-w-2xl rounded-none sm:rounded-2xl flex flex-col max-h-screen sm:max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-tan/30">
          <h3 className="font-serif text-xl text-espresso flex items-center gap-2"><Sparkles size={16} /> Preview</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-sand text-clay"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto bg-stone-100 p-6">
          <div className="max-w-xl mx-auto bg-ivory border border-tan/40 rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-3 border-b border-tan/20 text-xs text-clay">
              From <strong className="text-espresso">{fromName || "B.MARC"}</strong>
            </div>
            {email.featured_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={email.featured_image_url} alt="" className="w-full max-h-64 object-cover" />
            )}
            <div className="px-8 py-8">
              <h1 className="font-serif text-2xl text-espresso mb-1">{render(email.subject)}</h1>
              {email.preview_text && <p className="text-xs text-clay italic mb-6">{render(email.preview_text)}</p>}
              {paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] text-espresso/90 leading-[1.7] mb-4 whitespace-pre-wrap">{p}</p>
              ))}
              {email.cta_label && email.cta_url && (
                <div className="text-center my-8">
                  <span className="inline-block bg-espresso text-ivory px-7 py-3 rounded-full text-xs uppercase tracking-[0.2em]">
                    {email.cta_label}
                  </span>
                </div>
              )}
              <div className="mt-10 pt-6 border-t border-tan/20 text-xs text-clay">
                With warmth,<br /><span className="font-serif text-base text-espresso">{fromName || "B.MARC"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 border-t border-tan/30 text-[0.65rem] text-clay/70 text-center">
          Preview uses sample data: {Object.entries(sample).map(([k, v]) => `${k}=${v}`).join(" · ")}
        </div>
      </div>
    </div>
  );
}
