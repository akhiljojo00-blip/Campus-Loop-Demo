import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Bookmark, 
  Package, 
  Trash2, 
  RotateCcw, 
  Eye, 
  User, 
  MapPin, 
  PlusCircle,
  ShieldCheck,
  LogOut,
  LogIn,
  GraduationCap,
  Sparkles,
  Mail,
  Zap,
  SlidersHorizontal
} from 'lucide-react';

export const ProfileDrawer: React.FC = () => {
  const { 
    isProfileDrawerOpen, 
    setIsProfileDrawerOpen, 
    savedItemIds, 
    userListingIds, 
    listings, 
    deleteListing, 
    setSelectedProduct, 
    setIsResetConfirmOpen,
    setIsListItemModalOpen,
    setIsPromoteModalOpen,
    setPromotingTarget,
    setIsPreferencesModalOpen
  } = useCampus();

  const { 
    user, 
    profile, 
    isConfigured, 
    signOut, 
    openAuthModal 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'saved' | 'my-listings'>('saved');

  if (!isProfileDrawerOpen) return null;

  const savedListings = listings.filter(item => savedItemIds.includes(item.id));
  const userListings = listings.filter(item => userListingIds.includes(item.id));

  const displayName = profile?.full_name || (user?.user_metadata?.full_name as string | undefined) || 'Aditya Sharma';
  const displayDepartment = profile?.department || '1st Year BCA';
  const displayLocation = profile?.campus_location || 'Central Library';
  const displayEmail = user?.email || 'aditya.sharma@campus.edu';

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsProfileDrawerOpen(false)}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#12221B] h-full shadow-warm-lg flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div>
          <div className="p-4 sm:p-5 bg-[#153225] text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
                  Campus Student Hub
                </span>
              </div>

              <button
                onClick={() => setIsProfileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 border border-white/20 flex items-center justify-center font-bold text-white text-lg shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-base text-white truncate">
                    {displayName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-200 mt-0.5 truncate">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{displayDepartment}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/70 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{displayLocation}</span>
                  </div>
                </div>
              </div>

              {/* Status pill & Auth action */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] text-emerald-300">
                  {isConfigured ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>campusloop-dev</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Demo Mode</span>
                    </>
                  )}
                </div>

                {user ? (
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center gap-1 text-[11px] text-red-300 hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsProfileDrawerOpen(false);
                      openAuthModal('signin');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-200 hover:text-white font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-[#E7E3DC] dark:border-emerald-900/60 bg-[#FAF8F5] dark:bg-[#0D1C15]">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'text-[#153225] dark:text-emerald-300 border-b-2 border-[#153225] dark:border-emerald-400 bg-white dark:bg-[#12221B]'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-[#BA4E29]" />
              <span>Saved Items ({savedListings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('my-listings')}
              className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'my-listings'
                  ? 'text-[#153225] dark:text-emerald-300 border-b-2 border-[#153225] dark:border-emerald-400 bg-white dark:bg-[#12221B]'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>My Listings ({userListings.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'saved' && (
            <>
              {savedListings.length > 0 ? (
                savedListings.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 bg-white dark:bg-[#162920] rounded-2xl border border-stone-200/80 dark:border-emerald-900/60 hover:border-stone-400 dark:hover:border-emerald-700 transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-14 h-14 rounded-xl object-cover bg-stone-100 dark:bg-stone-800 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">
                        {item.category}
                      </span>
                      <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="font-serif font-extrabold text-sm text-[#153225] dark:text-emerald-300 mt-0.5">
                        ₹{item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setPromotingTarget({
                            type: 'listing',
                            id: item.id,
                            title: item.title,
                            category: item.category
                          });
                          setIsPromoteModalOpen(true);
                          setIsProfileDrawerOpen(false);
                        }}
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                        title="Promote or boost listing"
                      >
                        <Zap className="w-4 h-4 text-amber-600" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setIsProfileDrawerOpen(false);
                        }}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#E1EDE5] dark:hover:bg-emerald-900 text-[#153225] dark:text-emerald-300 transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <p className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">No saved items yet</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
                    Click the bookmark icon on any marketplace item to keep track of it here.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'my-listings' && (
            <>
              {userListings.length > 0 ? (
                userListings.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 bg-white dark:bg-[#162920] rounded-2xl border border-stone-200/80 dark:border-emerald-900/60 transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-14 h-14 rounded-xl object-cover bg-stone-100 dark:bg-stone-800 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">
                        {item.category}
                      </span>
                      <h4 className="font-serif font-bold text-xs text-stone-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="font-serif font-extrabold text-sm text-[#153225] dark:text-emerald-300 mt-0.5">
                        ₹{item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setPromotingTarget({
                            type: 'listing',
                            id: item.id,
                            title: item.title,
                            category: item.category
                          });
                          setIsPromoteModalOpen(true);
                          setIsProfileDrawerOpen(false);
                        }}
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                        title="Promote or boost listing"
                      >
                        <Zap className="w-4 h-4 text-amber-600" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setIsProfileDrawerOpen(false);
                        }}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#E1EDE5] dark:hover:bg-emerald-900 text-[#153225] dark:text-emerald-300 transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete your listing "${item.title}"?`)) {
                            deleteListing(item.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">You haven't listed any items yet</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto mb-4">
                    Have an old textbook or electronics? Put it up on Campus Market in 30 seconds.
                  </p>
                  <button
                    onClick={() => {
                      setIsProfileDrawerOpen(false);
                      setIsListItemModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#153225] text-white text-xs font-bold hover:bg-[#1E4333] transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-300" />
                    <span>+ List an Item Now</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Area with Reset Control */}
        <div className="p-4 border-t border-[#E7E3DC] dark:border-emerald-900/60 bg-[#FAF8F5] dark:bg-[#0D1C15]">
          <button
            onClick={() => {
              setIsProfileDrawerOpen(false);
              setIsPreferencesModalOpen(true);
            }}
            className="w-full mb-3 py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-emerald-500 text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customize Match Alerts</span>
            </span>
            <span className="text-[10px] text-stone-400">Preferences →</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Auth:</span> {isConfigured ? 'campusloop-dev' : 'Offline Demo'}
            </div>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold p-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seed Demo Data</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
