import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Music2, Facebook, Youtube, Linkedin, Twitter } from "lucide-react";
import { branding, type SocialLink } from "@/config/branding";

const ICONS = {
  instagram: Instagram,
  tiktok: Music2,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  x: Twitter,
  mail: Mail,
} as const;

function SocialIcon({ social }: { social: SocialLink }) {
  const Icon = ICONS[social.icon] ?? Mail;
  const isExternal = social.url.startsWith("http");
  return (
    <a
      href={social.url}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={social.label}
      className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-espresso hover:text-ivory transition-colors"
    >
      <Icon size={16} />
    </a>
  );
}

export function Footer() {
  return (
    <footer className="bg-sand/60 border-t border-border/50 mt-32">
      <div className="container-luxe py-20 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-serif text-2xl tracking-[0.3em] text-espresso">{branding.name}</div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground max-w-sm">
            {branding.footer.description}
          </p>
        </div>
        <div>
          <div className="eyebrow mb-5">{branding.footer.exploreLabel}</div>
          <ul className="space-y-3 text-sm">
            {branding.nav.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="link-underline">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-5">{branding.footer.connectLabel}</div>
          <div className="flex gap-4">
            {branding.socials.map((s) => (
              <SocialIcon key={s.url} social={s} />
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="container-luxe py-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase">
          <span>© {new Date().getFullYear()} {branding.fullName}</span>
          <span>{branding.ethos}</span>
        </div>
      </div>
    </footer>
  );
}
