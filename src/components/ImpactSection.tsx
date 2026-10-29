import React from 'react';
import { PiggyBank, RefreshCw, MapPin } from 'lucide-react';

export const ImpactSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#14231D] border-b border-[#E7E3DC] dark:border-emerald-900/60 transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold tracking-wider uppercase text-[#BA4E29] bg-[#FAECE6] dark:bg-orange-950/60 px-3 py-1 rounded-full">
            Why Campus Market
          </span>
          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#153225] dark:text-[#FAF8F5] mt-3">
            Built for how college students actually live and study
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
            Standard ecommerce adds packaging delays, delivery charges, and stranger risk. 
            Campus Market organizes what already exists within walking distance of your lecture hall.
          </p>
        </div>

        {/* 3 Pillars of Student Value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pillar 1: Financial Relief */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-[#E7E3DC] dark:border-emerald-900/40 hover:border-[#153225]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300 flex items-center justify-center mb-5">
              <PiggyBank className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
              Affordable Essentials
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              First-year books, lab coats, and graphic drafters are expensive when purchased new, yet used for only one or two semesters. Second-hand pricing makes essential course tools accessible to everyone regardless of budget.
            </p>
            <div className="mt-4 pt-4 border-t border-stone-200/60 dark:border-stone-800 flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Sellers recover cash • Buyers save pocket money
            </div>
          </div>

          {/* Pillar 2: Circular Reuse */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-[#E7E3DC] dark:border-emerald-900/40 hover:border-[#BA4E29]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FAECE6] dark:bg-orange-950/60 text-[#BA4E29] flex items-center justify-center mb-5">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
              Circular Campus Economy
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Every semester ends with piles of functional calculators, notebooks, and hostel lamps abandoned during room clearance. Keeping items cycling through consecutive batches reduces campus waste and carbon footprints.
            </p>
            <div className="mt-4 pt-4 border-t border-stone-200/60 dark:border-stone-800 flex items-center gap-2 text-xs font-semibold text-[#BA4E29]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BA4E29]"></span>
              Zero cardboard packaging • Zero shipping fuel
            </div>
          </div>

          {/* Pillar 3: Frictionless Hyper-Local Trust */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-[#E7E3DC] dark:border-emerald-900/40 hover:border-[#153225]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#DDE7DF] dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
              Hyper-Local Convenience
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              No waiting for courier tracking. When you message a senior, you can inspect the calculator screen or book bindings between class periods at the library or canteen before handing over money.
            </p>
            <div className="mt-4 pt-4 border-t border-stone-200/60 dark:border-stone-800 flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
              Face-to-face inspection • Instant handoff
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
