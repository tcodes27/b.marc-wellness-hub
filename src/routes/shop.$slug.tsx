import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { ShopCard, type ShopCardItem } from "@/components/shop/ShopCard";
import { openShopLink, resolveShopUrl, detectEnv } from "@/lib/shop-links";
import { ExternalLink, ArrowLeft } from "lucide-react";

/**
 * /shop/:slug serves two purposes:
 *   1. branded short links (resolve from shop_short_links and redirect)
 *   2. item detail pages
 *
 * Short links are checked first. Click count is incremented via
 * shop_increment_click RPC on the server-rendered redirect path,
 * and again on the client if the item page renders.
 */

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ params }) => {
    const { slug } = params;

    // 1. short link?
    const { data: shortLink } = await supabase
      .from("shop_short_links")
      .select("slug, prefix, shop_item_id, target_url, is_active")
      .eq("prefix", "shop")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (shortLink) {
      // fire-and-forget click increment
      void supabase.rpc("shop_increment_click", { _prefix: "shop", _slug: slug });

      // resolve to item link if shop_item_id present
      if (shortLink.shop_item_id) {
        const { data: linkedItem } = await supabase
          .from("shop_items")
          .select("*")
          .eq("id", shortLink.shop_item_id)
          .maybeSingle();
        if (linkedItem) {
          const env = detectEnv(
            typeof navigator !== "undefined" ? navigator.userAgent : "",
          );
          const url = resolveShopUrl(linkedItem as any, env);
          if (url) throw redirect({ href: url });
        }
      }
      if (shortLink.target_url) {
        throw redirect({ href: shortLink.target_url });
      }
    }

    // 2. item detail
    const { data: item, error } = await supabase
      .from("shop_items")
      .select("*")
      .eq("slug", slug)
      .in("status", ["live", "coming_soon"])
      .maybeSingle();

    if (error || !item) {
      throw redirect({ to: "/shop" });
    }

    return { item: item as ShopCardItem };
  },
  component: ShopItemPage,
});

function ShopItemPage() {
  const { item } = Route.useLoaderData();
  const img = item.image_url || item.thumbnail_url;
  const isComingSoon = item.status === "coming_soon";

  return (
    <SiteLayout>
      <section className="pt-32 md:pt-40 pb-16 container-luxe">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-clay hover:text-espresso mb-8"
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="aspect-[4/5] bg-sand rounded-2xl overflow-hidden">
            {img ? (
              <img src={img} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-clay/50 font-serif italic">
                {item.title}
              </div>
            )}
          </div>
          <div>
            {item.category && (
              <span className="text-[0.65rem] uppercase tracking-[0.25em] text-clay">
                {item.category}
              </span>
            )}
            <h1 className="font-serif text-3xl md:text-4xl text-espresso mt-2">{item.title}</h1>
            {item.platform && (
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-clay">
                Available on {item.platform}
              </p>
            )}
            {item.price && (
              <p className="mt-3 font-serif text-2xl text-espresso">{item.price}</p>
            )}
            {item.description && (
              <p className="mt-5 text-sm md:text-base text-clay leading-relaxed">
                {item.description}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => !isComingSoon && openShopLink(item as any)}
                disabled={isComingSoon}
                className="inline-flex items-center gap-2 bg-espresso text-ivory text-xs uppercase tracking-[0.25em] px-6 py-3 rounded-full hover:bg-clay transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ExternalLink size={14} />
                {isComingSoon ? "Coming Soon" : item.button_label || "Shop Now"}
              </button>
              {item.is_digital && (item as any).checkout_url && (
                <a
                  href={(item as any).checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-espresso text-espresso text-xs uppercase tracking-[0.25em] px-6 py-3 rounded-full hover:bg-espresso hover:text-ivory transition"
                >
                  Get the Digital Product
                </a>
              )}
            </div>
            <p className="mt-6 text-[0.6rem] uppercase tracking-[0.25em] text-clay/70">
              This may be an affiliate link — we may earn a small commission at no cost to you.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
