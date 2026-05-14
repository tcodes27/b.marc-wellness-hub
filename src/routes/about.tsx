import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import about from "@/assets/about.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About, B.MARC Pilates" },
      { name: "description", content: "The story, vision and values behind B.MARC Pilates, a wellness culture built around movement, intention and feminine community." },
      { property: "og:title", content: "About, B.MARC Pilates" },
      { property: "og:description", content: "A movement designed for modern women. Built on Pilates, presence and community." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="pt-40 pb-20 md:pt-56 md:pb-28">
        <div className="container-luxe max-w-4xl">
          <span className="eyebrow">Our Story</span>
          <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl leading-[1.02]">
            Movement is our <em className="font-light">love language.</em>
          </h1>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-luxe grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7 aspect-[4/5] rounded-3xl overflow-hidden">
            <img src={about} alt="Studio" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="md:col-span-5 md:pt-16 space-y-6 text-lg leading-[1.7] text-foreground/85 font-light">
            <p>
              B.MARC began with a simple idea, that the way we move shapes the way we live. What started as a single Pilates session in a small Los Angeles loft grew into a community of women practicing presence together.
            </p>
            <p>
              Today, B.MARC is a brand, a studio, and a culture. A space where strength and softness coexist. Where you arrive for the workout and stay for the women.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-sand/50">
        <div className="container-luxe grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="eyebrow">The Vision</span>
            <h2 className="mt-5 text-4xl md:text-5xl">A community of <em className="font-light">intentional women.</em></h2>
            <p className="mt-7 text-muted-foreground leading-relaxed">
              We're building something quieter and more lasting than a fitness brand. B.MARC is a soft place to land, a movement that invites women to come home to themselves through Pilates, ritual and shared breath.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img src={g4} alt="Group flow" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden mt-10">
              <img src={g5} alt="Meditation" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container-luxe">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { n: "01", t: "Move with intention", d: "Every breath, every rep, chosen, not rushed." },
              { n: "02", t: "Hold space for women", d: "A community that softens, lifts and stays." },
              { n: "03", t: "Live the practice", d: "Wellness as a daily ritual, not a routine." },
            ].map((v) => (
              <div key={v.n}>
                <div className="font-serif text-tan text-4xl">{v.n}</div>
                <h3 className="mt-4 text-2xl">{v.t}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
