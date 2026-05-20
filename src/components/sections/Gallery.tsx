import { images } from "@/config/images";

const items = [
  { ...images.gallery.reformer, span: "row-span-2" },
  { ...images.gallery.groupClass, span: "" },
  { ...images.gallery.matcha, span: "" },
  { ...images.gallery.friends, span: "" },
  { ...images.gallery.meditation, span: "row-span-2" },
];

export function Gallery() {
  return (
    <section className="py-28 md:py-36">
      <div className="container-luxe">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <span className="eyebrow">The Community</span>
            <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl max-w-2xl">
              Moments from <em className="font-light">our world.</em>
            </h2>
          </div>
          <a
            href="https://www.instagram.com/bmarcpilates/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit B.MARC Pilates on Instagram (opens in a new tab)"
            className="text-sm uppercase tracking-[0.28em] link-underline"
          >
            @bmarcpilates
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[180px] md:auto-rows-[240px] gap-3 md:gap-5">
          {items.map((i, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl group ${i.span}`}
            >
              <img
                src={i.src}
                alt={i.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/15 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
