import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  X, 
  Bookmark, 
  Package, 
  Trash2, 
  RotateCcw, 
  Eye, 
  User, 
  MapPin, 
  ExternalLink,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';

export const ProfileDrawer: React.FC = () => {
  const { 
    isProfileDrawerOpen, 
    setIsProfileDrawerOpen, 
    savedItemIds, 
    userListingIds, 
    listings, 
    deleteListing, 
    toggleSaveItem, 
    setSelectedProduct, 
    setIsResetConfirmOpen,
    setIsListItemModalOpen
  } = useCampus();

  const [activeTab, setActiveTab] = useState<'saved' | 'my-listings'>('saved');

  if (!isProfileDrawerOpen) return null;

  const savedListings = listings.filter(item => savedItemIds.includes(item.id));
  const userListings = listings.filter(item => userListingIds.includes(item.id));

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsProfileDrawerOpen(false)}
    >
      <div 
        className="relative w-full max-w-md bg-white h-full shadow-warm-lg flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div>
          <div className="p-4 sm:p-5 bg-[#153225] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-emerald-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-white">
                  Student Campus Hub
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <p className="text-[11px] text-[#FAF8F5]/80">Demo Browser Session</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsProfileDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-[#E7E3DC] bg-[#FAF8F5]">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'text-[#153225] border-b-2 border-[#153225] bg-white'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-[#BA4E29]" />
              <span>Saved Items ({savedListings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('my-listings')}
              className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'my-listings'
                  ? 'text-[#153225] border-b-2 border-[#153225] bg-white'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-emerald-700" />
              <span>My Demo Listings ({userListings.length})</span>
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
                    className="p-3 bg-white rounded-2xl border border-stone-200/80 hover:border-stone-400 transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                        {item.category}
                      </span>
                      <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                        {item.title}
                      </h4>
                      <p className="font-serif font-extrabold text-sm text-[#153225] mt-0.5">
                        ₹{item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setIsProfileDrawerOpen(false);
                        }}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-[#E1EDE5] text-[#153225] transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleSaveItem(item.id)}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <p className="font-serif font-bold text-sm text-stone-800">No saved items yet</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Click the bookmark icon on any textbook or gadget to save it here for later.
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
                    className="p-3 bg-white rounded-2xl border border-stone-200/80 hover:border-stone-400 transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-[#BA4E29] tracking-wider">
                        Demo Listing
                      </span>
                      <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                        {item.title}
                      </h4>
                      <p className="font-serif font-extrabold text-sm text-[#153225] mt-0.5">
                        ₹{item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setIsProfileDrawerOpen(false);
                        }}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-[#E1EDE5] text-[#153225] transition-colors cursor-pointer"
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
                        className="p-2 rounded-xl bg-stone-100 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E1EDE5] text-[#153225] flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="font-serif font-bold text-sm text-stone-800">You haven't listed any items yet</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto mb-4">
                    Have an old BCA textbook or electronics? Put it up on CampusLoop in 30 seconds.
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
        <div className="p-4 border-t border-[#E7E3DC] bg-[#FAF8F5]">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-stone-500">
              <span className="font-semibold text-stone-700">Storage:</span> Local Browser Cache
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
