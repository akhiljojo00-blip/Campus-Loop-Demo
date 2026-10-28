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
  AlertCircle,
  CheckCircle2,
  BookOpen
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
    showToast
  } = useCampus();

  const [imgError, setImgError] = useState(false);

  if (!selectedProduct) return null;

  const isSaved = isItemSaved(selectedProduct.id);
  const savings = selectedProduct.originalPrice ? selectedProduct.originalPrice - selectedProduct.price : 0;
  const savingsPct = selectedProduct.originalPrice 
    ? Math.round((savings / selectedProduct.originalPrice) * 100) 
    : 0;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link Copied', `CampusLoop link for "${selectedProduct.title}" copied to clipboard.`, 'info');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={() => setSelectedProduct(null)}
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#E7E3DC] shadow-warm-lg overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-stone-900 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Product Photo & Badges (Col 5) */}
          <div className="md:col-span-5 bg-[#F4EFEA] relative flex flex-col justify-between p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#E7E3DC]">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-200 shadow-xs">
              {!imgError ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-stone-100 text-center">
                  <BookOpen className="w-12 h-12 text-stone-400 mb-2" />
                  <span className="text-xs font-semibold text-stone-600">{selectedProduct.category}</span>
                </div>
              )}

              {/* Status Badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
                {selectedProduct.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#153225] text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Featured
                  </span>
                )}
                {selectedProduct.isUserListing && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#BA4E29] text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    Demo listing
                  </span>
                )}
              </div>
            </div>

            {/* Price Breakdown Banner */}
            <div className="mt-4 p-3.5 bg-white rounded-2xl border border-stone-200/80">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                Campus Price
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-serif font-extrabold text-2xl text-[#153225]">
                  ₹{selectedProduct.price}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    ₹{selectedProduct.originalPrice}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <div className="mt-1.5 text-xs text-emerald-800 font-semibold flex items-center gap-1">
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
                    ? 'bg-[#FAECE6] text-[#BA4E29] border-[#BA4E29]'
                    : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved in list' : 'Save for later'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
                title="Share listing link"
                aria-label="Share listing link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Details, Description, Seller & Actions (Col 7) */}
          <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Category & Condition header */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-800 bg-[#E1EDE5] px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                  {selectedProduct.category}
                </span>
                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md">
                  Condition: {selectedProduct.condition}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 leading-snug mb-3">
                {selectedProduct.title}
              </h2>

              {/* Seller & Location Info Box */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-stone-200/80 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#153225] text-white flex items-center justify-center font-bold text-xs">
                      {selectedProduct.sellerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">{selectedProduct.sellerName}</p>
                      <p className="text-[11px] text-stone-500">{selectedProduct.sellerDepartment || 'Campus Student'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {selectedProduct.dateListed}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center gap-1.5 text-xs text-stone-600">
                  <MapPin className="w-3.5 h-3.5 text-[#BA4E29] shrink-0" />
                  <span><strong>Pickup spot:</strong> {selectedProduct.campusLocation}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                  Item Description
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {selectedProduct.description}
                </p>
                {selectedProduct.conditionNotes && (
                  <p className="text-xs text-stone-500 mt-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    <strong className="text-stone-700">Seller condition notes:</strong> {selectedProduct.conditionNotes}
                  </p>
                )}
              </div>

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {selectedProduct.tags.map((tag, i) => (
                    <span key={i} className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions Area */}
            <div>
              {/* Trust Reminder Pill */}
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-900 rounded-xl text-[11px] font-medium border border-emerald-200 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Inspect in person before paying. No advance UPI transfers.</span>
              </div>

              {/* Main Contact CTA Button */}
              <button
                onClick={() => {
                  setContactingProduct(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#153225] hover:bg-[#1E4333] active:bg-[#10271D] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-warm transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>Contact {selectedProduct.sellerName.split(' ')[0]} (Demo Chat)</span>
              </button>

              {/* Secondary Options: Report & Delete */}
              <div className="mt-3 flex items-center justify-between text-xs pt-2">
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
