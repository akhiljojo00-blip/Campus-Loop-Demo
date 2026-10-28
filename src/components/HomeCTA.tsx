import React from 'react';
import { useCampus } from '../context/CampusContext';
import { ArrowRight, PlusCircle, Sparkles } from 'lucide-react';

export const HomeCTA: React.FC = () => {
  const { setActiveTab, setIsListItemModalOpen } = useCampus();

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-[#153225] via-[#1B3C2D] to-[#0E241A] text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold tracking-wide uppercase mb-4 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#BA4E29]" />
          <span>Join Your Campus Loop</span>
        </div>

        <h2 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#FAF8F5] leading-tight mb-4">
          Ready to turn unused course gear into cash?
        </h2>

        <p className="text-sm sm:text-base text-[#FAF8F5]/80 leading-relaxed mb-8 max-w-xl mx-auto">
          Pass on your previous semester’s books and electronics to someone who needs them. 
          Save a classmate money and reduce waste right on campus.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => {
              setActiveTab('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#BA4E29] hover:bg-[#A34322] text-white text-sm font-bold shadow-warm transition-all group cursor-pointer"
          >
            <span>Explore marketplace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => setIsListItemModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-[#153225] text-sm font-bold shadow-warm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#BA4E29]" />
            <span>List an item</span>
          </button>
        </div>
      </div>
    </section>
  );
};
