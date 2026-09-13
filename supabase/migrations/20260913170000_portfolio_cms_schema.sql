-- Portfolio CMS — consolidated schema, RLS and storage setup.
-- This mirrors the migrations already applied to the linked Supabase project
-- (my-portfolio-db). It is idempotent, so it is safe to run on a fresh project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- helpers --
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------- profiles --
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'viewer' check (role in ('admin','viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SECURITY DEFINER so the policy check does not recurse into profiles' own RLS
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;
grant execute on function public.is_admin() to authenticated, anon;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- content --
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  thumbnail_url text,
  hero_image_url text,
  technologies text[] not null default '{}',
  category text not null default 'Web',
  github_url text,
  live_url text,
  status text not null default 'completed'
    check (status in ('completed','in-progress','planned','archived')),
  featured boolean not null default false,
  published boolean not null default true,
  display_order int not null default 0,
  start_date date,
  completion_date date,
  key_features text[] not null default '{}',
  challenges text,
  solutions text,
  lessons_learned text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_slug_idx on public.projects(slug);
create index if not exists projects_published_idx on public.projects(published, display_order);
create index if not exists projects_featured_idx on public.projects(featured) where featured;

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  caption text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_images_project_idx on public.project_images(project_id, display_order);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  category text not null default 'Other'
    check (category in ('Frontend','Backend','Database','Tools','Design','Other')),
  level int check (level between 0 and 100),
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  location text,
  logo_url text,
  company_url text,
  start_date date,
  end_date date,
  currently_working boolean not null default false,
  description text,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field text,
  location text,
  logo_url text,
  start_date date,
  end_date date,
  description text,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon text,
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  icon text,
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hero_labels (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  position text not null default 'top-left'
    check (position in ('top-left','top-right','mid-left','mid-right','bottom-left','bottom-right')),
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One jsonb row per settings group: general, hero, about, contact, resume, seo, theme
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200 and email like '%_@_%.__%'),
  subject text not null check (char_length(subject) between 2 and 200),
  message text not null check (char_length(message) between 10 and 5000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages(created_at desc);

do $$
declare t text;
begin
  foreach t in array array['profiles','projects','skills','experiences','education',
                           'services','social_links','hero_labels','site_settings']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- -------------------------------------------------------------------- RLS --
alter table public.profiles         enable row level security;
alter table public.projects         enable row level security;
alter table public.project_images   enable row level security;
alter table public.skills           enable row level security;
alter table public.experiences      enable row level security;
alter table public.education        enable row level security;
alter table public.services         enable row level security;
alter table public.social_links     enable row level security;
alter table public.hero_labels      enable row level security;
alter table public.site_settings    enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select
  using (published = true or public.is_admin());
drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists project_images_public_read on public.project_images;
create policy project_images_public_read on public.project_images for select
  using (exists (select 1 from public.projects p
                 where p.id = project_id and (p.published or public.is_admin())));
drop policy if exists project_images_admin_write on public.project_images;
create policy project_images_admin_write on public.project_images for all
  using (public.is_admin()) with check (public.is_admin());

-- Tables with an `active` flag share the same read/write shape
do $$
declare t text;
begin
  foreach t in array array['skills','experiences','education','services','social_links','hero_labels']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('create policy %I on public.%I for select
                    using (active = true or public.is_admin())', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin_write', t);
    execute format('create policy %I on public.%I for all
                    using (public.is_admin()) with check (public.is_admin())', t || '_admin_write', t);
  end loop;
end $$;

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings for select using (true);
drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- The public may submit a message but may never read, edit or delete one
drop policy if exists contact_messages_public_insert on public.contact_messages;
create policy contact_messages_public_insert on public.contact_messages for insert with check (true);
drop policy if exists contact_messages_admin_read on public.contact_messages;
create policy contact_messages_admin_read on public.contact_messages for select using (public.is_admin());
drop policy if exists contact_messages_admin_update on public.contact_messages;
create policy contact_messages_admin_update on public.contact_messages for update
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists contact_messages_admin_delete on public.contact_messages;
create policy contact_messages_admin_delete on public.contact_messages for delete using (public.is_admin());

-- ---------------------------------------------------------------- storage --
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media','media', true, 52428800,
   array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/x-icon',
         'video/mp4','video/webm']),
  ('resume','resume', true, 10485760, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio media public read" on storage.objects;
create policy "portfolio media public read" on storage.objects for select
  using (bucket_id in ('media','resume'));

drop policy if exists "portfolio media admin insert" on storage.objects;
create policy "portfolio media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('media','resume') and public.is_admin());

drop policy if exists "portfolio media admin update" on storage.objects;
create policy "portfolio media admin update" on storage.objects for update to authenticated
  using (bucket_id in ('media','resume') and public.is_admin())
  with check (bucket_id in ('media','resume') and public.is_admin());

drop policy if exists "portfolio media admin delete" on storage.objects;
create policy "portfolio media admin delete" on storage.objects for delete to authenticated
  using (bucket_id in ('media','resume') and public.is_admin());
