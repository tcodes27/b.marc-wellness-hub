import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { images, type SiteImage } from "@/config/images";

function EditorialPhoto({ image, className = "" }: { image: SiteImage; className?: string }) {
  return <img src={image.src} alt={image.alt} loading="lazy" decoding="async" width={1536} height={1024} className={`h-full w-full object-cover ${className}`} />;
}

export function StudioEditorial() {
  return (
    <section className="py-20 md:py-28" aria-labelledby="studio-heading">
      <div className="container-luxe">
        <div className="grid gap-8 md:grid-cols-2 items-end mb-10">
          <div><span className="eyebrow">The Studio Experience</span><h2 id="studio-heading" className="mt-5 text-4xl md:text-5xl">Room to move.<br /><em className="font-light">Space to exhale.</em></h2></div>
          <p className="text-muted-foreground leading-relaxed max-w-md md:justify-self-end">A glimpse of the studio we're imagining: natural light, intentional details, and space for your own pace. Our community begins online; our physical studio is still ahead.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="aspect-[16/10] md:col-span-8 overflow-hidden"><EditorialPhoto image={images.studio} /></div>
          <div className="aspect-[4/3] md:aspect-auto md:col-span-4 overflow-hidden"><EditorialPhoto image={images.aboutStudio} /></div>
        </div>
      </div>
    </section>
  );
}

export function MovementEditorial() {
  const practices = [
    { image: images.movement.flow, title: "Mat Pilates", detail: "Core, posture & full-body movement" },
    { image: images.movement.mobility, title: "Gentle Strength", detail: "Lower-body movement, stretching & mobility" },
    { image: images.movement.essentials, title: "Start Where You Are", detail: "Beginner Pilates & self-guided rituals" },
  ];
  return (
    <section className="py-20 md:py-28 bg-secondary/40" aria-labelledby="movement-heading">
      <div className="container-luxe">
        <span className="eyebrow">Pilates & Movement</span>
        <div className="flex flex-wrap items-end justify-between gap-6 mt-5 mb-10">
          <h2 id="movement-heading" className="text-4xl md:text-5xl">Find your <em className="font-light">rhythm.</em></h2>
          <Button asChild variant="link" className="px-0"><Link to="/membership">Explore the community <ArrowUpRight aria-hidden="true" /></Link></Button>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {practices.map((practice) => <article key={practice.title} className="group min-w-0">
            <div className="aspect-[4/3] overflow-hidden"><EditorialPhoto image={practice.image} className="transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none" /></div>
            <h3 className="mt-5 text-2xl">{practice.title}</h3><p className="mt-2 text-sm text-muted-foreground">{practice.detail}</p>
          </article>)}
        </div>
      </div>
    </section>
  );
}

export function WellnessEditorial() {
  return (
    <section className="py-20 md:py-28" aria-labelledby="wellness-heading">
      <div className="container-luxe grid gap-10 md:grid-cols-12 items-center">
        <div className="aspect-[3/4] md:col-span-5 overflow-hidden"><EditorialPhoto image={images.wellness.ritual} /></div>
        <div className="md:col-span-7 md:pl-8">
          <span className="eyebrow">Wellness & Self-Care</span>
          <h2 id="wellness-heading" className="mt-5 text-4xl md:text-5xl">Beyond the mat.<br /><em className="font-light">Back to yourself.</em></h2>
          <p className="mt-6 max-w-lg text-muted-foreground leading-relaxed">Small rituals, taken slowly. Dry brushing, natural soaps, facial care, body oils, and lip care belong to a wider vision of wellness — one that makes room for rest, too.</p>
          <p className="mt-3 text-sm text-muted-foreground">An editorial glimpse of our self-care vision, not a product launch.</p>
          <div className="mt-8 aspect-[16/9] overflow-hidden"><EditorialPhoto image={images.wellness.skincare} /></div>
          <Button asChild variant="link" className="px-0 mt-5"><Link to="/shop">Explore the wellness edit <ArrowUpRight aria-hidden="true" /></Link></Button>
        </div>
      </div>
    </section>
  );
}