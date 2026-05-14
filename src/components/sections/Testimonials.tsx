import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const quotes = [
  {
    q: "B.MARC didn't just change my body — it changed the way I show up for myself. The community holds you with such grace.",
    n: "Isabella M.",
    r: "Member since 2024",
  },
  {
    q: "Every class feels like a ritual. Soft music, candlelight, and women lifting each other up. It's the only place I truly exhale.",
    n: "Sasha L.",
    r: "Studio Regular",
  },
  {
    q: "I came for the Pilates and stayed for the women. This is more than a workout — it's a way of living I didn't know I needed.",
    n: "Camille R.",
    r: "Online Member",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const t = quotes[i];

  return (
    <section className="py-28 md:py-36 bg-sand/50">
      <div className="container-luxe max-w-4xl text-center">
        <Quote size={36} className="mx-auto text-clay" strokeWidth={1} />
        <blockquote
          key={i}
          className="mt-8 font-serif text-2xl md:text-4xl leading-[1.3] text-espresso animate-fade-in"
        >
          “{t.q}”
        </blockquote>
        <div className="mt-10">
          <div className="font-medium tracking-wide">{t.n}</div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-1">{t.r}</div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            aria-label="Previous"
            onClick={() => setI((i - 1 + quotes.length) % quotes.length)}
            className="size-11 rounded-full border border-border flex items-center justify-center hover:bg-espresso hover:text-ivory transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            {quotes.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-1 rounded-full transition-all ${idx === i ? "w-8 bg-espresso" : "w-4 bg-clay/40"}`}
              />
            ))}
          </div>
          <button
            aria-label="Next"
            onClick={() => setI((i + 1) % quotes.length)}
            className="size-11 rounded-full border border-border flex items-center justify-center hover:bg-espresso hover:text-ivory transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
