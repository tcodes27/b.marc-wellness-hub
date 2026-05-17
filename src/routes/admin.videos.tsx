import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "./admin";
import { MEMBER_TIERS, TIER_LABEL, type MemberTier } from "@/lib/portal";
import { videoThumbnail, extractVideoId, type VideoLibraryEntry } from "@/lib/youtube";
import { Plus, Loader2, Trash2, Save, Search, PlayCircle, Lock, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/videos")({
  component: VideosAdmin,
});

type Row = VideoLibraryEntry & { is_active?: boolean; created_at?: string };

function VideosAdmin() {
  const { userId } = useAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | MemberTier>("all");

  // New-video form
  const [form, setForm] = useState({
    title: "", url: "", playlist_url: "", thumbnail_url: "",
    private_link: "", category: "", tags: "",
    access_level: "public" as MemberTier, sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setErr(null);
    const { data, error } = await supabase
      .from("video_library")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const create = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error("Title and URL are required");
      return;
    }
    if (!extractVideoId(form.url)) {
      toast.error("URL doesn't look like a YouTube video URL");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      url: form.url.trim(),
      playlist_url: form.playlist_url.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      private_link: form.private_link.trim() || null,
      category: form.category.trim() || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      access_level: form.access_level,
      sort_order: Number(form.sort_order) || 0,
      created_by: userId || null,
    };
    const { error } = await supabase.from("video_library").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Video added");
    setForm({ ...form, title: "", url: "", playlist_url: "", thumbnail_url: "", private_link: "", category: "", tags: "" });
    void load();
  };

  const update = async (id: string, patch: Partial<Row>) => {
    const { error } = await supabase.from("video_library").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else void load();
  };

  const remove = async (r: Row) => {
    if (!confirm(`Delete "${r.title}"?`)) return;
    const { error } = await supabase.from("video_library").delete().eq("id", r.id);
    if (error) toast.error(error.message);
    else void load();
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) =>
      (levelFilter === "all" || r.access_level === levelFilter) &&
      (!term || r.title.toLowerCase().includes(term) || (r.category ?? "").toLowerCase().includes(term)),
    );
  }, [rows, q, levelFilter]);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Video Library</p>
        <h1 className="font-serif text-3xl mt-2">YouTube videos & member access</h1>
        <p className="text-sm text-clay mt-1 max-w-xl">
          Add public videos and private/unlisted member classes. Access is enforced
          by the database — only viewers at the matching tier can see the row.
        </p>
      </div>

      {/* New video */}
      <div className="bg-white border border-tan/30 rounded-2xl p-5 shadow-sm">
        <h2 className="font-serif text-lg">Add a video</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <Field label="Title *">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Morning reformer flow" />
          </Field>
          <Field label="YouTube URL *">
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputCls} placeholder="https://www.youtube.com/watch?v=…" />
          </Field>
          <Field label="Playlist URL">
            <input value={form.playlist_url} onChange={(e) => setForm({ ...form, playlist_url: e.target.value })} className={inputCls} placeholder="https://www.youtube.com/playlist?list=…" />
          </Field>
          <Field label="Thumbnail URL (override)">
            <input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} className={inputCls} placeholder="Optional — leave blank to auto-derive" />
          </Field>
          <Field label="Private / unlisted link (members only)">
            <input value={form.private_link} onChange={(e) => setForm({ ...form, private_link: e.target.value })} className={inputCls} placeholder="https://youtu.be/… (unlisted)" />
          </Field>
          <Field label="Category">
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} placeholder="Reformer, Mat, Breathwork…" />
          </Field>
          <Field label="Tags (comma-separated)">
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} placeholder="beginner, 20min, sculpt" />
          </Field>
          <Field label="Access level">
            <select value={form.access_level} onChange={(e) => setForm({ ...form, access_level: e.target.value as MemberTier })} className={inputCls}>
              {MEMBER_TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
            </select>
          </Field>
          <Field label="Sort order">
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={create} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.25em] px-5 py-2.5 disabled:opacity-50">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add video
          </button>
        </div>
      </div>

      {/* Filters + list */}
      <div className="bg-white border border-tan/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-3 border-b border-tan/20 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-clay" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or category…" className={`${inputCls} pl-9`} />
          </div>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as any)} className={inputCls}>
            <option value="all">All access levels</option>
            {MEMBER_TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>
        ) : err ? (
          <div className="p-6 text-rose-700 bg-rose-50 text-sm">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-clay text-sm">
            <PlayCircle className="mx-auto mb-3 text-clay/60" />
            {rows.length === 0 ? "No videos yet. Add one above." : "No videos match the filter."}
          </div>
        ) : (
          <ul className="divide-y divide-tan/20">
            {filtered.map((r) => {
              const thumb = r.thumbnail_url || videoThumbnail(r.url);
              return (
                <li key={r.id} className="p-4 flex gap-4 items-start">
                  <div className="h-16 w-24 rounded-lg bg-sand flex-shrink-0 overflow-hidden">
                    {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1 grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
                    <div className="min-w-0">
                      <div className="font-serif text-base text-espresso truncate">{r.title}</div>
                      <div className="text-xs text-clay truncate">{r.category ?? "—"} · {(r.tags ?? []).join(", ") || "no tags"}</div>
                      <a href={r.url ?? "#"} target="_blank" rel="noopener noreferrer" className="text-[0.65rem] text-clay underline inline-flex items-center gap-1 mt-1">
                        {r.url ?? "(no url)"} <ExternalLink size={10} />
                      </a>
                      {r.private_link && (
                        <div className="text-[0.65rem] text-espresso inline-flex items-center gap-1 mt-1">
                          <Lock size={10} /> private link set
                        </div>
                      )}
                    </div>
                    <select value={r.access_level} onChange={(e) => void update(r.id, { access_level: e.target.value as MemberTier })} className={inputCls}>
                      {MEMBER_TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
                    </select>
                    <label className="text-xs inline-flex items-center gap-2">
                      <input type="checkbox" checked={r.is_active ?? true} onChange={(e) => void update(r.id, { is_active: e.target.checked } as any)} />
                      Active
                    </label>
                    <button onClick={() => remove(r)} className="p-2 rounded-lg text-rose-700 hover:bg-rose-50" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="p-3 text-xs text-clay border-t border-tan/20">{filtered.length} of {rows.length}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-tan/40 px-3 py-2 text-sm bg-ivory focus:outline-none focus:border-espresso";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block text-[10px] uppercase tracking-[0.25em] text-clay mb-1.5">{label}</span>
      {children}
    </label>
  );
}
