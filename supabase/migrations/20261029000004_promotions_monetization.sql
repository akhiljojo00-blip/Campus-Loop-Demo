-- ==============================================================================
-- Migration: 20261029000004_promotions_monetization.sql
-- Project: Campus Market (CampusLoop 3.0)
-- Target: campusloop-dev (yvzfaeecpqhvpmngmbmj)
--
-- Features:
-- 1. Promotions table (public.promotions) with strict pricing & status lifecycle
-- 2. Security Definer RPC request_promotion enforcing owner-only promotion & catalogue pricing
-- 3. Automatic expiry calculation and status tracking
-- 4. Haversine distance calculation function for location-aware radius queries
-- 5. Supabase Realtime publication for promotions
-- ==============================================================================

-- ==============================================================================
-- 0. Ensure listings table has boost columns
-- ==============================================================================
alter table public.listings add column if not exists is_boosted boolean default false;
alter table public.listings add column if not exists boost_expires_at bigint null;

-- 1. Create promotions table
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('listing', 'wanted_request')),
  target_id text not null,
  promo_type text not null check (promo_type in ('boost_24h', 'featured_7d', 'featured_30d')),
  price_inr numeric(10,2) not null check (price_inr > 0),
  status text not null check (status in ('pending_payment', 'active', 'expired', 'cancelled')) default 'pending_payment',
  starts_at timestamptz default timezone('utc'::text, now()) not null,
  expires_at timestamptz not null,
  payment_reference text null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_promotions_target 
  on public.promotions (target_type, target_id, status);

create index if not exists idx_promotions_active_expiry 
  on public.promotions (status, expires_at);

comment on table public.promotions is 'Catalogue-priced promotions for marketplace listings and Wanted Board requests';

-- Enable RLS
alter table public.promotions enable row level security;

-- Policies for promotions
drop policy if exists "Anyone can view active promotions or owners view own" on public.promotions;
create policy "Anyone can view active promotions or owners view own"
  on public.promotions for select
  to authenticated, anon
  using (
    (status = 'active' and expires_at > timezone('utc'::text, now()))
    or (auth.uid() is not null and auth.uid() = user_id)
  );

-- Revoke direct insert, update, and delete from client roles to guarantee catalogue integrity
revoke insert, update, delete on public.promotions from anon;
revoke insert, update, delete on public.promotions from authenticated;
revoke insert, update, delete on public.promotions from public;

grant select on public.promotions to authenticated, anon;


-- 2. Haversine distance calculation function
create or replace function public.haversine_distance_km(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
returns double precision
language sql
immutable
as $$
  select case
    when lat1 is null or lon1 is null or lat2 is null or lon2 is null then null
    else
      6371.0 * 2.0 * asin(
        sqrt(
          power(sin(radians((lat2 - lat1) / 2.0)), 2) +
          cos(radians(lat1)) * cos(radians(lat2)) *
          power(sin(radians((lon2 - lon1) / 2.0)), 2)
        )
      )
  end;
$$;


-- 3. Security Definer RPC: request_promotion
create or replace function public.request_promotion(
  p_target_type text,
  p_target_id text,
  p_promo_type text,
  p_payment_ref text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_owner_id uuid;
  v_price numeric(10,2);
  v_duration interval;
  v_starts_at timestamptz;
  v_expires_at timestamptz;
  v_status text;
  v_promo_id uuid;
  v_target_title text;
begin
  -- 1. Authentication check
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required to promote items';
  end if;

  -- 2. Validate target type
  if p_target_type not in ('listing', 'wanted_request') then
    raise exception 'Invalid target_type. Must be listing or wanted_request';
  end if;

  -- 3. Validate promo type & determine official catalogue price and duration
  if p_promo_type = 'boost_24h' then
    v_price := 3.00;
    v_duration := interval '24 hours';
  elsif p_promo_type = 'featured_7d' then
    v_price := 9.00;
    v_duration := interval '7 days';
  elsif p_promo_type = 'featured_30d' then
    if p_target_type != 'listing' then
      raise exception '30-day featured promotion is only available for marketplace listings';
    end if;
    v_price := 19.00;
    v_duration := interval '30 days';
  else
    raise exception 'Invalid promo_type. Allowed: boost_24h, featured_7d, featured_30d';
  end if;

  -- 4. Ownership verification
  if p_target_type = 'listing' then
    select seller_id, title into v_owner_id, v_target_title
    from public.listings
    where id = p_target_id::uuid;

    if not found then
      raise exception 'Listing not found';
    end if;

    if v_owner_id != v_uid then
      raise exception 'You can only promote your own listings';
    end if;

  elsif p_target_type = 'wanted_request' then
    select requester_id, title into v_owner_id, v_target_title
    from public.wanted_requests
    where id = p_target_id::uuid;

    if not found then
      raise exception 'Wanted request not found';
    end if;

    if v_owner_id != v_uid then
      raise exception 'You can only promote your own wanted requests';
    end if;
  end if;

  -- 5. Calculate activation time windows
  v_starts_at := timezone('utc'::text, now());
  v_expires_at := v_starts_at + v_duration;

  -- If payment reference provided, mark active; otherwise pending_payment
  if p_payment_ref is not null and length(trim(p_payment_ref)) > 0 then
    v_status := 'active';
  else
    v_status := 'pending_payment';
  end if;

  -- 6. Insert promotion record
  insert into public.promotions (
    user_id,
    target_type,
    target_id,
    promo_type,
    price_inr,
    status,
    starts_at,
    expires_at,
    payment_reference
  ) values (
    v_uid,
    p_target_type,
    p_target_id,
    p_promo_type,
    v_price,
    v_status,
    v_starts_at,
    v_expires_at,
    p_payment_ref
  ) returning id into v_promo_id;

  -- 7. If active, update the target listing or wanted request flags
  if v_status = 'active' then
    if p_target_type = 'listing' then
      update public.listings
      set is_featured = case when p_promo_type in ('featured_7d', 'featured_30d') then true else is_featured end,
          is_boosted = case when p_promo_type = 'boost_24h' then true else is_boosted end,
          boost_expires_at = case when p_promo_type = 'boost_24h' then extract(epoch from v_expires_at)::bigint * 1000 else boost_expires_at end
      where id = p_target_id::uuid;
    elsif p_target_type = 'wanted_request' then
      update public.wanted_requests
      set is_highlighted = true
      where id = p_target_id::uuid;
    end if;

    -- Create in-app confirmation notification for owner
    insert into public.in_app_notifications (
      user_id,
      title,
      message,
      type,
      link_id,
      link_type
    ) values (
      v_uid,
      'Promotion Activated: ' || coalesce(v_target_title, 'Item'),
      'Your ' || replace(p_promo_type, '_', ' ') || ' is now active until ' || to_char(v_expires_at, 'DD Mon YYYY, HH24:MI') || ' UTC.',
      'promotion_active',
      p_target_id,
      case when p_target_type = 'listing' then 'listing' else 'wanted' end
    );
  end if;

  return jsonb_build_object(
    'id', v_promo_id,
    'user_id', v_uid,
    'target_type', p_target_type,
    'target_id', p_target_id,
    'promo_type', p_promo_type,
    'price_inr', v_price,
    'status', v_status,
    'starts_at', v_starts_at,
    'expires_at', v_expires_at,
    'payment_reference', p_payment_ref
  );
end;
$$;

-- Grant execution on request_promotion to authenticated users
revoke execute on function public.request_promotion from public, anon;
grant execute on function public.request_promotion to authenticated;


-- 4. Enable Supabase Realtime for promotions safely
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
      and schemaname = 'public' 
      and tablename = 'promotions'
  ) then
    alter publication supabase_realtime add table public.promotions;
  end if;
end;
$$;
