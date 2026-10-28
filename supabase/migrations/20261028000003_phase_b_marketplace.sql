-- CampusLoop 3.0: Phase B - Real Marketplace Backend
-- Tables: listings, saved_listings, listing_images, wanted_requests
-- Storage Bucket: listing-images
-- Target Environment: campusloop-dev (Supabase Development Project)
-- Date: 2026-10-29

-- ====================================================================
-- 1. REAL LISTINGS TABLE
-- ====================================================================

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (
    category in (
      'Textbooks', 
      'Electronics', 
      'Stationery', 
      'Study essentials', 
      'Hostel essentials', 
      'College essentials', 
      'Other'
    )
  ),
  condition text not null check (
    condition in (
      'Like New', 
      'Good condition', 
      'Well used'
    )
  ),
  price numeric(10, 2) not null check (price >= 0),
  original_price numeric(10, 2) check (original_price is null or original_price >= price),
  contact_preference text not null default 'Campus Chat' check (
    contact_preference in (
      'Campus Chat', 
      'WhatsApp', 
      'Meet at Library'
    )
  ),
  campus_location text not null default 'Central Library',
  latitude double precision,
  longitude double precision,
  image_url text not null default 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
  tags text[] default array[]::text[],
  condition_notes text,
  status text not null default 'active' check (
    status in ('active', 'reserved', 'sold', 'archived')
  ),
  is_featured boolean default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes for performance
create index if not exists idx_listings_seller_id on public.listings(seller_id);
create index if not exists idx_listings_category on public.listings(category);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_created_at on public.listings(created_at desc);

-- Trigger for updated_at
drop trigger if exists on_listings_updated on public.listings;
create trigger on_listings_updated
  before update on public.listings
  for each row execute function public.handle_updated_at();

-- RLS for listings
alter table public.listings enable row level security;

drop policy if exists "Listings are viewable by everyone" on public.listings;
drop policy if exists "Authenticated users can create listings" on public.listings;
drop policy if exists "Users can update own listings" on public.listings;
drop policy if exists "Users can delete own listings" on public.listings;

-- Public can view active listings; sellers can view their own listings regardless of status
create policy "Listings are viewable by everyone"
  on public.listings
  for select
  using (status = 'active' or auth.uid() = seller_id);

-- Authenticated students can create listings under their own profile
create policy "Authenticated users can create listings"
  on public.listings
  for insert
  with check (auth.uid() = seller_id);

-- Only listing owners can update their listings
create policy "Users can update own listings"
  on public.listings
  for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

-- Only listing owners can delete their listings
create policy "Users can delete own listings"
  on public.listings
  for delete
  using (auth.uid() = seller_id);

-- ====================================================================
-- 2. SAVED LISTINGS (BOOKMARKS) TABLE
-- ====================================================================

create table if not exists public.saved_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique(user_id, listing_id)
);

create index if not exists idx_saved_listings_user on public.saved_listings(user_id);

-- RLS for saved_listings (strictly owner-only)
alter table public.saved_listings enable row level security;

drop policy if exists "Users can view own saved listings" on public.saved_listings;
drop policy if exists "Users can save listings" on public.saved_listings;
drop policy if exists "Users can unsave listings" on public.saved_listings;

create policy "Users can view own saved listings"
  on public.saved_listings
  for select
  using (auth.uid() = user_id);

create policy "Users can save listings"
  on public.saved_listings
  for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave listings"
  on public.saved_listings
  for delete
  using (auth.uid() = user_id);

-- ====================================================================
-- 3. LISTING IMAGES STORAGE & TABLE
-- ====================================================================

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  uploader_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  is_primary boolean default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_listing_images_listing on public.listing_images(listing_id);

alter table public.listing_images enable row level security;

drop policy if exists "Listing images are viewable by everyone" on public.listing_images;
drop policy if exists "Authenticated users can upload listing images" on public.listing_images;
drop policy if exists "Uploaders can delete own listing images" on public.listing_images;

create policy "Listing images are viewable by everyone"
  on public.listing_images
  for select
  using (true);

create policy "Authenticated users can upload listing images"
  on public.listing_images
  for insert
  with check (auth.uid() = uploader_id);

create policy "Uploaders can delete own listing images"
  on public.listing_images
  for delete
  using (auth.uid() = uploader_id);

-- Create public storage bucket for listing images if storage schema exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images', 
  'listing-images', 
  true, 
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage bucket RLS policies
drop policy if exists "Public Access to Listing Images" on storage.objects;
drop policy if exists "Authenticated users can upload listing images" on storage.objects;
drop policy if exists "Users can update own listing images" on storage.objects;
drop policy if exists "Users can delete own listing images" on storage.objects;

create policy "Public Access to Listing Images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images' 
    and auth.role() = 'authenticated'
  );

create policy "Users can update own listing images"
  on storage.objects for update
  using (
    bucket_id = 'listing-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================================================================
-- 4. REAL WANTED BOARD TABLE
-- ====================================================================

create table if not exists public.wanted_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null check (
    category in (
      'Textbooks', 
      'Electronics', 
      'Stationery', 
      'Study essentials', 
      'Hostel essentials', 
      'College essentials', 
      'Other'
    )
  ),
  min_budget numeric(10, 2) not null default 0 check (min_budget >= 0),
  max_budget numeric(10, 2) not null check (max_budget >= min_budget),
  desired_condition text not null default 'Any condition' check (
    desired_condition in (
      'Like New', 
      'Good condition', 
      'Any condition'
    )
  ),
  campus_location text not null default 'Central Library',
  search_radius text not null default 'On Campus Only',
  description text not null,
  urgency text not null default 'No rush' check (
    urgency in (
      'Urgent (Need within 24h)', 
      'Within a week', 
      'No rush'
    )
  ),
  expires_at timestamptz not null default (timezone('utc'::text, now()) + interval '14 days'),
  status text not null default 'Open' check (
    status in ('Open', 'Offers Received', 'Fulfilled', 'Expired')
  ),
  is_highlighted boolean default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes for wanted_requests
create index if not exists idx_wanted_requester_id on public.wanted_requests(requester_id);
create index if not exists idx_wanted_status on public.wanted_requests(status);
create index if not exists idx_wanted_category on public.wanted_requests(category);
create index if not exists idx_wanted_created_at on public.wanted_requests(created_at desc);

-- Trigger for updated_at
drop trigger if exists on_wanted_requests_updated on public.wanted_requests;
create trigger on_wanted_requests_updated
  before update on public.wanted_requests
  for each row execute function public.handle_updated_at();

-- RLS for wanted_requests
alter table public.wanted_requests enable row level security;

drop policy if exists "Wanted requests are viewable by everyone" on public.wanted_requests;
drop policy if exists "Authenticated users can create wanted requests" on public.wanted_requests;
drop policy if exists "Users can update own wanted requests" on public.wanted_requests;
drop policy if exists "Users can delete own wanted requests" on public.wanted_requests;

create policy "Wanted requests are viewable by everyone"
  on public.wanted_requests
  for select
  using (status in ('Open', 'Offers Received', 'Fulfilled') or auth.uid() = requester_id);

create policy "Authenticated users can create wanted requests"
  on public.wanted_requests
  for insert
  with check (auth.uid() = requester_id);

create policy "Users can update own wanted requests"
  on public.wanted_requests
  for update
  using (auth.uid() = requester_id)
  with check (auth.uid() = requester_id);

create policy "Users can delete own wanted requests"
  on public.wanted_requests
  for delete
  using (auth.uid() = requester_id);
