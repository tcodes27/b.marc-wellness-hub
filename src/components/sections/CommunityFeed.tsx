import { useEffect, useRef, useState } from "react";
import { Instagram } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import e1 from "@/assets/event-1.jpg";
import e2 from "@/assets/event-2.jpg";
import e3 from "@/assets/event-3.jpg";
import about from "@/assets/about.jpg";
import membership from "@/assets/membership.jpg";

const INSTAGRAM_URL = "https://www.instagram.com/bmarcpilates/";

/**
 * PASTE YOUR INSTAGRAM FEED EMBED CODE HERE
 * --------------------------------------------------------------
 * Drop the full HTML snippet from your provider (Elfsight, SociableKIT,
 * LightWidget, Instagram oEmbed, etc.) into the string below.
 *
 * Example (LightWidget):
 *   const INSTAGRAM_EMBED_CODE = `
 *     <iframe src="//lightwidget.com/widgets/XXXXX.html"
 *       scrolling="no" allowtransparency="true"
 *       class="lightwidget-widget"
 *       style="width:100%;border:0;overflow:hidden;"></iframe>
 *   `;
 *
 * Leave as an empty string to show the branded placeholder + design preview.
 */
const INSTAGRAM_EMBED_CODE = "";

type Post = {
  src: string;
  alt: string;
  caption: string;
  ratio: "portrait" | "square" | "tall";
  kind?: "reel" | "carousel";
};

// Placeholder posts — shown only until the real Instagram embed is connected.
const placeholderPosts: Post[] = [
  { src: g1, alt: "Reformer flow", caption: "Sunday reformer ritual.", ratio: "portrait" },
  { src: e1, alt: "Park gathering", caption: "Golden hour, soft hearts.", ratio: "square", kind: "reel" },
  { src: g3, alt: "Matcha moment", caption: "Slow mornings.", ratio: "tall" },
  { src: about, alt: "Studio community", caption: "The B.MARC women.", ratio: "portrait", kind: "carousel" },
  { src: g2, alt: "Braided beauty", caption: "Movement as identity.", ratio: "square" },
  { src: e2, alt: "Brunch club", caption: "Post-flow brunch.", ratio: "portrait" },
  { src: g5, alt: "Cafe pause", caption: "Soft routines.", ratio: "tall", kind: "reel" },
  { src: g4, alt: "Linen light", caption: "Quiet practice.", ratio: "square", kind: "carousel" },
  { src: e3, alt: "Coastal sunrise", caption: "Breathwork at sunrise.", ratio: "portrait" },
  { src: membership, alt: "Home Pilates", caption: "Practice from anywhere.", ratio: "square" },
];

const ratioClass: Record<Post["ratio"], string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  tall: "aspect-[2/3]",
};

function PlaceholderCard({ post }: { post: Post }) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="relative shrink-0 snap-start w-[260px] md:w-[320px] group block"
      aria-label={`Open ${post.alt} on Instagram`}
    >
      <div className={`relative overflow-hidden rounded-[1.75rem] bg-sand shadow-[0_30px_60px_-30px_oklch(0.28_0.035_40_/_0.35)] ${ratioClass[post.ratio]}`}>
        <img
          src={post.src}
          alt={post.alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/55 via-espresso/0 to-espresso/0 opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

        <span className="absolute top-4 left-4 text-[0.55rem] uppercase tracking-[0.3em] text-ivory/95 bg-espresso/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-ivory/25">
          Placeholder
        </span>

        {post.kind && (
          <span className="absolute top-4 right-4 text-[0.6rem] uppercase tracking-[0.3em] text-ivory/95 bg-espresso/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-ivory/25">
            {post.kind}
          </span>
        )}

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <p className="text-ivory text-sm font-light leading-snug max-w-[80%]">{post.caption}</p>
          <Instagram size={16} className="text-ivory/90 shrink-0" />
        </div>
      </div>
    </a>
  );
}

function InstagramEmbedSlot({ embedCode }: { embedCode: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Re-execute any <script> tags pasted inside the embed (Elfsight, LightWidget, etc.)
  useEffect(() => {
    if (!embedCode || !ref.current) return;
    const scripts = ref.current.querySelectorAll("script");
    scripts.forEach((old) => {
      const s = document.createElement("script");
      Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value));
      s.text = old.text;
      old.parentNode?.replaceChild(s, old);
    });
  }, [embedCode]);

  return (
    <div
      ref={ref}
      className="instagram-embed-slot w-full"
      // Provider markup is trusted (you paste it). Required to inject iframes/widgets.
      dangerouslySetInnerHTML={{ __html: embedCode }}
    />
  );
}

function PlaceholderCarousel() {
  return (
    <div
      className="flex gap-5 md:gap-7 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 px-6 md:px-12"
      style={{
        scrollbarWidth: "none",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
      }}
    >
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
      {placeholderPosts.map((post, i) => (
        <PlaceholderCard key={i} post={post} />
      ))}
    </div>
  );
}

export function CommunityFeed() {
  const [hasEmbed] = useState(() => INSTAGRAM_EMBED_CODE.trim().length > 0);

  return (
    <section
      id="instagram"
      className="py-28 md:py-36 bg-gradient-to-b from-ivory via-sand/40 to-ivory overflow-hidden"
    >
      <div className="container-luxe">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <span className="eyebrow">Live from Instagram</span>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.01em]">
              Inside the <em className="font-light">B.MARC Community.</em>
            </h2>
            <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
              A living feed of rituals, gatherings and quiet moments from{" "}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                @bmarcpilates
              </a>
              . Updated automatically as we share new posts and Reels.
            </p>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.28em] link-underline"
          >
            <Instagram size={16} />
            @bmarcpilates
          </a>
        </div>
      </div>

      {/* Instagram feed container — embed code mounts here when configured */}
      <div className="relative">
        {hasEmbed ? (
          <div className="container-luxe">
            <div className="rounded-[2rem] bg-ivory/60 backdrop-blur-sm p-4 md:p-6 shadow-[0_40px_100px_-40px_oklch(0.28_0.035_40_/_0.3)]">
              <InstagramEmbedSlot embedCode={INSTAGRAM_EMBED_CODE} />
            </div>
          </div>
        ) : (
          <>
            {/* Editorial design preview using placeholder imagery */}
            <PlaceholderCarousel />

            {/* Embed-ready slot with clear instructions for the site owner */}
            <div className="container-luxe mt-10">
              <div className="relative rounded-[2rem] border border-dashed border-tan/50 bg-ivory/70 backdrop-blur-sm px-6 py-10 md:px-12 md:py-14 text-center">
                <span className="eyebrow text-tan">For the site owner</span>
                <h3 className="mt-4 font-serif text-2xl md:text-3xl text-espresso">
                  Paste Instagram Feed Embed Code Here
                </h3>
                <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Open{" "}
                  <code className="px-1.5 py-0.5 rounded bg-sand/70 text-espresso text-xs">
                    src/components/sections/CommunityFeed.tsx
                  </code>{" "}
                  and replace the empty{" "}
                  <code className="px-1.5 py-0.5 rounded bg-sand/70 text-espresso text-xs">
                    INSTAGRAM_EMBED_CODE
                  </code>{" "}
                  string with the snippet from your feed widget — Elfsight,
                  SociableKIT, LightWidget, EmbedSocial or Instagram's own
                  oEmbed all work. The placeholder cards above will be replaced
                  by your live @bmarcpilates feed automatically.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="container-luxe mt-16 md:mt-20 flex flex-col items-center text-center">
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
          <Instagram size={14} /> Follow @bmarcpilates
        </a>
      </div>
    </section>
  );
}
