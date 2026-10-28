import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Public display profile interface (safe for marketplace queries)
export interface UserProfile {
  id: string;
  full_name: string;
  department: string;
  campus_location: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Private contact & account details (strictly owner-only via RLS)
export interface UserPrivateDetails {
  id: string;
  phone_number?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Environment variables: support modern Supabase Publishable Key (sbp_...) or legacy Anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublicKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid URL & non-placeholder publishable/anon key are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabasePublicKey && 
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-dev-project-ref') &&
  !supabasePublicKey.includes('your-supabase-publishable') &&
  !supabasePublicKey.includes('your-supabase-anon-key')
);

// Fallback dummy values to prevent createClient from throwing if unconfigured during development
const fallbackUrl = 'https://campusloop-dev.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabasePublicKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'campusloop_supabase_auth_session'
    }
  }
);
