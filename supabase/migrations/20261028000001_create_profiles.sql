-- CampusLoop 3.0: Phase A - Profiles & Authentication Setup
-- Target Environment: campusloop-dev (Supabase Development Project)
-- Date: 2026-10-28

-- 1. Create public.profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  department text default '1st Year BCA',
  campus_location text default 'Central Library',
  avatar_url text,
  phone_number text,
  bio text,
  loopcoins_balance integer not null default 150 check (loopcoins_balance >= 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Index for fast queries
create index if not exists idx_profiles_department on public.profiles(department);
create index if not exists idx_profiles_campus_location on public.profiles(campus_location);

-- 2. Function to auto-create profile upon auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    full_name,
    department,
    campus_location,
    avatar_url,
    loopcoins_balance
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'department', '1st Year BCA'),
    coalesce(new.raw_user_meta_data->>'campus_location', 'Central Library'),
    new.raw_user_meta_data->>'avatar_url',
    150
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    department = coalesce(excluded.department, public.profiles.department),
    campus_location = coalesce(excluded.campus_location, public.profiles.campus_location);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute handle_new_user on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Automatic updated_at timestamp trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

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

-- RLS Policy: Anyone (anon/authenticated) can read profiles to view marketplace sellers & buyers
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
