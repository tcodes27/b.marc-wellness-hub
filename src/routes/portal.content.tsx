import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listMemberContent } from "@/lib/portal";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Lock, PlayCircle, Youtube } from "lucide-react";
import { YOUTUBE_CHANNEL_URL, embedVideoUrl, videoThumbnail, type VideoLibraryEntry } from "@/lib/youtube";

export const Route = createFileRoute("/portal/content")({
  component: ContentPage,
});

type Post = {
  id: string; title: string; subtitle: string | null; slug: string;
  featured_image_url: string | null; published_at: string | null;
  visibility: string; content_type: string;
};

function ContentPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null); setPosts(null);
    const { data, error } = await listMemberContent();
    if (error) setErr(error.message);
    else setPosts((data ?? []) as Post[]);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-12">
      <ProtectedVideoLibrary />

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-clay">For members</p>
        <h2 className="font-serif text-3xl mt-2">Latest content</h2>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
          {err} <button onClick={load} className="ml-3 underline">Retry</button>
        </div>
      )}

      {!posts && !err && (
        <div className="grid sm:grid-cols-2 gap-4">{[0,1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
      )}

      {posts && posts.length === 0 && (
        <div className="rounded-2xl border border-tan/30 bg-white p-8 text-center">
          <BookOpen className="mx-auto text-clay" />
          <p className="mt-3 font-serif text-lg">No posts yet</p>
          <p className="text-sm text-clay mt-1">New member content will appear here.</p>
        </div>
      )}

      {posts && posts.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {posts.map(p => (
            <article key={p.id} className="rounded-2xl overflow-hidden bg-white border border-tan/30">
              {p.featured_image_url && <img src={p.featured_image_url} alt="" className="w-full h-40 object-cover" />}
              <div className="p-4">
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-clay">{p.content_type}{p.visibility === "members" && " · Members"}</p>
                <h3 className="font-serif text-lg mt-1">{p.title}</h3>
                {p.subtitle && <p className="text-sm text-clay mt-1 line-clamp-2">{p.subtitle}</p>}
                {p.published_at && <p className="text-xs text-clay mt-2">{new Date(p.published_at).toLocaleDateString()}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
