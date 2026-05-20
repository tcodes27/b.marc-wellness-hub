import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { images } from "@/config/images";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About, B.MARC Pilates" },
      { name: "description", content: "B.MARC is a hybrid wellness community — online today, in-studio soon. Self-guided digital reformer sessions, live instructor-led classes, and pop-up events designed for beginners and modern lifestyles." },
      { property: "og:title", content: "About, B.MARC Pilates" },
      { property: "og:description", content: "A wellness community built around movement — online today, hybrid tomorrow." },
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
            A wellness community, <em className="font-light">online and in real life.</em>
          </h1>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-luxe grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7 aspect-[4/5] rounded-3xl overflow-hidden">
            <img src={images.founder.src} alt={images.founder.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
          <div className="md:col-span-5 md:pt-16 space-y-6 text-lg leading-[1.7] text-foreground/85 font-light">
            <p>
              B.MARC began with a simple belief — that movement is a love language, and wellness should fit into real life, not compete with it. Founded by Erra, a Pilates instructor based in Atlanta, we're building a modern wellness community designed to feel less intimidating and more like home.
            </p>
            <p>
              Today, we're an online-first membership: guided movement, mobility, stretching, and Pilates-inspired flows delivered to a growing community of beginners and seasoned movers alike. Pop-up events, workshops, and meetups bring the community together in real life.
            </p>
            <p>
              Soon, we'll open a studio designed around two ways to experience B.MARC — self-guided digital reformer sessions for members who want privacy, pace, and flexibility, and live, instructor-led classes for the energy and connection of a group. Hybrid by design, beginner by welcome.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-sand/50">
        <div className="container-luxe">
          <div className="max-w-2xl mb-14">
            <span className="eyebrow">The Studio Vision</span>
            <h2 className="mt-5 text-4xl md:text-5xl">Two ways to <em className="font-light">experience B.MARC.</em></h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              When our studio opens, members choose the experience that fits the moment — quiet and self-paced, or live and community-led.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-ivory rounded-3xl overflow-hidden border border-border/60">
              <div className="aspect-[5/3] overflow-hidden">
                <img src={images.selfGuided.src} alt={images.selfGuided.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="p-8">
                <span className="eyebrow text-clay">Option One</span>
                <h3 className="mt-3 font-serif text-2xl md:text-3xl">Self-Guided Reformer</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Follow digital instructor sessions on your own time. Move at your own pace, in a calm, premium, technology-enhanced studio. Ideal for beginners, introverts, and anyone who wants privacy and flexibility.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-espresso/85">
                  <li>· Structured guided routines</li>
                  <li>· Self-paced, low-pressure</li>
                  <li>· Off-hour access</li>
                </ul>
              </div>
            </div>
            <div className="bg-ivory rounded-3xl overflow-hidden border border-border/60">
              <div className="aspect-[5/3] overflow-hidden">
                <img src={images.liveClass.src} alt={images.liveClass.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="p-8">
                <span className="eyebrow text-clay">Option Two</span>
                <h3 className="mt-3 font-serif text-2xl md:text-3xl">Live Community Classes</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Instructor-led group sessions built around community, energy, and accountability. Welcoming, inclusive, empowering — high-end without the intimidation of traditional gym culture.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-espresso/85">
                  <li>· Group energy & connection</li>
                  <li>· Live coaching & cues</li>
                  <li>· Shared wellness rituals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container-luxe">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { n: "01", t: "Beginners welcome", d: "Guided support, self-paced options, no intimidation — just an invitation in." },
              { n: "02", t: "Community-first", d: "A wellness culture, not a gym. Human-centered, inclusive, and built around connection." },
              { n: "03", t: "Hybrid by design", d: "Online today, in-studio tomorrow. Self-guided or live — your wellness, your way." },
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
