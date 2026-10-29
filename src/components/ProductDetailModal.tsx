import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  X, 
  Bookmark, 
  MapPin, 
  Clock, 
  User, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  Flag, 
  Trash2,
  Share2,
  Tag,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Star,
  Flame,
  Compass,
  Zap
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    toggleSaveItem, 
    isItemSaved, 
    setContactingProduct, 
    setReportingProduct,
    deleteListing,
    getSellerProfile,
    setSelectedSellerProfile,
    setActiveTab,
    showToast,
    setIsPromoteModalOpen,
    setPromotingTarget
  } = useCampus();

  const [imgError, setImgError] = useState(false);

  if (!selectedProduct) return null;

  const isSaved = isItemSaved(selectedProduct.id);
  const sellerProfile = getSellerProfile(selectedProduct.sellerName);
  const effectivePrice = selectedProduct.agreedPrice || selectedProduct.price;
  const savings = selectedProduct.originalPrice ? selectedProduct.originalPrice - effectivePrice : 0;
  const savingsPct = selectedProduct.originalPrice 
    ? Math.round((savings / selectedProduct.originalPrice) * 100) 
    : 0;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link Copied', `Campus Market link for "${selectedProduct.title}" copied to clipboard.`, 'info');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={() => setSelectedProduct(null)}
    >
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#14231D] rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg overflow-hidden my-auto animate-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-stone-900/90 hover:bg-white text-stone-600 dark:text-stone-300 hover:text-stone-900 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Product Photo & Badges */}
          <div className="md:col-span-5 bg-[#F4EFEA] dark:bg-stone-900 relative flex flex-col justify-between p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#E7E3DC] dark:border-emerald-900/60">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-200 dark:bg-stone-800 shadow-xs">
              {!imgError ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-stone-100 dark:bg-stone-800 text-center">
                  <BookOpen className="w-12 h-12 text-stone-400 mb-2" />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">{selectedProduct.category}</span>
                </div>
              )}

              {/* Status Badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
                {selectedProduct.isBoosted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    <Flame className="w-3 h-3" /> Boosted
                  </span>
                )}
                {selectedProduct.isFeatured && !selectedProduct.isBoosted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#153225] text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Featured
                  </span>
                )}
                {selectedProduct.isUserListing ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#BA4E29] text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    Your Listing
                  </span>
                ) : selectedProduct.isDemoListing ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-medium tracking-wide border border-stone-300/70 dark:border-stone-700">
                    Demo Sample
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    <ShieldCheck className="w-3 h-3" /> Live Campus
                  </span>
                )}
              </div>
            </div>

            {/* Price Breakdown Banner */}
            <div className="mt-4 p-3.5 bg-white dark:bg-stone-900/90 rounded-2xl border border-stone-200/80 dark:border-emerald-900/40">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                Campus Price
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-serif font-extrabold text-2xl text-[#153225] dark:text-emerald-300">
                  ₹{effectivePrice}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ₹{selectedProduct.originalPrice}
                  </span>
                )}
              </div>
              {selectedProduct.agreedPrice && (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                  ✓ Special Agreed Bargain Price
                </span>
              )}
              {savings > 0 && (
                <div className="mt-1.5 text-xs text-emerald-800 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Student saves ₹{savings} ({savingsPct}% off new)</span>
                </div>
              )}
            </div>

            {/* Action Bar (Save & Share) */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => toggleSaveItem(selectedProduct.id)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-[#FAECE6] dark:bg-orange-950/60 text-[#BA4E29] border-[#BA4E29]'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 border-stone-200 dark:border-emerald-900/60'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved in list' : 'Save for later'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                title="Share listing link"
                aria-label="Share listing link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Details, Seller & Action */}
          <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Category & Condition header */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-[#E1EDE5] dark:bg-emerald-950 px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                  {selectedProduct.category}
                </span>
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-md">
                  Condition: {selectedProduct.condition}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100 leading-snug mb-3">
                {selectedProduct.title}
              </h2>

              {/* Seller & Reputation Card (Feature 3) */}
              <div className="p-3.5 bg-[#FAF8F5] dark:bg-[#0D1C15]/80 rounded-2xl border border-stone-200/80 dark:border-emerald-900/40 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedSellerProfile(sellerProfile)}
                    className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#153225] dark:bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                      {selectedProduct.sellerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 dark:text-stone-100 underline decoration-stone-300">
                          {selectedProduct.sellerName}
                        </span>
                        <span className="text-amber-500 font-bold flex items-center text-xs">
                          ★ {sellerProfile.averageRating}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {selectedProduct.sellerDepartment || 'Campus Student'} • {sellerProfile.totalReviews} reviews
                      </p>
                    </div>
                  </button>

                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {selectedProduct.dateListed}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#BA4E29] shrink-0" />
                    <span><strong>Pickup:</strong> {selectedProduct.campusLocation}</span>
                  </span>

                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setActiveTab('map');
                    }}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                  >
                    View on Map →
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1.5">
                  Item Description
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {selectedProduct.description}
                </p>
                {selectedProduct.conditionNotes && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 bg-stone-50 dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800">
                    <strong className="text-stone-700 dark:text-stone-200">Seller condition notes:</strong> {selectedProduct.conditionNotes}
                  </p>
                )}
              </div>

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selectedProduct.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div>
              {/* Owner Promote CTA */}
              {selectedProduct.isUserListing && (
                <button
                  onClick={() => {
                    setPromotingTarget({
                      type: 'listing',
                      id: selectedProduct.id,
                      title: selectedProduct.title,
                      category: selectedProduct.category
                    });
                    setIsPromoteModalOpen(true);
                    setSelectedProduct(null);
                  }}
                  className="w-full py-2.5 px-4 mb-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-warm transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>⚡ Boost or Feature This Listing (₹3 – ₹19)</span>
                </button>
              )}

              {/* Dual Action Buttons: Make Offer (Bargain) vs Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                <button
                  onClick={() => {
                    setContactingProduct(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="py-3 px-4 rounded-xl bg-[#BA4E29] hover:bg-[#A34322] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-warm transition-all cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Make an Offer / Bargain</span>
                </button>

                <button
                  onClick={() => {
                    setContactingProduct(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="py-3 px-4 rounded-xl bg-[#153225] dark:bg-emerald-700 hover:bg-[#1E4333] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-warm transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-300" />
                  <span>Campus Chat Meetup</span>
                </button>
              </div>

              {/* Secondary Options */}
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  onClick={() => {
                    setReportingProduct(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="text-stone-500 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report this listing</span>
                </button>

                {selectedProduct.isUserListing && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove your listing "${selectedProduct.title}"?`)) {
                        deleteListing(selectedProduct.id);
                        setSelectedProduct(null);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete my listing</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
