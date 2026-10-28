import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { X, Star, Sparkles, Send, CheckCircle2 } from 'lucide-react';

export const ReviewModal: React.FC = () => {
  const { 
    isReviewModalOpen, 
    setIsReviewModalOpen, 
    reviewingTarget, 
    addReview 
  } = useCampus();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  if (!isReviewModalOpen || !reviewingTarget) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview(
      reviewingTarget.sellerName,
      reviewingTarget.itemTitle,
      reviewingTarget.category,
      rating,
      comment.trim(),
      reviewingTarget.exchangeId
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsReviewModalOpen(false)}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#14231D] rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg overflow-hidden animate-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#153225] dark:bg-[#0D1C15] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
              ★
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Leave a Peer Review
              </h3>
              <p className="text-[11px] text-[#FAF8F5]/80">
                Rate your exchange with {reviewingTarget.sellerName}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div className="p-3 bg-[#FAF8F5] dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-emerald-900/40 text-xs">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Exchanged Item</span>
            <p className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm">
              {reviewingTarget.itemTitle}
            </p>
            <p className="text-stone-500 text-[11px] mt-0.5">
              Category: {reviewingTarget.category}
            </p>
          </div>

          {/* Star Selection */}
          <div className="text-center py-2">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-2">
              Select Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating !== null ? star <= hoverRating : star <= rating)
                        ? 'text-amber-400 fill-current'
                        : 'text-stone-300 dark:text-stone-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 mt-1 block">
              {rating === 5 && '🌟 Excellent experience!'}
              {rating === 4 && '👍 Great condition and prompt meetup'}
              {rating === 3 && '👌 Good average exchange'}
              {rating === 2 && '⚠️ Item condition had minor flaws'}
              {rating === 1 && '❌ Unsatisfactory exchange'}
            </span>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1">
              Your Review / Experience *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Was the item in the stated condition? Did the seller meet on time at the campus location?"
              rows={3}
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs bg-white dark:bg-stone-900 dark:text-white outline-none focus:border-[#153225]"
              required
            />
          </div>

          {/* Reward pill */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-medium border border-amber-200 dark:border-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Earn +15 LoopCoins for submitting this verified review!</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!comment.trim()}
              className="px-5 py-2 rounded-xl bg-[#153225] hover:bg-[#1E4333] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
