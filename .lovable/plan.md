## B.MARC Pilates — Admin Dashboard v2 + Content Studio

Replace the current single-page `/admin` with a full sidebar layout containing 7 sections, plus a Content Studio with a Tiptap editor and Supabase Storage for images. Keep all existing public-site behavior (Join the Community → Supabase, Reserve Your Spot → Cal.com) untouched.

### 1. Database (one migration)

New columns / tables:

```text
community_members.status   -- add "Archived" to enum/check constraint
booking_clicks             -- id, event_label, source_path, user_agent, created_at
content_posts              -- id, title, subtitle, slug (unique), body (jsonb),
                              featured_image_url, gallery_images (text[]),
                              content_type, audience, status,
                              scheduled_at, published_at,
                              created_at, updated_at, created_by (uuid)
storage bucket "content-images" (public read, admin-only write via RLS)
```

RLS:
- `booking_clicks`: anon INSERT only; admin SELECT.
- `content_posts`: admin full access; no public read (drafts must stay private).
- Storage: public SELECT on `content-images`; INSERT/UPDATE/DELETE only for `has_role(auth.uid(),'admin')`.

### 2. Routing & layout

```text
src/routes/
  admin.tsx                  -- pathless layout: auth + admin role guard,
                                renders sidebar + <Outlet />
  admin.index.tsx            -- Dashboard Overview (rewritten)
  admin.members.tsx          -- Community Members (current admin table, moved)
  admin.events.tsx           -- Events (Cal.com)
  admin.leads.tsx            -- Leads / Interest Tags
  admin.exports.tsx          -- Exports
  admin.settings.tsx         -- Settings
  admin.content.tsx          -- Content Studio list
  admin.content.new.tsx      -- New post editor
  admin.content.$id.tsx      -- Edit post
  admin.login.tsx            -- (existing, unchanged)
```

`admin.tsx` does the session + `user_roles` admin check once and provides member/role context to children, eliminating duplicated guards.

Sidebar component: ivory bg, nude/beige cards, mocha text, rounded, soft shadows, mobile-collapsible (shadcn sidebar pattern). Active link highlight via `useRouterState`.

### 3. Section details

**Dashboard Overview** — summary cards (total signups, new this week, total booking clicks, top interest), recent 5 signups table, upcoming events list (from Cal.com server fn).

**Community Members** — port existing table; add "Archived" status, sort newest/oldest, retain search + filters + detail drawer with notes/status edit.

**Events** — calls `getCalEvents` server fn (see §4). Shows event types + recent bookings with "Open in Cal.com" CTA. If `CAL_API_KEY` missing, shows the "Connect Cal.com API key…" empty state with a link to Settings.

**Leads / Interest Tags** — derived client-side from members: count per interest tag, click → filtered member list.

**Exports** — buttons that build CSV in-browser from current Supabase queries: all members, filtered (uses Members filters via shared store), sponsor leads, per-interest, new this month.

**Settings** — read-only status pills for: Supabase (ping), Cal.com (server fn returns `{configured: boolean}`), Instagram (existing `instagram.functions`), community form ("Enabled"). No keys displayed.

**Content Studio** — list view (table: title, type, audience, status, created, published, actions). Editor uses **Tiptap** (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`) storing JSON in `body`. Featured image + gallery upload to `content-images` bucket via supabase-js. Save draft / Schedule / Publish / Archive. Disabled "Send Email", "Send SMS", "Publish to Member Portal" buttons labeled "Coming Soon".

### 4. Cal.com integration (server-side only)

New secrets: `CAL_API_KEY`, `CAL_USERNAME` (default `bmarcpilates`).

`src/lib/cal.functions.ts` — `createServerFn` handlers:
- `getCalEventTypes()` → GET `https://api.cal.com/v2/event-types?username=bmarcpilates`
- `getCalBookings()` → GET `https://api.cal.com/v2/bookings`
- `getCalStatus()` → returns `{configured: !!process.env.CAL_API_KEY}`

All protected with `requireSupabaseAuth` + admin role check inside handler. Keys never leave the server.

### 5. Booking click tracking

Add a tiny `trackBookingClick(label)` helper called from BookingProvider when the modal opens. Inserts a row into `booking_clicks` (anon RLS allows insert only).

### 6. Tech additions

- `bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder`
- New secrets via `secrets--add_secret`: `CAL_API_KEY`, `CAL_USERNAME`.

### 7. Out of scope (explicitly)

- Sending email/SMS (buttons stub only).
- Public reading of `content_posts` (admin-only for now; member portal later).
- Editing existing public site styling, hero, BookingProvider Cal.com embed.

### Required user action after implementation

1. Approve the SQL migration when prompted.
2. Provide `CAL_API_KEY` in the secrets prompt (Cal.com → Settings → Developer → API Keys).
3. Confirm `CAL_USERNAME` (default `bmarcpilates`).
