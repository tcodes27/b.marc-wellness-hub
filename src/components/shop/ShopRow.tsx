import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ShopRow({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="container-luxe py-10 md:py-14">
      <div className="flex items-end justify-between mb-5 md:mb-7 gap-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-espresso">{title}</h2>
          {subtitle && (
            <p className="text-xs uppercase tracking-[0.22em] text-clay mt-1.5">{subtitle}</p>
          )}
        </div>
        <div className="hidden md:flex gap-2">
          <button
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
            className="p-2 rounded-full border border-tan/40 hover:bg-sand transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scroll(1)}
            className="p-2 rounded-full border border-tan/40 hover:bg-sand transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {children}
      </div>
    </section>
  );
}
