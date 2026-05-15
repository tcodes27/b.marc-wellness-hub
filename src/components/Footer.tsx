import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Music2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-sand/60 border-t border-border/50 mt-32">
      <div className="container-luxe py-20 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-serif text-2xl tracking-[0.3em] text-espresso">B.MARC</div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground max-w-sm">
            A movement, a community, a way of living. Pilates, wellness and intention, designed for the modern woman.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-5">Explore</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="link-underline">Home</Link></li>
            <li><Link to="/events" className="link-underline">Events</Link></li>
            <li><Link to="/membership" className="link-underline">Membership</Link></li>
            <li><Link to="/about" className="link-underline">About</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-5">Connect</div>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/bmarcpilates/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-espresso hover:text-ivory transition-colors">
              <Instagram size={16} />
            </a>
            <a href="https://www.tiktok.com/@bmarcpilates" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-espresso hover:text-ivory transition-colors">
              <Music2 size={16} />
            </a>
            <a href="mailto:team@bmarcpilates.com" aria-label="Email team@bmarcpilates.com" className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-espresso hover:text-ivory transition-colors">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="container-luxe py-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase">
          <span>© {new Date().getFullYear()} B.MARC Pilates</span>
          <span>Movement · Community · Intention</span>
        </div>
      </div>
    </footer>
  );
}
