import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, UserProfile, UserPrivateDetails } from '../lib/supabase';

export type AuthModalMode = 'signin' | 'signup' | 'forgot';

export interface SignUpMetadata {
  fullName: string;
  department: string;
  campusLocation: string;
}

// Strict allowlist of editable public profile fields
export interface EditableProfileFields {
  full_name?: string;
  department?: string;
  campus_location?: string;
  avatar_url?: string | null;
  bio?: string | null;
}

export const ALLOWED_PROFILE_UPDATE_FIELDS: readonly (keyof EditableProfileFields)[] = [
  'full_name',
  'department',
  'campus_location',
  'avatar_url',
  'bio'
] as const;

// Disallowed server-controlled properties that must never be updated by clients
export const FORBIDDEN_PROFILE_KEYS = [
  'id',
  'loopcoins_balance',
  'email',
  'created_at',
  'updated_at',
  'is_admin',
  'role',
  'email_confirmed_at'
] as const;

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  privateDetails: UserPrivateDetails | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: AuthModalMode;
  setAuthModalMode: (mode: AuthModalMode) => void;
  openAuthModal: (mode?: AuthModalMode) => void;
  
  // Auth operations
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: EditableProfileFields) => Promise<{ success: boolean; error?: string }>;
  updatePrivateDetails: (details: { phone_number?: string | null }) => Promise<{ success: boolean; error?: string }>;
  fetchPrivateDetails: () => Promise<UserPrivateDetails | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback profile for offline demo mode (public display fields only)
const DEMO_OFFLINE_PROFILE: UserProfile = {
  id: 'demo-bca-student-001',
  full_name: 'Aditya Sharma',
  department: '1st Year BCA',
  campus_location: 'Central Library',
  avatar_url: null,
  bio: '1st Year BCA student passionate about web tech, books, and campus exchange.'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    return isSupabaseConfigured ? null : DEMO_OFFLINE_PROFILE;
  });
  const [privateDetails, setPrivateDetails] = useState<UserPrivateDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');

  // Fetch public user profile from Supabase public.profiles
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      setProfile(DEMO_OFFLINE_PROFILE);
      return;
    }

    try {
      // Explicitly select only public display columns
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, department, campus_location, avatar_url, bio, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Could not fetch profile from Supabase:', error.message);
        return;
      }

      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, []);

  // Fetch private user details (strictly owner-only via RLS)
  const fetchPrivateDetails = useCallback(async (): Promise<UserPrivateDetails | null> => {
    if (!isSupabaseConfigured || !user?.id) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_private_details')
        .select('id, phone_number, created_at, updated_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Could not fetch private details:', error.message);
        return null;
      }

      if (data) {
        setPrivateDetails(data as UserPrivateDetails);
        return data as UserPrivateDetails;
      }
      return null;
    } catch (err) {
      console.error('Error fetching private details:', err);
      return null;
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // Initialize session and auth listeners
  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Initial session error:', error.message);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id);
          }
        }
      } catch (err) {
        console.error('Failed to get Supabase session:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setPrivateDetails(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const openAuthModal = (mode: AuthModalMode = 'signin') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  // Sign In with email & password
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      // Offline demo fallback simulation
      setTimeout(() => {
        setUser({
          id: 'demo-bca-student-001',
          email: email || 'aditya.sharma@campus.edu',
          app_metadata: {},
          user_metadata: { full_name: 'Aditya Sharma' },
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as unknown as User);
        setProfile(DEMO_OFFLINE_PROFILE);
        setIsLoading(false);
        setIsAuthModalOpen(false);
      }, 500);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      setIsLoading(false);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof AuthError || err instanceof Error ? err.message : 'Sign in failed';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  // Sign Up with email, password, and public metadata
  const signUp = async (
    email: string, 
    password: string, 
    metadata: SignUpMetadata
  ): Promise<{ success: boolean; needsEmailConfirmation?: boolean; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      // Offline demo fallback simulation
      setTimeout(() => {
        const demoUser = {
          id: `demo-${Date.now()}`,
          email: email.trim(),
          app_metadata: {},
          user_metadata: {
            full_name: metadata.fullName,
            department: metadata.department,
            campus_location: metadata.campusLocation
          },
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as unknown as User;

        setUser(demoUser);
        setProfile({
          id: demoUser.id,
          full_name: metadata.fullName,
          department: metadata.department,
          campus_location: metadata.campusLocation,
          avatar_url: null
        });
        setIsLoading(false);
        setIsAuthModalOpen(false);
      }, 500);
      return { success: true, needsEmailConfirmation: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: metadata.fullName.trim(),
            department: metadata.department.trim(),
            campus_location: metadata.campusLocation.trim()
          }
        }
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      const needsEmailConfirmation = !data.session;
      if (data.user) {
        setUser(data.user);
        if (data.session) {
          setSession(data.session);
          await fetchProfile(data.user.id);
          setIsAuthModalOpen(false);
        }
      }

      setIsLoading(false);
      return { success: true, needsEmailConfirmation };
    } catch (err: unknown) {
      const msg = err instanceof AuthError || err instanceof Error ? err.message : 'Signup failed';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      setPrivateDetails(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset Request
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setTimeout(() => setIsLoading(false), 500);
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/#reset-password`
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof AuthError || err instanceof Error ? err.message : 'Password reset failed';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  // Resend email verification
  const resendVerification = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim()
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof AuthError || err instanceof Error ? err.message : 'Resend failed';
      return { success: false, error: msg };
    }
  };

  // Strictly restricted profile updates (enforces allowlist & rejects unauthorized fields)
  const updateProfile = async (
    updates: EditableProfileFields
  ): Promise<{ success: boolean; error?: string }> => {
    if (!profile && !user) {
      return { success: false, error: 'User is not logged in' };
    }

    const targetId = profile?.id || user?.id;
    if (!targetId) {
      return { success: false, error: 'No user ID found' };
    }

    // Security check: Reject forbidden property injection (e.g. loopcoins_balance, id, role)
    const rawKeys = Object.keys(updates);
    const forbiddenAttempt = rawKeys.find(k => (FORBIDDEN_PROFILE_KEYS as readonly string[]).includes(k));
    if (forbiddenAttempt) {
      const errMsg = `Security violation: updating server-controlled field '${forbiddenAttempt}' is strictly prohibited.`;
      console.warn(errMsg);
      return { success: false, error: errMsg };
    }

    // Build strictly allowlisted sanitized payload
    const sanitizedPayload: EditableProfileFields = {};
    if (updates.full_name !== undefined) sanitizedPayload.full_name = updates.full_name;
    if (updates.department !== undefined) sanitizedPayload.department = updates.department;
    if (updates.campus_location !== undefined) sanitizedPayload.campus_location = updates.campus_location;
    if (updates.avatar_url !== undefined) sanitizedPayload.avatar_url = updates.avatar_url;
    if (updates.bio !== undefined) sanitizedPayload.bio = updates.bio;

    if (Object.keys(sanitizedPayload).length === 0) {
      return { success: false, error: 'No valid editable profile fields provided.' };
    }

    if (!isSupabaseConfigured) {
      // Local demo mode updates with sanitized payload only
      setProfile(prev => prev ? { ...prev, ...sanitizedPayload } : null);
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(sanitizedPayload)
        .eq('id', targetId)
        .select('id, full_name, department, campus_location, avatar_url, bio, created_at, updated_at')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        setProfile(data as UserProfile);
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      return { success: false, error: msg };
    }
  };

  // Update private details (owner-only via RLS)
  const updatePrivateDetails = async (
    details: { phone_number?: string | null }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User must be authenticated to update private details' };
    }

    if (!isSupabaseConfigured) {
      setPrivateDetails(prev => ({
        id: user.id,
        phone_number: details.phone_number ?? null,
        created_at: prev?.created_at,
        updated_at: new Date().toISOString()
      }));
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('user_private_details')
        .upsert({
          id: user.id,
          phone_number: details.phone_number ?? null,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        setPrivateDetails(data as UserPrivateDetails);
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Private details update failed';
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        privateDetails,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        authError,
        setAuthError,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        signIn,
        signUp,
        signOut,
        resetPassword,
        resendVerification,
        updateProfile,
        updatePrivateDetails,
        fetchPrivateDetails,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
