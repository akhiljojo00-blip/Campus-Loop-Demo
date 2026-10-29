import React from 'react';
import { Award, HelpCircle } from 'lucide-react';

export const BusinessModelSection: React.FC = () => {
  const stages = [
    {
      stage: 'Stage 1 (Current Demo Phase)',
      badge: 'Zero Barrier Adoption',
      badgeColor: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      title: '100% Free Campus Listings',
      model: '₹0 Commission • Open Access',
      description: 'Focus entirely on solving student liquidity and establishing user trust. Students list, browse, and connect without paying any fees or commission.',
      focus: 'High campus adoption, student feedback, and community engagement.',
      status: 'Active in Current Demo',
      statusColor: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800'
    },
    {
      stage: 'Stage 2 (Near-Term Growth)',
      badge: 'Micro-Monetization',
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      title: 'Featured Listings & Wanted Boosts',
      model: '₹3 – ₹19 Micro-Promotions',
      description: 'Sellers and buyers who want faster responses during semester start or exam weeks can optionally boost listings (₹3 for 24h, ₹9 for 7d, ₹19 for 30d) or Wanted requests for priority discovery.',
      focus: 'Micro-payments; completely voluntary without penalizing regular free users.',
      status: 'Promotions Catalogue Active',
      statusColor: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800'
    },
    {
      stage: 'Stage 3 (Ecosystem Expansion)',
      badge: 'B2B Campus Alliances',
      badgeColor: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      title: 'College & Bookstore Partnerships',
      model: 'Affiliate & Co-Branding',
      description: 'Collaborate with campus bookstores, university student unions, stationery providers, and printing centers for official book drives and student discount vouchers.',
      focus: 'Official institutional recognition and campus-wide orientation tie-ups.',
      status: 'Future Partnership Concept',
      statusColor: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800'
    },
    {
      stage: 'Stage 4 (Platform Maturity)',
      badge: 'Escrow & Value-Add',
      badgeColor: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      title: 'Optional Escrow & Safe Delivery',
      model: '2% - 3% Platform Convenience Fee',
      description: 'Only if Campus Market introduces automated digital escrow payments, instant refunds, or hostel delivery lockers will a nominal service fee ever be considered.',
      focus: 'High value items (laptops, expensive tablets) where buyer escrow provides insurance.',
      status: 'Long-Term Exploration Only',
      statusColor: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#14231D] border-b border-[#E7E3DC] dark:border-emerald-900/60 transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAECE6] dark:bg-orange-950/60 text-[#BA4E29] text-xs font-bold tracking-wide uppercase mb-3">
            <Award className="w-4 h-4" />
            <span>BCA Management Project • Business Strategy</span>
          </div>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#153225] dark:text-[#FAF8F5]">
            Phased Monetization & Viability Roadmap
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
            A sustainable campus startup must balance frictionless student adoption with long-term financial viability. 
            Here is our transparent 4-stage business roadmap.
          </p>
        </div>

        {/* 4 Phased Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stages.map((st, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-3xl bg-[#FAF8F5] dark:bg-stone-900 border border-[#E7E3DC] dark:border-emerald-900/40 hover:border-[#153225]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${st.badgeColor}`}>
                    {st.badge}
                  </span>
                  <span className="font-serif font-bold text-lg text-stone-400">
                    0{idx + 1}
                  </span>
                </div>

                <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1">
                  {st.stage}
                </p>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 leading-snug mb-2">
                  {st.title}
                </h3>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#14231D] border border-stone-200/80 dark:border-stone-800 mb-3">
                  <span className="text-xs font-bold text-[#153225] dark:text-emerald-300 block">
                    {st.model}
                  </span>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                  {st.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800">
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  <strong className="text-stone-700 dark:text-stone-300">Strategic Focus:</strong> {st.focus}
                </p>
                <div className="mt-3">
                  <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-md border ${st.statusColor}`}>
                    {st.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transparent Disclaimer Box */}
        <div className="p-6 rounded-2xl bg-[#F5F2EB] dark:bg-stone-900 border border-[#DDD2C4] dark:border-emerald-900/40 max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#153225] dark:bg-emerald-800 text-white flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            <strong className="text-stone-900 dark:text-stone-100 font-bold block mb-1">
              BCA Management Concept Disclosure
            </strong>
            This website is a business prototype demonstration for a 1st Year BCA management coursework assignment. 
            Campus Market operates with verified campus students and provides optional voluntary micro-promotions and sample demonstration data. 
            We do not claim existing corporate partnerships, paid transactions, or real bank integration in this prototype.
          </div>
        </div>

      </div>
    </section>
  );
};
