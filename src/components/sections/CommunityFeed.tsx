import { useRef } from "react";
import { Instagram, Play, Layers, ArrowLeft, ArrowRight } from "lucide-react";
import {
  instagramPosts,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  type InstagramPost,
} from "@/data/instagramPosts";

/**
 * ============================================================
 *  Inside the B.MARC Community — custom Instagram feed section.
 *
 *  Posts are hard-coded in `src/data/instagramPosts.ts`.
 *  To add or change posts, edit that file (newest first).
 *
 *  Future API upgrade: replace the static `instagramPosts` import
 *  with a server function that returns the same `InstagramPost[]`
 *  shape — no changes needed in this file.
 * ============================================================
 */

function TypeBadge({ type }: { type: InstagramPost["type"] }) {
  if (type === "image") return null;
  const Icon = type === "reel" ? Play : Layers;
  const label = type === "reel" ? "Reel" : "Carousel";
  return (
    <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.28em] text-ivory bg-espresso/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-ivory/25">
      <Icon size={11} className="shrink-0" />
      {label}
    </span>
  );
}

function PostCard({ post }: { post: InstagramPost }) {
  const formatted = new Date(post.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View Instagram ${post.type}: ${post.caption}`}
      className="group relative shrink-0 snap-start w-[78vw] sm:w-[340px] md:w-[360px] block focus:outline-none focus-visible:ring-2 focus-visible:ring-tan focus-visible:ring-offset-4 focus-visible:ring-offset-ivory rounded-[1.75rem]"
    >
      <div className="relative overflow-hidden rounded-[1.75rem] aspect-[4/5] bg-sand shadow-[0_30px_70px_-30px_oklch(0.28_0.035_40_/_0.35)] transition-shadow duration-500 group-hover:shadow-[0_50px_100px_-30px_oklch(0.28_0.035_40_/_0.45)]">
        <img
          src={post.image}
          alt={post.alt ?? post.caption}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-espresso/5 to-espresso/0 opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

        <TypeBadge type={post.type} />

        <span className="absolute top-4 left-4 text-[0.6rem] uppercase tracking-[0.3em] text-ivory/85">
          {formatted}
        </span>

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
          <p className="text-ivory text-sm font-light leading-snug max-w-[80%] translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
            {post.caption}
          </p>
          <Instagram
            size={16}
            className="text-ivory/90 shrink-0 transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>
    </a>
  );
}

export function CommunityFeed() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8 * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section
      id="instagram"
      className="py-28 md:py-36 bg-gradient-to-b from-ivory via-sand/40 to-ivory overflow-hidden"
    >
      <div className="container-luxe">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <span className="eyebrow">From our journal</span>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.01em]">
              Inside the <em className="font-light">B.MARC Community.</em>
            </h2>
            <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
              A curated look at our rituals, gatherings and quiet moments —
              shared from{" "}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                @{INSTAGRAM_HANDLE}
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous posts"
              className="hidden md:inline-flex h-11 w-11 items-center justify-center rounded-full border border-tan/40 bg-ivory text-espresso hover:bg-sand transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Next posts"
              className="hidden md:inline-flex h-11 w-11 items-center justify-center rounded-full border border-tan/40 bg-ivory text-espresso hover:bg-sand transition-colors"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal feed — scroll on desktop, swipe on mobile */}
      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex gap-5 md:gap-7 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 px-6 md:px-12 lg:px-20"
          style={{
            scrollbarWidth: "none",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
          }}
        >
          <style>{`
            .ig-scroller::-webkit-scrollbar { display: none; }
          `}</style>
          {instagramPosts.map((post) => (
            <PostCard key={post.link + post.date} post={post} />
          ))}
        </div>
      </div>

      <div className="container-luxe mt-14 md:mt-20 flex flex-col items-center text-center">
        <span className="eyebrow">Follow our journey</span>
        <p className="mt-4 font-serif text-2xl md:text-3xl max-w-xl">
          Step inside the everyday rituals of the B.MARC community.
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-luxe btn-luxe-hover mt-8"
        >
          <Instagram size={14} /> Follow @{INSTAGRAM_HANDLE}
        </a>
      </div>
    </section>
  );
}
