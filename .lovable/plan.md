# Shop Feature — B.Marć Pilates

A new `/shop` route plus admin CMS, short-link redirector, and database tables. Built inside the existing site, matching the luxury editorial aesthetic but more content-forward.

## Scope

### 1. Database (new migration `db/shop.sql`)
Tables:
- `shop_collections` — id, slug, title, description, sort_order, is_published, created_at
- `shop_items` — id, slug (unique), collection_id (fk), title, description, category, price (text, optional), platform (text: Amazon/LTK/Target/Etsy/Shopify/other), image_url, thumbnail_url, video_url (YouTube), pinterest_url, button_label, status (`live`|`coming_soon`|`draft`), is_featured, is_digital, sort_order, tags (text[]), created_at, updated_at
- `shop_item_links` — id, shop_item_id (fk), regular_url, mobile_deep_link, app_link, fallback_url, affiliate_url, utm_source, utm_medium, utm_campaign, open_behavior (`new_tab`|`same_tab`|`app_first`)
- `shop_digital_products` — id, shop_item_id (fk, nullable), title, description, price, file_url (PDF), checkout_url, cover_image, status
- `shop_short_links` — id, slug (unique, e.g. `grwm-black-set`), prefix (`shop`|`go`), shop_item_id (fk nullable), target_url, click_count, is_active, created_at
- `shop_content_posts` — id, slug, title, description, video_url, thumbnail_url, pinterest_url, related_ebook_id, item_ids (uuid[]), published_at, status

RLS:
- Public SELECT on published rows (status=live or is_published=true) for `anon, authenticated`
- Admin full access via `has_role(auth.uid(), 'admin')` (reuse existing pattern)
- Short link increment via SECURITY DEFINER function `public.shop_increment_click(slug text)`

### 2. Public routes
- `src/routes/shop.tsx` — hero, CTAs, collection rows (horizontal scroll), featured row, digital products row, content-to-shop posts row. Fetches via `createServerFn` using `supabaseAdmin` scoped to published items.
- `src/routes/shop.$slug.tsx` — single item detail page (image, description, primary CTA, related items)
- `src/routes/shop.($prefix).$slug.ts` server route — short-link redirector at `/shop/:slug` and `/go/:slug`. Resolves to the best mobile URL based on User-Agent, increments click count, 302 redirects. Adds UTM params.
  - Note: `/shop/:slug` overlaps the item detail page. Resolution order: short_link lookup first; if exists, redirect; else render detail page. Implement detail page fetch that falls back to redirect when a short link exists.

### 3. Mobile deep linking
Helper `src/lib/shop-links.ts`:
- Detect platform from User-Agent (iOS/Android, in-app browsers: Instagram, TikTok, Pinterest, YouTube)
- For known platforms with app schemes (Amazon `com.amazon.mobile.shopping://`, etc.) emit `app_link` when present
- Fallback chain: `app_link` → `mobile_deep_link` → `affiliate_url` → `fallback_url` → `regular_url`
- Always append UTM params
- Client-side card click handler that opens links with `target="_blank" rel="noopener nofollow sponsored"` and uses `window.location` for known in-app browsers to escape

### 4. Components (`src/components/shop/`)
- `ShopHero.tsx`
- `ShopRow.tsx` — horizontal scroll-snap row, Netflix-style
- `ShopCard.tsx` — image, title, description, category, price, platform badge, CTA button
- `DigitalProductCard.tsx`
- `ContentShopPost.tsx` — video thumbnail + product list

### 5. Admin (`src/routes/admin.shop.tsx`)
Tabs: Items, Collections, Digital Products, Short Links, Content Posts.
- CRUD tables with create/edit modals
- Image upload via Supabase Storage (new bucket `shop-media`, public)
- Drag-reorder via sort_order
- Field set per item matches link spec above (regular, mobile, app, fallback, affiliate, UTMs, platform, open behavior)
- Status toggle: live / coming_soon / draft
- Short-link manager (slug + prefix + target)

Add nav entry in `src/routes/admin.tsx` sidebar.

### 6. Navbar
Add `Shop` link to `branding.nav` in `src/config/branding.ts`.

### 7. Storage
New bucket `shop-media` (public) via SQL migration with read-all and admin write policies.

## Files to create
- `db/shop.sql`
- `src/routes/shop.tsx`
- `src/routes/shop.$slug.tsx` (handles detail + short-link fallback)
- `src/routes/go.$slug.ts` (short-link only, server route)
- `src/components/shop/ShopHero.tsx`, `ShopRow.tsx`, `ShopCard.tsx`, `DigitalProductCard.tsx`, `ContentShopPost.tsx`
- `src/lib/shop-links.ts` (URL resolver + UA detection)
- `src/lib/shop.functions.ts` (server fns: listShop, getShopItem, resolveShortLink, adminCRUD)
- `src/routes/admin.shop.tsx`

## Files to edit
- `src/config/branding.ts` — add Shop to nav
- `src/routes/admin.tsx` — add Shop sidebar entry

## No fake data
The page renders empty-state messaging until the admin adds real items. Hero + section headers always show; rows show "No items yet — check back soon" placeholders. No mock products committed.

## Out of scope
- Stripe checkout integration for digital products (structure ready; checkout_url accepts external Stripe link for now)
- Analytics dashboard
- A/B testing of links
