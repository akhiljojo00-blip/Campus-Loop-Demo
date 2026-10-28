import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  department: string;
  campus_location: string;
  avatar_url?: string | null;
  phone_number?: string | null;
  bio?: string | null;
  loopcoins_balance: number;
  created_at?: string;
  updated_at?: string;
}

// Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid URL & non-placeholder anon key are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-dev-project-ref') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

// Fallback dummy values to prevent createClient from throwing if unconfigured during development
const fallbackUrl = 'https://campusloop-dev.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'campusloop_supabase_auth_session'
    }
  }
);
