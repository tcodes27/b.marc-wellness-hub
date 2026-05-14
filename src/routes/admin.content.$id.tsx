import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  supabase, CONTENT_TYPES, AUDIENCE_OPTIONS, POST_STATUSES,
  type ContentPost, type ContentType, type AudienceOption, type PostStatus,
  type DeliveryChannel, type SendStatus,
} from "@/integrations/supabase/client";
import { useAdmin } from "./admin";
import { RichEditor } from "@/components/admin/RichEditor";
import {
  pickAndUploadImage, pickAndUploadImages,
  pickAndUploadVideos, pickAndUploadAudio,
} from "@/lib/content-uploads";
import { AUDIENCE_TAGS } from "@/lib/audience-tags";
import { resolveRecipients, type RecipientBreakdown } from "@/lib/recipients";
import { getIntegrationStatus, type IntegrationStatus } from "@/lib/integrations.functions";
import {
  Loader2, ArrowLeft, Save, Send, Clock, Archive, Eye, X,
  Image as ImageIcon, Film, Music, Mail, MessageSquare, Users, Link as LinkIcon,
  Check, CloudOff, RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/admin/content/$id")({
  component: EditPost,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

const SMS_LIMIT = 320;

type FormState = {
  title: string;
  subtitle: string;
  slug: string;
  body: unknown;
  featured_image_url: string;
  gallery_images: string[];
  content_type: ContentType;
  audience: AudienceOption;
  status: PostStatus;
  scheduled_at: string;
  // distribution
  audience_tags: string[];
  delivery_channels: DeliveryChannel[];
  email_subject: string;
  sms_text: string;
  media_images: string[];
  media_videos: string[];
  media_audio: string[];
  cta_label: string;
  cta_url: string;
  send_status: SendStatus;
};

const blank: FormState = {
  title: "",
  subtitle: "",
  slug: "",
  body: { type: "doc", content: [{ type: "paragraph" }] },
  featured_image_url: "",
  gallery_images: [],
  content_type: "Community Update",
  audience: "All Members",
  status: "Draft",
  scheduled_at: "",
  audience_tags: [],
  delivery_channels: [],
  email_subject: "",
  sms_text: "",
  media_images: [],
  media_videos: [],
  media_audio: [],
  cta_label: "",
  cta_url: "",
  send_status: "draft",
};

function EditPost() {
  const { id } = useParams({ from: "/admin/content/$id" });
  const isNew = id === "new";
  const { userId } = useAdmin();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [postId, setPostId] = useState<string | null>(isNew ? null : id);

  const [recipients, setRecipients] = useState<RecipientBreakdown>({ total: 0, email: 0, sms: 0, members: [] });
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Autosave state ─────────────────────────────────────────────────────────
  const STORAGE_KEY = `bmarc:content-draft:${id}`;
  const NEW_KEY = "bmarc:content-draft:new";
  type AutosaveStatus = "idle" | "saving" | "saved" | "error";
  const [autosave, setAutosave] = useState<{ status: AutosaveStatus; at: number | null; error?: string }>({
    status: "idle", at: null,
  });
  const skipAutosaveRef = useRef(true); // skip the very first form effect after mount/restore

  useEffect(() => {
    console.log("[content-editor] mount", { id, isNew, userId });
    if (isNew) {
      console.log("[content-editor] initialized in CREATE mode with blank defaults");
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.from("content_posts").select("*").eq("id", id).single();
        if (error) {
          console.error("[content-editor] fetch error", error);
          setLoadError(error.message);
        } else if (data) {
          const p = data as ContentPost;
          setForm({
            title: p.title,
            subtitle: p.subtitle ?? "",
            slug: p.slug,
            body: p.body ?? { type: "doc", content: [{ type: "paragraph" }] },
            featured_image_url: p.featured_image_url ?? "",
            gallery_images: p.gallery_images ?? [],
            content_type: p.content_type,
            audience: p.audience,
            status: p.status,
            scheduled_at: p.scheduled_at ?? "",
            audience_tags: p.audience_tags ?? [],
            delivery_channels: (p.delivery_channels ?? []) as DeliveryChannel[],
            email_subject: p.email_subject ?? "",
            sms_text: p.sms_text ?? "",
            media_images: p.media_images ?? [],
            media_videos: p.media_videos ?? [],
            media_audio: p.media_audio ?? [],
            cta_label: p.cta_label ?? "",
            cta_url: p.cta_url ?? "",
            send_status: (p.send_status ?? "draft") as SendStatus,
          });
        }
      } catch (err: any) {
        console.error("[content-editor] fetch threw", err);
        setLoadError(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew, userId]);

  useEffect(() => {
    getIntegrationStatus().then(setIntegrations).catch(() => setIntegrations(null));
  }, []);

  // Debounced recipient resolution whenever audience tags change
  useEffect(() => {
    if (form.audience_tags.length === 0) {
      setRecipients({ total: 0, email: 0, sms: 0, members: [] });
      return;
    }
    setRecipientsLoading(true);
    const t = setTimeout(async () => {
      const r = await resolveRecipients(form.audience_tags);
      setRecipients(r);
      setRecipientsLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [form.audience_tags]);

  const persist = async (override?: Partial<FormState>) => {
    setSaving(true);
    const merged = { ...form, ...override };
    const payload: any = {
      title: merged.title || "Untitled",
      subtitle: merged.subtitle || null,
      slug: merged.slug || slugify(merged.title || `post-${Date.now()}`),
      body: merged.body,
      featured_image_url: merged.featured_image_url || null,
      gallery_images: merged.gallery_images,
      content_type: merged.content_type,
      audience: merged.audience,
      status: merged.status,
      scheduled_at: merged.scheduled_at || null,
      audience_tags: merged.audience_tags,
      delivery_channels: merged.delivery_channels,
      email_subject: merged.email_subject || null,
      sms_text: merged.sms_text || null,
      media_images: merged.media_images,
      media_videos: merged.media_videos,
      media_audio: merged.media_audio,
      cta_label: merged.cta_label || null,
      cta_url: merged.cta_url || null,
      send_status: merged.send_status,
    };
    if (payload.status === "Published" && !payload.published_at) payload.published_at = new Date().toISOString();
    let savedId = postId;
    if (!postId) {
      const { data, error } = await supabase
        .from("content_posts")
        .insert({ ...payload, created_by: userId })
        .select("id")
        .single();
      setSaving(false);
      if (error) { alert(error.message); return; }
      savedId = data.id;
      setPostId(savedId);
      navigate({ to: "/admin/content/$id", params: { id: savedId! }, replace: true });
    } else {
      const { error } = await supabase.from("content_posts").update(payload).eq("id", postId);
      setSaving(false);
      if (error) { alert(error.message); return; }
    }
    if (override) setForm(merged);
  };

  const toggleTag = (tag: string) => {
    setForm((f) => {
      const has = f.audience_tags.includes(tag);
      // Selecting "All Members" replaces the rest; selecting another removes "All Members"
      if (tag === "All Members") {
        return { ...f, audience_tags: has ? [] : ["All Members"] };
      }
      const next = has
        ? f.audience_tags.filter((t) => t !== tag)
        : [...f.audience_tags.filter((t) => t !== "All Members"), tag];
      return { ...f, audience_tags: next };
    });
  };

  const toggleChannel = (ch: DeliveryChannel) => {
    setForm((f) => ({
      ...f,
      delivery_channels: f.delivery_channels.includes(ch)
        ? f.delivery_channels.filter((c) => c !== ch)
        : [...f.delivery_channels, ch],
    }));
  };

  const wantsEmail = form.delivery_channels.includes("email");
  const wantsSms = form.delivery_channels.includes("sms");

  const emailReady = Boolean(integrations?.email.configured);
  const smsReady = Boolean(integrations?.sms.configured);

  const canSendEmail = emailReady && wantsEmail && recipients.email > 0 && !!form.email_subject.trim();
  const canSendSms = smsReady && wantsSms && recipients.sms > 0 && !!form.sms_text.trim();
  const canSendBoth = canSendEmail && canSendSms;

  const sendDisabledReason = (channel: "email" | "sms" | "both"): string => {
    if (channel === "email" || channel === "both") {
      if (!emailReady) return "Email provider not configured (set RESEND_API_KEY in Settings)";
      if (!wantsEmail) return "Enable Email delivery channel";
      if (!form.email_subject.trim()) return "Add an email subject";
      if (recipients.email === 0) return "No email-eligible recipients in selected audience";
    }
    if (channel === "sms" || channel === "both") {
      if (!smsReady) return "SMS not configured (set TWILIO_* secrets in Settings)";
      if (!wantsSms) return "Enable SMS delivery channel";
      if (!form.sms_text.trim()) return "Write an SMS message";
      if (recipients.sms === 0) return "No SMS-eligible recipients (consent + phone required)";
    }
    return "";
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-clay" /></div>;
  }
  if (loadError) {
    return (
      <div className="max-w-md mx-auto bg-rose-50 border border-rose-200 rounded-2xl p-6 text-sm text-rose-800">
        <p className="font-serif text-lg mb-2">Couldn't load this post</p>
        <p>{loadError}</p>
        <Link to="/admin/content" className="mt-4 inline-block underline">Back to library</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link to="/admin/content" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-clay">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setPreviewing(true)} className="inline-flex items-center gap-2 rounded-full border border-tan/40 text-xs uppercase tracking-[0.2em] px-4 py-2">
            <Eye size={12} /> Preview
          </button>
          <button onClick={() => persist({ status: "Draft", send_status: "draft" })} disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full border border-tan/40 text-xs uppercase tracking-[0.2em] px-4 py-2 disabled:opacity-50">
            <Save size={12} /> Save draft
          </button>
          <button onClick={() => persist({ status: "Scheduled", send_status: "scheduled" })}
                  disabled={saving || !form.scheduled_at}
                  className="inline-flex items-center gap-2 rounded-full border border-tan/40 text-xs uppercase tracking-[0.2em] px-4 py-2 disabled:opacity-50"
                  title={form.scheduled_at ? "" : "Set a scheduled time below"}>
            <Clock size={12} /> Schedule
          </button>
          <button onClick={() => persist({ status: "Published" })} disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5 disabled:opacity-50">
            <Send size={12} /> {saving ? "Saving…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
            placeholder="Title"
            className="w-full bg-transparent font-serif text-3xl text-espresso placeholder:text-clay/50 focus:outline-none"
          />
          <input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Subtitle (optional)"
            className="w-full bg-transparent text-lg text-clay placeholder:text-clay/40 focus:outline-none"
          />

          <RichEditor
            value={form.body}
            onChange={(b) => setForm({ ...form, body: b })}
            onInsertImage={pickAndUploadImage}
            placeholder="Begin your story…"
          />

          <Panel title="Call to action">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-3">
              <input value={form.cta_label}
                     onChange={(e) => setForm({ ...form, cta_label: e.target.value.slice(0, 60) })}
                     placeholder="Button label (e.g. Reserve)"
                     className={inputCls} />
              <input value={form.cta_url}
                     onChange={(e) => setForm({ ...form, cta_url: e.target.value.slice(0, 500) })}
                     placeholder="https://…"
                     className={inputCls} />
            </div>
          </Panel>

          <Panel title="Media">
            <MediaSection
              icon={<ImageIcon size={14} />}
              label="Images"
              urls={form.media_images}
              onAdd={async () => {
                const urls = await pickAndUploadImages();
                if (urls.length) setForm((f) => ({ ...f, media_images: [...f.media_images, ...urls] }));
              }}
              onRemove={(u) => setForm((f) => ({ ...f, media_images: f.media_images.filter((x) => x !== u) }))}
              renderThumb={(u) => <img src={u} alt="" className="aspect-square object-cover rounded-md" />}
            />
            <MediaSection
              icon={<Film size={14} />}
              label="Videos"
              urls={form.media_videos}
              onAdd={async () => {
                const urls = await pickAndUploadVideos();
                if (urls.length) setForm((f) => ({ ...f, media_videos: [...f.media_videos, ...urls] }));
              }}
              onRemove={(u) => setForm((f) => ({ ...f, media_videos: f.media_videos.filter((x) => x !== u) }))}
              renderThumb={(u) => <video src={u} className="aspect-square object-cover rounded-md bg-black" muted />}
            />
            <MediaSection
              icon={<Music size={14} />}
              label="Audio"
              urls={form.media_audio}
              onAdd={async () => {
                const urls = await pickAndUploadAudio();
                if (urls.length) setForm((f) => ({ ...f, media_audio: [...f.media_audio, ...urls] }));
              }}
              onRemove={(u) => setForm((f) => ({ ...f, media_audio: f.media_audio.filter((x) => x !== u) }))}
              renderThumb={(u) => (
                <div className="aspect-square flex items-center justify-center bg-sand rounded-md">
                  <Music size={20} className="text-clay" />
                </div>
              )}
            />
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel title="Featured image">
            {form.featured_image_url ? (
              <div className="relative">
                <img src={form.featured_image_url} alt="" className="w-full rounded-xl object-cover aspect-video" />
                <button onClick={() => setForm({ ...form, featured_image_url: "" })}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-ivory/90 flex items-center justify-center">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={async () => {
                        const url = await pickAndUploadImage();
                        if (url) setForm((f) => ({ ...f, featured_image_url: url }));
                      }}
                      className="w-full aspect-video rounded-xl border border-dashed border-tan/50 text-xs uppercase tracking-[0.2em] text-clay hover:bg-sand/40">
                Upload image
              </button>
            )}
          </Panel>

          <Panel title="Settings">
            <Field label="Content type">
              <select value={form.content_type}
                      onChange={(e) => setForm({ ...form, content_type: e.target.value as ContentType })}
                      className={selectCls}>
                {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Primary audience (legacy)">
              <select value={form.audience}
                      onChange={(e) => setForm({ ...form, audience: e.target.value as AudienceOption })}
                      className={selectCls}>
                {AUDIENCE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })}
                      className={selectCls}>
                {POST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Slug">
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                     className={selectCls} />
            </Field>
            <Field label="Scheduled at">
              <input type="datetime-local" value={form.scheduled_at}
                     onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                     className={selectCls} />
            </Field>
          </Panel>

          <Panel title="Audience targeting">
            <p className="text-[11px] text-clay">
              Choose who receives this post. Selecting <strong>All Members</strong> sends to every consenting member.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCE_TAGS.map((t) => {
                const active = form.audience_tags.includes(t);
                return (
                  <button key={t} type="button" onClick={() => toggleTag(t)}
                          className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.16em] border transition-colors ${
                            active
                              ? "bg-espresso text-ivory border-espresso"
                              : "border-tan/50 text-espresso hover:bg-sand"
                          }`}>
                    {t}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 rounded-xl bg-sand/40 border border-tan/30 p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-espresso">
                <Users size={12} className="text-clay" />
                {recipientsLoading
                  ? "Calculating…"
                  : <><strong>{recipients.total}</strong> matched member{recipients.total === 1 ? "" : "s"}</>}
              </div>
              <div className="text-[11px] text-clay flex gap-3">
                <span><Mail size={10} className="inline mb-0.5" /> {recipients.email} email-eligible</span>
                <span><MessageSquare size={10} className="inline mb-0.5" /> {recipients.sms} SMS-eligible</span>
              </div>
            </div>
          </Panel>

          <Panel title="Delivery channels">
            <div className="space-y-2">
              <ChannelToggle
                checked={wantsEmail}
                onChange={() => toggleChannel("email")}
                icon={<Mail size={14} />}
                label="Email"
                detail={emailReady ? "Provider configured" : "Provider not configured"}
                ok={emailReady}
              />
              <ChannelToggle
                checked={wantsSms}
                onChange={() => toggleChannel("sms")}
                icon={<MessageSquare size={14} />}
                label="SMS"
                detail={smsReady ? "Twilio configured" : "Twilio not configured"}
                ok={smsReady}
              />
            </div>

            {wantsEmail && (
              <div className="mt-3 space-y-1">
                <Field label="Email subject">
                  <input value={form.email_subject}
                         onChange={(e) => setForm({ ...form, email_subject: e.target.value.slice(0, 200) })}
                         placeholder="A new note from B.MARC"
                         className={inputCls} />
                </Field>
              </div>
            )}

            {wantsSms && (
              <div className="mt-3 space-y-1">
                <Field label={`SMS message (${form.sms_text.length}/${SMS_LIMIT})`}>
                  <textarea value={form.sms_text}
                            onChange={(e) => setForm({ ...form, sms_text: e.target.value.slice(0, SMS_LIMIT) })}
                            rows={3}
                            placeholder="Hi {first_name}, …  Reply STOP to unsubscribe."
                            className={`${inputCls} resize-none font-mono text-[12px]`} />
                </Field>
                <p className="text-[10px] text-clay">
                  Required by SMS rules: include sender identification and "Reply STOP to unsubscribe."
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Send">
            <SendButton
              label="Send Email Campaign"
              icon={<Mail size={12} />}
              enabled={canSendEmail}
              reason={sendDisabledReason("email")}
            />
            <SendButton
              label="Send SMS Alert"
              icon={<MessageSquare size={12} />}
              enabled={canSendSms}
              reason={sendDisabledReason("sms")}
            />
            <SendButton
              label="Send Both"
              icon={<Send size={12} />}
              enabled={canSendBoth}
              reason={sendDisabledReason("both")}
              primary
            />
            <button onClick={() => persist({ status: "Draft", send_status: "draft" })} disabled={saving}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-tan/40 text-xs uppercase tracking-[0.2em] py-2 hover:bg-sand">
              <Save size={12} /> Save only
            </button>
            <button onClick={() => persist({ status: "Archived" })} disabled={saving}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-tan/40 text-xs uppercase tracking-[0.2em] py-2 hover:bg-sand">
              <Archive size={12} /> Archive
            </button>

            <p className="text-[10px] text-clay leading-relaxed pt-1">
              Send buttons activate once the matching provider is configured in Settings,
              audience tags and a subject/message are set, and at least one consenting recipient is in range.
            </p>
          </Panel>
        </aside>
      </div>

      {previewing && (
        <PreviewModal form={form} recipients={recipients} onClose={() => setPreviewing(false)} />
      )}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-tan/40 px-3 py-2 text-sm bg-white text-espresso placeholder:text-clay/50 focus:outline-none focus:border-espresso";
const selectCls = inputCls;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.25em] text-clay mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-tan/30 rounded-2xl p-4 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.25em] text-clay mb-3">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ChannelToggle({
  checked, onChange, icon, label, detail, ok,
}: { checked: boolean; onChange: () => void; icon: React.ReactNode; label: string; detail: string; ok: boolean }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-tan/30 px-3 py-2 hover:bg-sand/40">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-espresso" />
      <span className="flex items-center gap-2 text-sm text-espresso flex-1">
        {icon} {label}
      </span>
      <span className={`text-[10px] uppercase tracking-[0.18em] ${ok ? "text-emerald-700" : "text-amber-700"}`}>
        {detail}
      </span>
    </label>
  );
}

function SendButton({
  label, icon, enabled, reason, primary,
}: { label: string; icon: React.ReactNode; enabled: boolean; reason: string; primary?: boolean }) {
  return (
    <button
      disabled={!enabled}
      title={enabled ? "" : reason}
      className={`w-full inline-flex items-center justify-center gap-2 rounded-xl text-xs uppercase tracking-[0.2em] py-2.5 transition-colors ${
        enabled
          ? primary
            ? "bg-espresso text-ivory hover:bg-espresso/90"
            : "border border-espresso text-espresso hover:bg-sand"
          : "border border-tan/40 text-clay/60 bg-sand/20 cursor-not-allowed"
      }`}
    >
      {icon} {label}
      {!enabled && <span className="text-[9px] tracking-normal lowercase opacity-70">· locked</span>}
    </button>
  );
}

function MediaSection({
  icon, label, urls, onAdd, onRemove, renderThumb,
}: {
  icon: React.ReactNode;
  label: string;
  urls: string[];
  onAdd: () => Promise<void> | void;
  onRemove: (url: string) => void;
  renderThumb: (url: string) => React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-[0.22em] text-clay flex items-center gap-1.5">{icon} {label}</span>
        <button onClick={() => onAdd()} className="text-[10px] uppercase tracking-[0.2em] text-espresso hover:text-clay">+ Add</button>
      </div>
      {urls.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {urls.map((u) => (
            <div key={u} className="relative">
              {renderThumb(u)}
              <button onClick={() => onRemove(u)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-ivory/95 flex items-center justify-center shadow-sm">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-clay/70">No {label.toLowerCase()} attached.</p>
      )}
    </div>
  );
}

function PreviewModal({
  form, recipients, onClose,
}: { form: FormState; recipients: RecipientBreakdown; onClose: () => void }) {
  const tab = useMemo(() => {
    if (form.delivery_channels.includes("email")) return "email" as const;
    if (form.delivery_channels.includes("sms")) return "sms" as const;
    return "post" as const;
  }, [form.delivery_channels]);
  const [active, setActive] = useState<"post" | "email" | "sms">(tab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/60">
      <div className="bg-ivory max-w-3xl w-full max-h-[90vh] overflow-hidden rounded-3xl border border-tan/30 shadow-xl flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-tan/30">
          <div>
            <span className="eyebrow">Preview</span>
            <div className="mt-1 text-[11px] text-clay">
              {form.audience_tags.length === 0 ? "No audience selected" : form.audience_tags.join(" · ")}
              {" · "}
              <strong>{recipients.total}</strong> matched · {recipients.email} email · {recipients.sms} SMS
            </div>
          </div>
          <button onClick={onClose} className="text-clay hover:text-espresso"><X size={18} /></button>
        </div>

        <div className="flex gap-1 px-6 pt-3 border-b border-tan/20">
          {(["post", "email", "sms"] as const).map((k) => (
            <button key={k} onClick={() => setActive(k)}
                    className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] border-b-2 ${
                      active === k ? "border-espresso text-espresso" : "border-transparent text-clay"
                    }`}>
              {k}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1">
          {active === "post" && (
            <article className="px-8 py-10">
              {form.featured_image_url && (
                <img src={form.featured_image_url} alt="" className="w-full aspect-video object-cover rounded-2xl mb-8" />
              )}
              <p className="eyebrow">{form.content_type}</p>
              <h1 className="font-serif text-4xl mt-3">{form.title || "Untitled"}</h1>
              {form.subtitle && <p className="text-lg text-clay mt-2">{form.subtitle}</p>}
              <div className="prose prose-sm max-w-none mt-8 text-espresso"
                   dangerouslySetInnerHTML={{ __html: jsonToSimpleHtml(form.body) }} />
              {form.cta_label && form.cta_url && (
                <a href={form.cta_url} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 mt-8 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.25em] px-6 py-3">
                  <LinkIcon size={12} /> {form.cta_label}
                </a>
              )}
            </article>
          )}

          {active === "email" && (
            <div className="px-8 py-8">
              <div className="text-[11px] uppercase tracking-[0.2em] text-clay">Subject</div>
              <div className="font-serif text-xl text-espresso mt-1 mb-6 border-b border-tan/30 pb-3">
                {form.email_subject || <span className="text-clay/60">(no subject)</span>}
              </div>
              <article className="prose prose-sm max-w-none text-espresso">
                <h1 className="font-serif">{form.title || "Untitled"}</h1>
                {form.subtitle && <p className="text-clay">{form.subtitle}</p>}
                {form.featured_image_url && (
                  <img src={form.featured_image_url} alt="" className="rounded-xl my-4" />
                )}
                <div dangerouslySetInnerHTML={{ __html: jsonToSimpleHtml(form.body) }} />
                {form.cta_label && form.cta_url && (
                  <p>
                    <a href={form.cta_url}>{form.cta_label} →</a>
                  </p>
                )}
                <hr />
                <p className="text-xs text-clay">
                  You're receiving this because you joined the B.MARC Pilates community.
                </p>
              </article>
            </div>
          )}

          {active === "sms" && (
            <div className="px-8 py-8 flex justify-center">
              <div className="max-w-xs w-full rounded-3xl border border-tan/40 bg-sand/40 p-4 shadow-sm">
                <div className="text-[10px] uppercase tracking-[0.2em] text-clay mb-2">From: B.MARC</div>
                <div className="rounded-2xl bg-white border border-tan/30 px-4 py-3 text-sm text-espresso whitespace-pre-wrap">
                  {form.sms_text || <span className="text-clay/60">(no SMS message)</span>}
                </div>
                <div className="mt-2 text-[10px] text-clay text-right">
                  {form.sms_text.length}/{SMS_LIMIT} chars
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function jsonToSimpleHtml(node: any): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(jsonToSimpleHtml).join("");
  const align = node.attrs?.textAlign && node.attrs.textAlign !== "left" ? ` style="text-align:${node.attrs.textAlign}"` : "";
  if (node.type === "doc") return jsonToSimpleHtml(node.content);
  if (node.type === "paragraph") return `<p${align}>${jsonToSimpleHtml(node.content)}</p>`;
  if (node.type === "heading") return `<h${node.attrs?.level ?? 2}${align}>${jsonToSimpleHtml(node.content)}</h${node.attrs?.level ?? 2}>`;
  if (node.type === "bulletList") return `<ul>${jsonToSimpleHtml(node.content)}</ul>`;
  if (node.type === "orderedList") return `<ol>${jsonToSimpleHtml(node.content)}</ol>`;
  if (node.type === "listItem") return `<li>${jsonToSimpleHtml(node.content)}</li>`;
  if (node.type === "blockquote") return `<blockquote style="border-left:2px solid rgba(0,0,0,.2);padding-left:1rem;font-style:italic;color:#7a6a5a">${jsonToSimpleHtml(node.content)}</blockquote>`;
  if (node.type === "horizontalRule") return `<hr style="margin:2rem 0;border:0;border-top:1px solid rgba(0,0,0,.15)" />`;
  if (node.type === "image") return `<img src="${node.attrs?.src ?? ""}" alt="" style="border-radius:1rem;margin:1.5rem 0" />`;
  if (node.type === "text") {
    let t = escapeHtml(node.text ?? "");
    for (const m of node.marks ?? []) {
      if (m.type === "bold") t = `<strong>${t}</strong>`;
      if (m.type === "italic") t = `<em>${t}</em>`;
      if (m.type === "underline") t = `<u>${t}</u>`;
      if (m.type === "link") t = `<a href="${escapeHtml(m.attrs?.href ?? "#")}">${t}</a>`;
    }
    return t;
  }
  return jsonToSimpleHtml(node.content);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
