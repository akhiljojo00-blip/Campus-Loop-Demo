import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  X, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  User, 
  Flag, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export const SellerProfileModal: React.FC = () => {
  const { 
    selectedSellerProfile, 
    setSelectedSellerProfile, 
    getSellerReviews, 
    reportReview 
  } = useCampus();

  if (!selectedSellerProfile) return null;

  const profile = selectedSellerProfile;
  const sellerReviews = getSellerReviews(profile.name);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={() => setSelectedSellerProfile(null)}
    >
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-[#14231D] rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg overflow-hidden my-auto animate-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#153225] dark:bg-[#0D1C15] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 font-bold">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-white">
                Seller Profile & Peer Ratings
              </h2>
              <p className="text-[11px] text-[#FAF8F5]/80">
                Verified campus reputation and review history
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedSellerProfile(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* Profile Overview Card */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#0D1C15]/80 border border-stone-200 dark:border-emerald-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#153225] dark:bg-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {profile.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    {profile.name}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {profile.department} • {profile.campusLocation}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Member since {profile.memberSince} • {profile.completedExchanges} exchanges completed
                </p>
              </div>
            </div>

            {/* Big Score Box */}
            <div className="text-center sm:text-right bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800 shrink-0 w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-end gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-serif font-extrabold text-2xl text-stone-900 dark:text-stone-100">
                  {profile.averageRating}
                </span>
                <span className="text-xs text-stone-400">/ 5.0</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Based on {sellerReviews.length} peer reviews
              </p>
            </div>
          </div>

          {/* Rating Distribution Breakdown */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-emerald-900/40">
            <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-3">
              Rating Distribution
            </h4>
            <div className="space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = profile.ratingBreakdown[stars as keyof typeof profile.ratingBreakdown] || 0;
                const pct = profile.totalReviews > 0 ? (count / profile.totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="w-10 text-stone-500 dark:text-stone-400 font-medium">
                      {stars} ★
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-[11px] text-stone-400">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Product & Exchange Reviews ({sellerReviews.length})
              </h4>
              <span className="text-[10px] text-stone-400">
                Verified Exchange Only
              </span>
            </div>

            {sellerReviews.length > 0 ? (
              <div className="space-y-3">
                {sellerReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-emerald-900/40 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                            {rev.reviewerName}
                          </span>
                          <span className="text-[10px] text-stone-400">• {rev.date}</span>
                        </div>
                        <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-medium">
                          Item: {rev.itemTitle} ({rev.itemCategory})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-300 dark:text-stone-700'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      "{rev.comment}"
                    </p>

                    <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                      <button
                        onClick={() => reportReview(rev.id)}
                        className="text-[10px] text-stone-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Report review</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/30 text-center text-xs text-stone-500 dark:text-stone-400">
                No reviews yet for this student seller.
              </div>
            )}
          </div>

          {/* Academic Prototype Notice */}
          <div className="p-3 rounded-xl bg-[#F5F2EB] dark:bg-stone-800/60 text-[11px] text-stone-600 dark:text-stone-400 flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
            <span>
              Sample Data Notice: Ratings and reviews are simulated demonstrations for coursework presentation. No real buyer reviews or transactions are fabricated.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
