import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read credentials
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
console.log('  CAMPUSLOOP 3.0: PHASE B LIVE BACKEND VERIFICATION');
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

async function runPhaseBLiveTests() {
  try {
    const ts = Date.now();
    const emailA = `seller_a_${ts}@campusloop.dev`;
    const emailB = `buyer_b_${ts}@campusloop.dev`;
    const password = `TestPass123!_${ts}`;

    // 1. Provision two test users
    console.log(`Provisioning test accounts: ${emailA} & ${emailB}`);
    const { data: userAData, error: errA } = await adminClient.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Seller Alice', department: '1st Year BCA', campus_location: 'Central Library' }
    });
    const { data: userBData, error: errB } = await adminClient.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Buyer Bob', department: '2nd Year BCA', campus_location: 'Hostel Block A' }
    });
    assert(!errA && userAData.user, 'Provisioned User A');
    assert(!errB && userBData.user, 'Provisioned User B');

    // 2. Sign in as User A and User B using public anon client
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data: loginA } = await clientA.auth.signInWithPassword({ email: emailA, password });
    const { data: loginB } = await clientB.auth.signInWithPassword({ email: emailB, password });
    assert(loginA.session !== null, 'Client A authenticated');
    assert(loginB.session !== null, 'Client B authenticated');

    const userA = userAData.user;
    const userB = userBData.user;

    // 3. User A creates a real listing
    console.log('\nTesting Real Listings CRUD & RLS...');
    const { data: newListing, error: createListErr } = await clientA
      .from('listings')
      .insert({
        seller_id: userA.id,
        title: 'BCA Discrete Mathematics 4th Edition',
        description: 'Hardcover textbook, excellent condition with solved practice papers.',
        category: 'Textbooks',
        condition: 'Like New',
        price: 320,
        original_price: 650,
        contact_preference: 'Campus Chat',
        campus_location: 'Central Library',
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
        tags: ['bca', 'math', 'discrete']
      })
      .select()
      .single();
    assert(!createListErr && newListing, 'User A created listing in campusloop-dev', createListErr?.message);

    // 4. Public anonymous query for listings
    const { data: publicListings, error: pubErr } = await anonClient
      .from('listings')
      .select('id, title, price, category, condition, seller_id, profiles(full_name, department)')
      .eq('id', newListing.id)
      .single();
    assert(!pubErr && publicListings.title === newListing.title, 'Public/Anon user can read active listing with seller profile');

    // 5. User B attempts unauthorized UPDATE of User A's listing (must be rejected by RLS)
    const { data: bUpdateA, error: bUpdateErr } = await clientB
      .from('listings')
      .update({ price: 10, title: 'Defaced by User B' })
      .eq('id', newListing.id)
      .select();
    assert(
      bUpdateErr !== null || (Array.isArray(bUpdateA) && bUpdateA.length === 0),
      'User B CANNOT modify User A listing (RLS denied)'
    );

    // 6. User B attempts unauthorized DELETE of User A's listing (must be rejected by RLS)
    const { data: bDeleteA, error: bDeleteErr } = await clientB
      .from('listings')
      .delete()
      .eq('id', newListing.id)
      .select();
    assert(
      bDeleteErr !== null || (Array.isArray(bDeleteA) && bDeleteA.length === 0),
      'User B CANNOT delete User A listing (RLS denied)'
    );

    // 7. User A updates own listing (price change)
    const { data: aUpdateOwn, error: aUpdateErr } = await clientA
      .from('listings')
      .update({ price: 299 })
      .eq('id', newListing.id)
      .select()
      .single();
    assert(!aUpdateErr && aUpdateOwn.price === 299, 'User A successfully updated own listing');

    // 8. User B saves User A's listing (saved_listings)
    console.log('\nTesting Saved Listings (Bookmarks)...');
    const { data: savedRow, error: saveErr } = await clientB
      .from('saved_listings')
      .insert({ user_id: userB.id, listing_id: newListing.id })
      .select()
      .single();
    assert(!saveErr && savedRow, 'User B saved listing to bookmarks');

    // User A cannot view User B's saved listings
    const { data: aReadsBSaved, error: aReadSavedErr } = await clientA
      .from('saved_listings')
      .select('*')
      .eq('user_id', userB.id);
    assert(
      aReadSavedErr !== null || (Array.isArray(aReadsBSaved) && aReadsBSaved.length === 0),
      'User A CANNOT read User B saved bookmarks (RLS enforced)'
    );

    // 9. Wanted Board: User B creates a wanted request
    console.log('\nTesting Wanted Board Requests & RLS...');
    const { data: wantedReq, error: wantedErr } = await clientB
      .from('wanted_requests')
      .insert({
        requester_id: userB.id,
        title: 'Need Casio Scientific Calculator fx-991EX',
        category: 'Electronics',
        min_budget: 400,
        max_budget: 700,
        desired_condition: 'Good condition',
        campus_location: 'Hostel Block A',
        search_radius: 'On Campus Only',
        description: 'Need for BCA semester 2 exam on Friday.',
        urgency: 'Urgent (Need within 24h)'
      })
      .select()
      .single();
    assert(!wantedErr && wantedReq, 'User B posted Wanted Request in campusloop-dev', wantedErr?.message);

    // User A reads open wanted requests
    const { data: aReadsWanted, error: aReadWantedErr } = await clientA
      .from('wanted_requests')
      .select('id, title, max_budget, category, profiles(full_name, department)')
      .eq('id', wantedReq.id)
      .single();
    assert(!aReadWantedErr && aReadsWanted.title === wantedReq.title, 'User A can view User B open Wanted Request');

    // User A attempts to update or delete User B's request (must fail)
    const { data: aTamperWanted, error: aTamperErr } = await clientA
      .from('wanted_requests')
      .update({ status: 'Fulfilled' })
      .eq('id', wantedReq.id)
      .select();
    assert(
      aTamperErr !== null || (Array.isArray(aTamperWanted) && aTamperWanted.length === 0),
      'User A CANNOT update User B Wanted Request (RLS denied)'
    );

    // User B marks own request fulfilled
    const { data: bFulfilled, error: bFulfillErr } = await clientB
      .from('wanted_requests')
      .update({ status: 'Fulfilled' })
      .eq('id', wantedReq.id)
      .select()
      .single();
    assert(!bFulfillErr && bFulfilled.status === 'Fulfilled', 'User B marked own Wanted Request as Fulfilled');

    // 10. Test storage bucket 'listing-images' upload by User A
    console.log('\nTesting Listing Images Storage Bucket...');
    const dummyImageBuffer = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;', 'binary');
    const storageFilePath = `${userA.id}/test-item-${ts}.gif`;

    const { data: uploadRes, error: uploadErr } = await clientA
      .storage
      .from('listing-images')
      .upload(storageFilePath, dummyImageBuffer, { contentType: 'image/gif', upsert: true });
    assert(!uploadErr && uploadRes, 'User A uploaded image to listing-images bucket', uploadErr?.message);

    // Verify public URL retrieval
    const { data: publicUrlData } = clientA.storage.from('listing-images').getPublicUrl(storageFilePath);
    assert(publicUrlData && publicUrlData.publicUrl.includes(storageFilePath), 'Public URL for image generated correctly');

    // Cleanup: User A deletes own test image
    const { error: delImgErr } = await clientA.storage.from('listing-images').remove([storageFilePath]);
    assert(!delImgErr, 'User A deleted own test image from storage');

    // Cleanup: Delete test records & test users
    await adminClient.from('saved_listings').delete().eq('user_id', userB.id);
    await adminClient.from('wanted_requests').delete().eq('requester_id', userB.id);
    await adminClient.from('listings').delete().eq('seller_id', userA.id);
    await adminClient.auth.admin.deleteUser(userA.id);
    await adminClient.auth.admin.deleteUser(userB.id);
    console.log('\nCleaned up ephemeral Phase B test records & users.');

    console.log(`\n================================================================`);
    console.log(`  PHASE B LIVE VERIFICATION FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Unexpected error in Phase B tests:', err);
    process.exit(1);
  }
}

runPhaseBLiveTests();
