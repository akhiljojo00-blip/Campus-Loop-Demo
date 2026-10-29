-- ==============================================================================
-- Migration: 20261029000003_preferences_notifications.sql
-- Project: Campus Market (CampusLoop 3.0)
-- Target: campusloop-dev (yvzfaeecpqhvpmngmbmj)
--
-- Features:
-- 1. Category Preferences (user_category_preferences) with owner-only RLS
-- 2. In-App Notifications (in_app_notifications) with owner-only RLS
-- 3. Automatic Matching Triggers on new active listings and wanted requests
-- 4. Notification duplicate prevention & quiet hours check
-- 5. Supabase Realtime publication for in-app notifications
-- ==============================================================================

-- 1. Create user_category_preferences table
create table if not exists public.user_category_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  buy_categories text[] default '{}'::text[] not null,
  sell_categories text[] default '{}'::text[] not null,
  wanted_categories text[] default '{}'::text[] not null,
  notifications_enabled boolean default true not null,
  quiet_hours_start time null,
  quiet_hours_end time null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.user_category_preferences is 'User-selected interest categories for buying, selling, and wanted matching notifications';

-- Enable RLS
alter table public.user_category_preferences enable row level security;

-- Policies for user_category_preferences
drop policy if exists "Users can view their own preferences" on public.user_category_preferences;
create policy "Users can view their own preferences"
  on public.user_category_preferences for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own preferences" on public.user_category_preferences;
create policy "Users can insert their own preferences"
  on public.user_category_preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own preferences" on public.user_category_preferences;
create policy "Users can update their own preferences"
  on public.user_category_preferences for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own preferences" on public.user_category_preferences;
create policy "Users can delete their own preferences"
  on public.user_category_preferences for delete
  to authenticated
  using (auth.uid() = user_id);

-- Permissions for user_category_preferences
grant select, insert, update, delete on public.user_category_preferences to authenticated;
revoke all on public.user_category_preferences from anon;
revoke all on public.user_category_preferences from public;


-- 2. Create in_app_notifications table
create table if not exists public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('new_listing_match', 'wanted_match', 'offer_update', 'exchange_update', 'promotion_active', 'system')),
  link_id text null,
  link_type text null,
  is_read boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_in_app_notifications_user_created 
  on public.in_app_notifications (user_id, created_at desc);

create index if not exists idx_in_app_notifications_user_unread 
  on public.in_app_notifications (user_id) where is_read = false;

comment on table public.in_app_notifications is 'In-app notification center for matches, offers, promotions, and system alerts';

-- Enable RLS
alter table public.in_app_notifications enable row level security;

-- Policies for in_app_notifications
drop policy if exists "Users can view own notifications" on public.in_app_notifications;
create policy "Users can view own notifications"
  on public.in_app_notifications for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.in_app_notifications;
create policy "Users can update own notifications"
  on public.in_app_notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.in_app_notifications;
create policy "Users can delete own notifications"
  on public.in_app_notifications for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own notifications" on public.in_app_notifications;
create policy "Users can insert own notifications"
  on public.in_app_notifications for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Permissions for in_app_notifications
grant select, insert, update, delete on public.in_app_notifications to authenticated;
revoke all on public.in_app_notifications from anon;
revoke all on public.in_app_notifications from public;


-- 3. Matching notification triggers (SECURITY DEFINER with empty search_path)

-- Helper function to check quiet hours
create or replace function public.is_in_quiet_hours(
  p_start time,
  p_end time,
  p_check_time time default (timezone('utc'::text, now()))::time
)
returns boolean
language plpgsql
immutable
as $$
begin
  if p_start is null or p_end is null then
    return false;
  end if;

  if p_start < p_end then
    return p_check_time >= p_start and p_check_time < p_end;
  else
    -- Crosses midnight (e.g. 22:00 to 07:00)
    return p_check_time >= p_start or p_check_time < p_end;
  end if;
end;
$$;

-- Trigger function: notify users on new active listing matching their buy_categories
create or replace function public.notify_on_new_listing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pref_rec record;
begin
  -- Only trigger on active listings
  if new.status != 'active' then
    return new;
  end if;

  -- Find users whose buy_categories contains this listing's category
  for pref_rec in
    select user_id, quiet_hours_start, quiet_hours_end
    from public.user_category_preferences
    where notifications_enabled = true
      and user_id != new.seller_id
      and new.category = any(buy_categories)
  loop
    -- Check quiet hours
    if not public.is_in_quiet_hours(pref_rec.quiet_hours_start, pref_rec.quiet_hours_end) then
      -- Prevent duplicate notification for same user and listing
      if not exists (
        select 1 from public.in_app_notifications
        where user_id = pref_rec.user_id
          and type = 'new_listing_match'
          and link_id = new.id::text
      ) then
        insert into public.in_app_notifications (
          user_id,
          title,
          message,
          type,
          link_id,
          link_type
        ) values (
          pref_rec.user_id,
          'New in ' || new.category || ': ' || new.title,
          'A peer listed "' || new.title || '" for ₹' || new.price || ' near ' || coalesce(new.campus_location, 'Campus') || '.',
          'new_listing_match',
          new.id::text,
          'listing'
        );
      end if;
    end if;
  end loop;

  return new;
end;
$$;

-- Attach trigger to listings
drop trigger if exists trg_notify_on_new_listing on public.listings;
create trigger trg_notify_on_new_listing
  after insert on public.listings
  for each row
  execute function public.notify_on_new_listing();


-- Trigger function: notify users on new wanted request matching their sell_categories
create or replace function public.notify_on_new_wanted_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pref_rec record;
begin
  -- Find users whose sell_categories contains this request's category
  for pref_rec in
    select user_id, quiet_hours_start, quiet_hours_end
    from public.user_category_preferences
    where notifications_enabled = true
      and (new.requester_id is null or user_id != new.requester_id)
      and new.category = any(sell_categories)
  loop
    -- Check quiet hours
    if not public.is_in_quiet_hours(pref_rec.quiet_hours_start, pref_rec.quiet_hours_end) then
      -- Prevent duplicate notification for same user and request
      if not exists (
        select 1 from public.in_app_notifications
        where user_id = pref_rec.user_id
          and type = 'wanted_match'
          and link_id = new.id::text
      ) then
        insert into public.in_app_notifications (
          user_id,
          title,
          message,
          type,
          link_id,
          link_type
        ) values (
          pref_rec.user_id,
          'Wanted in ' || new.category || ': ' || new.title,
          'A peer is looking for "' || new.title || '" with budget up to ₹' || new.max_budget || '.',
          'wanted_match',
          new.id::text,
          'wanted'
        );
      end if;
    end if;
  end loop;

  return new;
end;
$$;

-- Attach trigger to wanted_requests
drop trigger if exists trg_notify_on_new_wanted on public.wanted_requests;
create trigger trg_notify_on_new_wanted
  after insert on public.wanted_requests
  for each row
  execute function public.notify_on_new_wanted_request();


-- 4. Enable Supabase Realtime for in_app_notifications safely
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
      and schemaname = 'public' 
      and tablename = 'in_app_notifications'
  ) then
    alter publication supabase_realtime add table public.in_app_notifications;
  end if;
end;
$$;
