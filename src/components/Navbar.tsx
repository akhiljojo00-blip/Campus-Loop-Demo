import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
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
  ShieldCheck, 
  HelpCircle, 
  TrendingUp,
  User,
  Package
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
    isPresentationMode,
    setIsPresentationMode,
    setPresentationStep,
    setSearchQuery
  } = useCampus();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E7E3DC] transition-all">
      {/* Top micro-announcement banner for academic demo badge */}
      <div className="bg-[#153225] text-white text-[11px] sm:text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[#FAF8F5]/90 font-medium tracking-wide">
              BCA Management Project Prototype <span className="hidden sm:inline text-white/50">•</span> <span className="hidden sm:inline text-[#DDE7DF]">Zero-waste Campus Circular Economy Demo</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startPresentation}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#BA4E29] hover:bg-[#A34322] text-white text-[11px] font-semibold transition-colors shadow-xs"
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
            className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153225] rounded-lg p-1 -ml-1 text-left"
          >
            <BrandLogo size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'home'
                  ? 'text-[#153225] bg-[#E1EDE5]/70'
                  : 'text-stone-600 hover:text-[#153225] hover:bg-stone-100/60'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('marketplace')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'marketplace'
                  ? 'text-[#153225] bg-[#E1EDE5]/70'
                  : 'text-stone-600 hover:text-[#153225] hover:bg-stone-100/60'
              }`}
            >
              Marketplace
            </button>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'how-it-works'
                  ? 'text-[#153225] bg-[#E1EDE5]/70'
                  : 'text-stone-600 hover:text-[#153225] hover:bg-stone-100/60'
              }`}
            >
              How It Works
            </button>

            <button
              onClick={() => handleNavClick('business-model')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'business-model'
                  ? 'text-[#153225] bg-[#E1EDE5]/70'
                  : 'text-stone-600 hover:text-[#153225] hover:bg-stone-100/60'
              }`}
            >
              Business Model
            </button>

            <button
              onClick={() => handleNavClick('safety')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'safety'
                  ? 'text-[#153225] bg-[#E1EDE5]/70'
                  : 'text-stone-600 hover:text-[#153225] hover:bg-stone-100/60'
              }`}
            >
              Trust & Safety
            </button>
          </nav>

          {/* Action Area: Search shortcut, Saved Items, List an Item, Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => {
                setActiveTab('marketplace');
                const searchEl = document.getElementById('marketplace-search-input');
                if (searchEl) searchEl.focus();
              }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DDD2C4] bg-white/70 hover:bg-white text-stone-500 hover:text-[#153225] text-xs transition-colors"
              title="Search campus essentials"
            >
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <span>Search textbooks, tech...</span>
            </button>

            {/* Saved Items Button with counter badge */}
            <button
              onClick={() => setIsProfileDrawerOpen(true)}
              className="relative p-2 rounded-lg text-stone-700 hover:text-[#153225] hover:bg-stone-200/50 transition-colors focus:outline-none"
              title="View Saved Items"
              aria-label="View Saved Items"
            >
              <Bookmark className="w-5 h-5" />
              {savedItemIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#BA4E29] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#FAF8F5]">
                  {savedItemIds.length}
                </span>
              )}
            </button>

            {/* List an item button (Primary CTA) */}
            <button
              onClick={() => setIsListItemModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#153225] hover:bg-[#1E4333] active:bg-[#10271D] text-white text-xs sm:text-sm font-semibold shadow-warm transition-all transform active:scale-98"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>List an item</span>
            </button>

            {/* Demo / Profile menu dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#DDD2C4] bg-white hover:bg-[#F4EFEA] text-stone-700 transition-colors"
                title="Student Profile & Demo Controls"
                aria-label="Student Profile & Demo Controls"
              >
                <User className="w-4 h-4 text-[#153225]" />
              </button>

              {demoMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E7E3DC] shadow-warm-lg p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setDemoMenuOpen(false)}
                >
                  <div className="p-3 border-b border-stone-100 bg-[#FAF8F5] rounded-xl mb-1">
                    <p className="font-bold text-sm text-[#153225]">Student Demo Profile</p>
                    <p className="text-stone-500 text-[11px] mt-0.5">Campus Loop Member • BCA Dept</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Verified Campus
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsProfileDrawerOpen(true)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-stone-700 hover:bg-[#FAF8F5] hover:text-[#153225] transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Bookmark className="w-4 h-4 text-[#BA4E29]" />
                      Saved Items
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 text-[11px] font-semibold">
                      {savedItemIds.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsProfileDrawerOpen(true)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-stone-700 hover:bg-[#FAF8F5] hover:text-[#153225] transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Package className="w-4 h-4 text-emerald-700" />
                      My Demo Listings
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 text-[11px] font-semibold">
                      {userListingIds.length}
                    </span>
                  </button>

                  <button
                    onClick={startPresentation}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg text-[#BA4E29] hover:bg-orange-50 font-semibold transition-colors"
                  >
                    <Presentation className="w-4 h-4" />
                    Launch Presentation Tour
                  </button>

                  <div className="h-px bg-stone-100 my-1" />

                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg text-red-600 hover:bg-red-50 text-[11px] font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Seed Demo Data
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-700 hover:text-[#153225] hover:bg-stone-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E3DC] bg-[#FAF8F5] px-4 pt-3 pb-6 shadow-warm-lg animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'home' ? 'bg-[#E1EDE5] text-[#153225]' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNavClick('marketplace')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'marketplace' ? 'bg-[#E1EDE5] text-[#153225]' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Explore Marketplace</span>
            </button>

            <button
              onClick={() => handleNavClick('how-it-works')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'how-it-works' ? 'bg-[#E1EDE5] text-[#153225]' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>How CampusLoop Works</span>
            </button>

            <button
              onClick={() => handleNavClick('business-model')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'business-model' ? 'bg-[#E1EDE5] text-[#153225]' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#BA4E29]" />
              <span>Business Model (BCA Management)</span>
            </button>

            <button
              onClick={() => handleNavClick('safety')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold ${
                activeTab === 'safety' ? 'bg-[#E1EDE5] text-[#153225]' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Trust & Campus Safety</span>
            </button>

            <div className="h-px bg-stone-200 my-2" />

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsListItemModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#153225] text-white text-xs font-semibold shadow-warm"
              >
                <PlusCircle className="w-4 h-4 text-emerald-300" />
                <span>+ List an item</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  startPresentation();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#BA4E29] text-white text-xs font-semibold shadow-warm"
              >
                <Presentation className="w-4 h-4" />
                <span>Tour</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
