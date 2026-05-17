import { goToYouTube, YOUTUBE_CHANNEL_URL } from "@/lib/youtube";
import { Play, Youtube } from "lucide-react";

const featured = [
  { t: "Featured Classes", d: "Signature Pilates flows, filmed in studio.", dest: "videos" as const },
  { t: "Beginner Playlists", d: "A grounded entry point to your practice.", dest: "playlists" as const },
  { t: "Wellness Drops", d: "Breathwork, mobility and intentional rituals.", dest: "featured" as const },
];

export function YouTubeShowcase() {
  return (
    <section className="py-28 md:py-36 bg-ivory">
      <div className="container-luxe">
        <div className="flex items-end justify-between gap-10 flex-wrap mb-14">
          <div className="max-w-xl">
            <span className="eyebrow">On YouTube</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl">
              Curated Pilates, <em className="font-light">streaming now.</em>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Free wellness sessions live on our channel. Member-only classes
              arrive as private, unlisted links — straight to you.
            </p>
          </div>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.28em] link-underline"
          >
            <Youtube size={16} /> Visit the channel
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((f) => (
            <button
              key={f.t}
              onClick={() => goToYouTube(f.dest)}
              className="group text-left bg-card rounded-2xl p-7 border border-border/60 hover:border-clay/40 transition-colors"
            >
              <div className="flex items-center gap-3 text-clay">
                <span className="h-10 w-10 rounded-full bg-espresso text-ivory flex items-center justify-center group-hover:bg-clay transition-colors">
                  <Play size={14} className="ml-0.5" />
                </span>
                <span className="text-[0.65rem] uppercase tracking-[0.3em]">YouTube</span>
              </div>
              <div className="mt-6 font-serif text-2xl">{f.t}</div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
