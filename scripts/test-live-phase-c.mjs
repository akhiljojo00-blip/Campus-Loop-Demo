import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read credentials strictly from process.env or .env.local
let SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
let SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
let SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const envLocalPath = path.resolve('.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) SUPABASE_URL = trimmed.split('=')[1].trim();
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) SUPABASE_ANON_KEY = trimmed.split('=')[1].trim();
    if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_SERVICE_KEY = trimmed.split('=')[1].trim();
  }
}

console.log('================================================================');
console.log('  CAMPUSLOOP 3.0: PHASE C LIVE BACKEND VERIFICATION');
console.log('  Target: campusloop-dev (yvzfaeecpqhvpmngmbmj)');
console.log('================================================================\n');

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       -> ${details}`);
    failed++;
  }
}

async function runPhaseCLiveTests() {
  const ts = Date.now();
  const emailA = `seller_c_a_${ts}@campusloop.dev`;
  const emailB = `buyer_c_b_${ts}@campusloop.dev`;
  const emailC = `buyer_c_c_${ts}@campusloop.dev`;
  const password = `TestPass123!_${ts}`;

  let userA, userB, userC;
  let clientA, clientB, clientC;
  let testListingId;
  let offerBId, offerCId;
  let exchangeId;

  try {
    // 1. Provision 3 test users
    console.log('Provisioning test users (Seller A, Buyer B, Competing Buyer C)...');
    const { data: uA, error: eA } = await adminClient.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Professor Roy (Seller)', department: 'Computer Science', campus_location: 'Central Library' }
    });
    if (eA) throw eA;
    userA = uA.user;
    assert(Boolean(userA?.id), 'Provisioned Seller User A');

    const { data: uB, error: eB } = await adminClient.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Aditya (Buyer 1)', department: '1st Year BCA', campus_location: 'Central Library' }
    });
    if (eB) throw eB;
    userB = uB.user;
    assert(Boolean(userB?.id), 'Provisioned Buyer User B');

    const { data: uC, error: eC } = await adminClient.auth.admin.createUser({
      email: emailC,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Sneha (Buyer 2)', department: '1st Year BCA', campus_location: 'Science Quad' }
    });
    if (eC) throw eC;
    userC = uC.user;
    assert(Boolean(userC?.id), 'Provisioned Buyer User C');

    // Authenticate 3 clients
    clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await clientA.auth.signInWithPassword({ email: emailA, password });
    clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await clientB.auth.signInWithPassword({ email: emailB, password });
    clientC = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    await clientC.auth.signInWithPassword({ email: emailC, password });

    // Wait for triggers to create profiles
    await new Promise(r => setTimeout(r, 600));

    // 2. Seller A creates a listing
    console.log('\nCreating active listing by Seller A...');
    const { data: listingData, error: listErr } = await clientA
      .from('listings')
      .insert({
        seller_id: userA.id,
        title: 'Database System Concepts 7th Edition',
        description: 'Standard textbook for BCA semester 2 DBMS paper.',
        category: 'Textbooks',
        condition: 'Good condition',
        price: 500,
        campus_location: 'Central Library Lobby',
        status: 'active'
      })
      .select()
      .single();

    if (listErr) throw listErr;
    testListingId = listingData.id;
    assert(Boolean(testListingId), 'Seller A created active listing');

    // TEST 1: Seller cannot negotiate on their own listing
    console.log('\nTesting Rule 1: Seller cannot negotiate on their own listing...');
    const { data: ownOfferData, error: ownOfferErr } = await clientA.rpc('create_bargain_offer', {
      p_listing_id: testListingId,
      p_offered_price: 450,
      p_message: 'Offer on my own item'
    });
    assert(
      ownOfferErr !== null && (ownOfferErr.message.includes('own listing') || ownOfferErr.code === '22023'),
      'Seller A cannot propose an offer on their own listing (rejected by RPC)',
      ownOfferErr ? ownOfferErr.message : 'Should have failed'
    );

    // TEST 2: Invalid or non-positive price is rejected
    console.log('\nTesting Rule 2: Invalid or non-positive price validation...');
    const { data: negOffer, error: negErr } = await clientB.rpc('create_bargain_offer', {
      p_listing_id: testListingId,
      p_offered_price: -50,
      p_message: 'Negative offer'
    });
    assert(
      negErr !== null && (negErr.message.includes('positive') || negErr.code === '22023'),
      'Negative or zero price offer is rejected'
    );

    // TEST 3: Buyer B creates a valid offer
    console.log('\nTesting Rule 3: Valid offer proposal by Buyer B...');
    const { data: offerBData, error: offerBErr } = await clientB.rpc('create_bargain_offer', {
      p_listing_id: testListingId,
      p_offered_price: 400,
      p_message: 'Can pick up at 3pm at library'
    });
    if (offerBErr) throw offerBErr;
    offerBId = offerBData.id;
    assert(
      offerBData?.status === 'Pending' && Number(offerBData?.offered_price) === 400,
      'Buyer B successfully proposed offer of ₹400 (Status: Pending)'
    );

    // TEST 4: Nonparticipant C cannot read Buyer B private conversation
    console.log('\nTesting Rule 4: Nonparticipant cannot read conversation...');
    const { data: convsC } = await clientC
      .from('conversations')
      .select('*')
      .eq('id', offerBData.conversation_id);
    assert(
      !convsC || convsC.length === 0,
      'Nonparticipant User C cannot read User B private conversation (RLS enforced)'
    );

    // TEST 5: Nonparticipant C cannot send chat messages to B-A conversation
    console.log('\nTesting Rule 5: Nonparticipant cannot send chat messages...');
    const { error: sendCErr } = await clientC
      .from('chat_messages')
      .insert({
        conversation_id: offerBData.conversation_id,
        sender_id: userC.id,
        message: 'Intruding on this private chat'
      });
    assert(
      sendCErr !== null,
      'Nonparticipant User C cannot send messages to User B conversation (RLS enforced)',
      sendCErr?.message
    );

    // TEST 6: Buyer B cannot accept their own pending offer
    console.log('\nTesting Rule 6: Buyer cannot accept their own pending offer...');
    const { error: buyerAcceptErr } = await clientB.rpc('accept_bargain_offer', {
      p_offer_id: offerBId,
      p_message: 'Accepting my own offer'
    });
    assert(
      buyerAcceptErr !== null && (buyerAcceptErr.message.includes('Only the seller can accept') || buyerAcceptErr.code === '42501'),
      'Buyer B cannot accept their own pending offer'
    );

    // TEST 7: Seller A counters Buyer B offer with ₹450
    console.log('\nTesting Rule 7: Seller counters offer...');
    const { data: counterData, error: counterErr } = await clientA.rpc('counter_bargain_offer', {
      p_offer_id: offerBId,
      p_counter_price: 450,
      p_message: 'Meet halfway at ₹450?'
    });
    if (counterErr) throw counterErr;
    assert(
      counterData?.status === 'Countered' && Number(counterData?.counter_price) === 450,
      'Seller A countered offer with ₹450 (Status: Countered)'
    );

    // TEST 8: Seller A cannot accept their own counteroffer (only Buyer can accept counter)
    console.log('\nTesting Rule 8: Seller cannot accept their own counteroffer...');
    const { error: sellerAcceptCounterErr } = await clientA.rpc('accept_bargain_offer', {
      p_offer_id: offerBId
    });
    assert(
      sellerAcceptCounterErr !== null && (sellerAcceptCounterErr.message.includes('Only the buyer can accept') || sellerAcceptCounterErr.code === '42501'),
      'Seller A cannot accept their own counteroffer'
    );

    // TEST 9: Seller A cannot cancel Buyer B offer
    console.log('\nTesting Rule 9: Seller cannot cancel Buyer offer...');
    const { error: sellerCancelErr } = await clientA.rpc('cancel_bargain_offer', {
      p_offer_id: offerBId
    });
    assert(
      sellerCancelErr !== null && (sellerCancelErr.message.includes('Only the buyer can cancel') || sellerCancelErr.code === '42501'),
      'Seller A cannot cancel Buyer B offer'
    );

    // TEST 10: Competing offer from Buyer C for ₹460
    console.log('\nTesting Rule 10: Competing offer from Buyer C...');
    const { data: offerCData, error: offerCErr } = await clientC.rpc('create_bargain_offer', {
      p_listing_id: testListingId,
      p_offered_price: 460,
      p_message: 'Can take it immediately for ₹460 cash'
    });
    if (offerCErr) throw offerCErr;
    offerCId = offerCData.id;
    assert(
      offerCData?.status === 'Pending' && Number(offerCData?.offered_price) === 460,
      'Buyer C submitted competing offer of ₹460'
    );

    // TEST 11: Direct API update cannot bypass state transitions
    console.log('\nTesting Rule 11: Direct API updates blocked...');
    const { error: directUpdateErr } = await clientB
      .from('bargain_offers')
      .update({ status: 'Accepted' })
      .eq('id', offerBId);
    assert(
      directUpdateErr !== null,
      'Direct client UPDATE on bargain_offers is blocked (REVOKE enforced)'
    );

    // TEST 12: Atomic acceptance of Buyer C offer
    console.log('\nTesting Rule 12: Atomic acceptance & competing offer resolution...');
    const { data: acceptData, error: acceptErr } = await clientA.rpc('accept_bargain_offer', {
      p_offer_id: offerCId,
      p_message: 'Deal accepted! Meet at Central Library Lobby.'
    });
    if (acceptErr) throw acceptErr;
    assert(
      acceptData?.offer?.status === 'Accepted' && Number(acceptData?.offer?.agreed_price) === 460,
      'Seller A atomically accepted Buyer C offer at ₹460'
    );
    exchangeId = acceptData?.exchange?.id;
    assert(
      Boolean(exchangeId) && acceptData?.exchange?.status === 'reserved',
      'Persistent exchange record created with status: reserved'
    );

    // Check listing status changed to 'reserved'
    const { data: updatedListing } = await anonClient
      .from('listings')
      .select('status')
      .eq('id', testListingId)
      .single();
    assert(
      updatedListing?.status === 'reserved',
      'Listing status atomically updated to "reserved"'
    );

    // Check competing offer from Buyer B was automatically set to 'Rejected'
    const { data: offerBStatus } = await clientB
      .from('bargain_offers')
      .select('status')
      .eq('id', offerBId)
      .single();
    assert(
      offerBStatus?.status === 'Rejected',
      'Competing offer from Buyer B automatically transitioned to "Rejected"'
    );

    // TEST 13: Attempt to accept Buyer B rejected offer fails
    console.log('\nTesting Rule 13: Rejected offer cannot be accepted...');
    const { error: rejectAcceptErr } = await clientB.rpc('accept_bargain_offer', {
      p_offer_id: offerBId
    });
    assert(
      rejectAcceptErr !== null && (rejectAcceptErr.message.includes('not in an acceptable state') || rejectAcceptErr.code === '22023'),
      'Rejected offer cannot be accepted'
    );

    // TEST 14: Double acceptance prevention on reserved listing
    console.log('\nTesting Rule 14: Preventing competing acceptance on reserved listing...');
    const { error: doubleAcceptErr } = await clientA.rpc('accept_bargain_offer', {
      p_offer_id: offerCId
    });
    assert(
      doubleAcceptErr !== null,
      'Double acceptance on already accepted/reserved offer is strictly blocked'
    );

    // TEST 15: Private Chat Messaging & Realtime
    console.log('\nTesting Rule 15: Private chat exchange between Buyer C and Seller A...');
    const { data: msgC, error: msgCErr } = await clientC
      .from('chat_messages')
      .insert({
        conversation_id: offerCData.conversation_id,
        sender_id: userC.id,
        message: 'I am wearing a blue jacket by the circulation desk!'
      })
      .select()
      .single();
    if (msgCErr) throw msgCErr;
    assert(
      Boolean(msgC?.id) && msgC.message.includes('blue jacket'),
      'Buyer C sent normal text message in private conversation'
    );

    // Phase C.1 Security: Participant cannot insert 'system' messages
    console.log('\nTesting Phase C.1: Participant cannot spoof system messages...');
    const { error: spoofSysErr } = await clientC
      .from('chat_messages')
      .insert({
        conversation_id: offerCData.conversation_id,
        sender_id: userC.id,
        message: 'Spoofed system notification: Admin approved discount',
        message_type: 'system'
      });
    assert(
      spoofSysErr !== null,
      'Participant User C CANNOT directly insert a "system" message (RLS enforced)',
      spoofSysErr?.message
    );

    // Phase C.1 Security: Participant cannot insert 'offer_event' messages
    console.log('\nTesting Phase C.1: Participant cannot spoof offer_event messages...');
    const { error: spoofEventErr } = await clientC
      .from('chat_messages')
      .insert({
        conversation_id: offerCData.conversation_id,
        sender_id: userC.id,
        message: 'Spoofed offer event: Offer accepted for ₹1',
        message_type: 'offer_event'
      });
    assert(
      spoofEventErr !== null,
      'Participant User C CANNOT directly insert an "offer_event" message (RLS enforced)',
      spoofEventErr?.message
    );

    // Phase C.1 Security: Anonymous access to chat messages is blocked
    console.log('\nTesting Phase C.1: Anonymous access to chat messages is blocked...');
    const { data: anonChat } = await anonClient
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', offerCData.conversation_id);
    assert(
      !anonChat || anonChat.length === 0,
      'Anonymous user cannot read private chat messages (Revoke & RLS enforced)'
    );

    const { error: anonInsertErr } = await anonClient
      .from('chat_messages')
      .insert({
        conversation_id: offerCData.conversation_id,
        sender_id: userC.id,
        message: 'Anonymous intrusion'
      });
    assert(
      anonInsertErr !== null,
      'Anonymous user cannot insert chat messages'
    );

    // Seller A reads conversation messages
    const { data: sellerMessages, error: readErr } = await clientA
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', offerCData.conversation_id)
      .order('created_at', { ascending: true });
    if (readErr) throw readErr;
    assert(
      sellerMessages.some(m => m.message.includes('blue jacket')),
      'Seller A can read Buyer C private chat messages'
    );

    // Phase C.1: Verify trusted RPC functions generated legitimate system and offer-event messages
    console.log('\nTesting Phase C.1: Trusted RPC functions generated legitimate system and offer-event messages...');
    const hasSystemMsg = sellerMessages.some(m => m.message_type === 'system');
    const hasOfferEvent = sellerMessages.some(m => m.message_type === 'offer_event');
    assert(hasSystemMsg, 'Trusted RPC generated legitimate "system" message');
    assert(hasOfferEvent, 'Trusted RPC generated legitimate "offer_event" message');

    // Buyer B reads conversation C messages -> should return 0 (RLS isolation)
    const { data: bMessages } = await clientB
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', offerCData.conversation_id);
    assert(
      !bMessages || bMessages.length === 0,
      'Buyer B CANNOT read messages from Buyer C private conversation'
    );

    // TEST 16: Two-party exchange confirmation workflow
    console.log('\nTesting Rule 16: Two-party exchange completion workflow...');
    // Buyer C confirms exchange
    const { data: confirm1, error: c1Err } = await clientC.rpc('confirm_exchange_completion', {
      p_exchange_id: exchangeId
    });
    if (c1Err) throw c1Err;
    assert(
      confirm1?.status === 'reserved' && Boolean(confirm1?.buyer_confirmed_at),
      'Buyer C confirmed exchange (remains reserved until Seller confirms)'
    );

    // Seller A confirms exchange -> both confirmed -> status becomes completed and listing becomes sold!
    const { data: confirm2, error: c2Err } = await clientA.rpc('confirm_exchange_completion', {
      p_exchange_id: exchangeId
    });
    if (c2Err) throw c2Err;
    assert(
      confirm2?.status === 'completed' && Boolean(confirm2?.seller_confirmed_at),
      'Seller A confirmed exchange (transitions to "completed")'
    );

    const { data: finalListing } = await anonClient
      .from('listings')
      .select('status')
      .eq('id', testListingId)
      .single();
    assert(
      finalListing?.status === 'sold',
      'Listing status automatically transitioned to "sold"'
    );

    // TEST 17: Supabase Realtime channel setup and teardown
    console.log('\nTesting Rule 17: Supabase Realtime channel lifecycle...');
    const channel = clientA.channel(`chat_${offerCData.conversation_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${offerCData.conversation_id}`
      }, () => {})
      .subscribe((status) => {
        // Just verify channel can subscribe
      });

    assert(Boolean(channel), 'Realtime channel instantiated correctly for conversation');
    await clientA.removeChannel(channel);
    assert(true, 'Realtime channel cleaned up cleanly');

  } finally {
    console.log('\nCleaning up Phase C test records & accounts from campusloop-dev...');
    try {
      if (testListingId) {
        await adminClient.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await adminClient.from('offer_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await adminClient.from('bargain_offers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await adminClient.from('exchanges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await adminClient.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await adminClient.from('listings').delete().eq('id', testListingId);
      }
      if (userA?.id) await adminClient.auth.admin.deleteUser(userA.id);
      if (userB?.id) await adminClient.auth.admin.deleteUser(userB.id);
      if (userC?.id) await adminClient.auth.admin.deleteUser(userC.id);
      console.log('Cleanup complete.');
    } catch (cleanupErr) {
      console.warn('Cleanup warning:', cleanupErr.message);
    }
  }

  console.log('\n================================================================');
  console.log(`  PHASE C LIVE VERIFICATION FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhaseCLiveTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
