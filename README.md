# Portfolio CMS

A personal portfolio site where every visible piece of content is editable from an
admin dashboard. React + Vite + TypeScript on the front, Supabase (Postgres, Auth,
Storage) behind it, deployed to GitHub Pages.

## Stack

React 18 · Vite 5 · TypeScript · Tailwind CSS · React Router 6 · Supabase ·
Framer Motion (hero entrance only) · Zod · React Helmet Async

## Getting it running locally

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL and anon key
npm run dev
```

Both environment values are public by design — they are protected by Row Level
Security, not by secrecy. **Never put a service-role key in this project.**

## One-time setup

### 1. Create your admin account

There is no public sign-up. Create the user, then promote it:

1. Supabase dashboard → **Authentication → Users → Add user**. Use a real email and
   password, and tick *Auto Confirm User*.
2. Run this in the SQL editor, with your email:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

3. Sign in at `/admin/login`.

A trigger creates the `profiles` row automatically on signup, defaulting to
`viewer`. Only `role = 'admin'` can write anything.

### 2. GitHub Pages

Add two repository secrets (**Settings → Secrets and variables → Actions**):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then set **Settings → Pages → Source** to **GitHub Actions**. Pushing to `main`
builds and deploys. The workflow works out the base path itself: `/` for a
`username.github.io` repo, `/<repo-name>/` for anything else.

Deep links are handled by `public/404.html`, which stashes the requested route and
hands it back to the router — GitHub Pages has no server-side rewrite.

## What is editable without touching code

Everything on the public site, via `/admin`:

| Screen | Controls |
| --- | --- |
| Projects | create, edit, delete, publish, feature, reorder, gallery images |
| Skills | CRUD, category, optional level, show/hide, reorder |
| Experience | CRUD, logo, current-role flag, reorder |
| Education | CRUD, logo, reorder |
| Services | CRUD, icon, show/hide, reorder |
| Social links | CRUD, platform, show/hide, reorder |
| Messages | read, mark read/unread, delete, reply by email |
| Media | browse, upload and delete files per storage folder |
| Settings | general, hero, hero labels, about, contact, resume, SEO, theme colours |

The hero portrait, background video, poster image, resume PDF, favicon, logo and
Open Graph image are all uploads managed from Settings.

## Security model

RLS is the boundary; hiding admin UI is only a convenience.

- Public reads: published projects, active content rows, site settings.
- Public writes: contact form inserts only.
- Public cannot read `contact_messages`, change settings, or upload to storage.
- Admin access is gated on `public.is_admin()`, a `SECURITY DEFINER` function that
  checks `profiles.role`. It is security-definer specifically so the policy does
  not recurse into the `profiles` table's own RLS.

Verified against the live database by assuming the `anon` and `authenticated`
roles directly — 21 checks covering both the deny and allow paths.

## Project layout

```
src/
  components/
    admin/      AdminLayout, RequireAdmin, ResourceAdmin, form fields
    home/       Hero and the homepage sections
    layout/     Navbar, Footer, PublicLayout, Seo
    projects/   ProjectCard
    ui/         Button, Modal, Toast, Badge, Icon set
  hooks/        useAuth, useSiteData, useContent (public reads + generic CRUD)
  lib/          supabase client, types, storage, validation, utils
  pages/        public pages + pages/admin/*
supabase/migrations/   schema, RLS and storage setup
```

`ResourceAdmin` is the reason the admin screens are small: each one is a field
definition list, and one generic component supplies the real CRUD, reordering and
show/hide behaviour.

## Notes

- `public/media/profile.png` is the bundled fallback portrait, used until a hero
  image is uploaded in Settings. It is background-removed so it sits directly on
  the white container.
- The hero background video is skipped on phones and whenever the OS requests
  reduced motion, falling back to the poster image and then to nothing.
- Admin routes are code-split, so visitors never download the dashboard bundle.

## Scripts

```bash
npm run dev        # local dev server
npm run lint       # eslint
npm run typecheck  # tsc, no emit
npm run build      # production build to dist/
npm run preview    # serve the build locally
```
