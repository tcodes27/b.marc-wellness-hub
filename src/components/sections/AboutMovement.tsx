import about from "@/assets/about.jpg";

const pillars = [
  "Wellness",
  "Confidence",
  "Discipline",
  "Feminine Energy",
  "Community",
  "Intentional Living",
];

export function AboutMovement() {
  return (
    <section className="py-28 md:py-40 bg-sand/40">
      <div className="container-luxe grid gap-16 md:gap-20 md:grid-cols-2 items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <img
            src={about}
            alt="Sunlit Pilates studio"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] hover:scale-105"
          />
        </div>
        <div>
          <span className="eyebrow">The Movement</span>
          <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            A practice of <em className="font-light">presence</em>, a culture of <em className="font-light">care</em>.
          </h2>
          <p className="mt-7 text-muted-foreground leading-relaxed max-w-lg">
            B.MARC was born from a simple belief — that movement is a love language. We build strength on the mat and a softer, more intentional life off of it. This is Pilates as ritual, community as medicine.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 max-w-md">
            {pillars.map((p) => (
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
