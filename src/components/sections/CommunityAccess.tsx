import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, Compass, Heart, CalendarCheck, History, Award, Sparkles, type LucideIcon } from "lucide-react";
import { images } from "@/config/images";

type Feature = { icon: LucideIcon; title: string; points: string[]; soon?: boolean };

const publicFeatures: Feature[] = [
  { icon: CalendarDays, title: "Upcoming Activities", points: ["Upcoming instructor activities", "Scheduled live classes", "Upcoming wellness events"] },
  { icon: Clock, title: "Instructor Schedule", points: ["When instructors are going live", "Activity dates and times", "Event and class locations"] },
  { icon: Compass, title: "Community Discovery", points: ["Available classes and community experiences", "Upcoming in-person events"] },
];

const portalFeatures: Feature[] = [
  { icon: Heart, title: "Favorite Videos", points: ["Save preferred video content", "Quickly revisit saved workouts"], soon: true },
  { icon: CalendarCheck, title: "Personal Calendar", points: ["Your scheduled activities", "Upcoming classes and events"] },
  { icon: History, title: "Activity History", points: ["Activities you've attended", "A record of your participation"], soon: true },
  { icon: Award, title: "Rewards & Points", points: ["Earn points through participation", "Track accumulated rewards"], soon: true },
  { icon: Sparkles, title: "Personalized Experience", points: ["Your saved content and personal activity in one place"] },
];

function Column({ eyebrow, title, note, items }: { eyebrow: string; title: string; note: string; items: Feature[] }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-7 md:p-9">
      <span className="eyebrow">{eyebrow}</span>
      <h3 className="mt-3 font-serif text-2xl md:text-3xl text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
      <ul className="mt-7 space-y-6">
        {items.map((f) => (
          <li key={f.title} className="flex gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
              <f.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2 font-serif text-lg text-foreground">
                {f.title}
                {f.soon && <span className="rounded-full border border-border px-2 py-0.5 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Coming soon</span>}
              </div>
              <ul className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {f.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommunityAccess() {
  return (
    <section className="py-24 md:py-32" aria-labelledby="community-access-heading">
      <div className="container-luxe">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] items-end">
          <div>
            <span className="eyebrow">Open to everyone</span>
            <h2 id="community-access-heading" className="mt-4 text-4xl md:text-5xl text-foreground">
              Community &amp; <em className="font-light">Membership Experience</em>
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground leading-relaxed">
              Discover classes and events freely. Register for the portal when you want a more personal experience.
            </p>
          </div>
          <div className="relative hidden md:block aspect-[16/10] rounded-3xl overflow-hidden">
            <img src={images.liveClass.src} alt={images.liveClass.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Column eyebrow="No sign-up needed" title="Public Community Access" note="Explore everything happening in the community." items={publicFeatures} />
          <Column eyebrow="Free portal registration" title="Registered Portal Access" note="Additional tools once you create your portal access." items={portalFeatures} />
        </div>

        <div className="mt-10 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">A paid membership is never required to discover classes and events.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/events" className="btn-luxe">View Events</Link>
            <Link to="/portal/signup" className="btn-luxe">Create Your Portal Access</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
