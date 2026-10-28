import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  Search, 
  MessageSquare, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const { setActiveTab, setIsListItemModalOpen } = useCampus();

  const steps = [
    {
      step: '01',
      title: 'Browse & Discover',
      subtitle: 'Find exact course materials from seniors',
      description: 'Filter listings by BCA semester, textbook title, electronics, or hostel gear. Compare real photos and fair second-hand pricing set by classmates.',
      icon: <Search className="w-6 h-6 text-[#153225] dark:text-emerald-300" />,
      badge: 'Step 1: Discover'
    },
    {
      step: '02',
      title: 'Connect Directly',
      subtitle: 'Message & bargain without commission',
      description: 'Use the in-app campus chat or bargaining tool to propose offers, ask condition questions, and agree on an exchange price between lectures.',
      icon: <MessageSquare className="w-6 h-6 text-[#BA4E29]" />,
      badge: 'Step 2: Connect & Bargain'
    },
    {
      step: '03',
      title: 'Exchange On Campus',
      subtitle: 'Safe, face-to-face inspection & handover',
      description: 'Meet at a familiar college landmark like the Central Library steps or Canteen. Inspect the item in person, pay via direct UPI or cash, and complete the loop.',
      icon: <MapPin className="w-6 h-6 text-emerald-800 dark:text-emerald-400" />,
      badge: 'Step 3: Exchange'
    }
  ];

  const safetyChecklist = [
    'Always meet in broad daylight at popular campus spots (Library, Cafeteria, Quadrangle).',
    'Thoroughly test electronics (power on, test cords, check display) before paying.',
    'Inspect textbook edition and page binding to verify syllabus match.',
    'Never share bank OTPs, UPI PINs, or transfer advance deposits to anyone.',
    'Use the "Report Listing" button if you notice unrealistic prices or suspicious offers.'
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F5] dark:bg-[#0D1C15] border-b border-[#E7E3DC] dark:border-emerald-900/60 transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-wider uppercase text-[#153225] dark:text-emerald-300 bg-[#E1EDE5] dark:bg-emerald-950 px-3.5 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#153225] dark:text-[#FAF8F5] mt-3">
            How CampusLoop Works
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2">
            No shipping delays. No payment gateway cut. A closed, trusted peer network tailored for your college campus.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {steps.map((s, idx) => (
            <div 
              key={s.step}
              className="relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14231D] border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm hover:shadow-warm-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <span className="font-serif font-bold text-2xl text-stone-300 dark:text-stone-600">
                    {s.step}
                  </span>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-[#BA4E29]">
                  {s.badge}
                </span>
                <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100 mt-1 mb-2">
                  {s.title}
                </h3>
                <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 mb-3">
                  {s.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {s.description}
                </p>
              </div>

              {idx < 2 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#153225] dark:bg-emerald-700 text-white items-center justify-center shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Campus Safety Card */}
        <div className="rounded-3xl bg-[#153225] dark:bg-[#08120E] text-white p-6 sm:p-10 shadow-warm-lg border border-emerald-900/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold uppercase tracking-wide mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Campus Trust & Safe Exchange Protocol</span>
              </div>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#FAF8F5] mb-3">
                Safety first: verified campus-only exchanges
              </h3>
              <p className="text-xs sm:text-sm text-[#FAF8F5]/80 leading-relaxed mb-6">
                Because CampusLoop operates strictly on your college premises, you do not have to give your home address to internet strangers. Here is the recommended student exchange code:
              </p>

              <div className="space-y-2.5">
                {safetyChecklist.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-[#FAF8F5]/90 font-medium leading-snug">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/15">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/20">
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <h4 className="font-serif font-bold text-sm text-white">Recommended Campus Meetup Zones</h4>
              </div>
              
              <ul className="space-y-3 text-xs text-[#FAF8F5]/90">
                <li className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="font-semibold">🏛️ Central Library Steps / Lobby</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded">High Security</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="font-semibold">☕ Student Canteen / Food Court</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded">Daytime Rush</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="font-semibold">💻 BCA / Computer Lab Corridor</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded">Dept Area</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="font-semibold">🏢 Main Administrative Building</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded">CCTV Monitored</span>
                </li>
              </ul>

              <div className="mt-5 pt-3 border-t border-white/15 flex gap-2">
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#BA4E29] hover:bg-[#A34322] text-white text-xs font-bold transition-colors text-center cursor-pointer"
                >
                  Start Browsing
                </button>
                <button
                  onClick={() => setIsListItemModalOpen(true)}
                  className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  List An Item
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
