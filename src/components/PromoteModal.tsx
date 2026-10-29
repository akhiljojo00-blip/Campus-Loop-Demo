import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { PromoType } from '../types';
import { Zap, Star, ShieldCheck, Check, Sparkles, X, Flame, QrCode, CreditCard, ArrowRight } from 'lucide-react';

interface PromoPlan {
  type: PromoType;
  title: string;
  duration: string;
  priceInr: number;
  badgeText: string;
  badgeIcon: React.ReactNode;
  description: string;
  popular?: boolean;
}

const LISTING_PLANS: PromoPlan[] = [
  {
    type: 'boost_24h',
    title: '24-Hour Item Boost',
    duration: '24 Hours',
    priceInr: 3,
    badgeText: '⚡ Boosted',
    badgeIcon: <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />,
    description: 'Pushes your item directly to the top of the marketplace feed with an eye-catching orange badge.'
  },
  {
    type: 'featured_7d',
    title: '7-Day Featured Listing',
    duration: '7 Days',
    priceInr: 9,
    badgeText: '⭐ Featured',
    badgeIcon: <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />,
    description: 'Pinned spotlight placement on the homepage Featured shelf and top of search results.',
    popular: true
  },
  {
    type: 'featured_30d',
    title: '30-Day Semester Spotlight',
    duration: '30 Days',
    priceInr: 19,
    badgeText: '🏆 Semester Top',
    badgeIcon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
    description: 'Maximum visibility for whole semester until examination season concludes.'
  }
];

const WANTED_PLANS: PromoPlan[] = [
  {
    type: 'boost_24h',
    title: '24-Hour Urgent Boost',
    duration: '24 Hours',
    priceInr: 3,
    badgeText: '⚡ Urgent Need',
    badgeIcon: <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />,
    description: 'Highlights your Wanted request in bold orange so seniors browse it first.'
  },
  {
    type: 'featured_7d',
    title: '7-Day Pinned Request',
    duration: '7 Days',
    priceInr: 9,
    badgeText: '⭐ Pinned',
    badgeIcon: <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />,
    description: 'Pinned to the top of the Wanted Board for 7 days until fulfilled.',
    popular: true
  }
];

export const PromoteModal: React.FC = () => {
  const {
    isPromoteModalOpen,
    setIsPromoteModalOpen,
    promotingTarget,
    requestPromotion,
    showToast
  } = useCampus();

  const [selectedPlanType, setSelectedPlanType] = useState<PromoType>('boost_24h');
  const [paymentMode, setPaymentMode] = useState<'instant' | 'upi'>('instant');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isPromoteModalOpen || !promotingTarget) return null;

  const isListing = promotingTarget.type === 'listing';
  const plans = isListing ? LISTING_PLANS : WANTED_PLANS;
  const selectedPlan = plans.find(p => p.type === selectedPlanType) || plans[0];

  const handlePromote = async () => {
    setIsProcessing(true);
    try {
      const paymentRef = `UPI_REF_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
      const result = await requestPromotion(
        promotingTarget.type,
        promotingTarget.id,
        selectedPlan.type,
        paymentRef
      );

      if (result) {
        showToast(
          'Promotion Active!',
          `"${promotingTarget.title}" is now ${selectedPlan.title} (₹${selectedPlan.priceInr}).`,
          'success'
        );
        setIsPromoteModalOpen(false);
      }
    } catch (err: any) {
      showToast('Promotion Error', err.message || 'Failed to activate promotion', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#14231D] text-stone-900 dark:text-stone-100 rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg max-w-xl w-full overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#153225] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#BA4E29] flex items-center justify-center text-white shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                Official Campus Market Catalogue
              </span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-white">
                Promote Your {isListing ? 'Listing' : 'Wanted Request'}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsPromoteModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Target preview pill */}
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Target {isListing ? 'Item' : 'Request'}
              </span>
              <p className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 truncate max-w-sm">
                {promotingTarget.title}
              </p>
            </div>
            {promotingTarget.category && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {promotingTarget.category}
              </span>
            )}
          </div>

          {/* Promotion Plans Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-3">
              Select Promotion Plan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.map(p => {
                const isSelected = selectedPlanType === p.type;
                return (
                  <div
                    key={p.type}
                    onClick={() => setSelectedPlanType(p.type)}
                    className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#153225] text-white border-[#153225] shadow-warm'
                        : 'bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-800 hover:border-emerald-500'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#BA4E29] text-white text-[9px] font-extrabold uppercase tracking-wide shadow-xs">
                        Popular
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {p.badgeIcon}
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-300' : 'text-stone-500'}`}>
                          {p.duration}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm mb-1 leading-snug">
                        {p.title}
                      </h4>
                      <p className={`text-[11px] leading-relaxed mb-3 ${isSelected ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'}`}>
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/40 flex items-center justify-between">
                      <span className={`font-serif font-black text-base ${isSelected ? 'text-white' : 'text-[#153225] dark:text-emerald-300'}`}>
                        ₹{p.priceInr}
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-semibold">Select</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Preview of Boosted Card */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-2">
              Live Badge Preview
            </label>
            <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-stone-800 flex items-center justify-center border border-stone-200 dark:border-stone-700">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                    {selectedPlan.badgeText}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Expires in {selectedPlan.duration}
                  </span>
                </div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                  {promotingTarget.title}
                </p>
              </div>
            </div>
          </div>

          {/* Safe Payment Mode */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-2">
              Safe Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMode('instant')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                  paymentMode === 'instant'
                    ? 'border-[#153225] bg-[#E1EDE5] dark:bg-emerald-950/70 text-[#153225] dark:text-emerald-300 font-bold'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 hover:border-emerald-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span className="truncate">Instant Campus Activation</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                  paymentMode === 'upi'
                    ? 'border-[#153225] bg-[#E1EDE5] dark:bg-emerald-950/70 text-[#153225] dark:text-emerald-300 font-bold'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 hover:border-emerald-300'
                }`}
              >
                <QrCode className="w-4 h-4 text-[#BA4E29]" />
                <span className="truncate">UPI Reference Scan</span>
              </button>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Safe student micro-payment. Zero saved card numbers or recurring charges.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-[#0D1C15] border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Due</span>
            <span className="font-serif font-black text-lg text-[#153225] dark:text-emerald-300">
              ₹{selectedPlan.priceInr}.00
            </span>
          </div>

          <button
            type="button"
            onClick={handlePromote}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#BA4E29] hover:bg-[#A34322] text-white text-xs font-bold transition-all shadow-warm cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? 'Activating...' : `Activate for ₹${selectedPlan.priceInr}`}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
