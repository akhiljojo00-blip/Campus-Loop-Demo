-- CampusLoop 3.0: Phase A.1 - Security Hardening & Data Boundary Protection
-- Target Environment: campusloop-dev (Supabase Development Project)
-- Date: 2026-10-28

-- ====================================================================
-- 1. SEPARATE PUBLIC PROFILES & PRIVATE DETAILS
-- ====================================================================

-- Remove sensitive / private contact info and server-authoritative balance from public.profiles
alter table if exists public.profiles 
  drop column if exists phone_number,
  drop column if exists loopcoins_balance;

-- Create private user details table with strict owner-only access
create table if not exists public.user_private_details (
  id uuid primary key references auth.users(id) on delete cascade,
  phone_number text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- ====================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on private details table
alter table public.user_private_details enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users can view own private details" on public.user_private_details;
drop policy if exists "Users can insert own private details" on public.user_private_details;
drop policy if exists "Users can update own private details" on public.user_private_details;

-- Strictly owner-only policies: Neither anonymous users nor other authenticated users can read or edit
create policy "Users can view own private details"
  on public.user_private_details
  for select
  using (auth.uid() = id);

create policy "Users can insert own private details"
  on public.user_private_details
  for insert
  with check (auth.uid() = id);

create policy "Users can update own private details"
  on public.user_private_details
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ====================================================================
-- 3. COLUMN-LEVEL DATABASE PERMISSIONS (DEFENSE IN DEPTH)
-- ====================================================================

-- Ensure public.profiles has strict column-level privileges:
-- Clients can only read public display fields
-- Authenticated users can only update intended editable profile fields
revoke all on public.profiles from public;
revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;

grant select on public.profiles to anon, authenticated;
grant insert (id, full_name, department, campus_location, avatar_url, bio) on public.profiles to authenticated;
grant update (full_name, department, campus_location, avatar_url, bio) on public.profiles to authenticated;

-- Ensure user_private_details is inaccessible to anon / public
revoke all on public.user_private_details from public;
revoke all on public.user_private_details from anon;
grant select, insert, update, delete on public.user_private_details to authenticated;

-- ====================================================================
-- 4. HARDEN SIGNUP & UPDATED_AT TRIGGERS (SECURITY DEFINER PROTECTION)
-- ====================================================================

-- Harden handle_new_user: empty search_path, schema qualification, no client balance control
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 1. Insert sanitized public profile
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

  -- 2. Insert private details into separate owner-only table if phone metadata is present
  if (new.raw_user_meta_data ? 'phone_number') and (new.raw_user_meta_data->>'phone_number' is not null) then
    insert into public.user_private_details (id, phone_number)
    values (new.id, new.raw_user_meta_data->>'phone_number')
    on conflict (id) do update set
      phone_number = excluded.phone_number;
  end if;

  return new;
end;
$$;

-- Security hardening: revoke direct execution permissions on security definer function
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- Ensure trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Harden handle_updated_at trigger function
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

-- Attach updated_at trigger to user_private_details
drop trigger if exists on_user_private_details_updated on public.user_private_details;
create trigger on_user_private_details_updated
  before update on public.user_private_details
  for each row execute function public.handle_updated_at();
