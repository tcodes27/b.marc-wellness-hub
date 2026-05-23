import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { resolveShopUrl, detectEnv } from "@/lib/shop-links";

/**
 * /go/:slug — branded short-link redirector.
 * Resolves via shop_short_links (prefix='go') and increments click_count.
 * If linked to a shop_item, uses the link resolver to pick the best URL
 * for the visitor's environment.
 */
export const Route = createFileRoute("/go/$slug")({
  loader: async ({ params }) => {
    const { slug } = params;

    const { data: link } = await supabase
      .from("shop_short_links")
      .select("slug, prefix, shop_item_id, target_url, is_active")
      .eq("prefix", "go")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (!link) throw redirect({ to: "/shop" });

    void supabase.rpc("shop_increment_click", { _prefix: "go", _slug: slug });

    if (link.shop_item_id) {
      const { data: item } = await supabase
        .from("shop_items")
        .select("*")
        .eq("id", link.shop_item_id)
        .maybeSingle();
      if (item) {
        const env = detectEnv(
          typeof navigator !== "undefined" ? navigator.userAgent : "",
        );
        const url = resolveShopUrl(item as any, env);
        if (url) throw redirect({ href: url });
      }
    }
    if (link.target_url) throw redirect({ href: link.target_url });
    throw redirect({ to: "/shop" });
  },
  component: () => null,
});
