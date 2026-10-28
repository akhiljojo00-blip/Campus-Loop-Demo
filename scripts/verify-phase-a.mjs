import fs from 'fs';
import path from 'path';

console.log('=== CAMPUSLOOP 3.0: PHASE A VERIFICATION SUITE ===\n');

let failedTests = 0;
let passedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    failedTests++;
  }
}

// 1. Check .env.example
const envExamplePath = path.resolve('.env.example');
assert(fs.existsSync(envExamplePath), '.env.example exists');
if (fs.existsSync(envExamplePath)) {
  const content = fs.readFileSync(envExamplePath, 'utf8');
  assert(content.includes('VITE_SUPABASE_URL'), '.env.example defines VITE_SUPABASE_URL');
  assert(content.includes('VITE_SUPABASE_ANON_KEY'), '.env.example defines VITE_SUPABASE_ANON_KEY');
  assert(!content.includes('SERVICE_ROLE') && !content.includes('service_role_key'), '.env.example does not expose service-role key variables');
  assert(content.includes('campusloop-dev'), '.env.example clearly references development project');
}

// 2. Check .gitignore
const gitignorePath = path.resolve('.gitignore');
assert(fs.existsSync(gitignorePath), '.gitignore exists');
if (fs.existsSync(gitignorePath)) {
  const content = fs.readFileSync(gitignorePath, 'utf8');
  assert(content.includes('.env') && content.includes('!.env.example'), '.gitignore excludes .env files while preserving .env.example');
}

// 3. Check SQL Migration
const migrationPath = path.resolve('supabase/migrations/20261028000001_create_profiles.sql');
assert(fs.existsSync(migrationPath), 'SQL migration 20261028000001_create_profiles.sql exists');
if (fs.existsSync(migrationPath)) {
  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert(sql.includes('create table if not exists public.profiles'), 'Migration creates public.profiles table');
  assert(sql.includes('references auth.users(id) on delete cascade'), 'Profiles table references auth.users with cascade delete');
  assert(sql.includes('alter table public.profiles enable row level security;'), 'RLS is enabled on public.profiles');
  assert(sql.includes('for select'), 'RLS includes select policy for profiles');
  assert(sql.includes('for insert'), 'RLS includes self-insert policy for profiles');
  assert(sql.includes('for update'), 'RLS includes self-update policy for profiles');
  assert(sql.includes('create trigger on_auth_user_created'), 'Auth signup trigger on_auth_user_created is configured');
  assert(sql.includes('create trigger on_profile_updated'), 'Updated_at trigger on_profile_updated is configured');
}

// 4. Check Supabase Client and Auth Files
assert(fs.existsSync(path.resolve('src/lib/supabase.ts')), 'src/lib/supabase.ts exists');
assert(fs.existsSync(path.resolve('src/context/AuthContext.tsx')), 'src/context/AuthContext.tsx exists');
assert(fs.existsSync(path.resolve('src/components/AuthModal.tsx')), 'src/components/AuthModal.tsx exists');
assert(fs.existsSync(path.resolve('supabase/README.md')), 'supabase/README.md documentation exists');

// 5. Check Dist Build Output
assert(fs.existsSync(path.resolve('dist/index.html')), 'dist/index.html exists from production build');

console.log(`\nVerification complete: ${passedTests} passed, ${failedTests} failed.`);
if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('Phase A foundation verified successfully!\n');
}
