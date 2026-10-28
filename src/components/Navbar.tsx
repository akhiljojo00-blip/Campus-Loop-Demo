import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { 
  Search, 
  PlusCircle, 
  Bookmark, 
  Menu, 
  X, 
  RotateCcw, 
  Presentation, 
  Layers, 
  HelpCircle, 
  TrendingUp,
  User,
  Package,
  Sun,
  Moon,
  Coins,
  MapPin,
  ClipboardList,
  LogIn,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    savedItemIds, 
    userListingIds,
    setIsListItemModalOpen, 
    setIsProfileDrawerOpen,
    setIsResetConfirmOpen,
    setIsWalletModalOpen,
    setIsPresentationMode,
    setPresentationStep,
    loopCoinsBalance,
    theme,
    toggleTheme
  } = useCampus();

  const {
    user,
    profile,
    isConfigured,
    openAuthModal,
    signOut
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const displayName = profile?.full_name || (user?.user_metadata?.full_name as string | undefined) || 'Aditya Sharma';
  const displayDepartment = profile?.department || '1st Year BCA';
  const displayEmail = user?.email || 'aditya.sharma@campus.edu';

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startPresentation = () => {
    setIsPresentationMode(true);
    setPresentationStep(0);
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 dark:bg-[#0D1C15]/90 backdrop-blur-md border-b border-[#E7E3DC] dark:border-emerald-900/60 transition-colors">
      {/* Top announcement bar */}
      <div className="bg-[#153225] dark:bg-[#08120E] text-white text-[11px] sm:text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[#FAF8F5]/90 font-medium tracking-wide">
              CampusLoop 3.0 <span className="hidden sm:inline text-white/50">•</span> <span className="hidden sm:inline text-[#DDE7DF]">Phase A: Supabase Dev Auth (`campusloop-dev`)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startPresentation}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#BA4E29] hover:bg-[#A34322] text-white text-[11px] font-semibold transition-colors shadow-xs cursor-pointer"
              title="Launch BCA Guided Presentation Walkthrough"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Presentation Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153225] rounded-lg p-1 -ml-1 text-left cursor-pointer"
          >
            <BrandLogo size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'text-[#153225] dark:text-emerald-300 bg-[#E1EDE5]/70 dark:bg-emerald-950/80'
                  : 'text-stone-600 dark:text-stone-300 hover:text-[#153225] dark:hover:text-white hover:bg-stone-100/60 dark:hover:bg-stone-800'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('marketplace')}
              className={`px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'text-[#153225] dark:text-emerald-300 bg-[#E1EDE5]/70 dark:bg-emerald-950/80'
                  : 'text-stone-600 dark:text-stone-300 hover:text-[#153225] dark:hover:text-white hover:bg-stone-100/60 dark:hover:bg-stone-800'
              }`}
            >
              Marketplace
            </button>

            {/* Feature 1: Wanted Board */}
            <button
              onClick={() => handleNavClick('wanted')}
              className={`px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'wanted'
                  ? 'text-[#BA4E29] dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50'
                  : 'text-stone-600 dark:text-stone-300 hover:text-[#BA4E29] hover:bg-stone-100/60 dark:hover:bg-stone-800'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-[#BA4E29]" />
              <span>Wanted Board</span>
            </button>

            {/* Feature 5: Campus Map */}
            <button
              onClick={() => handleNavClick('map')}
              className={`px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'map'
                  ? 'text-[#153225] dark:text-emerald-300 bg-[#E1EDE5]/70 dark:bg-emerald-950/80'
                  : 'text-stone-600 dark:text-stone-300 hover:text-[#153225] dark:hover:text-white hover:bg-stone-100/60 dark:hover:bg-stone-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Map</span>
            </button>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'how-it-works'
                  ? 'text-[#153225] dark:text-emerald-300 bg-[#E1EDE5]/70 dark:bg-emerald-950/80'
                  : 'text-stone-600 dark:text-stone-300 hover:text-[#153225] dark:hover:text-white hover:bg-stone-100/60 dark:hover:bg-stone-800'
              }`}
            >
              How it works
            </button>

            <button
              onClick={() => handleNavClick('business-model')}
              className={`px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'business-model'
                  ? 'text-[#153225] dark:text-emerald-300 bg-[#E1EDE5]/70 dark:bg-emerald-950/80'
                  : 'text-stone-600 dark:text-stone-300 hover:text-[#153225] dark:hover:text-white hover:bg-stone-100/60 dark:hover:bg-stone-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#BA4E29]" />
              <span>Business model</span>
            </button>

            <button
              onClick={() => handleNavClick('safety')}
              className={`px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'safety'
                  ? 'text-[#153225] dark:text-emerald-300 bg-[#E1EDE5]/70 dark:bg-emerald-950/80'
                  : 'text-stone-600 dark:text-stone-300 hover:text-[#153225] dark:hover:text-white hover:bg-stone-100/60 dark:hover:bg-stone-800'
              }`}
            >
              Trust & Safety
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-stone-700 dark:text-stone-200 hover:text-[#153225] dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors focus:outline-none cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Ivory Theme' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>

            {/* LoopCoins Wallet Quick Button */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 hover:bg-amber-100/80 transition-all font-semibold text-xs shadow-2xs cursor-pointer"
              title="CampusLoop Coins Balance"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>{loopCoinsBalance}</span>
            </button>

            {/* Search shortcut for desktop */}
            <button
              onClick={() => {
                setActiveTab('marketplace');
                setTimeout(() => {
                  const input = document.getElementById('marketplace-search-input');
                  if (input) input.focus();
                }, 100);
              }}
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl text-stone-700 dark:text-stone-200 hover:text-[#153225] dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors focus:outline-none cursor-pointer"
              title="Search marketplace"
              aria-label="Search items"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Saved Items */}
            <button
              onClick={() => setIsProfileDrawerOpen(true)}
              className="relative p-2 rounded-xl text-stone-700 dark:text-stone-200 hover:text-[#153225] dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors focus:outline-none cursor-pointer"
              title="View Saved Items"
              aria-label="View Saved Items"
            >
              <Bookmark className="w-4 h-4" />
              {savedItemIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#BA4E29] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#FAF8F5] dark:ring-[#0D1C15]">
                  {savedItemIds.length}
                </span>
              )}
            </button>

            {/* Primary CTA */}
            <button
              onClick={() => setIsListItemModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#153225] dark:bg-emerald-700 hover:bg-[#1E4333] active:bg-[#10271D] text-white text-xs sm:text-sm font-semibold shadow-warm transition-all transform active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>List item</span>
            </button>

            {/* Profile / Auth Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#DDD2C4] dark:border-emerald-900/60 bg-white dark:bg-stone-900 hover:bg-[#F4EFEA] text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                title="Student Profile & Authentication"
                aria-label="Student Profile & Authentication"
              >
                <User className="w-4 h-4 text-[#153225] dark:text-emerald-300" />
              </button>

              {demoMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#14231D] border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setDemoMenuOpen(false)}
                >
                  <div className="p-3 border-b border-stone-100 dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-900/80 rounded-xl mb-1">
                    <p className="font-bold text-sm text-[#153225] dark:text-emerald-300 truncate">
                      {displayName}
                    </p>
                    <p className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5 truncate">
                      {displayDepartment} • {displayEmail}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 
                        {isConfigured ? 'campusloop-dev' : 'Verified Campus'}
                      </span>
                      <span className="font-bold text-amber-700 dark:text-amber-300 text-xs">
                        🪙 {loopCoinsBalance}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <span>🪙</span> LoopCoins Wallet
                    </span>
                    <span className="text-[11px] font-bold text-amber-700">
                      {loopCoinsBalance} Coins
                    </span>
                  </button>

                  <button
                    onClick={() => setIsProfileDrawerOpen(true)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Bookmark className="w-4 h-4 text-[#BA4E29]" />
                      Saved Items
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[11px] font-semibold">
                      {savedItemIds.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsProfileDrawerOpen(true)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Package className="w-4 h-4 text-emerald-700" />
                      My Listings
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[11px] font-semibold">
                      {userListingIds.length}
                    </span>
                  </button>

                  <button
                    onClick={startPresentation}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-[#BA4E29] hover:bg-orange-50 dark:hover:bg-orange-950/40 font-semibold transition-colors"
                  >
                    <Presentation className="w-4 h-4" />
                    Launch Presentation Tour
                  </button>

                  <div className="h-px bg-stone-100 dark:bg-stone-800 my-1" />

                  {user ? (
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-[11px] font-medium transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => openAuthModal('signin')}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-bold transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In / Register
                    </button>
                  )}

                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 text-[11px] font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Seed Demo Data
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-700 dark:text-stone-200 hover:text-[#153225] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E3DC] dark:border-emerald-900/60 bg-[#FAF8F5] dark:bg-[#0D1C15] px-4 pt-3 pb-6 shadow-warm-lg animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'home' ? 'bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNavClick('marketplace')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'marketplace' ? 'bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Explore Marketplace</span>
            </button>

            <button
              onClick={() => handleNavClick('wanted')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'wanted' ? 'bg-[#E1EDE5] dark:bg-emerald-950 text-[#BA4E29]' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-[#BA4E29]" />
              <span>Wanted Board (Buyer Requests)</span>
            </button>

            <button
              onClick={() => handleNavClick('map')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'map' ? 'bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Interactive Campus Map</span>
            </button>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'how-it-works' ? 'bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>How CampusLoop Works</span>
            </button>

            <button
              onClick={() => handleNavClick('business-model')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'business-model' ? 'bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#BA4E29]" />
              <span>Business Model (BCA Management)</span>
            </button>

            <div className="h-px bg-stone-200 dark:bg-stone-800 my-2" />

            {/* Mobile Auth button */}
            {user ? (
              <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-xl mb-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#153225] dark:text-emerald-300 truncate">{displayName}</p>
                  <p className="text-[11px] text-stone-500 truncate">{displayEmail}</p>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('signin');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-800 text-white text-xs font-semibold mb-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsListItemModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#153225] dark:bg-emerald-700 text-white text-xs font-semibold shadow-warm"
              >
                <PlusCircle className="w-4 h-4 text-emerald-300" />
                <span>+ List item</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsWalletModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-warm"
              >
                <span>🪙 {loopCoinsBalance}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
