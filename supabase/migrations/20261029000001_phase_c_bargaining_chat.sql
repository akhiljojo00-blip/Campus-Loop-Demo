-- CampusLoop 3.0: Phase C - Real Bargaining, Private Chat & Exchange Workflow
-- Tables: conversations, chat_messages, bargain_offers, offer_history, exchanges
-- Security: Transactional RPCs, strict RLS, atomic acceptance, participant validation
-- Date: 2026-10-29

-- ====================================================================
-- 0. UPDATE LISTINGS POLICY TO PERMIT VIEWING RESERVED AND SOLD ITEMS
-- ====================================================================

drop policy if exists "Listings are viewable by everyone" on public.listings;
create policy "Listings are viewable by everyone"
  on public.listings
  for select
  using (status in ('active', 'reserved', 'sold') or auth.uid() = seller_id);

-- ====================================================================
-- 1. CONVERSATIONS TABLE
-- ====================================================================

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint uq_conversations_listing_buyer unique (listing_id, buyer_id),
  constraint chk_conversations_participants_diff check (buyer_id <> seller_id)
);

create index if not exists idx_conversations_listing on public.conversations(listing_id);
create index if not exists idx_conversations_buyer on public.conversations(buyer_id);
create index if not exists idx_conversations_seller on public.conversations(seller_id);
create index if not exists idx_conversations_updated_at on public.conversations(updated_at desc);

alter table public.conversations enable row level security;

drop policy if exists "Participants can view own conversations" on public.conversations;
create policy "Participants can view own conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Direct client modifications revoked
revoke insert, update, delete on public.conversations from anon, authenticated;
grant select on public.conversations to anon, authenticated;

-- ====================================================================
-- 2. CHAT MESSAGES TABLE
-- ====================================================================

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(trim(message)) > 0 and char_length(message) <= 2000),
  message_type text not null default 'text' check (message_type in ('text', 'system', 'offer_event')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_chat_messages_conv on public.chat_messages(conversation_id);
create index if not exists idx_chat_messages_created_at on public.chat_messages(created_at asc);

alter table public.chat_messages enable row level security;

drop policy if exists "Participants can view conversation messages" on public.chat_messages;
create policy "Participants can view conversation messages"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = chat_messages.conversation_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Participants can send messages" on public.chat_messages;
create policy "Participants can send messages"
  on public.chat_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = chat_messages.conversation_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

grant select, insert on public.chat_messages to authenticated;
grant select on public.chat_messages to anon;

-- ====================================================================
-- 3. BARGAIN OFFERS TABLE
-- ====================================================================

create table if not exists public.bargain_offers (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  original_price numeric(10, 2) not null check (original_price >= 0),
  offered_price numeric(10, 2) not null check (offered_price > 0),
  counter_price numeric(10, 2) check (counter_price is null or counter_price > 0),
  status text not null default 'Pending' check (
    status in ('Pending', 'Countered', 'Accepted', 'Rejected', 'Cancelled', 'Expired')
  ),
  message text check (message is null or char_length(message) <= 1000),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint chk_bargain_offers_participants_diff check (buyer_id <> seller_id)
);

create index if not exists idx_bargain_offers_listing on public.bargain_offers(listing_id);
create index if not exists idx_bargain_offers_conv on public.bargain_offers(conversation_id);
create index if not exists idx_bargain_offers_buyer on public.bargain_offers(buyer_id);
create index if not exists idx_bargain_offers_seller on public.bargain_offers(seller_id);
create index if not exists idx_bargain_offers_status on public.bargain_offers(status);

alter table public.bargain_offers enable row level security;

drop policy if exists "Participants can view bargain offers" on public.bargain_offers;
create policy "Participants can view bargain offers"
  on public.bargain_offers for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Direct client mutations are strictly forbidden; RPC functions handle state transitions atomically
revoke insert, update, delete on public.bargain_offers from anon, authenticated;
grant select on public.bargain_offers to anon, authenticated;

-- ====================================================================
-- 4. OFFER HISTORY TIMELINE TABLE
-- ====================================================================

create table if not exists public.offer_history (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.bargain_offers(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null check (sender_role in ('buyer', 'seller')),
  action text not null check (action in ('propose', 'counter', 'accept', 'reject', 'cancel')),
  price numeric(10, 2) not null check (price > 0),
  message text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_offer_history_offer on public.offer_history(offer_id);
create index if not exists idx_offer_history_created_at on public.offer_history(created_at asc);

alter table public.offer_history enable row level security;

drop policy if exists "Participants can view offer history" on public.offer_history;
create policy "Participants can view offer history"
  on public.offer_history for select
  using (
    exists (
      select 1 from public.bargain_offers bo
      where bo.id = offer_history.offer_id
      and (bo.buyer_id = auth.uid() or bo.seller_id = auth.uid())
    )
  );

revoke insert, update, delete on public.offer_history from anon, authenticated;
grant select on public.offer_history to anon, authenticated;

-- ====================================================================
-- 5. EXCHANGES WORKFLOW TABLE
-- ====================================================================

create table if not exists public.exchanges (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  offer_id uuid references public.bargain_offers(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  agreed_price numeric(10, 2) not null check (agreed_price >= 0),
  status text not null default 'reserved' check (
    status in ('reserved', 'completed', 'cancelled')
  ),
  meetup_location text not null default 'Central Campus',
  buyer_confirmed_at timestamptz,
  seller_confirmed_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint chk_exchanges_parties_diff check (buyer_id <> seller_id)
);

create index if not exists idx_exchanges_listing on public.exchanges(listing_id);
create index if not exists idx_exchanges_buyer on public.exchanges(buyer_id);
create index if not exists idx_exchanges_seller on public.exchanges(seller_id);
create index if not exists idx_exchanges_status on public.exchanges(status);

-- Only one active exchange (reserved or completed) allowed per listing
create unique index if not exists uq_active_exchange_per_listing
  on public.exchanges(listing_id)
  where status in ('reserved', 'completed');

alter table public.exchanges enable row level security;

drop policy if exists "Participants can view their exchanges" on public.exchanges;
create policy "Participants can view their exchanges"
  on public.exchanges for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

revoke insert, update, delete on public.exchanges from anon, authenticated;
grant select on public.exchanges to anon, authenticated;

-- ====================================================================
-- 6. SECURITY-DEFINER TRANSACTIONAL RPC FUNCTIONS
-- ====================================================================

-- 6.1 Get or Create Conversation
create or replace function public.get_or_create_conversation(p_listing_id uuid)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_listing record;
  v_conv record;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select id, seller_id, title, campus_location, status
  into v_listing
  from public.listings
  where id = p_listing_id;

  if not found then
    raise exception 'Listing not found' using errcode = 'P0002';
  end if;

  if v_listing.seller_id = v_caller_id then
    raise exception 'Seller cannot start a buyer conversation on their own listing' using errcode = '22023';
  end if;

  select id, listing_id, buyer_id, seller_id, created_at, updated_at
  into v_conv
  from public.conversations
  where listing_id = p_listing_id and buyer_id = v_caller_id;

  if not found then
    insert into public.conversations (listing_id, buyer_id, seller_id)
    values (p_listing_id, v_caller_id, v_listing.seller_id)
    returning id, listing_id, buyer_id, seller_id, created_at, updated_at
    into v_conv;

    -- Greeting system message
    insert into public.chat_messages (conversation_id, sender_id, message, message_type)
    values (
      v_conv.id, 
      v_listing.seller_id, 
      'Hi! Thanks for checking out "' || v_listing.title || '". Propose a price or pick a meetup spot!',
      'system'
    );
  end if;

  return json_build_object(
    'id', v_conv.id,
    'listing_id', v_conv.listing_id,
    'buyer_id', v_conv.buyer_id,
    'seller_id', v_conv.seller_id,
    'created_at', v_conv.created_at,
    'updated_at', v_conv.updated_at
  );
end;
$$;

-- 6.2 Propose a New Bargain Offer
create or replace function public.create_bargain_offer(
  p_listing_id uuid, 
  p_offered_price numeric, 
  p_message text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_listing record;
  v_conv_id uuid;
  v_offer record;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_offered_price is null or p_offered_price <= 0 then
    raise exception 'Offered price must be positive' using errcode = '22023';
  end if;

  select id, seller_id, price, status, title
  into v_listing
  from public.listings
  where id = p_listing_id
  for share;

  if not found then
    raise exception 'Listing not found' using errcode = 'P0002';
  end if;

  if v_listing.seller_id = v_caller_id then
    raise exception 'Buyer cannot negotiate on their own listing' using errcode = '22023';
  end if;

  if v_listing.status <> 'active' then
    raise exception 'Listing is not available for offers (status: %)', v_listing.status using errcode = '22023';
  end if;

  select id into v_conv_id
  from public.conversations
  where listing_id = p_listing_id and buyer_id = v_caller_id;

  if not found then
    insert into public.conversations (listing_id, buyer_id, seller_id)
    values (p_listing_id, v_caller_id, v_listing.seller_id)
    returning id into v_conv_id;
  end if;

  -- Cancel existing pending/countered offers by this buyer on this listing
  update public.bargain_offers
  set status = 'Cancelled', updated_at = timezone('utc'::text, now())
  where listing_id = p_listing_id and buyer_id = v_caller_id and status in ('Pending', 'Countered');

  insert into public.bargain_offers (
    conversation_id,
    listing_id,
    buyer_id,
    seller_id,
    original_price,
    offered_price,
    status,
    message
  )
  values (
    v_conv_id,
    p_listing_id,
    v_caller_id,
    v_listing.seller_id,
    v_listing.price,
    p_offered_price,
    'Pending',
    p_message
  )
  returning * into v_offer;

  insert into public.offer_history (
    offer_id,
    sender_id,
    sender_role,
    action,
    price,
    message
  )
  values (
    v_offer.id,
    v_caller_id,
    'buyer',
    'propose',
    p_offered_price,
    coalesce(p_message, 'Proposed offer: ₹' || p_offered_price::text)
  );

  insert into public.chat_messages (conversation_id, sender_id, message, message_type)
  values (
    v_conv_id,
    v_caller_id,
    '📢 Proposed a price offer of ₹' || p_offered_price::text || (case when p_message is not null and trim(p_message) <> '' then ' — "' || p_message || '"' else '' end),
    'offer_event'
  );

  update public.conversations
  set updated_at = timezone('utc'::text, now())
  where id = v_conv_id;

  return json_build_object(
    'id', v_offer.id,
    'conversation_id', v_offer.conversation_id,
    'listing_id', v_offer.listing_id,
    'buyer_id', v_offer.buyer_id,
    'seller_id', v_offer.seller_id,
    'original_price', v_offer.original_price,
    'offered_price', v_offer.offered_price,
    'status', v_offer.status,
    'message', v_offer.message,
    'created_at', v_offer.created_at,
    'updated_at', v_offer.updated_at
  );
end;
$$;

-- 6.3 Propose Counteroffer (Seller only)
create or replace function public.counter_bargain_offer(
  p_offer_id uuid, 
  p_counter_price numeric, 
  p_message text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_offer record;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_counter_price is null or p_counter_price <= 0 then
    raise exception 'Counter price must be positive' using errcode = '22023';
  end if;

  select *
  into v_offer
  from public.bargain_offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'Offer not found' using errcode = 'P0002';
  end if;

  if v_offer.seller_id <> v_caller_id then
    raise exception 'Only the seller can counter this offer' using errcode = '42501';
  end if;

  if v_offer.status <> 'Pending' then
    raise exception 'Only Pending offers can be countered (current status: %)', v_offer.status using errcode = '22023';
  end if;

  update public.bargain_offers
  set counter_price = p_counter_price,
      status = 'Countered',
      updated_at = timezone('utc'::text, now())
  where id = p_offer_id
  returning * into v_offer;

  insert into public.offer_history (
    offer_id,
    sender_id,
    sender_role,
    action,
    price,
    message
  )
  values (
    v_offer.id,
    v_caller_id,
    'seller',
    'counter',
    p_counter_price,
    coalesce(p_message, 'Countered with ₹' || p_counter_price::text)
  );

  insert into public.chat_messages (conversation_id, sender_id, message, message_type)
  values (
    v_offer.conversation_id,
    v_caller_id,
    '🔄 Counteroffer proposed: ₹' || p_counter_price::text || (case when p_message is not null and trim(p_message) <> '' then ' — "' || p_message || '"' else '' end),
    'offer_event'
  );

  update public.conversations
  set updated_at = timezone('utc'::text, now())
  where id = v_offer.conversation_id;

  return json_build_object(
    'id', v_offer.id,
    'status', v_offer.status,
    'counter_price', v_offer.counter_price,
    'updated_at', v_offer.updated_at
  );
end;
$$;

-- 6.4 Accept Offer (Atomic Acceptance)
create or replace function public.accept_bargain_offer(
  p_offer_id uuid, 
  p_message text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_offer record;
  v_listing record;
  v_agreed_price numeric;
  v_exchange record;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into v_offer
  from public.bargain_offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'Offer not found' using errcode = 'P0002';
  end if;

  if v_offer.status not in ('Pending', 'Countered') then
    raise exception 'Offer is not in an acceptable state (status: %)', v_offer.status using errcode = '22023';
  end if;

  -- Pending offers can only be accepted by the seller; Countered offers can only be accepted by the buyer
  if v_offer.status = 'Pending' and v_caller_id <> v_offer.seller_id then
    raise exception 'Only the seller can accept a pending offer' using errcode = '42501';
  end if;

  if v_offer.status = 'Countered' and v_caller_id <> v_offer.buyer_id then
    raise exception 'Only the buyer can accept a counteroffer' using errcode = '42501';
  end if;

  -- Lock listing to ensure atomicity
  select id, seller_id, status, campus_location
  into v_listing
  from public.listings
  where id = v_offer.listing_id
  for update;

  if not found then
    raise exception 'Listing not found' using errcode = 'P0002';
  end if;

  if v_listing.status <> 'active' then
    raise exception 'Listing is no longer available (current status: %)', v_listing.status using errcode = '22023';
  end if;

  if exists (
    select 1 from public.exchanges
    where listing_id = v_listing.id and status in ('reserved', 'completed')
  ) then
    raise exception 'An active exchange already exists for this listing' using errcode = '22023';
  end if;

  if v_offer.status = 'Countered' then
    v_agreed_price := v_offer.counter_price;
  else
    v_agreed_price := v_offer.offered_price;
  end if;

  -- 1. Reserve listing
  update public.listings
  set status = 'reserved',
      updated_at = timezone('utc'::text, now())
  where id = v_listing.id;

  -- 2. Accept this offer
  update public.bargain_offers
  set status = 'Accepted',
      updated_at = timezone('utc'::text, now())
  where id = p_offer_id
  returning * into v_offer;

  -- 3. Reject competing offers
  update public.bargain_offers
  set status = 'Rejected',
      updated_at = timezone('utc'::text, now())
  where listing_id = v_listing.id and id <> p_offer_id and status in ('Pending', 'Countered');

  -- 4. Create exchange record
  insert into public.exchanges (
    listing_id,
    offer_id,
    buyer_id,
    seller_id,
    agreed_price,
    status,
    meetup_location
  )
  values (
    v_listing.id,
    v_offer.id,
    v_offer.buyer_id,
    v_offer.seller_id,
    v_agreed_price,
    'reserved',
    v_listing.campus_location
  )
  returning * into v_exchange;

  -- 5. Offer history
  insert into public.offer_history (
    offer_id,
    sender_id,
    sender_role,
    action,
    price,
    message
  )
  values (
    v_offer.id,
    v_caller_id,
    case when v_caller_id = v_offer.seller_id then 'seller' else 'buyer' end,
    'accept',
    v_agreed_price,
    coalesce(p_message, 'Deal accepted at ₹' || v_agreed_price::text)
  );

  -- 6. Chat announcement
  insert into public.chat_messages (conversation_id, sender_id, message, message_type)
  values (
    v_offer.conversation_id,
    v_caller_id,
    '🎉 Offer Accepted! Agreed on ₹' || v_agreed_price::text || '. The listing is reserved for campus exchange.',
    'offer_event'
  );

  update public.conversations
  set updated_at = timezone('utc'::text, now())
  where id = v_offer.conversation_id;

  return json_build_object(
    'offer', json_build_object(
      'id', v_offer.id,
      'status', v_offer.status,
      'agreed_price', v_agreed_price,
      'updated_at', v_offer.updated_at
    ),
    'exchange', json_build_object(
      'id', v_exchange.id,
      'status', v_exchange.status,
      'agreed_price', v_exchange.agreed_price,
      'meetup_location', v_exchange.meetup_location
    )
  );
end;
$$;

-- 6.5 Reject Offer (Seller only)
create or replace function public.reject_bargain_offer(
  p_offer_id uuid, 
  p_message text default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_offer record;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into v_offer
  from public.bargain_offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'Offer not found' using errcode = 'P0002';
  end if;

  if v_caller_id <> v_offer.seller_id then
    raise exception 'Only the seller can reject this offer' using errcode = '42501';
  end if;

  if v_offer.status not in ('Pending', 'Countered') then
    raise exception 'Offer is not active' using errcode = '22023';
  end if;

  update public.bargain_offers
  set status = 'Rejected',
      updated_at = timezone('utc'::text, now())
  where id = p_offer_id
  returning * into v_offer;

  insert into public.offer_history (
    offer_id,
    sender_id,
    sender_role,
    action,
    price,
    message
  )
  values (
    v_offer.id,
    v_caller_id,
    'seller',
    'reject',
    coalesce(v_offer.counter_price, v_offer.offered_price),
    coalesce(p_message, 'Declined offer.')
  );

  insert into public.chat_messages (conversation_id, sender_id, message, message_type)
  values (
    v_offer.conversation_id,
    v_caller_id,
    '❌ Seller declined the offer.' || (case when p_message is not null and trim(p_message) <> '' then ' "' || p_message || '"' else '' end),
    'offer_event'
  );

  update public.conversations
  set updated_at = timezone('utc'::text, now())
  where id = v_offer.conversation_id;

  return json_build_object(
    'id', v_offer.id,
    'status', v_offer.status
  );
end;
$$;

-- 6.6 Cancel Offer (Buyer only)
create or replace function public.cancel_bargain_offer(p_offer_id uuid)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_offer record;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into v_offer
  from public.bargain_offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'Offer not found' using errcode = 'P0002';
  end if;

  if v_caller_id <> v_offer.buyer_id then
    raise exception 'Only the buyer can cancel this offer' using errcode = '42501';
  end if;

  if v_offer.status not in ('Pending', 'Countered') then
    raise exception 'Offer is not active' using errcode = '22023';
  end if;

  update public.bargain_offers
  set status = 'Cancelled',
      updated_at = timezone('utc'::text, now())
  where id = p_offer_id
  returning * into v_offer;

  insert into public.offer_history (
    offer_id,
    sender_id,
    sender_role,
    action,
    price,
    message
  )
  values (
    v_offer.id,
    v_caller_id,
    'buyer',
    'cancel',
    coalesce(v_offer.counter_price, v_offer.offered_price),
    'Buyer cancelled offer.'
  );

  insert into public.chat_messages (conversation_id, sender_id, message, message_type)
  values (
    v_offer.conversation_id,
    v_caller_id,
    '🚫 Buyer cancelled the offer proposal.',
    'offer_event'
  );

  update public.conversations
  set updated_at = timezone('utc'::text, now())
  where id = v_offer.conversation_id;

  return json_build_object(
    'id', v_offer.id,
    'status', v_offer.status
  );
end;
$$;

-- 6.7 Confirm Exchange Completion (Requires both parties)
create or replace function public.confirm_exchange_completion(p_exchange_id uuid)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_exchange record;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into v_exchange
  from public.exchanges
  where id = p_exchange_id
  for update;

  if not found then
    raise exception 'Exchange not found' using errcode = 'P0002';
  end if;

  if v_caller_id <> v_exchange.buyer_id and v_caller_id <> v_exchange.seller_id then
    raise exception 'Not authorized to confirm this exchange' using errcode = '42501';
  end if;

  if v_exchange.status <> 'reserved' then
    raise exception 'Exchange is not in reserved state (status: %)', v_exchange.status using errcode = '22023';
  end if;

  if v_caller_id = v_exchange.buyer_id then
    v_exchange.buyer_confirmed_at := timezone('utc'::text, now());
  else
    v_exchange.seller_confirmed_at := timezone('utc'::text, now());
  end if;

  if v_exchange.buyer_confirmed_at is not null and v_exchange.seller_confirmed_at is not null then
    v_exchange.status := 'completed';
    update public.listings
    set status = 'sold', updated_at = timezone('utc'::text, now())
    where id = v_exchange.listing_id;
  end if;

  update public.exchanges
  set buyer_confirmed_at = v_exchange.buyer_confirmed_at,
      seller_confirmed_at = v_exchange.seller_confirmed_at,
      status = v_exchange.status,
      updated_at = timezone('utc'::text, now())
  where id = p_exchange_id;

  return json_build_object(
    'id', v_exchange.id,
    'status', v_exchange.status,
    'buyer_confirmed_at', v_exchange.buyer_confirmed_at,
    'seller_confirmed_at', v_exchange.seller_confirmed_at
  );
end;
$$;

-- 6.8 Cancel Exchange (Reverts listing to 'active')
create or replace function public.cancel_exchange(p_exchange_id uuid, p_reason text default null)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_exchange record;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select *
  into v_exchange
  from public.exchanges
  where id = p_exchange_id
  for update;

  if not found then
    raise exception 'Exchange not found' using errcode = 'P0002';
  end if;

  if v_caller_id <> v_exchange.buyer_id and v_caller_id <> v_exchange.seller_id then
    raise exception 'Not authorized to cancel this exchange' using errcode = '42501';
  end if;

  if v_exchange.status <> 'reserved' then
    raise exception 'Only reserved exchanges can be cancelled' using errcode = '22023';
  end if;

  update public.listings
  set status = 'active', updated_at = timezone('utc'::text, now())
  where id = v_exchange.listing_id;

  update public.exchanges
  set status = 'cancelled',
      notes = coalesce(p_reason, 'Exchange cancelled by participant'),
      updated_at = timezone('utc'::text, now())
  where id = p_exchange_id;

  return json_build_object(
    'id', v_exchange.id,
    'status', 'cancelled'
  );
end;
$$;

-- ====================================================================
-- 7. GRANTS AND REPLICA IDENTITY
-- ====================================================================

revoke execute on function public.get_or_create_conversation(uuid) from public, anon;
grant execute on function public.get_or_create_conversation(uuid) to authenticated;

revoke execute on function public.create_bargain_offer(uuid, numeric, text) from public, anon;
grant execute on function public.create_bargain_offer(uuid, numeric, text) to authenticated;

revoke execute on function public.counter_bargain_offer(uuid, numeric, text) from public, anon;
grant execute on function public.counter_bargain_offer(uuid, numeric, text) to authenticated;

revoke execute on function public.accept_bargain_offer(uuid, text) from public, anon;
grant execute on function public.accept_bargain_offer(uuid, text) to authenticated;

revoke execute on function public.reject_bargain_offer(uuid, text) from public, anon;
grant execute on function public.reject_bargain_offer(uuid, text) to authenticated;

revoke execute on function public.cancel_bargain_offer(uuid) from public, anon;
grant execute on function public.cancel_bargain_offer(uuid) to authenticated;

revoke execute on function public.confirm_exchange_completion(uuid) from public, anon;
grant execute on function public.confirm_exchange_completion(uuid) to authenticated;

revoke execute on function public.cancel_exchange(uuid, text) from public, anon;
grant execute on function public.cancel_exchange(uuid, text) to authenticated;

-- Enable Realtime publication conditionally
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bargain_offers'
  ) then
    alter publication supabase_realtime add table public.bargain_offers;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'exchanges'
  ) then
    alter publication supabase_realtime add table public.exchanges;
  end if;
end;
$$;

alter table public.chat_messages replica identity full;
alter table public.bargain_offers replica identity full;
alter table public.exchanges replica identity full;
