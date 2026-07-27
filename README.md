# VITROUS

A coming-soon site for an atelier making hand-cast glass keycaps.
Next.js 16 · Tailwind v4 · GSAP · Paper Shaders (liquid metal) · Supabase.

---

## Running it locally

```bash
npm install
npm run dev
```

The site works with **no configuration at all** — the hero renders and the page
is fully browsable. Only the waitlist form needs Supabase; without keys it
returns a polite "the list isn't open just yet" instead of crashing.

---

## 1. Supabase — database

1. Go to **supabase.com** → *New project*. Any name; pick a region near you and
   save the database password somewhere.
2. Wait for it to finish provisioning (~2 min).
3. Open **SQL Editor** → *New query*, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and press **Run**.
   That creates the `signups` table, the two enums, the unique-email index,
   the Row Level Security policy, and the storage bucket.
4. Open **Project Settings → Data API** and copy the **Project URL**.
5. Open **Project Settings → API Keys** and copy the **`anon` / public** key.
6. Create `.env.local` (copy `.env.example`) and paste both in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

7. Restart `npm run dev`. Submit the form, then check
   **Table Editor → signups** — your row is there.

### What the table stores

| column       | type                    | notes                               |
| ------------ | ----------------------- | ----------------------------------- |
| `id`         | uuid                    | primary key                         |
| `title`      | `MR` / `MRS`            | enum — nothing else can be inserted |
| `first_name` | text                    | 1–80 chars                          |
| `email`      | text                    | unique, case-insensitive            |
| `kind`       | `WAITLIST` / `PREORDER` | one table serves both flows         |
| `source`     | text                    | defaults to `web`                   |
| `user_agent` | text                    | truncated to 400 chars              |
| `created_at` | timestamptz             | defaults to `now()`                 |

**On security:** the `anon` key is *designed* to be public — Row Level Security
decides what it may do. The policy here grants `INSERT` only. Nobody can read,
edit or delete the list with that key; you read it in the dashboard.

---

## 2. Supabase — storage

Storage is Supabase's file locker (as opposed to the database, which holds
rows). Instead of shipping product images inside the repo, you upload them once
and the site links to them by URL. That means you can swap a product photo
without a code change or redeploy.

The bucket `vitrous-assets` is created by `schema.sql` as **public-read /
private-write**: anyone may view an image, only you may upload one.

To upload the hero image (and anything you drop into
`public/assets-to-upload/`):

```bash
# .env.local also needs the service_role key for this one command
# Settings → API Keys → service_role.  NEVER commit it or ship it to the browser.
node scripts/upload-assets.mjs
```

It prints the public URL of each file. To make the site actually serve images
from Storage rather than `/public`, add:

```env
NEXT_PUBLIC_USE_STORAGE_ASSETS=true
```

This is opt-in on purpose — until you flip it, a half-finished storage setup
can't break the hero image.

---

## 3. GitHub → Vercel

The site deploys from GitHub; the Vercel CLI is not used.

1. Push this repo to GitHub (already done if you're reading it there).
2. Go to **vercel.com/new** → *Import Git Repository* → pick this repo.
3. Framework preset: **Next.js** (auto-detected). Leave build settings alone.
4. Before clicking Deploy, open **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deploy.**

Every future `git push` to `main` redeploys automatically.

---

## Project layout

```
app/
  layout.tsx              fonts + metadata
  page.tsx                composes the sections
  globals.css             design tokens, label-caps, hairlines
  api/waitlist/route.ts   validates and inserts a signup
components/
  Hero.tsx                hero composition + entrance animation
  HeroEsc.tsx             the keycap: levitation, tilt, sheen, reflection
  LiquidBackdrop.tsx      liquid-metal shader, masked into the black
  Sections.tsx            manifesto, making, specification, waitlist, footer
  WaitlistForm.tsx        title / first name / email + confirmation state
  Reveal.tsx              GSAP ScrollTrigger reveal wrapper
lib/supabase.ts           client + storage URL helper (degrades safely)
scripts/upload-assets.mjs one-shot storage uploader
supabase/schema.sql       run this in the SQL editor
```

## Notes on the animation

The keycap is the supplied photograph, not a 3D model — its background is pure
black (`#000`), and the page background is set to exactly `#000` so there is no
visible seam. It is then treated as a physical object: it levitates on a sine
loop, tilts toward the cursor in CSS 3D perspective, throws a soft blurred
reflection, and a specular highlight sweeps across the glass every ~7 seconds.
A masked liquid-metal shader sits behind it at low opacity for the chrome
shimmer.
