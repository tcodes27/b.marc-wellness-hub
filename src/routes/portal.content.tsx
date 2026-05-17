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

/**
 * Future-ready Protected Video Library.
 *
 * Reads from a `video_library` table once it exists (admin uploads YouTube
 * URLs there). Until then we render a graceful empty state with a direct
 * link to the public channel, and embed any rows that arrive.
 *
 * Expected columns when the table is created:
 *   id, title, url, playlist_url, thumbnail_url, category, tags[],
 *   access_level ('public' | 'community' | 'signature' | 'all-access'),
 *   private_link (nullable — unlisted URL shown only to approved members).
 */
function ProtectedVideoLibrary() {
  const [entries, setEntries] = useState<VideoLibraryEntry[] | null>(null);
  const [active, setActive] = useState<VideoLibraryEntry | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await (supabase as any)
          .from("video_library")
          .select("*")
          .order("created_at", { ascending: false });
        if (!cancelled) setEntries(((data ?? []) as VideoLibraryEntry[]));
      } catch {
        if (!cancelled) setEntries([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-clay">Member library</p>
          <h1 className="font-serif text-3xl mt-2">Protected video library</h1>
          <p className="text-sm text-clay mt-2 max-w-md">
            Curated Pilates and wellness sessions, including private unlisted classes for members.
          </p>
        </div>
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] link-underline"
        >
          <Youtube size={14} /> Public channel
        </a>
      </div>

      {active && (
        <div className="mt-6 rounded-2xl overflow-hidden border border-tan/30 bg-black">
          <div className="aspect-video">
            <iframe
              src={embedVideoUrl(active.private_link || active.url) ?? ""}
              title={active.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {entries === null && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2].map(i => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      )}

      {entries && entries.length === 0 && (
        <div className="mt-6 rounded-2xl border border-tan/30 bg-white p-8 text-center">
          <PlayCircle className="mx-auto text-clay" />
          <p className="mt-3 font-serif text-lg">Library coming soon</p>
          <p className="text-sm text-clay mt-1 max-w-sm mx-auto">
            Member-only classes will appear here. In the meantime, explore free sessions on our channel.
          </p>
        </div>
      )}

      {entries && entries.length > 0 && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((v) => {
            const thumb = v.thumbnail_url || videoThumbnail(v.url);
            const memberOnly = v.access_level !== "public";
            return (
              <button
                key={v.id}
                onClick={() => setActive(v)}
                className="group text-left rounded-2xl overflow-hidden bg-white border border-tan/30 hover:border-clay/50 transition-colors"
              >
                <div className="relative aspect-video bg-sand">
                  {thumb && <img src={thumb} alt="" className="w-full h-full object-cover" />}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-12 w-12 rounded-full bg-espresso/90 text-ivory flex items-center justify-center group-hover:bg-clay transition-colors">
                      <PlayCircle size={20} />
                    </span>
                  </span>
                  {memberOnly && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-espresso text-ivory text-[0.55rem] uppercase tracking-[0.25em] px-2 py-1 rounded-full">
                      <Lock size={10} /> Members
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {v.category && <p className="text-[0.6rem] uppercase tracking-[0.3em] text-clay">{v.category}</p>}
                  <h3 className="font-serif text-base mt-1">{v.title}</h3>
                  {v.tags && v.tags.length > 0 && (
                    <p className="text-xs text-clay mt-1 line-clamp-1">{v.tags.join(" · ")}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
