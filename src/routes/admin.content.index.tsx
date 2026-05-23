import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  supabase, type ContentPost, POST_STATUSES, AUDIENCE_OPTIONS, CONTENT_TYPES,
} from "@/integrations/supabase/client";
import { useAdmin } from "./admin";
import { NewPostModal } from "@/components/admin/NewPostModal";
import { Plus, Loader2, Trash2, Eye, Pencil, Copy, Search, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/content/")({
  component: ContentList,
});

const STATUS_COLOR: Record<string, string> = {
  Draft: "bg-stone-200 text-stone-700",
  Scheduled: "bg-amber-100 text-amber-800",
  Published: "bg-emerald-100 text-emerald-700",
  Archived: "bg-stone-300 text-stone-600",
};

function ContentList() {
  const navigate = useNavigate();
  const { userId } = useAdmin();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"all" | (typeof POST_STATUSES)[number]>("all");
  const [audience, setAudience] = useState<"all" | string>("all");
  const [type, setType] = useState<"all" | string>("all");
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("content_posts")
      .select("*")
      .order("updated_at", { ascending: false });
    setPosts((data ?? []) as ContentPost[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const archive = async (p: ContentPost) => {
    if (!confirm(`Archive "${p.title}"?`)) return;
    await supabase.from("content_posts").update({ status: "Archived" }).eq("id", p.id);
    void load();
  };

  const remove = async (p: ContentPost) => {
    if (!confirm(`Permanently delete "${p.title}"?`)) return;
    await supabase.from("content_posts").delete().eq("id", p.id);
    void load();
  };

  const duplicate = async (p: ContentPost) => {
    const { id, created_at, updated_at, published_at, ...rest } = p as any;
    const copy = {
      ...rest,
      title: `${p.title} (copy)`,
      slug: `${p.slug}-copy-${Date.now().toString(36)}`,
      status: "Draft",
      scheduled_at: null,
      published_at: null,
      created_by: userId,
    };
    const { data, error } = await supabase.from("content_posts").insert(copy).select("id").single();
    if (error) { alert(error.message); return; }
    navigate({ to: "/admin/content/$id", params: { id: data.id } });
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter((p) =>
      (status === "all" || p.status === status) &&
      (audience === "all" || p.audience === audience) &&
      (type === "all" || p.content_type === type) &&
      (!term || p.title.toLowerCase().includes(term) || (p.subtitle ?? "").toLowerCase().includes(term)),
    );
  }, [posts, status, audience, type, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: posts.length };
    POST_STATUSES.forEach((s) => (c[s] = posts.filter((p) => p.status === s).length));
    return c;
  }, [posts]);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow">Content Studio</p>
          <h1 className="font-serif text-3xl mt-2">Editorial library</h1>
          <p className="text-sm text-clay mt-1 max-w-md">
            Compose premium wellness updates, schedule announcements, and prepare them for email, SMS, and the member portal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { console.log("[content] New post clicked"); setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.25em] px-6 py-3 hover:bg-espresso/90 transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={14} /> New post
        </button>
      </div>

      {/* Status chips */}
      <div className="flex gap-2 flex-wrap">
        <Chip active={status === "all"} onClick={() => setStatus("all")} count={counts.all}>All</Chip>
        {POST_STATUSES.map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)} count={counts[s]}>{s}</Chip>
        ))}
      </div>

      {/* Search + filters */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 bg-white border border-tan/30 rounded-2xl p-3 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-clay" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or subtitle…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-transparent rounded-xl border border-transparent focus:border-tan/50 focus:outline-none"
          />
        </div>
        <select value={audience} onChange={(e) => setAudience(e.target.value)} className={selectCls}>
          <option value="all">All audiences</option>
          {AUDIENCE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
          <option value="all">All types</option>
          {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="bg-white border border-tan/30 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="mx-auto text-clay/50" size={36} />
            <p className="mt-4 text-sm text-clay">
              {posts.length === 0 ? "Your editorial library is empty." : "No posts match the current filters."}
            </p>
            <button
              type="button"
              onClick={() => { console.log("[content] Create your first post clicked"); setModalOpen(true); }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.25em] px-5 py-2.5 hover:bg-espresso/90 transition-colors cursor-pointer"
            >
              <Plus size={12} /> Create your first post
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-tan/20">
            {filtered.map((p) => (
              <li key={p.id} className="group flex items-center gap-4 px-5 py-4 hover:bg-sand/20 transition-colors">
                <Link
                  to="/admin/content/$id"
                  params={{ id: p.id }}
                  className="h-14 w-20 rounded-lg bg-sand/60 flex-shrink-0 overflow-hidden flex items-center justify-center"
                >
                  {p.featured_image_url
                    ? <img src={p.featured_image_url} alt="" className="h-full w-full object-cover" />
                    : <FileText size={18} className="text-clay/60" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to="/admin/content/$id" params={{ id: p.id }} className="block">
                    <div className="font-serif text-base text-espresso truncate">{p.title || "Untitled"}</div>
                    {p.subtitle && <div className="text-xs text-clay truncate mt-0.5">{p.subtitle}</div>}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${STATUS_COLOR[p.status] ?? "bg-stone-100"}`}>
                        {p.status}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-clay">{p.content_type}</span>
                      <span className="text-[10px] text-clay/70">·</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-clay">{p.audience}</span>
                      {p.reusable_in_journeys && (
                        <span className="text-[10px] uppercase tracking-[0.18em] bg-sand text-espresso px-2 py-0.5 rounded-full">Reusable</span>
                      )}
                      {p.automation_enabled && (
                        <span className="text-[10px] uppercase tracking-[0.18em] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Automation</span>
                      )}
                      {p.linked_journeys && p.linked_journeys.length > 0 && (
                        <span className="text-[10px] uppercase tracking-[0.18em] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                          Used in {p.linked_journeys.length} journey{p.linked_journeys.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
                <div className="text-[11px] text-clay hidden sm:block whitespace-nowrap">
                  {new Date(p.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <IconBtn label="Edit" onClick={() => navigate({ to: "/admin/content/$id", params: { id: p.id } })}><Pencil size={14} /></IconBtn>
                  <IconBtn label="Preview" onClick={() => navigate({ to: "/admin/content/$id", params: { id: p.id }, search: { preview: 1 } as any })}><Eye size={14} /></IconBtn>
                  <IconBtn label="Duplicate" onClick={() => duplicate(p)}><Copy size={14} /></IconBtn>
                  <IconBtn label={p.status === "Archived" ? "Delete" : "Archive"} danger onClick={() => (p.status === "Archived" ? remove(p) : archive(p))}><Trash2 size={14} /></IconBtn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <NewPostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => { void load(); }}
        userId={userId}
      />
    </div>
  );
}

const selectCls = "rounded-xl border border-tan/40 px-3 py-2 text-sm bg-white text-espresso focus:outline-none focus:border-espresso";

function Chip({
  active, onClick, count, children,
}: { active: boolean; onClick: () => void; count?: number; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] border transition-colors flex items-center gap-2 ${
        active ? "bg-espresso text-ivory border-espresso" : "border-tan/40 text-espresso hover:bg-sand"
      }`}
    >
      {children}
      {typeof count === "number" && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-ivory/20" : "bg-sand"}`}>{count}</span>
      )}
    </button>
  );
}

function IconBtn({
  children, onClick, label, danger,
}: { children: React.ReactNode; onClick: () => void; label: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-2 rounded-lg hover:bg-sand transition-colors ${danger ? "text-rose-700" : "text-espresso"}`}
    >
      {children}
    </button>
  );
}
