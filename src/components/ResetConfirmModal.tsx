import React from 'react';
import { useCampus } from '../context/CampusContext';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';

export const ResetConfirmModal: React.FC = () => {
  const { isResetConfirmOpen, setIsResetConfirmOpen, resetDemoData } = useCampus();

  if (!isResetConfirmOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsResetConfirmOpen(false)}
    >
      <div 
        className="relative w-full max-w-sm bg-white dark:bg-[#14231D] text-stone-900 dark:text-stone-100 rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg overflow-hidden p-5 sm:p-6 text-center animate-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
          <RotateCcw className="w-6 h-6" />
        </div>

        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mb-1.5">
          Reset Demo Data?
        </h3>

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
          This will restore the 14 original sample seed products and clear your browser’s custom demo listings. This action cannot be undone.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsResetConfirmOpen(false)}
            className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={resetDemoData}
            className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Yes, Reset Seed Data
          </button>
        </div>
      </div>
    </div>
  );
};
