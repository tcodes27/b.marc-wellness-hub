import membership from "@/assets/membership.jpg";
import { goToYouTube } from "@/lib/youtube";
import { branding } from "@/config/branding";

export function MembershipPreview() {
  const { membership: m } = branding;
  return (
    <section className="py-28 md:py-36 bg-espresso text-ivory">
      <div className="container-luxe grid gap-16 md:grid-cols-2 items-center">
        <div className="order-2 md:order-1">
          <span className="eyebrow !text-tan">{m.eyebrow}</span>
          <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-ivory">
            {m.headlineLead}<em className="font-light">{m.headlineEm}</em>
          </h2>
          <p className="mt-7 text-ivory/75 leading-relaxed max-w-lg">
            {m.body}
          </p>

          <ul className="mt-10 grid sm:grid-cols-2 gap-6">
            {m.features.map((f) => (
              <li key={f.title}>
                <div className="font-serif text-xl">{f.title}</div>
                <div className="mt-1.5 text-sm text-ivory/65 leading-relaxed">{f.description}</div>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <button onClick={() => goToYouTube("channel")} className="btn-luxe !bg-ivory !text-espresso !border-ivory hover:!bg-transparent hover:!text-ivory">
              {branding.cta.startMembership}
            </button>
          </div>
        </div>

        <div className="order-1 md:order-2 relative aspect-[4/5] rounded-3xl overflow-hidden">
          <img
            src={membership}
            alt={`${branding.terminology.membership} preview`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
