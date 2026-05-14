import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";

export function Hero() {
  return (
    <section className="relative h-screen min-h-[680px] w-full overflow-hidden">
      <img
        src={hero}
        alt="Woman practicing Pilates in a sunlit studio"
        className="absolute inset-0 w-full h-full object-cover scale-105"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/30 via-espresso/20 to-espresso/70" />

      <div className="relative h-full container-luxe flex flex-col justify-end pb-24 md:pb-32">
        <div className="max-w-3xl">
          <span className="eyebrow !text-ivory/80 animate-fade-in">B.MARC Pilates</span>
          <h1 className="mt-6 font-serif text-ivory text-5xl md:text-7xl lg:text-8xl leading-[1.02] animate-fade-up">
            More Than Pilates.<br />
            <em className="font-light">A Wellness Culture.</em>
          </h1>
          <p
            className="mt-8 text-ivory/85 text-base md:text-lg max-w-xl leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            Movement, connection, and intentional living designed for modern women.
          </p>
          <div
            className="mt-10 flex flex-wrap gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link to="/membership" className="btn-luxe !bg-ivory !text-espresso !border-ivory hover:!bg-transparent hover:!text-ivory">
              Join the Community
            </Link>
            <Link to="/events" className="btn-ghost-luxe hover:!bg-ivory hover:!text-espresso">
              View Events <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory/70 text-[0.65rem] uppercase tracking-[0.4em] animate-fade-in" style={{ animationDelay: "0.6s" }}>
        Scroll
      </div>
    </section>
  );
}
