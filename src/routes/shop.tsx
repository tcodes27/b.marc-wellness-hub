import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopRow } from "@/components/shop/ShopRow";
import { ShopCard, type ShopCardItem } from "@/components/shop/ShopCard";
import { supabase } from "@/integrations/supabase/client";
import { branding } from "@/config/branding";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: `Shop — ${branding.fullName}` },
      {
        name: "description",
        content:
          "Curated finds for movement, wellness, everyday style, beauty, and digital resources. Shop the lifestyle behind B.MARC Pilates.",
      },
      { property: "og:title", content: `Shop — ${branding.fullName}` },
      {
        property: "og:description",
        content:
          "Curated finds for movement, wellness, everyday style, beauty, and digital resources.",
      },
    ],
  }),
  component: ShopPage,
});

type Collection = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
};

type Item = ShopCardItem & {
  collection_id: string | null;
  is_featured: boolean;
  sort_order: number;
};

const DEFAULT_COLLECTIONS: Array<{ slug: string; title: string }> = [
  { slug: "latest-finds", title: "Latest Finds" },
  { slug: "get-ready-with-me", title: "Get Ready With Me" },
  { slug: "pilates-looks", title: "Pilates Looks" },
  { slug: "gym-running", title: "Gym + Running" },
  { slug: "walking-essentials", title: "Walking Essentials" },
  { slug: "boots-style", title: "Boots + Style Finds" },
  { slug: "beauty-self-care", title: "Beauty + Self-Care" },
  { slug: "home-wellness", title: "Home + Wellness" },
  { slug: "amazon-favorites", title: "Amazon Favorites" },
  { slug: "digital-products", title: "Digital Products + eBooks" },
];

function ShopPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cRes, iRes] = await Promise.all([
        supabase
          .from("shop_collections")
          .select("id, slug, title, description, sort_order")
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("shop_items")
          .select("*")
          .in("status", ["live", "coming_soon"])
          .order("sort_order", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      setCollections((cRes.data ?? []) as Collection[]);
      setItems((iRes.data ?? []) as Item[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byCollection = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of items) {
      const key = it.collection_id ?? "_uncategorized";
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    }
    return map;
  }, [items]);

  // Build the rows we'll render: real collections first, then default
  // placeholder rows so the page always shows the full editorial structure.
  const rowsToRender = useMemo(() => {
    const renderable: Array<{
      key: string;
      slug: string;
      title: string;
      items: Item[];
    }> = [];

    // Featured first if any
    const featured = items.filter((i) => i.is_featured);
    if (featured.length > 0) {
      renderable.push({ key: "featured", slug: "featured", title: "Featured", items: featured });
    }

    // Real published collections
    for (const c of collections) {
      renderable.push({
        key: c.id,
        slug: c.slug,
        title: c.title,
        items: byCollection.get(c.id) ?? [],
      });
    }

    // Default editorial slots that have no real collection yet — show as
    // "Coming Soon" rows so the page structure is always present.
    const existingSlugs = new Set(collections.map((c) => c.slug));
    for (const d of DEFAULT_COLLECTIONS) {
      if (!existingSlugs.has(d.slug)) {
        renderable.push({ key: `default-${d.slug}`, slug: d.slug, title: d.title, items: [] });
      }
    }

    // Uncategorized last if any
    const uncategorized = byCollection.get("_uncategorized") ?? [];
    if (uncategorized.length > 0) {
      renderable.push({
        key: "uncategorized",
        slug: "more",
        title: "More Finds",
        items: uncategorized,
      });
    }

    return renderable;
  }, [collections, byCollection, items]);

  return (
    <SiteLayout>
      <ShopHero />

      {loading ? (
        <div className="container-luxe py-20 flex justify-center">
          <Loader2 className="animate-spin text-clay" />
        </div>
      ) : (
        <>
          {rowsToRender.map((row) => (
            <div key={row.key} id={row.slug}>
              <ShopRow title={row.title}>
                {row.items.length === 0 ? (
                  <EmptyRow />
                ) : (
                  row.items.map((it) => <ShopCard key={it.id} item={it} />)
                )}
              </ShopRow>
            </div>
          ))}

          <section className="container-luxe py-16 md:py-24 text-center border-t border-tan/30 mt-8">
            <h2 className="font-serif text-2xl md:text-3xl text-espresso">
              Want a closer look at something?
            </h2>
            <p className="text-sm text-clay mt-3 max-w-md mx-auto">
              Follow along on Instagram and TikTok — most shop links live in our bio and stories.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {branding.socials
                .filter((s) => s.icon === "instagram" || s.icon === "tiktok")
                .map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-[0.25em] border border-espresso text-espresso px-5 py-2.5 rounded-full hover:bg-espresso hover:text-ivory transition"
                  >
                    {s.label}
                  </a>
                ))}
              <Link
                to="/about"
                className="text-xs uppercase tracking-[0.25em] bg-espresso text-ivory px-5 py-2.5 rounded-full hover:bg-clay transition"
              >
                About B.MARC
              </Link>
            </div>
          </section>
        </>
      )}
    </SiteLayout>
  );
}

function EmptyRow() {
  return (
    <div className="snap-start shrink-0 w-full bg-sand/40 border border-dashed border-tan/40 rounded-2xl px-6 py-10 text-center">
      <p className="font-serif italic text-clay text-sm">
        New finds dropping soon — check back shortly.
      </p>
    </div>
  );
}
