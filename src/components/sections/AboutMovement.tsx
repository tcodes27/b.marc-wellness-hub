import { images } from "@/config/images";
import { branding } from "@/config/branding";

export function AboutMovement() {
  const { about: a } = branding;
  return (
    <section className="py-28 md:py-40 bg-sand/40">
      <div className="container-luxe grid gap-16 md:gap-20 md:grid-cols-2 items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <img
            src={images.aboutStudio.src}
            alt={images.aboutStudio.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] hover:scale-105"
          />
        </div>
        <div>
          <span className="eyebrow">{a.eyebrow}</span>
          <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            {a.headlineLead}<em className="font-light">{a.headlineEm1}</em>{a.headlineMid}<em className="font-light">{a.headlineEm2}</em>.
          </h2>
          <p className="mt-7 text-muted-foreground leading-relaxed max-w-lg">
            {a.body}
          </p>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 max-w-md">
            {a.pillars.map((p) => (
              <div key={p} className="flex items-center gap-3 text-sm">
                <span className="size-1.5 rounded-full bg-clay" />
                <span className="font-medium tracking-wide">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
