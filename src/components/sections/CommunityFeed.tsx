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

type Post = {
  src: string;
  alt: string;
  caption: string;
  href: string;
  ratio: "portrait" | "square" | "tall";
  kind?: "reel";
};

// Curated feed. Replace with Instagram Graph API results once a long-lived
// access token is wired in (see CommunityFeed notes).
const posts: Post[] = [
  { src: g1, alt: "Reformer flow", caption: "Sunday reformer ritual.", href: "https://instagram.com/bmarcpilates", ratio: "portrait" },
  { src: e1, alt: "Park gathering", caption: "Golden hour, soft hearts.", href: "https://instagram.com/bmarcpilates", ratio: "square", kind: "reel" },
  { src: g3, alt: "Matcha moment", caption: "Slow mornings.", href: "https://instagram.com/bmarcpilates", ratio: "tall" },
  { src: about, alt: "Studio community", caption: "The B.MARC women.", href: "https://instagram.com/bmarcpilates", ratio: "portrait" },
  { src: g2, alt: "Braided beauty", caption: "Movement as identity.", href: "https://instagram.com/bmarcpilates", ratio: "square" },
  { src: e2, alt: "Brunch club", caption: "Post-flow brunch.", href: "https://instagram.com/bmarcpilates", ratio: "portrait" },
  { src: g5, alt: "Cafe pause", caption: "Soft routines.", href: "https://instagram.com/bmarcpilates", ratio: "tall", kind: "reel" },
  { src: g4, alt: "Linen light", caption: "Quiet practice.", href: "https://instagram.com/bmarcpilates", ratio: "square" },
  { src: e3, alt: "Coastal sunrise", caption: "Breathwork at sunrise.", href: "https://instagram.com/bmarcpilates", ratio: "portrait" },
  { src: membership, alt: "Home Pilates", caption: "Practice from anywhere.", href: "https://instagram.com/bmarcpilates", ratio: "square" },
];

const ratioClass: Record<Post["ratio"], string> = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  tall: "aspect-[2/3]",
};

const widthClass: Record<Post["ratio"], string> = {
  portrait: "w-[260px] md:w-[320px]",
  square: "w-[280px] md:w-[340px]",
  tall: "w-[240px] md:w-[300px]",
};

function Card({ post }: { post: Post }) {
  return (
    <a
      href={post.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative shrink-0 ${widthClass[post.ratio]} group block`}
      aria-label={`Open ${post.alt} on Instagram`}
    >
      <div className={`relative overflow-hidden rounded-[1.75rem] bg-sand ${ratioClass[post.ratio]}`}>
        <img
          src={post.src}
          alt={post.alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/55 via-espresso/0 to-espresso/0 opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

        {post.kind === "reel" && (
          <span className="absolute top-4 right-4 text-[0.6rem] uppercase tracking-[0.3em] text-ivory/95 bg-espresso/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-ivory/25">
            Reel
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

function MarqueeRow({ items, reverse = false, duration = "60s" }: { items: Post[]; reverse?: boolean; duration?: string }) {
  return (
    <div
      className="group/marquee relative overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className="flex gap-5 md:gap-7 w-max animate-marquee group-hover/marquee:[animation-play-state:paused]"
        style={{
          animationDuration: duration,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[...items, ...items].map((post, idx) => (
          <Card key={`${post.src}-${idx}`} post={post} />
        ))}
      </div>
    </div>
  );
}

export function CommunityFeed() {
  const rowA = posts.slice(0, 5);
  const rowB = posts.slice(5);

  return (
    <section className="py-28 md:py-36 bg-gradient-to-b from-ivory via-sand/40 to-ivory overflow-hidden">
      <div className="container-luxe">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <span className="eyebrow">Social Community</span>
            <h2 className="mt-5 font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.01em]">
              Moments from <em className="font-light">our world.</em>
            </h2>
            <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
              A living feed of B.MARC women, rituals and gatherings, pulled straight from our community.
            </p>
          </div>
          <a
            href="https://instagram.com/bmarcpilates"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.28em] link-underline"
          >
            <Instagram size={16} />
            @bmarcpilates
          </a>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <MarqueeRow items={rowA} duration="70s" />
        <MarqueeRow items={rowB} reverse duration="85s" />
      </div>

      <div className="container-luxe mt-16 md:mt-20 flex flex-col items-center text-center">
        <span className="eyebrow">Follow our journey</span>
        <p className="mt-4 font-serif text-2xl md:text-3xl max-w-xl">
          Step inside the everyday rituals of the B.MARC community.
        </p>
        <a
          href="https://instagram.com/bmarcpilates"
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
