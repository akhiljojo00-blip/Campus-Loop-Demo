import React, { useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Presentation, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  HelpCircle,
  PlusCircle,
  Search,
  CheckCircle2,
  ClipboardList,
  Compass,
  Coins
} from 'lucide-react';

export const PresentationTour: React.FC = () => {
  const { 
    isPresentationMode, 
    setIsPresentationMode, 
    presentationStep, 
    setPresentationStep, 
    nextPresentationStep, 
    prevPresentationStep,
    setActiveTab,
    setIsListItemModalOpen,
    setIsWalletModalOpen,
    setSearchQuery,
    setSelectedCategory
  } = useCampus();

  const steps = [
    {
      step: 1,
      badge: 'The Problem',
      title: 'Expensive Semester Cycles & Hostel Waste',
      summary: 'Every semester, college students spend ₹3,000–₹8,000 on new textbooks, lab coats, and calculators that sit idle once examinations conclude.',
      talkingPoints: [
        'Commercial bookstores charge full retail for single-semester books.',
        'Seniors have no organized way to monetize their used study materials.',
        'High courier fees and packaging waste make general ecommerce impractical on campus.'
      ],
      actionLabel: 'View Problem Overview',
      onEnter: () => {
        setActiveTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      step: 2,
      badge: 'The Solution',
      title: 'CampusLoop 2.0: Circular Economy & Wanted Board',
      summary: 'CampusLoop provides both a marketplace feed AND a reverse "Wanted Board" where students request exact items with their budget.',
      talkingPoints: [
        '“Your campus. Your stuff. Your loop.” tagline & student brand.',
        'Reverse Wanted Board: buyers post requests, seniors respond with offers.',
        'Zero commission on peer-to-peer student transactions.'
      ],
      actionLabel: 'Inspect Wanted Board',
      onEnter: () => {
        setActiveTab('wanted');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      step: 3,
      badge: 'Live Marketplace & Bargaining',
      title: 'Interactive Bargaining & Campus Map',
      summary: 'Students negotiate prices directly using an offer/counter-offer state machine, and discover items near their lecture halls via the interactive Leaflet campus map.',
      talkingPoints: [
        'Bargaining flow: propose price -> seller accepts/counters -> locks deal.',
        'Interactive Leaflet campus map showing approximate landmark zones.',
        'Consent-based 15-minute live meetup proximity radar.'
      ],
      actionLabel: 'Explore Campus Map',
      onEnter: () => {
        setActiveTab('map');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      step: 4,
      badge: 'LoopCoins Virtual Rewards',
      title: 'Gamified Student Loyalty & Virtual Tokens',
      summary: 'LoopCoins reward students for positive community actions (listing items, agreeing on offers, leaving peer reviews) and can be spent on listing visibility boosts.',
      talkingPoints: [
        'Earn +25 LoopCoins for completed agreements, +15 for listings.',
        'Spend 40 LoopCoins to pin an item to the top for 48 hours.',
        'Clear academic disclaimer: zero real monetary value, stored in localStorage.'
      ],
      actionLabel: 'Open LoopCoins Wallet',
      onEnter: () => {
        setIsWalletModalOpen(true);
      }
    },
    {
      step: 5,
      badge: 'BCA Management Strategy',
      title: 'Monetization Roadmap & Campus Growth',
      summary: 'A disciplined 4-phase rollout: Free adoption -> Featured listing boosts (₹20-₹49) -> University bookstore partnerships -> Long-term escrow fees.',
      talkingPoints: [
        'Phase 1 ensures zero-friction network density.',
        'Micro-monetization via optional visibility boosts during exam rush weeks.',
        'Strict honesty: currently prototype-only without fake metrics or payments.'
      ],
      actionLabel: 'Review Business Plan',
      onEnter: () => {
        setIsWalletModalOpen(false);
        setActiveTab('business-model');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  ];

  const current = steps[presentationStep];

  useEffect(() => {
    if (isPresentationMode && current) {
      current.onEnter();
    }
  }, [isPresentationMode, presentationStep]);

  useEffect(() => {
    if (!isPresentationMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        nextPresentationStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevPresentationStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, presentationStep]);

  if (!isPresentationMode) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-xl w-auto animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#153225] text-white rounded-3xl border-2 border-emerald-600/40 shadow-warm-lg overflow-hidden p-5 sm:p-6 backdrop-blur-md">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-900/60">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#BA4E29] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Presentation className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                BCA Class Presentation Guide (CampusLoop 2.0)
              </span>
              <h3 className="font-serif font-bold text-sm text-white">
                Step {current.step} of 5: {current.badge}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsPresentationMode(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Exit Presentation Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Title & Summary */}
        <div className="mb-4">
          <h4 className="font-serif font-bold text-base sm:text-lg text-[#FAF8F5] leading-snug">
            {current.title}
          </h4>
          <p className="text-xs text-[#FAF8F5]/80 mt-1 leading-relaxed">
            {current.summary}
          </p>
        </div>

        {/* Presenter Talking Points */}
        <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-800/60 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1.5">
            Key Presenter Talking Points:
          </span>
          <ul className="space-y-1.5 text-xs text-[#FAF8F5]/90">
            {current.talkingPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center gap-1.5 mb-4">
          {steps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setPresentationStep(idx)}
              className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                idx === presentationStep 
                  ? 'bg-[#BA4E29]' 
                  : idx < presentationStep 
                    ? 'bg-emerald-500' 
                    : 'bg-emerald-900/60'
              }`}
              title={`Go to step ${s.step}: ${s.badge}`}
            />
          ))}
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => setIsPresentationMode(false)}
            className="text-xs text-white/70 hover:text-white px-2 py-1.5 transition-colors cursor-pointer"
          >
            Exit Tour
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={prevPresentationStep}
              disabled={presentationStep === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {presentationStep < steps.length - 1 ? (
              <button
                onClick={nextPresentationStep}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-[#BA4E29] hover:bg-[#A34322] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsPresentationMode(false)}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>Finish Tour</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
