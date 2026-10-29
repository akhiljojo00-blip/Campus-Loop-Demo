-- CampusLoop 3.0: Phase C.1 - Chat Message Security Hardening
-- Hardening: Restrict direct authenticated chat message insertion to participant 'text' messages only
-- Revoke direct 'system' and 'offer_event' message creation by clients
-- Protect trusted RPC functions, maintain empty search path, revoke anonymous chat access
-- Date: 2026-10-29

-- ====================================================================
-- 1. HARDEN CHAT MESSAGE INSERT & SELECT POLICIES
-- ====================================================================

-- Drop previous insert policy
drop policy if exists "Participants can send messages" on public.chat_messages;

-- Create hardened insert policy:
-- 1. sender_id must match auth.uid()
-- 2. message_type MUST strictly equal 'text' (prevents spoofing 'system' or 'offer_event')
-- 3. message must be non-empty and <= 2000 characters
-- 4. auth.uid() must be an actual participant (buyer or seller) in the referenced conversation
create policy "Participants can send messages"
  on public.chat_messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and message_type = 'text'
    and char_length(trim(message)) > 0
    and char_length(message) <= 2000
    and exists (
      select 1 from public.conversations c
      where c.id = chat_messages.conversation_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- Re-affirm private SELECT policy (authenticated participants only)
drop policy if exists "Participants can view conversation messages" on public.chat_messages;
create policy "Participants can view conversation messages"
  on public.chat_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = chat_messages.conversation_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ====================================================================
-- 2. PERMISSION RESTRICTIONS (DEFENSE IN DEPTH)
-- ====================================================================

-- Anonymous and public roles have zero access to private chat messages
revoke all on public.chat_messages from public, anon;

-- Authenticated users can only SELECT and INSERT (UPDATE and DELETE are revoked)
revoke update, delete on public.chat_messages from authenticated;
grant select, insert on public.chat_messages to authenticated;

-- Ensure conversations table is strictly inaccessible to anonymous users
revoke all on public.conversations from public, anon;
grant select on public.conversations to authenticated;

-- ====================================================================
-- 3. ENSURE RPCs GENERATE INITIAL GREETING ON NEW CONVERSATION
-- ====================================================================

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

    -- Greeting system message
    insert into public.chat_messages (conversation_id, sender_id, message, message_type)
    values (
      v_conv_id, 
      v_listing.seller_id, 
      'Hi! Thanks for checking out "' || v_listing.title || '". Propose a price or pick a meetup spot!',
      'system'
    );
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

-- ====================================================================
-- 4. VERIFY RPC GRANTS & SEARCH PATH
-- ====================================================================

-- Re-assert explicit execution grants for authenticated users
grant execute on function public.get_or_create_conversation(uuid) to authenticated;
grant execute on function public.create_bargain_offer(uuid, numeric, text) to authenticated;
grant execute on function public.counter_bargain_offer(uuid, numeric, text) to authenticated;
grant execute on function public.accept_bargain_offer(uuid, text) to authenticated;
grant execute on function public.reject_bargain_offer(uuid, text) to authenticated;
grant execute on function public.cancel_bargain_offer(uuid) to authenticated;
grant execute on function public.confirm_exchange_completion(uuid) to authenticated;
grant execute on function public.cancel_exchange(uuid, text) to authenticated;

-- Revoke execute from public and anon
revoke execute on function public.get_or_create_conversation(uuid) from public, anon;
revoke execute on function public.create_bargain_offer(uuid, numeric, text) from public, anon;
revoke execute on function public.counter_bargain_offer(uuid, numeric, text) from public, anon;
revoke execute on function public.accept_bargain_offer(uuid, text) from public, anon;
revoke execute on function public.reject_bargain_offer(uuid, text) from public, anon;
revoke execute on function public.cancel_bargain_offer(uuid) from public, anon;
revoke execute on function public.confirm_exchange_completion(uuid) from public, anon;
revoke execute on function public.cancel_exchange(uuid, text) from public, anon;
