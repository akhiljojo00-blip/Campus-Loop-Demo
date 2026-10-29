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
console.log('  CAMPUS MARKET: PHASE D LIVE BACKEND VERIFICATION');
console.log('  Target: campusloop-dev (yvzfaeecpqhvpmngmbmj)');
console.log('================================================================\n');

const _anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
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

async function runPhaseDLiveTests() {
  const ts = Date.now();
  const emailA = `buyer_d_a_${ts}@campusloop.dev`;
  const emailB = `seller_d_b_${ts}@campusloop.dev`;
  const password = `PassD123!_${ts}`;

  let userA, userB;
  let clientA, clientB;
  let testListingId;
  let testWantedId;

  try {
    // 1. Provision test accounts
    console.log('Provisioning test users (User A - Buyer, User B - Seller)...');
    const { data: authA, error: errA } = await adminClient.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Ananya Sharma (Buyer A)', department: '2nd Year BBA' }
    });
    if (errA) throw errA;
    userA = authA.user;

    const { data: authB, error: errB } = await adminClient.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Rohit Verma (Seller B)', department: '3rd Year BCA' }
    });
    if (errB) throw errB;
    userB = authB.user;

    // Authenticate client sessions
    clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { error: signinErrA } = await clientA.auth.signInWithPassword({ email: emailA, password });
    if (signinErrA) throw signinErrA;

    clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { error: signinErrB } = await clientB.auth.signInWithPassword({ email: emailB, password });
    if (signinErrB) throw signinErrB;

    assert(userA && userB, 'Provisioned and authenticated test users in campusloop-dev');

    // 2. Test User Category Preferences CRUD & RLS
    console.log('\nTesting Category Preferences CRUD & RLS...');
    const { data: prefA, error: prefErrA } = await clientA
      .from('user_category_preferences')
      .insert({
        user_id: userA.id,
        buy_categories: ['Textbooks', 'Electronics'],
        sell_categories: ['Study essentials'],
        wanted_categories: ['Textbooks'],
        notifications_enabled: true
      })
      .select()
      .single();

    assert(!prefErrA && prefA?.buy_categories?.includes('Textbooks'), 'User A inserted category preferences');

    const { data: prefB, error: prefErrB } = await clientB
      .from('user_category_preferences')
      .insert({
        user_id: userB.id,
        buy_categories: ['Hostel essentials'],
        sell_categories: ['Stationery'],
        wanted_categories: ['Stationery'],
        notifications_enabled: true
      })
      .select()
      .single();

    assert(!prefErrB && prefB?.sell_categories?.includes('Stationery'), 'User B inserted category preferences');

    // Isolation check: User B cannot view User A preferences
    const { data: bViewsA, error: _bViewsAErr } = await clientB
      .from('user_category_preferences')
      .select('*')
      .eq('user_id', userA.id);

    assert(bViewsA?.length === 0, 'User B CANNOT read User A category preferences (RLS isolated)');

    // Isolation check: User B cannot update User A preferences
    const { data: bUpdatesA, error: _bUpdatesAErr } = await clientB
      .from('user_category_preferences')
      .update({ buy_categories: ['Hacked'] })
      .eq('user_id', userA.id)
      .select();

    assert(!bUpdatesA || bUpdatesA.length === 0, 'User B CANNOT update User A category preferences (RLS denied)');

    // 3. Test Automatic Matching Notification on New Listing
    console.log('\nTesting Automatic Listing Matching Notification Trigger...');
    // User B lists a Textbook (User A has Textbooks in buy_categories)
    const { data: newListing, error: listErr } = await clientB
      .from('listings')
      .insert({
        seller_id: userB.id,
        title: 'Data Structures with C++ Textbook',
        description: 'Excellent condition, all pages intact.',
        category: 'Textbooks',
        condition: 'Good condition',
        price: 350,
        original_price: 600,
        campus_location: 'Hostel Block 4, North Campus',
        contact_preference: 'Campus Chat',
        latitude: 28.545,
        longitude: 77.192,
        status: 'active'
      })
      .select()
      .single();

    if (listErr) throw listErr;
    testListingId = newListing.id;
    assert(newListing?.id, 'User B posted active Textbook listing');

    // Give trigger a moment to execute
    await new Promise(r => setTimeout(r, 600));

    // Check User A in-app notifications
    const { data: notifsA, error: notifErrA } = await clientA
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', userA.id)
      .eq('type', 'new_listing_match');

    assert(
      !notifErrA && notifsA?.some(n => n.link_id === testListingId),
      'User A received automated matching notification for Textbook listing',
      notifErrA ? notifErrA.message : 'No matching notification found'
    );

    // Verify User B (seller) did NOT receive a notification for their own listing
    const { data: notifsBSelf } = await clientB
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', userB.id)
      .eq('link_id', testListingId);

    assert(notifsBSelf?.length === 0, 'Seller User B did NOT receive self-notification');

    // 4. Test Automatic Matching Notification on Wanted Request
    console.log('\nTesting Automatic Wanted Request Matching Notification Trigger...');
    // User A posts a wanted request for Stationery (User B has Stationery in sell_categories)
    const { data: newWanted, error: wantedErr } = await clientA
      .from('wanted_requests')
      .insert({
        requester_id: userA.id,
        title: 'Casio Scientific Calculator FX-991EX',
        description: 'Need urgently for end-term mathematics exam.',
        category: 'Stationery',
        min_budget: 400,
        max_budget: 700,
        desired_condition: 'Good condition',
        campus_location: 'Library Quad',
        search_radius: 'On Campus Only',
        urgency: 'Within a week',
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: 'Open'
      })
      .select()
      .single();

    if (wantedErr) throw wantedErr;
    testWantedId = newWanted.id;
    assert(newWanted?.id, 'User A posted open Wanted Request for Stationery');

    await new Promise(r => setTimeout(r, 600));

    // Check User B notifications
    const { data: notifsB, error: notifErrB } = await clientB
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', userB.id)
      .eq('type', 'wanted_match');

    assert(
      !notifErrB && notifsB?.some(n => n.link_id === testWantedId),
      'User B received automated matching notification for Wanted Request',
      notifErrB ? notifErrB.message : 'No matching notification found'
    );

    // 5. Test Notification Management (Mark as Read, RLS isolation)
    console.log('\nTesting Notification Update & Isolation...');
    const targetNotif = notifsA[0];
    const { data: updatedNotif, error: upNotifErr } = await clientA
      .from('in_app_notifications')
      .update({ is_read: true })
      .eq('id', targetNotif.id)
      .select()
      .single();

    assert(!upNotifErr && updatedNotif?.is_read === true, 'User A successfully marked notification as read');

    // Isolation check: User B cannot see User A notifications
    const { data: bReadsANotifs } = await clientB
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', userA.id);

    assert(bReadsANotifs?.length === 0, 'User B CANNOT read User A private notifications (RLS enforced)');

    // 6. Test Promotions & Catalogue Monetization
    console.log('\nTesting Promotions Catalogue & RPC Authorization...');

    // Test: Non-owner User A cannot promote User B's listing
    const { data: _fraudPromo, error: fraudErr } = await clientA.rpc('request_promotion', {
      p_target_type: 'listing',
      p_target_id: testListingId,
      p_promo_type: 'boost_24h',
      p_payment_ref: 'TEST_UNAUTHORIZED_REF'
    });

    assert(
      fraudErr && fraudErr.message.includes('You can only promote your own listings'),
      'Non-owner User A is blocked from promoting User B listing (RPC owner check enforced)'
    );

    // Test: Direct INSERT into promotions is blocked
    const { data: _directInsert, error: directErr } = await clientB
      .from('promotions')
      .insert({
        user_id: userB.id,
        target_type: 'listing',
        target_id: testListingId,
        promo_type: 'boost_24h',
        price_inr: 0.01,
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString()
      });

    assert(directErr !== null, 'Direct client INSERT into public.promotions is blocked (Revoke enforced)');

    // Test: Owner User B requests 24h boost via RPC
    const { data: validPromo, error: promoErr } = await clientB.rpc('request_promotion', {
      p_target_type: 'listing',
      p_target_id: testListingId,
      p_promo_type: 'boost_24h',
      p_payment_ref: 'UPI_REF_SIM_12345'
    });

    assert(
      !promoErr && validPromo?.status === 'active' && Number(validPromo?.price_inr) === 3.00,
      'Owner User B activated 24-hour item boost at catalogue price ₹3.00',
      promoErr ? promoErr.message : `Status: ${validPromo?.status}, Price: ${validPromo?.price_inr}`
    );

    // Verify listing is now marked is_boosted = true
    const { data: boostedListing } = await clientB
      .from('listings')
      .select('is_boosted, is_featured')
      .eq('id', testListingId)
      .single();

    assert(boostedListing?.is_boosted === true, 'Target listing atomically updated with is_boosted = true');

    // Verify User B received in-app confirmation notification for promotion
    const { data: promoNotifs } = await clientB
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', userB.id)
      .eq('type', 'promotion_active');

    assert(promoNotifs?.length > 0, 'User B received in-app notification confirming promotion activation');

    // 7. Test Location & Haversine Distance Calculation
    console.log('\nTesting Haversine Distance Function in PostgreSQL...');
    // Distance between North Campus (28.545, 77.192) and Central Library (28.549, 77.195)
    const { data: distData, error: distErr } = await adminClient.rpc('haversine_distance_km', {
      lat1: 28.545,
      lon1: 77.192,
      lat2: 28.549,
      lon2: 77.195
    });

    const distKm = Number(distData);
    assert(
      !distErr && distKm > 0.4 && distKm < 0.7,
      `Haversine formula calculated distance accurately: ${Math.round(distKm * 1000)} m`
    );

  } finally {
    // Ephemeral cleanup
    console.log('\nCleaning up Phase D test records & accounts from campusloop-dev...');
    if (testListingId) {
      await adminClient.from('promotions').delete().eq('target_id', testListingId);
      await adminClient.from('in_app_notifications').delete().eq('link_id', testListingId);
      await adminClient.from('listings').delete().eq('id', testListingId);
    }
    if (testWantedId) {
      await adminClient.from('in_app_notifications').delete().eq('link_id', testWantedId);
      await adminClient.from('wanted_requests').delete().eq('id', testWantedId);
    }
    if (userA) {
      await adminClient.from('user_category_preferences').delete().eq('user_id', userA.id);
      await adminClient.from('in_app_notifications').delete().eq('user_id', userA.id);
      await adminClient.auth.admin.deleteUser(userA.id);
    }
    if (userB) {
      await adminClient.from('user_category_preferences').delete().eq('user_id', userB.id);
      await adminClient.from('in_app_notifications').delete().eq('user_id', userB.id);
      await adminClient.auth.admin.deleteUser(userB.id);
    }
    console.log('Cleanup complete.');
  }

  console.log('\n================================================================');
  console.log(`  PHASE D LIVE VERIFICATION FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhaseDLiveTests().catch(err => {
  console.error('Fatal error running Phase D tests:', err);
  process.exit(1);
});
