import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  MapPin, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  KeyRound,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const CAMPUS_LOCATIONS = [
  'Central Library',
  'Hostel Block A',
  'Hostel Block B',
  'Hostel Block C',
  'Main Academic Block',
  'Student Activity Centre',
  'Cafeteria / Food Court',
  'Sports Complex',
  'Engineering Block'
];

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    signIn, 
    signUp, 
    resetPassword,
    resendVerification,
    authError, 
    setAuthError, 
    isConfigured, 
    isLoading 
  } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('1st Year BCA');
  const [campusLocation, setCampusLocation] = useState('Central Library');

  // Success notifications
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);
  const [resetSentEmail, setResetSentEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
    setVerificationPendingEmail(null);
    setResetSentEmail(null);
    setResendStatus(null);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both your college email and password.');
      return;
    }
    const res = await signIn(email, password);
    if (res.success) {
      handleClose();
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setAuthError('Please enter your college email address.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }

    const res = await signUp(email, password, {
      fullName: fullName.trim(),
      department: department.trim(),
      campusLocation: campusLocation.trim()
    });

    if (res.success) {
      if (res.needsEmailConfirmation) {
        setVerificationPendingEmail(email.trim());
      } else {
        handleClose();
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setAuthError('Please enter your college email.');
      return;
    }
    const res = await resetPassword(email);
    if (res.success) {
      setResetSentEmail(email.trim());
    }
  };

  const handleResendClick = async () => {
    if (!verificationPendingEmail) return;
    setResendStatus('sending');
    const res = await resendVerification(verificationPendingEmail);
    if (res.success) {
      setResendStatus('sent');
      setTimeout(() => setResendStatus(null), 4000);
    } else {
      setResendStatus('error');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#12221B] rounded-2xl shadow-warm-xl border border-[#E7E3DC] dark:border-emerald-900/60 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#153225] text-white p-5 sm:p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-200">
              Campus Student Access
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            {verificationPendingEmail 
              ? 'Verify Your Email'
              : resetSentEmail
              ? 'Check Your Inbox'
              : authModalMode === 'signin' 
              ? 'Sign in to CampusLoop' 
              : authModalMode === 'signup' 
              ? 'Create Student Account' 
              : 'Reset Your Password'
            }
          </h2>

          <p className="text-xs text-[#FAF8F5]/80 mt-1">
            {verificationPendingEmail
              ? 'Confirm your student identity to start trading on campus.'
              : resetSentEmail
              ? 'We sent instructions to recover your account.'
              : authModalMode === 'signin' 
              ? 'Buy, sell, exchange and lend essentials safely within campus.' 
              : authModalMode === 'signup' 
              ? 'Join fellow BCA and college peers with safe student-only profiles.' 
              : 'Enter your registered college email to receive a recovery link.'
            }
          </p>

          {/* Configuration status indicator */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/25 text-emerald-200 border border-white/10">
            {isConfigured ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>Connected to Supabase dev (`campusloop-dev`)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Local Demo Auth Mode (Add .env.local for live dev)</span>
              </>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {/* Error Alert */}
          {authError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{authError}</div>
            </div>
          )}

          {/* View 1: Verification Pending */}
          {verificationPendingEmail ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#153225] dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-[#153225] dark:text-white">
                  Verification Link Sent!
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  We sent a confirmation link to <strong className="text-[#153225] dark:text-white">{verificationPendingEmail}</strong>.
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Click the link in the email to activate your account, then sign in below.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationPendingEmail(null);
                    setAuthModalMode('signin');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#153225] hover:bg-[#1E4333] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Proceed to Sign In
                </button>

                <button
                  type="button"
                  onClick={handleResendClick}
                  disabled={resendStatus === 'sending'}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {resendStatus === 'sending' ? 'Resending...' : resendStatus === 'sent' ? 'Link resent!' : 'Didn\'t get an email? Resend'}
                </button>
              </div>
            </div>
          ) : resetSentEmail ? (
            /* View 2: Password Reset Sent */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-[#BA4E29] flex items-center justify-center border border-amber-200 dark:border-amber-900">
                <KeyRound className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-[#153225] dark:text-white">
                  Reset Link Dispatched
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  If an account exists for <strong className="text-[#153225] dark:text-white">{resetSentEmail}</strong>, password reset instructions are on their way.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetSentEmail(null);
                    setAuthModalMode('signin');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#153225] hover:bg-[#1E4333] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : authModalMode === 'signin' ? (
            /* View 3: Sign In Form */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  College Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu or name@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-stone-50 dark:bg-[#1A2E25] border border-stone-200 dark:border-emerald-900/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#153225] text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthModalMode('forgot');
                    }}
                    className="text-[11px] font-semibold text-[#BA4E29] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-stone-50 dark:bg-[#1A2E25] border border-stone-200 dark:border-emerald-900/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#153225] text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#153225] hover:bg-[#1E4333] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-stone-500 dark:text-stone-400">
                New to CampusLoop?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthModalMode('signup');
                  }}
                  className="font-bold text-[#153225] dark:text-emerald-300 hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </div>
            </form>
          ) : authModalMode === 'signup' ? (
            /* View 4: Sign Up Form */
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aditya Sharma"
                    className="w-full pl-10 pr-3.5 py-2 text-xs bg-stone-50 dark:bg-[#1A2E25] border border-stone-200 dark:border-emerald-900/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#153225] text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Department / Course
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. 1st Year BCA"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-[#1A2E25] border border-stone-200 dark:border-emerald-900/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#153225] text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Primary Campus Spot
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={campusLocation}
                      onChange={(e) => setCampusLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-[#1A2E25] border border-stone-200 dark:border-emerald-900/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#153225] text-stone-900 dark:text-stone-100"
                    >
                      {CAMPUS_LOCATIONS.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  College Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-10 pr-3.5 py-2 text-xs bg-stone-50 dark:bg-[#1A2E25] border border-stone-200 dark:border-emerald-900/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#153225] text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Password (min 6)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-[#1A2E25] border border-stone-200 dark:border-emerald-900/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#153225] text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-[#1A2E25] border border-stone-200 dark:border-emerald-900/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#153225] text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>New student accounts automatically receive <strong>150 LoopCoins</strong> welcome balance!</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#153225] hover:bg-[#1E4333] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating profile...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-1 text-center text-xs text-stone-500 dark:text-stone-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthModalMode('signin');
                  }}
                  className="font-bold text-[#153225] dark:text-emerald-300 hover:underline cursor-pointer"
                >
                  Sign in instead
                </button>
              </div>
            </form>
          ) : (
            /* View 5: Forgot Password Form */
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Enter Your College Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-stone-50 dark:bg-[#1A2E25] border border-stone-200 dark:border-emerald-900/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#153225] text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#153225] hover:bg-[#1E4333] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending recovery link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-stone-500 dark:text-stone-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthModalMode('signin');
                  }}
                  className="font-bold text-[#153225] dark:text-emerald-300 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
