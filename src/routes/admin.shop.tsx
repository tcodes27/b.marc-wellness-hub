import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Save, Upload, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/shop")({
  component: AdminShop,
});

type Collection = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
};

type Item = {
  id: string;
  slug: string;
  collection_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  price: string | null;
  platform: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  pinterest_url: string | null;
  button_label: string | null;
  status: "draft" | "live" | "coming_soon";
  is_featured: boolean;
  is_digital: boolean;
  digital_file_url: string | null;
  checkout_url: string | null;
  regular_url: string | null;
  mobile_deep_link: string | null;
  app_link: string | null;
  fallback_url: string | null;
  affiliate_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  open_behavior: string | null;
  tags: string[];
  sort_order: number;
};

type ShortLink = {
  id: string;
  slug: string;
  prefix: "shop" | "go";
  shop_item_id: string | null;
  target_url: string | null;
  click_count: number;
  is_active: boolean;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminShop() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-espresso">Shop Manager</h1>
        <p className="text-sm text-clay mt-1">
          Manage shop items, collections, digital products, and short links.
        </p>
      </header>
      <Tabs defaultValue="items">
        <TabsList className="mb-6 bg-sand/60">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="shortlinks">Short Links</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <ItemsPanel />
        </TabsContent>
        <TabsContent value="collections">
          <CollectionsPanel />
        </TabsContent>
        <TabsContent value="shortlinks">
          <ShortLinksPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------------------------------------------------------- ITEMS */

function ItemsPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  const load = async () => {
    setLoading(true);
    const [iRes, cRes] = await Promise.all([
      supabase
        .from("shop_items")
        .select("*")
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("shop_collections").select("*").order("sort_order"),
    ]);
    if (iRes.error) toast.error(iRes.error.message);
    setItems((iRes.data ?? []) as Item[]);
    setCollections((cRes.data ?? []) as Collection[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("shop_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      void load();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs uppercase tracking-[0.22em] text-clay">
          {items.length} item{items.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-espresso text-ivory text-xs uppercase tracking-[0.22em] px-4 py-2.5 rounded-full"
        >
          <Plus size={14} /> New Item
        </button>
      </div>

      {showForm && (
        <ItemForm
          item={editing}
          collections={collections}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            void load();
          }}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-clay" />
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="bg-white border border-tan/30 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-sand rounded-lg overflow-hidden shrink-0">
                {(it.thumbnail_url || it.image_url) && (
                  <img
                    src={it.thumbnail_url || it.image_url || ""}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif text-base text-espresso">{it.title}</span>
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-sand text-clay">
                    {it.status}
                  </span>
                  {it.is_featured && (
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-espresso text-ivory">
                      Featured
                    </span>
                  )}
                  {it.is_digital && (
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Digital
                    </span>
                  )}
                </div>
                <p className="text-xs text-clay truncate">
                  /shop/{it.slug} · {it.platform || "—"} · {it.category || "Uncategorized"}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setEditing(it);
                    setShowForm(true);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-tan/40 hover:bg-sand"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(it.id)}
                  className="text-xs p-1.5 rounded-lg border border-tan/40 hover:bg-red-50 text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-10 text-sm text-clay">
              No items yet — add your first one above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const EMPTY_ITEM: Partial<Item> = {
  slug: "",
  title: "",
  description: "",
  category: "",
  price: "",
  platform: "",
  image_url: "",
  thumbnail_url: "",
  video_url: "",
  pinterest_url: "",
  button_label: "Shop Now",
  status: "draft",
  is_featured: false,
  is_digital: false,
  digital_file_url: "",
  checkout_url: "",
  regular_url: "",
  mobile_deep_link: "",
  app_link: "",
  fallback_url: "",
  affiliate_url: "",
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  open_behavior: "new_tab",
  tags: [],
  sort_order: 0,
};

function ItemForm({
  item,
  collections,
  onClose,
  onSaved,
}: {
  item: Item | null;
  collections: Collection[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>(item ?? EMPTY_ITEM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagsInput, setTagsInput] = useState((item?.tags ?? []).join(", "));

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    const path = `items/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("shop-media").upload(path, file);
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from("shop-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.title?.trim()) return toast.error("Title is required");
    const slug = (form.slug?.trim() || slugify(form.title)).slice(0, 80);

    const payload = {
      slug,
      collection_id: form.collection_id || null,
      title: form.title.trim(),
      description: form.description?.trim() || null,
      category: form.category?.trim() || null,
      price: form.price?.trim() || null,
      platform: form.platform?.trim() || null,
      image_url: form.image_url?.trim() || null,
      thumbnail_url: form.thumbnail_url?.trim() || null,
      video_url: form.video_url?.trim() || null,
      pinterest_url: form.pinterest_url?.trim() || null,
      button_label: form.button_label?.trim() || "Shop Now",
      status: form.status || "draft",
      is_featured: !!form.is_featured,
      is_digital: !!form.is_digital,
      digital_file_url: form.digital_file_url?.trim() || null,
      checkout_url: form.checkout_url?.trim() || null,
      regular_url: form.regular_url?.trim() || null,
      mobile_deep_link: form.mobile_deep_link?.trim() || null,
      app_link: form.app_link?.trim() || null,
      fallback_url: form.fallback_url?.trim() || null,
      affiliate_url: form.affiliate_url?.trim() || null,
      utm_source: form.utm_source?.trim() || null,
      utm_medium: form.utm_medium?.trim() || null,
      utm_campaign: form.utm_campaign?.trim() || null,
      open_behavior: form.open_behavior || "new_tab",
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      sort_order: Number(form.sort_order) || 0,
    };

    setSaving(true);
    const { error } = item
      ? await supabase.from("shop_items").update(payload).eq("id", item.id)
      : await supabase.from("shop_items").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(item ? "Updated" : "Created");
    onSaved();
  };

  return (
    <div className="bg-white border border-tan/30 rounded-2xl p-5 mb-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Title">
          <input
            value={form.title || ""}
            onChange={(e) => set("title", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Slug (URL)">
          <input
            value={form.slug || ""}
            onChange={(e) => set("slug", slugify(e.target.value))}
            placeholder={form.title ? slugify(form.title) : "auto-from-title"}
            className={inputCls}
          />
        </Field>
        <Field label="Collection">
          <select
            value={form.collection_id || ""}
            onChange={(e) => set("collection_id", e.target.value || null)}
            className={inputCls}
          >
            <option value="">— None —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category (display label)">
          <input
            value={form.category || ""}
            onChange={(e) => set("category", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Platform (Amazon, LTK, ...)">
          <input
            value={form.platform || ""}
            onChange={(e) => set("platform", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Price (display only)">
          <input
            value={form.price || ""}
            onChange={(e) => set("price", e.target.value)}
            placeholder="$48"
            className={inputCls}
          />
        </Field>
        <Field label="Description" className="md:col-span-2">
          <textarea
            value={form.description || ""}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className={inputCls}
          />
        </Field>

        <Field label="Image URL (or upload)">
          <div className="flex gap-2">
            <input
              value={form.image_url || ""}
              onChange={(e) => set("image_url", e.target.value)}
              className={inputCls}
            />
            <label className="cursor-pointer inline-flex items-center justify-center px-3 rounded-lg border border-tan/40 hover:bg-sand">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadFile(f);
                  if (url) {
                    set("image_url", url);
                    if (!form.thumbnail_url) set("thumbnail_url", url);
                  }
                }}
              />
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            </label>
          </div>
        </Field>
        <Field label="Thumbnail URL">
          <input
            value={form.thumbnail_url || ""}
            onChange={(e) => set("thumbnail_url", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="YouTube video URL">
          <input
            value={form.video_url || ""}
            onChange={(e) => set("video_url", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Pinterest URL">
          <input
            value={form.pinterest_url || ""}
            onChange={(e) => set("pinterest_url", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Button label">
          <input
            value={form.button_label || ""}
            onChange={(e) => set("button_label", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Status">
          <select
            value={form.status || "draft"}
            onChange={(e) => set("status", e.target.value)}
            className={inputCls}
          >
            <option value="draft">Draft (hidden)</option>
            <option value="live">Live</option>
            <option value="coming_soon">Coming Soon</option>
          </select>
        </Field>

        <Field label="Tags (comma separated)" className="md:col-span-2">
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className={inputCls}
          />
        </Field>

        <div className="md:col-span-2 border-t border-tan/30 pt-4 mt-2">
          <h3 className="font-serif text-lg text-espresso mb-3">Link Behavior</h3>
        </div>

        <Field label="Affiliate URL (preferred)">
          <input
            value={form.affiliate_url || ""}
            onChange={(e) => set("affiliate_url", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Regular URL">
          <input
            value={form.regular_url || ""}
            onChange={(e) => set("regular_url", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Mobile deep link">
          <input
            value={form.mobile_deep_link || ""}
            onChange={(e) => set("mobile_deep_link", e.target.value)}
            placeholder="https://amazon.com/... or universal link"
            className={inputCls}
          />
        </Field>
        <Field label="App link (URI scheme)">
          <input
            value={form.app_link || ""}
            onChange={(e) => set("app_link", e.target.value)}
            placeholder="com.amazon.mobile.shopping://..."
            className={inputCls}
          />
        </Field>
        <Field label="Fallback URL">
          <input
            value={form.fallback_url || ""}
            onChange={(e) => set("fallback_url", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Open behavior">
          <select
            value={form.open_behavior || "new_tab"}
            onChange={(e) => set("open_behavior", e.target.value)}
            className={inputCls}
          >
            <option value="new_tab">New tab</option>
            <option value="same_tab">Same tab</option>
            <option value="app_first">Try native app first (mobile)</option>
          </select>
        </Field>

        <Field label="UTM source">
          <input
            value={form.utm_source || ""}
            onChange={(e) => set("utm_source", e.target.value)}
            placeholder="bmarc"
            className={inputCls}
          />
        </Field>
        <Field label="UTM medium">
          <input
            value={form.utm_medium || ""}
            onChange={(e) => set("utm_medium", e.target.value)}
            placeholder="shop"
            className={inputCls}
          />
        </Field>
        <Field label="UTM campaign">
          <input
            value={form.utm_campaign || ""}
            onChange={(e) => set("utm_campaign", e.target.value)}
            className={inputCls}
          />
        </Field>

        <div className="md:col-span-2 border-t border-tan/30 pt-4 mt-2">
          <h3 className="font-serif text-lg text-espresso mb-3">Digital Product (optional)</h3>
        </div>
        <Field label="Is digital product?">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.is_digital}
              onChange={(e) => set("is_digital", e.target.checked)}
            />
            Yes (eBook, PDF, guide, etc.)
          </label>
        </Field>
        <Field label="Featured?">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.is_featured}
              onChange={(e) => set("is_featured", e.target.checked)}
            />
            Show in Featured row
          </label>
        </Field>
        <Field label="Digital file URL (PDF download)">
          <input
            value={form.digital_file_url || ""}
            onChange={(e) => set("digital_file_url", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Checkout URL (Stripe / Gumroad / etc.)">
          <input
            value={form.checkout_url || ""}
            onChange={(e) => set("checkout_url", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Sort order (higher = first)">
          <input
            type="number"
            value={form.sort_order ?? 0}
            onChange={(e) => set("sort_order", Number(e.target.value))}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="mt-5 flex gap-2 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-xs uppercase tracking-[0.22em] text-clay">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-espresso text-ivory text-xs uppercase tracking-[0.22em] px-5 py-2.5 rounded-full disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {item ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- COLLECTIONS */

function CollectionsPanel() {
  const [rows, setRows] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ slug: "", title: "", description: "", sort_order: 0 });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shop_collections")
      .select("*")
      .order("sort_order");
    if (error) toast.error(error.message);
    setRows((data ?? []) as Collection[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    const slug = form.slug.trim() || slugify(form.title);
    const { error } = await supabase.from("shop_collections").insert({
      slug,
      title: form.title.trim(),
      description: form.description.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_published: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Created");
    setForm({ slug: "", title: "", description: "", sort_order: 0 });
    void load();
  };

  const update = async (id: string, patch: Partial<Collection>) => {
    const { error } = await supabase.from("shop_collections").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete collection? Items in it will be uncategorized.")) return;
    const { error } = await supabase.from("shop_collections").delete().eq("id", id);
    if (error) toast.error(error.message);
    else void load();
  };

  return (
    <div>
      <div className="bg-white border border-tan/30 rounded-xl p-4 mb-5 grid md:grid-cols-4 gap-3">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
        />
        <input
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
          className={inputCls}
        />
        <input
          placeholder="Sort order"
          type="number"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          className={inputCls}
        />
        <button
          onClick={create}
          className="inline-flex items-center justify-center gap-2 bg-espresso text-ivory text-xs uppercase tracking-[0.22em] px-4 rounded-full"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {loading ? (
        <Loader2 className="animate-spin text-clay mx-auto" />
      ) : (
        <div className="grid gap-2">
          {rows.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-tan/30 rounded-xl p-4 flex items-center gap-3"
            >
              <input
                value={c.title}
                onChange={(e) => update(c.id, { title: e.target.value })}
                className={inputCls + " flex-1"}
              />
              <input
                value={c.slug}
                onChange={(e) => update(c.id, { slug: slugify(e.target.value) })}
                className={inputCls + " w-40"}
              />
              <input
                type="number"
                value={c.sort_order}
                onChange={(e) => update(c.id, { sort_order: Number(e.target.value) })}
                className={inputCls + " w-20"}
              />
              <label className="inline-flex items-center gap-1.5 text-xs text-clay">
                <input
                  type="checkbox"
                  checked={c.is_published}
                  onChange={(e) => update(c.id, { is_published: e.target.checked })}
                />
                Published
              </label>
              <button
                onClick={() => remove(c.id)}
                className="p-1.5 rounded-lg border border-tan/40 hover:bg-red-50 text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- SHORT LINKS */

function ShortLinksPanel() {
  const [rows, setRows] = useState<ShortLink[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    slug: "",
    prefix: "shop" as "shop" | "go",
    shop_item_id: "",
    target_url: "",
  });

  const load = async () => {
    setLoading(true);
    const [sRes, iRes] = await Promise.all([
      supabase.from("shop_short_links").select("*").order("created_at", { ascending: false }),
      supabase.from("shop_items").select("id, slug, title").order("title"),
    ]);
    if (sRes.error) toast.error(sRes.error.message);
    setRows((sRes.data ?? []) as ShortLink[]);
    setItems((iRes.data ?? []) as any);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    if (!form.slug.trim()) return toast.error("Slug required");
    if (!form.shop_item_id && !form.target_url.trim())
      return toast.error("Pick an item or set a target URL");
    const { error } = await supabase.from("shop_short_links").insert({
      slug: slugify(form.slug),
      prefix: form.prefix,
      shop_item_id: form.shop_item_id || null,
      target_url: form.target_url.trim() || null,
      is_active: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Created");
    setForm({ slug: "", prefix: "shop", shop_item_id: "", target_url: "" });
    void load();
  };

  const toggle = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from("shop_short_links").update({ is_active }).eq("id", id);
    if (error) toast.error(error.message);
    else void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete short link?")) return;
    const { error } = await supabase.from("shop_short_links").delete().eq("id", id);
    if (error) toast.error(error.message);
    else void load();
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div>
      <div className="bg-white border border-tan/30 rounded-xl p-4 mb-5 grid md:grid-cols-5 gap-3">
        <select
          value={form.prefix}
          onChange={(e) => setForm({ ...form, prefix: e.target.value as any })}
          className={inputCls}
        >
          <option value="shop">/shop/</option>
          <option value="go">/go/</option>
        </select>
        <input
          placeholder="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
          className={inputCls}
        />
        <select
          value={form.shop_item_id}
          onChange={(e) => setForm({ ...form, shop_item_id: e.target.value })}
          className={inputCls}
        >
          <option value="">— Link to item (optional) —</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.title}
            </option>
          ))}
        </select>
        <input
          placeholder="...or target URL"
          value={form.target_url}
          onChange={(e) => setForm({ ...form, target_url: e.target.value })}
          className={inputCls}
        />
        <button
          onClick={create}
          className="inline-flex items-center justify-center gap-2 bg-espresso text-ivory text-xs uppercase tracking-[0.22em] px-4 rounded-full"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {loading ? (
        <Loader2 className="animate-spin text-clay mx-auto" />
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => {
            const url = `${origin}/${r.prefix}/${r.slug}`;
            return (
              <div
                key={r.id}
                className="bg-white border border-tan/30 rounded-xl p-4 flex items-center gap-3 flex-wrap"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-espresso underline-offset-2 hover:underline inline-flex items-center gap-1"
                >
                  /{r.prefix}/{r.slug} <ExternalLink size={11} />
                </a>
                <span className="text-xs text-clay">
                  {r.shop_item_id ? "→ item" : r.target_url || "(no target)"}
                </span>
                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-clay">
                  {r.click_count} clicks
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(url)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-tan/40 hover:bg-sand"
                  >
                    Copy
                  </button>
                  <label className="inline-flex items-center gap-1.5 text-xs text-clay">
                    <input
                      type="checkbox"
                      checked={r.is_active}
                      onChange={(e) => toggle(r.id, e.target.checked)}
                    />
                    Active
                  </label>
                  <button
                    onClick={() => remove(r.id)}
                    className="p-1.5 rounded-lg border border-tan/40 hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div className="text-center py-8 text-sm text-clay">No short links yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- atoms */

const inputCls =
  "w-full rounded-lg border border-tan/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-espresso/20";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-[0.65rem] uppercase tracking-[0.22em] text-clay mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
