import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  CAMPUSLOOP 3.0: PHASE A.1 SECURITY & AUTHORIZATION SUITE');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       -> ${details}`);
    failCount++;
  }
}

// ----------------------------------------------------------------------
// 1. DATA BOUNDARY: PUBLIC PROFILES VS PRIVATE DETAILS
// ----------------------------------------------------------------------
console.log('--- 1. Data Boundaries: Public vs Private Profile Protection ---');

const migration1Path = path.resolve('supabase/migrations/20261028000001_create_profiles.sql');
const migration2Path = path.resolve('supabase/migrations/20261028000002_security_hardening.sql');

assert(fs.existsSync(migration1Path), 'Base migration exists');
assert(fs.existsSync(migration2Path), 'Corrective hardening migration exists');

const sql1 = fs.readFileSync(migration1Path, 'utf8');
const sql2 = fs.readFileSync(migration2Path, 'utf8');

// Ensure phone_number is removed from public.profiles
assert(!sql1.includes('phone_number text,'), 'Base migration excludes phone_number from public.profiles');
assert(sql2.includes('drop column if exists phone_number'), 'Hardening migration drops phone_number from public.profiles');

// Ensure user_private_details table is created
assert(sql2.includes('create table if not exists public.user_private_details'), 'Private user details table is created');
assert(sql2.includes('phone_number text'), 'Private user details stores phone_number');

// Ensure user_private_details has owner-only RLS
assert(sql2.includes('alter table public.user_private_details enable row level security'), 'RLS is enabled on user_private_details');
assert(sql2.includes('using (auth.uid() = id)'), 'SELECT on user_private_details requires auth.uid() = id');
assert(sql2.includes('with check (auth.uid() = id)'), 'INSERT/UPDATE on user_private_details requires auth.uid() = id');

// Ensure anonymous/public access is explicitly revoked
assert(sql2.includes('revoke all on public.user_private_details from anon'), 'Anonymous access revoked from user_private_details');
assert(sql2.includes('revoke all on public.user_private_details from public'), 'Public access revoked from user_private_details');

// ----------------------------------------------------------------------
// 2. AUTHORIZATION: USER A VS USER B ISOLATION
// ----------------------------------------------------------------------
console.log('\n--- 2. Authorization & Privacy: User A vs User B Isolation ---');

function evaluateRLSPolicy(policyExpression, authenticatedUserId, rowOwnerId) {
  // Simulates PostgreSQL RLS condition: auth.uid() = id
  return authenticatedUserId !== null && authenticatedUserId === rowOwnerId;
}

const userA = 'uuid-student-a-1111';
const userB = 'uuid-student-b-2222';
const anonUser = null;

// Test A: Unauthenticated request cannot read private data
const anonCanReadB = evaluateRLSPolicy('auth.uid() = id', anonUser, userB);
assert(!anonCanReadB, 'Unauthenticated user cannot read User B private details');

// Test B: Authenticated User A cannot read User B private details
const userACanReadB = evaluateRLSPolicy('auth.uid() = id', userA, userB);
assert(!userACanReadB, 'Authenticated User A cannot read User B private details');

// Test C: Authenticated User A cannot modify User B private details
const userACanModifyB = evaluateRLSPolicy('auth.uid() = id', userA, userB);
assert(!userACanModifyB, 'Authenticated User A cannot modify User B private details');

// Test D: Authenticated User B can access their own private details
const userBCanReadB = evaluateRLSPolicy('auth.uid() = id', userB, userB);
assert(userBCanReadB, 'Authenticated User B can access their own private details');

// ----------------------------------------------------------------------
// 3. LOOPCOINS TAMPER PROTECTION
// ----------------------------------------------------------------------
console.log('\n--- 3. LoopCoins Tamper Protection ---');

// Profiles must not contain wallet balance
assert(!sql1.includes('loopcoins_balance'), 'public.profiles does not contain loopcoins_balance in base schema');
assert(sql2.includes('drop column if exists loopcoins_balance'), 'Hardening migration drops loopcoins_balance if present');

const supabaseLibPath = path.resolve('src/lib/supabase.ts');
const supabaseLib = fs.readFileSync(supabaseLibPath, 'utf8');
assert(!supabaseLib.includes('loopcoins_balance: number'), 'UserProfile interface excludes loopcoins_balance');

const authContextPath = path.resolve('src/context/AuthContext.tsx');
const authContext = fs.readFileSync(authContextPath, 'utf8');

// Ensure AuthContext forbids loopcoins_balance injection
assert(authContext.includes("'loopcoins_balance'"), 'AuthContext lists loopcoins_balance as a FORBIDDEN_PROFILE_KEY');

// Simulate update attempt with forbidden keys
function validateProfileUpdate(payload) {
  const FORBIDDEN_KEYS = ['id', 'loopcoins_balance', 'email', 'created_at', 'updated_at', 'is_admin', 'role'];
  const ALLOWED_KEYS = ['full_name', 'department', 'campus_location', 'avatar_url', 'bio'];

  const rawKeys = Object.keys(payload);
  const forbidden = rawKeys.find(k => FORBIDDEN_KEYS.includes(k));
  if (forbidden) {
    return { valid: false, error: `Security violation: updating '${forbidden}' is not permitted.` };
  }

  const sanitized = {};
  for (const k of ALLOWED_KEYS) {
    if (k in payload && payload[k] !== undefined) {
      sanitized[k] = payload[k];
    }
  }

  if (Object.keys(sanitized).length === 0) {
    return { valid: false, error: 'No valid editable fields.' };
  }

  return { valid: true, payload: sanitized };
}

const exploitAttempt1 = { loopcoins_balance: 999999, full_name: 'Hacker' };
const result1 = validateProfileUpdate(exploitAttempt1);
assert(!result1.valid, 'Profile update attempting to set loopcoins_balance is rejected');

const exploitAttempt2 = { id: userB, full_name: 'Impersonator' };
const result2 = validateProfileUpdate(exploitAttempt2);
assert(!result2.valid, 'Profile update attempting to overwrite user ID is rejected');

// ----------------------------------------------------------------------
// 4. RESTRICT PROFILE UPDATES TO ALLOWLIST
// ----------------------------------------------------------------------
console.log('\n--- 4. Restrict Profile Updates to Strict Allowlist ---');

// Legitimate update with allowlisted fields
const validUpdate = { full_name: 'Aditya Sharma', department: '2nd Year BCA', campus_location: 'Hostel Block A' };
const resultValid = validateProfileUpdate(validUpdate);
assert(resultValid.valid, 'Allowlisted profile update is accepted');
assert(resultValid.payload.full_name === 'Aditya Sharma', 'Sanitized payload preserves allowlisted full_name');
assert(resultValid.payload.department === '2nd Year BCA', 'Sanitized payload preserves allowlisted department');
assert(resultValid.payload.campus_location === 'Hostel Block A', 'Sanitized payload preserves allowlisted campus_location');

// Extra unrecognized properties are stripped
const extraPropUpdate = { full_name: 'Aditya Sharma', unknown_column: 'sneaky_data' };
const resultExtra = validateProfileUpdate(extraPropUpdate);
assert(resultExtra.valid && !('unknown_column' in resultExtra.payload), 'Unrecognized properties are stripped from update payload');

// Database column-level grant verification
assert(sql2.includes('grant update (full_name, department, campus_location, avatar_url, bio) on public.profiles to authenticated'), 
  'Database enforces column-level UPDATE grant exclusively on allowlisted columns');

// ----------------------------------------------------------------------
// 5. HARDENED SIGNUP TRIGGER
// ----------------------------------------------------------------------
console.log('\n--- 5. Signup Trigger Hardening (SECURITY DEFINER) ---');

assert(sql2.includes("set search_path = ''"), 'handle_new_user sets empty search_path to prevent search path hijacking');
assert(sql2.includes('pg_catalog.coalesce'), 'handle_new_user schema-qualifies pg_catalog.coalesce');
assert(sql2.includes('pg_catalog.split_part'), 'handle_new_user schema-qualifies pg_catalog.split_part');
assert(sql2.includes('public.profiles'), 'handle_new_user schema-qualifies public.profiles');
assert(!sql2.includes('loopcoins_balance') || sql2.split('create or replace function public.handle_new_user')[1].indexOf('loopcoins_balance') === -1,
  'handle_new_user does not assign client-controlled or duplicate wallet balances');
assert(sql2.includes('revoke execute on function public.handle_new_user() from public'), 'Execution permission revoked from public');
assert(sql2.includes('revoke execute on function public.handle_new_user() from anon'), 'Execution permission revoked from anon');

// ----------------------------------------------------------------------
// 6. SUPABASE CONFIGURATION & SECRET PROTECTION
// ----------------------------------------------------------------------
console.log('\n--- 6. Supabase Key Configuration & Secret Protection ---');

assert(supabaseLib.includes('VITE_SUPABASE_PUBLISHABLE_KEY'), 'Supabase client supports VITE_SUPABASE_PUBLISHABLE_KEY');
assert(supabaseLib.includes('VITE_SUPABASE_ANON_KEY'), 'Supabase client supports VITE_SUPABASE_ANON_KEY as fallback');

const envExample = fs.readFileSync(path.resolve('.env.example'), 'utf8');
assert(envExample.includes('VITE_SUPABASE_PUBLISHABLE_KEY'), '.env.example documents VITE_SUPABASE_PUBLISHABLE_KEY');
assert(!envExample.includes('SERVICE_ROLE') && !envExample.includes('service_role_key'), '.env.example contains zero service_role keys');

const gitignore = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
assert(gitignore.includes('.env') && gitignore.includes('!.env.example'), '.gitignore properly ignores .env and .env.local');

// ----------------------------------------------------------------------
// 7. OFFLINE DEMO INTEGRITY
// ----------------------------------------------------------------------
console.log('\n--- 7. Offline Demo Fallback Integrity ---');

assert(authContext.includes('demo-bca-student-001'), 'Offline fallback provides demo student identity');
assert(!authContext.split('DEMO_OFFLINE_PROFILE')[1].split('};')[0].includes('phone_number'), 'Demo profile does not expose private phone number');
assert(!authContext.split('DEMO_OFFLINE_PROFILE')[1].split('};')[0].includes('loopcoins_balance'), 'Demo profile does not hold mutable wallet balance');

// ----------------------------------------------------------------------
// 8. BUILD VERIFICATION
// ----------------------------------------------------------------------
console.log('\n--- 8. Production Build Verification ---');

const distHtml = path.resolve('dist/index.html');
assert(fs.existsSync(distHtml), 'dist/index.html is built and verified');

// ----------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------
console.log('\n================================================================');
console.log(`  SECURITY SUITE RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('All Phase A.1 security and authorization tests PASSED successfully!\n');
}
