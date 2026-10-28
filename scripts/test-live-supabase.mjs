import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
import path from 'path';

// Read from .env.local if present, or process.env
let SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
let SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
let SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const envLocalPath = path.resolve('.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      SUPABASE_URL = trimmed.split('=')[1].trim();
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      SUPABASE_ANON_KEY = trimmed.split('=')[1].trim();
    }
    if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      SUPABASE_SERVICE_KEY = trimmed.split('=')[1].trim();
    }
  }
}

// Fallback to development service key from environment if not in .env.local
if (!SUPABASE_SERVICE_KEY) {
  SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

console.log('================================================================');
console.log('  CAMPUSLOOP 3.0: LIVE SUPABASE AUTH & RLS VERIFICATION');
console.log('  Target: campusloop-dev (yvzfaeecpqhvpmngmbmj)');
console.log('================================================================\n');

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

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

async function runLiveTests() {
  try {
    // 1. Anon SELECT on public.profiles
    const { data: publicProfiles, error: publicProfilesErr } = await anonClient
      .from('profiles')
      .select('id, full_name, department, campus_location, avatar_url, bio');
    assert(!publicProfilesErr, 'Anonymous user can query public.profiles', publicProfilesErr?.message);

    // 2. Anon SELECT attempting to read private phone_number from profiles (should fail as column does not exist)
    const { error: phoneColErr } = await anonClient
      .from('profiles')
      .select('id, phone_number');
    assert(phoneColErr !== null, 'Column phone_number does not exist on public.profiles (isolated)');

    // 3. Anon SELECT on user_private_details (must be empty or permission denied due to RLS)
    const { data: privateData, error: privateErr } = await anonClient
      .from('user_private_details')
      .select('*');
    assert(
      privateErr !== null || (Array.isArray(privateData) && privateData.length === 0),
      'Anonymous user cannot read any records from user_private_details'
    );

    // 4. Provision two real test accounts via admin auth (bypassing SMTP email rate limits)
    const timestamp = Date.now();
    const emailA = `student_a_${timestamp}@campusloop.dev`;
    const emailB = `student_b_${timestamp}@campusloop.dev`;
    const password = `TestPass123!_${timestamp}`;

    console.log(`\nCreating Test User A: ${emailA}`);
    const { data: adminUserA, error: createAErr } = await adminClient.auth.admin.createUser({
      email: emailA,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Student A Test',
        department: '1st Year BCA',
        campus_location: 'Central Library',
        phone_number: '+91 99887 11111'
      }
    });
    assert(!createAErr && adminUserA.user, 'Test User A provisioned successfully', createAErr?.message);

    console.log(`Creating Test User B: ${emailB}`);
    const { data: adminUserB, error: createBErr } = await adminClient.auth.admin.createUser({
      email: emailB,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: 'Student B Test',
        department: '2nd Year BCA',
        campus_location: 'Hostel Block B',
        phone_number: '+91 99887 22222'
      }
    });
    assert(!createBErr && adminUserB.user, 'Test User B provisioned successfully', createBErr?.message);

    if (!adminUserA.user || !adminUserB.user) {
      console.error('Aborting further live tests: users could not be created.');
      return;
    }

    // 5. Test real client authentication using standard anon client
    console.log('\nTesting client authentication with anon key...');
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });

    const { data: loginA, error: loginAErr } = await clientA.auth.signInWithPassword({ email: emailA, password });
    assert(!loginAErr && loginA.session, 'Client A logged in successfully via anon client', loginAErr?.message);

    const { data: loginB, error: loginBErr } = await clientB.auth.signInWithPassword({ email: emailB, password });
    assert(!loginBErr && loginB.session, 'Client B logged in successfully via anon client', loginBErr?.message);

    // 6. Test Trigger Creation on public.profiles
    const { data: profileA } = await anonClient
      .from('profiles')
      .select('*')
      .eq('id', adminUserA.user.id)
      .maybeSingle();
    assert(profileA !== null && profileA.full_name === 'Student A Test', 'Signup trigger automatically created public profile for User A');

    const { data: profileB } = await anonClient
      .from('profiles')
      .select('*')
      .eq('id', adminUserB.user.id)
      .maybeSingle();
    assert(profileB !== null && profileB.full_name === 'Student B Test', 'Signup trigger automatically created public profile for User B');

    // 7. Test Private Details: User A can read User A's private details
    const { data: userAReadsOwn, error: ownPrivateErr } = await clientA
      .from('user_private_details')
      .select('*')
      .eq('id', adminUserA.user.id);
    assert(
      !ownPrivateErr && userAReadsOwn && userAReadsOwn.length > 0,
      'User A CAN read User A own private details',
      ownPrivateErr?.message
    );

    // 8. Test Private Details Isolation: User A queries User B's private details
    const { data: userAReadsB, error: rlsReadErr } = await clientA
      .from('user_private_details')
      .select('*')
      .eq('id', adminUserB.user.id);
    assert(
      rlsReadErr !== null || (Array.isArray(userAReadsB) && userAReadsB.length === 0),
      'User A CANNOT read User B private details (RLS strictly enforced)'
    );

    // 9. User A attempts to update User B's profile
    const { data: updateOtherProf, error: updateOtherErr } = await clientA
      .from('profiles')
      .update({ full_name: 'Hacked by User A' })
      .eq('id', adminUserB.user.id)
      .select();
    assert(
      updateOtherErr !== null || (Array.isArray(updateOtherProf) && updateOtherProf.length === 0),
      'User A CANNOT update User B public profile (RLS enforced)'
    );

    // 10. User A updates User A's own profile (allowlisted fields)
    const { data: updateOwnProf, error: updateOwnErr } = await clientA
      .from('profiles')
      .update({ campus_location: 'Hostel Block C' })
      .eq('id', adminUserA.user.id)
      .select()
      .single();
    assert(
      !updateOwnErr && updateOwnProf && updateOwnProf.campus_location === 'Hostel Block C',
      'User A CAN update User A own profile within allowlist',
      updateOwnErr?.message
    );

    // 11. User A attempts to update unauthorized column on profiles
    const { error: tamperErr } = await clientA
      .from('profiles')
      .update({ loopcoins_balance: 50000 })
      .eq('id', adminUserA.user.id);
    assert(tamperErr !== null, 'User A CANNOT update loopcoins_balance (column removed & unpermitted)');

    // 12. Cleanup test users after run
    await adminClient.auth.admin.deleteUser(adminUserA.user.id);
    await adminClient.auth.admin.deleteUser(adminUserB.user.id);
    console.log('\nCleaned up ephemeral test users from campusloop-dev.');

    console.log(`\n================================================================`);
    console.log(`  LIVE SUPABASE TESTS FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected error during live tests:', err);
    process.exit(1);
  }
}

runLiveTests();
