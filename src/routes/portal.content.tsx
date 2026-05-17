import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listMemberContent, listAccessibleVideos, TIER_LABEL, type MemberTier } from "@/lib/portal";
import { usePortal } from "./portal";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Lock, PlayCircle, Youtube, ExternalLink, Crown } from "lucide-react";
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

const TIER_BADGE: Record<MemberTier, string> = {
  "public": "bg-stone-200 text-stone-700",
  "community": "bg-tan/30 text-espresso",
  "signature": "bg-espresso text-ivory",
  "all-access": "bg-gradient-to-r from-tan to-clay text-ivory",
};

/**
 * Protected Video Library.
 *
 * RLS on `video_library` returns only the rows (and the `private_link` column)
 * that the current viewer is entitled to. The UI surfaces a "Private link"
 * button whenever a row carries one — its presence is itself the proof of
 * access, because RLS would have stripped it otherwise.
 */
function ProtectedVideoLibrary() {
  const { profile } = usePortal();
  const [entries, setEntries] = useState<VideoLibraryEntry[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [active, setActive] = useState<VideoLibraryEntry | null>(null);

  const tier: MemberTier = profile?.member_tier ?? "public";
  const isMember = tier !== "public";

  const load = async () => {
    setErr(null); setEntries(null);
    const { data, error } = await listAccessibleVideos();
    if (error) {
      // Table may not exist yet (pre-migration). Soft-fail.
      if (/relation .*video_library.* does not exist/i.test(error.message)) {
        setEntries([]);
      } else {
        setErr(error.message);
        setEntries([]);
      }
      return;
    }
    setEntries(data ?? []);
  };
  useEffect(() => { void load(); }, []);

  return (
    <section>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-clay">Member library</p>
          <h1 className="font-serif text-3xl mt-2">Protected video library</h1>
          <p className="text-sm text-clay mt-2 max-w-md">
            Curated Pilates and wellness sessions, including private unlisted
            classes for members.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.28em] px-3 py-1.5 rounded-full ${TIER_BADGE[tier]}`}>
            <Crown size={11} /> {TIER_LABEL[tier]}
          </span>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] link-underline"
          >
            <Youtube size={14} /> Public channel
          </a>
        </div>
      </div>

      {!isMember && (
        <div className="mt-6 rounded-2xl border border-tan/40 bg-sand/40 p-5 text-sm flex items-start gap-3">
          <Lock size={16} className="mt-0.5 text-clay shrink-0" />
          <div>
            <p className="font-medium text-espresso">You're viewing the public library.</p>
            <p className="text-clay mt-1">
              Member-only sessions unlock once an admin grants you Community,
              Signature, or All Access. <Link to="/membership" className="underline">View membership tiers</Link>.
            </p>
          </div>
        </div>
      )}

      {err && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
          {err} <button onClick={() => void load()} className="ml-3 underline">Retry</button>
        </div>
      )}

      {active && (
        <div className="mt-6 rounded-2xl overflow-hidden border border-tan/30 bg-black">
          <div className="aspect-video">
            <iframe
              src={embedVideoUrl(active.url) ?? ""}
              title={active.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {active.private_link && (
            <div className="bg-espresso text-ivory text-xs px-4 py-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <Lock size={12} /> Private member link active
              </span>
              <a
                href={active.private_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 underline"
              >
                Open on YouTube <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      )}

      {entries === null && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2].map(i => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      )}

      {entries && entries.length === 0 && !err && (
        <div className="mt-6 rounded-2xl border border-tan/30 bg-white p-8 text-center">
          <PlayCircle className="mx-auto text-clay" />
          <p className="mt-3 font-serif text-lg">
            {isMember ? "Library coming soon" : "No public classes published yet"}
          </p>
          <p className="text-sm text-clay mt-1 max-w-sm mx-auto">
            {isMember
              ? "New member-only classes will appear here as soon as they're uploaded."
              : "Explore free sessions on our channel while we publish the public library."}
          </p>
        </div>
      )}

      {entries && entries.length > 0 && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((v) => {
            const thumb = v.thumbnail_url || videoThumbnail(v.url);
            const level = v.access_level;
            const restricted = level !== "public";
            const locked = !(v.has_access ?? true);
            return (
              <div
                key={v.id}
                className={`group relative flex flex-col text-left rounded-2xl overflow-hidden bg-white border border-tan/30 transition-colors ${locked ? "" : "hover:border-clay/50"}`}
              >
                <button
                  type="button"
                  onClick={() => { if (!locked) setActive(v); }}
                  disabled={locked}
                  aria-label={locked ? `${v.title} — locked, requires ${TIER_LABEL[level]}` : `Play ${v.title}`}
                  className={`text-left ${locked ? "cursor-not-allowed" : ""}`}
                >
                  <div className="relative aspect-video bg-sand">
                    {thumb && (
                      <img
                        src={thumb}
                        alt=""
                        className={`w-full h-full object-cover ${locked ? "blur-[2px] scale-105 grayscale" : ""}`}
                      />
                    )}
                    {locked && <span className="absolute inset-0 bg-espresso/40" />}
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${locked ? "bg-ivory/90 text-espresso" : "bg-espresso/90 text-ivory group-hover:bg-clay"}`}>
                        {locked ? <Lock size={18} /> : <PlayCircle size={20} />}
                      </span>
                    </span>
                    <span className={`absolute top-2 right-2 inline-flex items-center gap-1 text-[0.55rem] uppercase tracking-[0.25em] px-2 py-1 rounded-full ${TIER_BADGE[level]}`}>
                      {restricted && <Lock size={10} />} {TIER_LABEL[level]}
                    </span>
                  </div>
                </button>
                <div className="p-4 flex-1 flex flex-col">
                  {v.category && <p className="text-[0.6rem] uppercase tracking-[0.3em] text-clay">{v.category}</p>}
                  <h3 className="font-serif text-base mt-1">{v.title}</h3>
                  {v.tags && v.tags.length > 0 && (
                    <p className="text-xs text-clay mt-1 line-clamp-1">{v.tags.join(" · ")}</p>
                  )}
                  {locked ? (
                    <div className="mt-3 pt-3 border-t border-tan/30">
                      <p className="text-xs text-clay">
                        This class unlocks at{" "}
                        <span className="font-medium text-espresso">{TIER_LABEL[level]}</span>.
                        {isMember
                          ? " Upgrade your membership to access it."
                          : " Join to start watching."}
                      </p>
                      <Link
                        to="/membership"
                        hash={level}
                        className="mt-3 inline-flex items-center justify-center gap-1.5 w-full rounded-full bg-espresso text-ivory text-[0.65rem] uppercase tracking-[0.28em] px-4 py-2.5 hover:bg-clay transition-colors"
                      >
                        <Crown size={12} />
                        {isMember ? `Upgrade to ${TIER_LABEL[level]}` : `Join — ${TIER_LABEL[level]}`}
                      </Link>
                    </div>
                  ) : v.private_link ? (
                    <p className="text-[0.65rem] uppercase tracking-[0.25em] text-clay mt-2 inline-flex items-center gap-1">
                      <Lock size={10} /> Private link unlocked
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
