import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Loader2, Save, ArrowUpRight, Mail, MessageSquare } from "lucide-react";
import {
  supabase, CONTENT_TYPES, AUDIENCE_OPTIONS,
  type ContentType, type AudienceOption, type DeliveryChannel,
} from "@/integrations/supabase/client";
import { AUDIENCE_TAGS } from "@/lib/audience-tags";
import { RichEditor } from "@/components/admin/RichEditor";
import { pickAndUploadImage } from "@/lib/content-uploads";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (postId: string) => void;
  userId: string;
};

export function NewPostModal({ open, onClose, onCreated, userId }: Props) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [contentType, setContentType] = useState<ContentType>("Community Update");
  const [audience, setAudience] = useState<AudienceOption>("All Members");
  const [audienceTags, setAudienceTags] = useState<string[]>([]);
  const [channels, setChannels] = useState<DeliveryChannel[]>([]);
  const [body, setBody] = useState<unknown>({ type: "doc", content: [{ type: "paragraph" }] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset state when reopened
  useEffect(() => {
    if (!open) return;
    console.log("[new-post-modal] opened");
    setTitle(""); setSubtitle("");
    setContentType("Community Update"); setAudience("All Members");
    setAudienceTags([]); setChannels([]);
    setBody({ type: "doc", content: [{ type: "paragraph" }] });
    setError(null); setSaving(false);
  }, [open]);

  // Esc to close + lock body scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggleTag = (tag: string) => {
    setAudienceTags((cur) => {
      const has = cur.includes(tag);
      if (tag === "All Members") return has ? [] : ["All Members"];
      const next = has ? cur.filter((t) => t !== tag) : [...cur.filter((t) => t !== "All Members"), tag];
      return next;
    });
  };

  const toggleChannel = (ch: DeliveryChannel) => {
    setChannels((cur) => cur.includes(ch) ? cur.filter((c) => c !== ch) : [...cur, ch]);
  };

  const create = async (opts: { openFullEditor: boolean }) => {
    setSaving(true);
    setError(null);
    const payload = {
      title: title.trim() || "Untitled",
      subtitle: subtitle.trim() || null,
      slug: slugify(title || `post-${Date.now()}`),
      body,
      content_type: contentType,
      audience,
      audience_tags: audienceTags,
      delivery_channels: channels,
      status: "Draft" as const,
      send_status: "draft" as const,
      created_by: userId,
    };
    const { data, error: err } = await supabase
      .from("content_posts")
      .insert(payload)
      .select("id")
      .single();
    setSaving(false);
    if (err) {
      console.error("[new-post-modal] insert error", err);
      setError(err.message);
      return;
    }
    console.log("[new-post-modal] created", data.id);
    onCreated(data.id);
    if (opts.openFullEditor) {
      navigate({ to: "/admin/content/$id", params: { id: data.id } });
    } else {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-post-title"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-6 bg-espresso/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        className="bg-ivory w-full sm:max-w-3xl max-h-[100dvh] sm:max-h-[90vh] sm:rounded-2xl shadow-2xl border border-tan/30 flex flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-b border-tan/30 bg-sand/30">
          <div>
            <p className="eyebrow">Content Studio</p>
            <h2 id="new-post-title" className="font-serif text-2xl text-espresso">New post</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-espresso hover:bg-sand cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            autoFocus
            className="w-full bg-transparent font-serif text-2xl sm:text-3xl text-espresso placeholder:text-clay/50 focus:outline-none"
          />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle (optional)"
            className="w-full bg-transparent text-base sm:text-lg text-clay placeholder:text-clay/40 focus:outline-none"
          />

          <RichEditor
            value={body}
            onChange={setBody}
            onInsertImage={pickAndUploadImage}
            placeholder="Begin your story…"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs uppercase tracking-[0.2em] text-clay flex flex-col gap-1.5">
              Content type
              <select value={contentType} onChange={(e) => setContentType(e.target.value)} className={selectCls}>
                {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-clay flex flex-col gap-1.5">
              Primary audience
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className={selectCls}>
                {AUDIENCE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-clay mb-2">Audience tags</p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_TAGS.map((tag) => {
                const active = audienceTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer ${
                      active ? "bg-espresso text-ivory border-espresso" : "border-tan/40 text-espresso hover:bg-sand"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-clay mb-2">Delivery channels</p>
            <div className="flex flex-wrap gap-2">
              {(["email", "sms"] as DeliveryChannel[]).map((ch) => {
                const active = channels.includes(ch);
                const Icon = ch === "email" ? Mail : MessageSquare;
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer ${
                      active ? "bg-espresso text-ivory border-espresso" : "border-tan/40 text-espresso hover:bg-sand"
                    }`}
                  >
                    <Icon size={12} /> {ch === "email" ? "Email" : "SMS"}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-clay/70 mt-2">
              Configure subject, SMS body, CTA, scheduling and media in the full editor.
            </p>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-2 flex-wrap px-5 sm:px-7 py-4 border-t border-tan/30 bg-sand/20">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-xs uppercase tracking-[0.2em] text-clay hover:text-espresso px-3 py-2 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => create({ openFullEditor: false })}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-tan/40 text-xs uppercase tracking-[0.2em] px-4 py-2 text-espresso hover:bg-sand cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save draft
            </button>
            <button
              type="button"
              onClick={() => create({ openFullEditor: true })}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5 hover:bg-espresso/90 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <ArrowUpRight size={12} />} Save & open editor
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

const selectCls = "rounded-xl border border-tan/40 px-3 py-2 text-sm bg-white text-espresso focus:outline-none focus:border-espresso normal-case tracking-normal";
