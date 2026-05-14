import { Link } from "@tanstack/react-router";
import membership from "@/assets/membership.jpg";
import { useBooking } from "@/components/booking/BookingProvider";

const features = [
  { t: "On-Demand Classes", d: "Reformer, mat & sculpt sessions, anywhere." },
  { t: "Beginner Programs", d: "Step-by-step paths to build a confident practice." },
  { t: "Wellness Routines", d: "Morning rituals, breathwork & sleep flows." },
  { t: "Lifestyle Content", d: "Recipes, edits and conversations on living well." },
];

export function MembershipPreview() {
  const { open } = useBooking();
  return (
    <section className="py-28 md:py-36 bg-espresso text-ivory">
      <div className="container-luxe grid gap-16 md:grid-cols-2 items-center">
        <div className="order-2 md:order-1">
          <span className="eyebrow !text-tan">The Membership</span>
          <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl text-ivory">
            Your studio, <em className="font-light">in your pocket.</em>
          </h2>
          <p className="mt-7 text-ivory/75 leading-relaxed max-w-lg">
            Stream Pilates classes and wellness rituals anytime, powered by Uscreen. Move with us from anywhere in the world.
          </p>

          <ul className="mt-10 grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <li key={f.t}>
                <div className="font-serif text-xl">{f.t}</div>
                <div className="mt-1.5 text-sm text-ivory/65 leading-relaxed">{f.d}</div>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <button onClick={() => open({ title: "Join the Community" })} className="btn-luxe !bg-ivory !text-espresso !border-ivory hover:!bg-transparent hover:!text-ivory">
              Start Your Journey
            </button>
          </div>
        </div>

        <div className="order-1 md:order-2 relative aspect-[4/5] rounded-3xl overflow-hidden">
          <img
            src={membership}
            alt="Online Pilates class on a laptop"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
