-- CampusLoop 3.0: Phase A - Base Profiles & Authentication Setup
-- Target Environment: campusloop-dev (Supabase Development Project)
-- Date: 2026-10-28

-- 1. Create public.profiles table linked to auth.users (public display fields only)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  department text default '1st Year BCA',
  campus_location text default 'Central Library',
  avatar_url text,
  bio text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Index for fast queries
create index if not exists idx_profiles_department on public.profiles(department);
create index if not exists idx_profiles_campus_location on public.profiles(campus_location);

-- 2. Function to auto-create profile upon auth.users signup (hardened with empty search_path)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    department,
    campus_location,
    avatar_url,
    bio
  )
  values (
    new.id,
    pg_catalog.coalesce(new.raw_user_meta_data->>'full_name', pg_catalog.split_part(new.email, '@', 1)),
    pg_catalog.coalesce(new.raw_user_meta_data->>'department', '1st Year BCA'),
    pg_catalog.coalesce(new.raw_user_meta_data->>'campus_location', 'Central Library'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'bio'
  )
  on conflict (id) do update set
    full_name = pg_catalog.coalesce(excluded.full_name, public.profiles.full_name),
    department = pg_catalog.coalesce(excluded.department, public.profiles.department),
    campus_location = pg_catalog.coalesce(excluded.campus_location, public.profiles.campus_location),
    avatar_url = pg_catalog.coalesce(excluded.avatar_url, public.profiles.avatar_url),
    bio = pg_catalog.coalesce(excluded.bio, public.profiles.bio);
  return new;
end;
$$;

-- Revoke direct execute permissions
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- Trigger to execute handle_new_user on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Automatic updated_at timestamp trigger (hardened)
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.timezone('utc'::text, pg_catalog.now());
  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- 4. Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Profiles are viewable by registered students" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

-- RLS Policy: Anyone (anon/authenticated) can read public display profiles
create policy "Profiles are viewable by registered students"
  on public.profiles
  for select
  using (true);

-- RLS Policy: Authenticated users can insert their own profile
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- RLS Policy: Users can only update their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 5. Column-Level Permissions
revoke all on public.profiles from public;
revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;

grant select on public.profiles to anon, authenticated;
grant insert (id, full_name, department, campus_location, avatar_url, bio) on public.profiles to authenticated;
grant update (full_name, department, campus_location, avatar_url, bio) on public.profiles to authenticated;
