import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCommunity } from "@/components/community/CommunityProvider";
import { branding } from "@/config/branding";
import { images } from "@/config/images";

export function Hero() {
  const { open } = useCommunity();
  return (
    <section className="relative min-h-[100svh] sm:min-h-[640px] w-full overflow-hidden">
      <img
        src={images.hero.src}
        alt={images.hero.alt}
        className="absolute inset-0 w-full h-full object-cover scale-105"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/55 via-espresso/35 to-espresso/80 sm:from-espresso/30 sm:via-espresso/20 sm:to-espresso/70" />

      <div className="relative min-h-[100svh] sm:min-h-[640px] container-luxe flex flex-col justify-end pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 md:pb-32">
        <div className="max-w-3xl">
          <span className="eyebrow !text-ivory/80 animate-fade-in">{branding.hero.eyebrow}</span>
          <h1 className="mt-4 sm:mt-5 font-serif text-ivory text-[2rem] leading-[1.1] xs:text-[2.25rem] sm:text-5xl sm:leading-[1.06] md:text-6xl md:leading-[1.05] lg:text-7xl lg:leading-[1.04] tracking-[-0.01em] animate-fade-up break-words">

            {branding.hero.headlineLead}<br />
            <em className="font-light">{branding.hero.headlineEm}</em>
          </h1>
          <p
            className="mt-8 text-ivory/85 text-base md:text-lg max-w-xl leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            {branding.hero.subtext}
          </p>
          <div
            className="mt-10 flex flex-wrap gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <button onClick={() => open("hero")} className="btn-luxe !bg-ivory !text-espresso !border-ivory hover:!bg-transparent hover:!text-ivory">
              {branding.cta.joinCommunity}
            </button>
            <Link to="/events" className="btn-ghost-luxe hover:!bg-ivory hover:!text-espresso">
              {branding.cta.viewEvents} <ArrowRight size={14} />
            </Link>
          </div>

          <div
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.65rem] uppercase tracking-[0.32em] text-ivory/70 animate-fade-up"
            style={{ animationDelay: "0.45s" }}
          >
            <span>Beginner-friendly</span>
            <span className="text-ivory/30">·</span>
            <span>Online + In-Person</span>
            <span className="text-ivory/30">·</span>
            <span>Community-led</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory/70 text-[0.65rem] uppercase tracking-[0.4em] animate-fade-in" style={{ animationDelay: "0.6s" }}>
        Scroll
      </div>
    </section>
  );
}
