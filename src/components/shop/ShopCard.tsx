import { openShopLink, type ShopLinkFields } from "@/lib/shop-links";
import { ExternalLink, Download, Sparkles } from "lucide-react";

export type ShopCardItem = ShopLinkFields & {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category?: string | null;
  price?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
  button_label?: string | null;
  status?: string | null;
  is_digital?: boolean | null;
  checkout_url?: string | null;
};

export function ShopCard({ item }: { item: ShopCardItem }) {
  const img = item.thumbnail_url || item.image_url;
  const isComingSoon = item.status === "coming_soon";
  const label =
    isComingSoon
      ? "Coming Soon"
      : item.button_label?.trim() ||
        (item.is_digital ? "Download" : "Shop Now");

  const handleClick = (e: React.MouseEvent) => {
    if (isComingSoon) return;
    e.preventDefault();
    if (item.is_digital && item.checkout_url) {
      window.open(item.checkout_url, "_blank", "noopener,noreferrer");
      return;
    }
    openShopLink(item);
  };

  return (
    <article className="snap-start shrink-0 w-[78%] sm:w-[46%] md:w-[31%] lg:w-[23%] bg-white border border-tan/30 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/5] bg-sand overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-clay/50 font-serif italic">
            {item.title}
          </div>
        )}
        {item.platform && (
          <span className="absolute top-3 left-3 bg-ivory/90 backdrop-blur text-espresso text-[0.6rem] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full">
            {item.platform}
          </span>
        )}
        {isComingSoon && (
          <span className="absolute top-3 right-3 bg-espresso text-ivory text-[0.6rem] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Sparkles size={10} /> Coming Soon
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {item.category && (
          <span className="text-[0.6rem] uppercase tracking-[0.22em] text-clay mb-1.5">
            {item.category}
          </span>
        )}
        <h3 className="font-serif text-base md:text-lg text-espresso leading-snug">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-clay mt-1.5 line-clamp-2 flex-1">{item.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          {item.price && (
            <span className="font-serif text-sm text-espresso">{item.price}</span>
          )}
          <button
            onClick={handleClick}
            disabled={isComingSoon}
            rel="noopener nofollow sponsored"
            className="ml-auto inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.2em] bg-espresso text-ivory px-3.5 py-2 rounded-full hover:bg-clay transition disabled:bg-clay/50 disabled:cursor-not-allowed"
          >
            {item.is_digital ? <Download size={11} /> : <ExternalLink size={11} />}
            {label}
          </button>
        </div>
      </div>
    </article>
  );
}
