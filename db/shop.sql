-- =========================================================
-- Shop feature for B.MARC Pilates
-- Run in Supabase Dashboard → SQL Editor.
-- Requires: db/admin_roles.sql (has_role function + app_role enum)
-- =========================================================

-- ---------- collections ----------
create table if not exists public.shop_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- items ----------
create table if not exists public.shop_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  collection_id uuid references public.shop_collections(id) on delete set null,
  title text not null,
  description text,
  category text,
  price text,
  platform text,                   -- Amazon, LTK, Target, Shopify, Etsy...
  image_url text,
  thumbnail_url text,
  video_url text,                  -- YouTube
  pinterest_url text,
  button_label text default 'Shop Now',
  status text not null default 'draft', -- draft | live | coming_soon
  is_featured boolean not null default false,
  is_digital boolean not null default false,
  -- digital extras (optional)
  digital_file_url text,
  checkout_url text,
  -- link fields (flat, single-source-of-truth per item)
  regular_url text,
  mobile_deep_link text,
  app_link text,
  fallback_url text,
  affiliate_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  open_behavior text default 'new_tab', -- new_tab | same_tab | app_first
  tags text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shop_items_collection_idx on public.shop_items(collection_id);
create index if not exists shop_items_status_idx on public.shop_items(status);

-- ---------- short links ----------
create table if not exists public.shop_short_links (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  prefix text not null default 'shop', -- shop | go
  shop_item_id uuid references public.shop_items(id) on delete set null,
  target_url text,                     -- used if shop_item_id is null
  click_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (prefix, slug)
);

-- ---------- content-to-shop posts ----------
create table if not exists public.shop_content_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  thumbnail_url text,
  video_url text,
  pinterest_url text,
  item_ids uuid[] not null default '{}',
  status text not null default 'draft', -- draft | live
  sort_order int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function public.shop_items_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists shop_items_touch on public.shop_items;
create trigger shop_items_touch
before update on public.shop_items
for each row execute function public.shop_items_touch_updated_at();

-- ---------- click counter (SECURITY DEFINER) ----------
create or replace function public.shop_increment_click(_prefix text, _slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.shop_short_links
     set click_count = click_count + 1
   where prefix = _prefix and slug = _slug and is_active = true;
$$;
grant execute on function public.shop_increment_click(text, text) to anon, authenticated;

-- ---------- RLS ----------
alter table public.shop_collections enable row level security;
alter table public.shop_items enable row level security;
alter table public.shop_short_links enable row level security;
alter table public.shop_content_posts enable row level security;

-- public read of published rows
drop policy if exists "Public read published collections" on public.shop_collections;
create policy "Public read published collections"
  on public.shop_collections for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Public read live items" on public.shop_items;
create policy "Public read live items"
  on public.shop_items for select
  to anon, authenticated
  using (status in ('live', 'coming_soon'));

drop policy if exists "Public read active short links" on public.shop_short_links;
create policy "Public read active short links"
  on public.shop_short_links for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public read live content posts" on public.shop_content_posts;
create policy "Public read live content posts"
  on public.shop_content_posts for select
  to anon, authenticated
  using (status = 'live');

-- admin full access (requires has_role function from admin_roles.sql)
do $$
declare t text;
begin
  foreach t in array array[
    'shop_collections','shop_items','shop_short_links','shop_content_posts'
  ] loop
    execute format('drop policy if exists "Admins full access" on public.%I;', t);
    execute format($f$create policy "Admins full access" on public.%I
      for all to authenticated
      using (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));$f$, t);
  end loop;
end $$;

grant select on public.shop_collections, public.shop_items,
                public.shop_short_links, public.shop_content_posts
  to anon, authenticated;

-- ---------- storage bucket for shop media ----------
insert into storage.buckets (id, name, public)
values ('shop-media', 'shop-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read shop-media" on storage.objects;
create policy "Public read shop-media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'shop-media');

drop policy if exists "Admins write shop-media" on storage.objects;
create policy "Admins write shop-media"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'shop-media' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'shop-media' and public.has_role(auth.uid(), 'admin'));
