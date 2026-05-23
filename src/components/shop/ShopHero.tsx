import { branding } from "@/config/branding";
import { ShoppingBag, BookOpen } from "lucide-react";

export function ShopHero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <section className="relative pt-32 md:pt-40 pb-12 md:pb-16 bg-gradient-to-b from-sand/60 to-ivory">
      <div className="container-luxe text-center max-w-3xl mx-auto">
        <span className="inline-block text-[0.65rem] uppercase tracking-[0.35em] text-clay mb-5">
          The {branding.name} Shop
        </span>
        <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl text-espresso leading-[1.1]">
          Shop the Looks, Tools, and Essentials{" "}
          <em className="italic font-light">Behind the Lifestyle.</em>
        </h1>
        <p className="mt-6 text-sm md:text-base text-clay max-w-xl mx-auto leading-relaxed">
          Curated finds for movement, wellness, everyday style, beauty, and digital resources.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => scrollTo("latest-finds")}
            className="inline-flex items-center gap-2 bg-espresso text-ivory text-xs uppercase tracking-[0.25em] px-6 py-3 rounded-full hover:bg-clay transition"
          >
            <ShoppingBag size={14} /> Shop Latest Finds
          </button>
          <button
            onClick={() => scrollTo("digital-products")}
            className="inline-flex items-center gap-2 border border-espresso text-espresso text-xs uppercase tracking-[0.25em] px-6 py-3 rounded-full hover:bg-espresso hover:text-ivory transition"
          >
            <BookOpen size={14} /> View Digital Products
          </button>
        </div>
        <p className="mt-6 text-[0.6rem] uppercase tracking-[0.25em] text-clay/70">
          Some links are affiliate links — we may earn a small commission at no cost to you.
        </p>
      </div>
    </section>
  );
}
