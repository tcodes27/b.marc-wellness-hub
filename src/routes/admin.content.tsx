import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, type ContentPost, POST_STATUSES } from "@/integrations/supabase/client";
import { Plus, Loader2, Trash2, Eye, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  component: ContentList,
});

const STATUS_COLOR: Record<string, string> = {
  Draft: "bg-slate-200 text-slate-700",
  Scheduled: "bg-amber-100 text-amber-800",
  Published: "bg-emerald-100 text-emerald-700",
  Archived: "bg-stone-200 text-stone-600",
};

function ContentList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | (typeof POST_STATUSES)[number]>("all");

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

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="font-serif text-3xl mt-2">Content Studio</h1>
          <p className="text-sm text-clay mt-1">Create posts, updates, and member-only notes.</p>
        </div>
        <button
          onClick={() => navigate({ to: "/admin/content/new" })}
          className="inline-flex items-center gap-2 rounded-full bg-espresso text-ivory text-xs uppercase tracking-[0.2em] px-5 py-2.5"
        >
          <Plus size={14} /> New post
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
        {POST_STATUSES.map((s) => (
          <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>{s}</Chip>
        ))}
      </div>

      <div className="bg-white border border-tan/30 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-clay" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-clay text-sm">
            No posts yet. <Link to="/admin/content/new" className="underline">Create your first one</Link>.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-clay text-[0.65rem] uppercase tracking-[0.2em]">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Audience</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-tan/15 hover:bg-sand/20">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.title}</div>
                    {p.subtitle && <div className="text-xs text-clay">{p.subtitle}</div>}
                  </td>
                  <td className="px-4 py-3 text-clay">{p.content_type}</td>
                  <td className="px-4 py-3 text-clay text-xs">{p.audience}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${STATUS_COLOR[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-clay">{new Date(p.updated_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to="/admin/content/$id" params={{ id: p.id }} className="p-1.5 rounded hover:bg-sand" title="Edit">
                        <Pencil size={14} />
                      </Link>
                      <Link to="/admin/content/$id" params={{ id: p.id }} search={{ preview: 1 } as any} className="p-1.5 rounded hover:bg-sand" title="Preview">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => (p.status === "Archived" ? remove(p) : archive(p))} className="p-1.5 rounded hover:bg-sand text-rose-700" title={p.status === "Archived" ? "Delete" : "Archive"}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] border transition-colors ${
        active ? "bg-espresso text-ivory border-espresso" : "border-tan/40 text-espresso hover:bg-sand"
      }`}
    >
      {children}
    </button>
  );
}
