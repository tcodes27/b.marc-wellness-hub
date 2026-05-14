import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  supabase, CONTENT_TYPES, AUDIENCE_OPTIONS, POST_STATUSES,
  type ContentPost, type ContentType, type AudienceOption, type PostStatus,
} from "@/integrations/supabase/client";
import { useAdmin } from "./admin";
import { RichEditor } from "@/components/admin/RichEditor";
import { pickAndUploadImage } from "@/lib/content-uploads";
import { Loader2, ArrowLeft, Save, Send, Clock, Archive, Eye, X } from "lucide-react";

export const Route = createFileRoute("/admin/content/$id")({
  component: EditPost,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

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
};

function EditPost() {
  const { id } = useParams({ from: "/admin/content/$id" });
  const isNew = id === "new";
  const { userId } = useAdmin();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [form, setForm] = useState<FormState>({
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
  });
  const [postId, setPostId] = useState<string | null>(isNew ? null : id);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data } = await supabase.from("content_posts").select("*").eq("id", id).single();
      if (data) {
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
        });
      }
      setLoading(false);
    })();
  }, [id, isNew]);

  const persist = async (override?: Partial<FormState>) => {
    setSaving(true);
    const payload: any = {
      title: form.title || "Untitled",
      subtitle: form.subtitle || null,
      slug: form.slug || slugify(form.title || `post-${Date.now()}`),
      body: form.body,
      featured_image_url: form.featured_image_url || null,
      gallery_images: form.gallery_images,
      content_type: form.content_type,
      audience: form.audience,
      status: form.status,
      scheduled_at: form.scheduled_at || null,
      ...override,
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
    if (override?.status) setForm((f) => ({ ...f, status: override.status as PostStatus }));
  };

  const uploadFeatured = async () => {
    const url = await pickAndUploadImage();
    if (url) setForm((f) => ({ ...f, featured_image_url: url }));
  };

  const addGallery = async () => {
    const url = await pickAndUploadImage();
    if (url) setForm((f) => ({ ...f, gallery_images: [...f.gallery_images, url] }));
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-clay" /></div>;
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
          <button onClick={() => persist({ status: "Draft" })} disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full border border-tan/40 text-xs uppercase tracking-[0.2em] px-4 py-2 disabled:opacity-50">
            <Save size={12} /> Save draft
          </button>
          <button onClick={() => persist({ status: "Scheduled" })} disabled={saving || !form.scheduled_at}
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
              <button onClick={uploadFeatured}
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
            <Field label="Audience">
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

          <Panel title="Gallery">
            {form.gallery_images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {form.gallery_images.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="" className="aspect-square object-cover rounded-md" />
                    <button onClick={() => setForm({ ...form, gallery_images: form.gallery_images.filter((g) => g !== url) })}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-ivory/90 flex items-center justify-center">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={addGallery}
                    className="w-full text-xs uppercase tracking-[0.2em] text-clay border border-dashed border-tan/50 rounded-xl py-2 hover:bg-sand/40">
              + Add image
            </button>
          </Panel>

          <Panel title="Distribution">
            <p className="text-[11px] text-clay mb-3">Connect SendGrid/Resend, Twilio, and the member portal in a future update.</p>
            <div className="space-y-2">
              <ComingSoonBtn>Send Email Campaign</ComingSoonBtn>
              <ComingSoonBtn>Send SMS Alert</ComingSoonBtn>
              <ComingSoonBtn>Publish to Portal</ComingSoonBtn>
              <button onClick={() => persist({ status: "Archived" })} disabled={saving}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-tan/40 text-xs uppercase tracking-[0.2em] py-2 hover:bg-sand">
                <Archive size={12} /> Archive
              </button>
            </div>
          </Panel>
        </aside>
      </div>

      {previewing && (
        <PreviewModal form={form} onClose={() => setPreviewing(false)} />
      )}
    </div>
  );
}

const selectCls = "w-full rounded-lg border border-tan/40 px-3 py-2 text-sm bg-white focus:outline-none focus:border-espresso";

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

function ComingSoonBtn({ children }: { children: React.ReactNode }) {
  return (
    <button disabled
            className="w-full rounded-xl border border-tan/40 text-xs uppercase tracking-[0.2em] py-2 text-clay/60 cursor-not-allowed bg-sand/20">
      {children} · Coming soon
    </button>
  );
}

function PreviewModal({ form, onClose }: { form: FormState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/60">
      <div className="bg-ivory max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-tan/30 shadow-xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-tan/30">
          <span className="eyebrow">Preview</span>
          <button onClick={onClose} className="text-clay hover:text-espresso"><X size={18} /></button>
        </div>
        <article className="px-8 py-10">
          {form.featured_image_url && (
            <img src={form.featured_image_url} alt="" className="w-full aspect-video object-cover rounded-2xl mb-8" />
          )}
          <p className="eyebrow">{form.content_type}</p>
          <h1 className="font-serif text-4xl mt-3">{form.title || "Untitled"}</h1>
          {form.subtitle && <p className="text-lg text-clay mt-2">{form.subtitle}</p>}
          <div className="prose prose-sm max-w-none mt-8 text-espresso"
               dangerouslySetInnerHTML={{ __html: jsonToSimpleHtml(form.body) }} />
        </article>
      </div>
    </div>
  );
}

function jsonToSimpleHtml(node: any): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(jsonToSimpleHtml).join("");
  if (node.type === "doc") return jsonToSimpleHtml(node.content);
  if (node.type === "paragraph") return `<p>${jsonToSimpleHtml(node.content)}</p>`;
  if (node.type === "heading") return `<h${node.attrs?.level ?? 2}>${jsonToSimpleHtml(node.content)}</h${node.attrs?.level ?? 2}>`;
  if (node.type === "bulletList") return `<ul>${jsonToSimpleHtml(node.content)}</ul>`;
  if (node.type === "orderedList") return `<ol>${jsonToSimpleHtml(node.content)}</ol>`;
  if (node.type === "listItem") return `<li>${jsonToSimpleHtml(node.content)}</li>`;
  if (node.type === "blockquote") return `<blockquote>${jsonToSimpleHtml(node.content)}</blockquote>`;
  if (node.type === "image") return `<img src="${node.attrs?.src ?? ""}" alt="" />`;
  if (node.type === "text") {
    let t = escapeHtml(node.text ?? "");
    for (const m of node.marks ?? []) {
      if (m.type === "bold") t = `<strong>${t}</strong>`;
      if (m.type === "italic") t = `<em>${t}</em>`;
      if (m.type === "link") t = `<a href="${escapeHtml(m.attrs?.href ?? "#")}">${t}</a>`;
    }
    return t;
  }
  return jsonToSimpleHtml(node.content);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
