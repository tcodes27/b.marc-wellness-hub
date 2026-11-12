import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2, Plus, Workflow, Copy, Pause, Play, Trash2, ChevronRight,
  Database, Users, Mail,
} from "lucide-react";

export const Route = createFileRoute("/admin/journeys/")({
  head: () => ({ meta: [{"title": "Community Journeys \u2014 B.MARC Pilates"}, {"name": "description", "content": "Explore Community Journeys at B.MARC Pilates, a movement and wellness community."}, {"property": "og:title", "content": "Community Journeys \u2014 B.MARC Pilates"}, {"property": "og:description", "content": "Explore Community Journeys at B.MARC Pilates, a movement and wellness community."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary_large_image"}, {"name": "robots", "content": "noindex, nofollow"}] }),
  component: JourneysPage,
});

type JourneyRow = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "active" | "paused" | "archived";
  trigger_type: string;
  audience_tags: string[];
  audience_interests: string[];
  from_name: string | null;
  created_at: string;
  email_count?: number;
  enrollment_count?: number;
};

const STATUS_STYLES: Record<string, string> = {
  draft:    "bg-slate-100 text-slate-700",
  active:   "bg-emerald-100 text-emerald-700",
  paused:   "bg-amber-100 text-amber-800",
  archived: "bg-stone-200 text-stone-600",
};

const TRIGGER_LABEL: Record<string, string> = {
  community_signup:    "Community signup",
  portal_signup:       "Portal signup",
  delay_after_join:    "X days after joining",
  event_registration:  "Event registration",
  manual:              "Manual",
  tag_added:           "Tag added",
  birthday_month:      "Birthday month",
};

function JourneysPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<JourneyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("journeys")
      .select("*, journey_emails(count), journey_enrollments(count)")
      .order("created_at", { ascending: false });
    if (error) {
      if (/relation .* does not exist|schema cache/i.test(error.message)) {
        setTableMissing(true);
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }
    setTableMissing(false);
    setRows((data ?? []).map((r: any) => ({
      ...r,
      email_count: r.journey_emails?.[0]?.count ?? 0,
      enrollment_count: r.journey_enrollments?.[0]?.count ?? 0,
    })));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const createJourney = async () => {
    setCreating(true);
    const { data, error } = await supabase
      .from("journeys")
      .insert({
        title: "Untitled Journey",
        description: null,
        status: "draft",
        trigger_type: "manual",
      })
      .select("id")
      .single();
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/admin/journeys/$id", params: { id: data.id } });
  };

  const duplicate = async (j: JourneyRow) => {
    const { data: newJ, error } = await supabase
      .from("journeys")
      .insert({
        title: `${j.title} (copy)`,
        description: j.description,
        status: "draft",
        trigger_type: j.trigger_type,
        audience_tags: j.audience_tags,
        audience_interests: j.audience_interests,
        from_name: j.from_name,
      })
      .select("id")
      .single();
    if (error) { toast.error(error.message); return; }
    // copy emails
    const { data: emails } = await supabase
      .from("journey_emails").select("*").eq("journey_id", j.id);
    if (emails && emails.length) {
      const copied = emails.map((e: any) => ({
        journey_id: newJ.id,
        position: e.position, delay_days: e.delay_days, delay_hours: e.delay_hours,
        subject: e.subject, preview_text: e.preview_text,
        body_markdown: e.body_markdown, body_html: e.body_html,
        featured_image_url: e.featured_image_url, attachments: e.attachments,
        cta_label: e.cta_label, cta_url: e.cta_url, signature_html: e.signature_html,
        active: e.active, channel: e.channel,
      }));
      await supabase.from("journey_emails").insert(copied);
    }
    toast.success("Journey duplicated");
    void load();
  };

  const setStatus = async (id: string, status: JourneyRow["status"]) => {
    const { error } = await supabase.from("journeys").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Status: ${status}`);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this journey and all its emails/enrollments? This cannot be undone.")) return;
    const { error } = await supabase.from("journeys").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Journey deleted");
    void load();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-clay">CRM Automation</p>
          <h1 className="font-serif text-3xl text-espresso mt-1">Community Journeys</h1>
          <p className="text-sm text-clay mt-2 max-w-xl">
            Build onboarding sequences, nurture flows, and wellness check-ins for your members —
            warm, editorial, founder-led.
          </p>
        </div>
        <button
          onClick={createJourney}
          disabled={creating || tableMissing}
          className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-40"
        >
          {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          New Journey
        </button>
      </header>

      {tableMissing && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <Database className="text-amber-700 mt-0.5" size={18} />
            <div>
              <h2 className="font-serif text-lg text-espresso">Database setup required</h2>
              <p className="text-sm text-clay mt-1">
                The <code className="text-xs">journeys</code> tables don't exist yet. Open{" "}
                <Link to="/admin/testing" className="underline">Admin → Testing</Link>,
                copy <code className="text-xs">journeys.sql</code>, and run it in your Supabase SQL editor.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-clay" /></div>
      ) : rows.length === 0 && !tableMissing ? (
        <div className="text-center py-16 bg-sand/30 rounded-2xl border border-tan/30">
          <Workflow className="mx-auto text-clay mb-4" size={32} />
          <h2 className="font-serif text-xl text-espresso">No journeys yet</h2>
          <p className="text-sm text-clay mt-1 max-w-md mx-auto">
            Start with a welcome flow for new members, or build a nurture sequence around an upcoming event.
          </p>
          <button
            onClick={createJourney}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-espresso text-ivory px-5 py-2.5 text-xs uppercase tracking-[0.2em]"
          >
            <Plus size={14} /> Create your first journey
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((j) => (
            <div key={j.id} className="bg-white border border-tan/30 rounded-2xl p-5 sm:p-6 hover:border-espresso/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <Link
                  to="/admin/journeys/$id"
                  params={{ id: j.id }}
                  className="flex-1 min-w-0 group"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-xl text-espresso group-hover:underline">{j.title}</h3>
                    <span className={`text-[0.6rem] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full ${STATUS_STYLES[j.status]}`}>
                      {j.status}
                    </span>
                  </div>
                  {j.description && (
                    <p className="text-sm text-clay mt-1 line-clamp-2">{j.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-clay flex-wrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Workflow size={12} /> {TRIGGER_LABEL[j.trigger_type] ?? j.trigger_type}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={12} /> {j.email_count} email{j.email_count === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={12} /> {j.enrollment_count} enrolled
                    </span>
                  </div>
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  {j.status === "active" ? (
                    <button
                      onClick={() => setStatus(j.id, "paused")}
                      aria-label={`Pause journey ${j.title}`}
                      className="p-2 rounded-lg hover:bg-sand text-clay" title="Pause"
                    ><Pause size={14} aria-hidden="true" /></button>
                  ) : (
                    <button
                      onClick={() => setStatus(j.id, "active")}
                      aria-label={`Activate journey ${j.title}`}
                      className="p-2 rounded-lg hover:bg-sand text-clay" title="Activate"
                    ><Play size={14} aria-hidden="true" /></button>
                  )}
                  <button onClick={() => duplicate(j)} aria-label={`Duplicate journey ${j.title}`} className="p-2 rounded-lg hover:bg-sand text-clay" title="Duplicate">
                    <Copy size={14} aria-hidden="true" />
                  </button>
                  <button onClick={() => remove(j.id)} aria-label={`Delete journey ${j.title}`} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Delete">
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                  <Link
                    to="/admin/journeys/$id"
                    params={{ id: j.id }}
                    aria-label={`Open journey ${j.title}`}
                    className="p-2 rounded-lg hover:bg-sand text-clay"
                    title="Open"
                  ><ChevronRight size={14} aria-hidden="true" /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-clay/70 mt-8 pt-6 border-t border-tan/20">
        <strong className="text-clay">Phase 1 of Community Journeys.</strong> Sequence editing is live;
        scheduled delivery, member enrollment hooks, open/click tracking, and Lovable Emails integration
        will land in the next phase. Schema is forward-compatible.
      </div>
    </div>
  );
}
