import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  X, 
  MapPin, 
  Clock, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  User, 
  Tag, 
  DollarSign, 
  MessageSquare,
  AlertCircle,
  Flame,
  Check
} from 'lucide-react';

export const WantedDetailModal: React.FC = () => {
  const { 
    selectedWantedRequest, 
    setSelectedWantedRequest, 
    submitWantedOffer, 
    acceptWantedOffer, 
    markRequestFulfilled,
    listings 
  } = useCampus();

  const [proposedPrice, setProposedPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [selectedListingId, setSelectedListingId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedWantedRequest) return null;

  const req = selectedWantedRequest;

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(proposedPrice);
    if (!proposedPrice || isNaN(priceNum) || priceNum <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitWantedOffer(
        req.id,
        priceNum,
        offerMessage.trim() || `I have this item available in ${req.desiredCondition} condition. Can meet at ${req.campusLocation}!`,
        selectedListingId || undefined
      );
      setIsSubmitting(false);
      setProposedPrice('');
      setOfferMessage('');
      setSelectedListingId('');
      // Update local view
      setSelectedWantedRequest(null);
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={() => setSelectedWantedRequest(null)}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#14231D] rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#153225] dark:bg-[#0D1C15] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                Wanted Board Request
              </span>
              <h2 className="font-serif font-bold text-base sm:text-lg text-white">
                {req.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setSelectedWantedRequest(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* Main Info Box */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#0D1C15]/80 border border-stone-200 dark:border-emerald-900/40">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-[#E1EDE5] dark:bg-emerald-950 px-2.5 py-1 rounded-md">
                  {req.category}
                </span>
                <span className="text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-md">
                  Condition: {req.desiredCondition}
                </span>
              </div>

              <span className="text-xs font-bold text-[#BA4E29] bg-orange-50 dark:bg-orange-950/60 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-900/60">
                {req.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line mb-4">
              {req.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-200 dark:border-emerald-900/40 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Budget</span>
                <span className="font-serif font-bold text-sm text-[#153225] dark:text-emerald-300">
                  ₹{req.minBudget} – ₹{req.maxBudget}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Campus Zone</span>
                <span className="font-semibold text-stone-700 dark:text-stone-300 truncate block">
                  {req.campusLocation}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Urgency</span>
                <span className="font-semibold text-stone-700 dark:text-stone-300 block">
                  {req.urgency}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Buyer</span>
                <span className="font-semibold text-stone-700 dark:text-stone-300 block">
                  {req.buyerName}
                </span>
              </div>
            </div>
          </div>

          {/* Offers Received Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Offers Received ({req.offers.length})
              </h3>
              {req.isUserRequest && req.status !== 'Fulfilled' && (
                <button
                  onClick={() => markRequestFulfilled(req.id)}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  ✓ Mark Request as Fulfilled
                </button>
              )}
            </div>

            {req.offers.length > 0 ? (
              <div className="space-y-3">
                {req.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-emerald-900/60 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                          {offer.sellerName}
                        </span>
                        <span className="text-[10px] text-stone-400">{offer.dateStr}</span>
                        {offer.status === 'Accepted' && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Accepted Deal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        {offer.message}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-serif font-extrabold text-base text-[#153225] dark:text-emerald-300 block">
                        ₹{offer.proposedPrice}
                      </span>
                      {req.isUserRequest && offer.status !== 'Accepted' && (
                        <button
                          onClick={() => acceptWantedOffer(req.id, offer.id)}
                          className="mt-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Accept Offer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/30 text-center text-xs text-stone-500 dark:text-stone-400">
                No seller offers received yet. Be the first classmate to respond!
              </div>
            )}
          </div>

          {/* Send an Offer Form for Sellers */}
          {req.status !== 'Fulfilled' && (
            <div className="pt-4 border-t border-stone-200 dark:border-emerald-900/40">
              <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 mb-3">
                Propose an Item or Offer to {req.buyerName}
              </h3>

              <form onSubmit={handleSendOffer} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                      Your Proposed Price in ₹ *
                    </label>
                    <input
                      type="number"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      placeholder={`e.g. ${req.minBudget}`}
                      className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs bg-white dark:bg-stone-900 dark:text-white outline-none focus:border-[#BA4E29]"
                      min={1}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                      Link Existing Listing (Optional)
                    </label>
                    <select
                      value={selectedListingId}
                      onChange={(e) => setSelectedListingId(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs bg-white dark:bg-stone-900 dark:text-white outline-none"
                    >
                      <option value="">None (Custom Offer)</option>
                      {listings.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.title} (₹{item.price})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Message to Buyer
                  </label>
                  <textarea
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Mention item condition, edition, and when you can meet on campus..."
                    rows={2}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs bg-white dark:bg-stone-900 dark:text-white outline-none focus:border-[#BA4E29]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting || !proposedPrice}
                    className="px-5 py-2.5 rounded-xl bg-[#153225] hover:bg-[#1E4333] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Proposed Offer (+15 Coins)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
