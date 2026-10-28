import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Eye, 
  MapPin, 
  CheckCircle2, 
  Flag,
  PhoneOff
} from 'lucide-react';

export const TrustSafetySection: React.FC = () => {
  const rules = [
    {
      title: 'Designated Public Campus Spots Only',
      description: 'Always meet inside the college campus during active university hours. Ideal locations include the Central Library foyer, Student Canteen, and Academic Block lobbies.',
      icon: <MapPin className="w-5 h-5 text-emerald-800 dark:text-emerald-300" />,
      color: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800'
    },
    {
      title: 'Inspect First, Pay Second',
      description: 'Always power on gadgets, verify textbook edition, and check calculator LCD screens thoroughly in person before sending any money.',
      icon: <Eye className="w-5 h-5 text-blue-800 dark:text-blue-300" />,
      color: 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Zero Advance Payments & No OTP Sharing',
      description: 'Never pay token amounts or booking deposits to any student online before seeing the item. Genuine peers will happily meet you at the campus quadrangle.',
      icon: <Lock className="w-5 h-5 text-red-800 dark:text-red-300" />,
      color: 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800'
    },
    {
      title: 'Direct Face-to-Face UPI or Cash',
      description: 'Once you are satisfied with the item, scan the seller’s UPI QR code directly on their phone or hand over cash. No middleman holding your money.',
      icon: <CheckCircle2 className="w-5 h-5 text-amber-800 dark:text-amber-300" />,
      color: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800'
    },
    {
      title: 'Prohibited & Restricted Items Policy',
      description: 'CampusLoop strictly prohibits weapons, alcohol, prescription drugs, copyrighted test answer keys, or stolen equipment. Listings violating this are removed.',
      icon: <AlertTriangle className="w-5 h-5 text-purple-800 dark:text-purple-300" />,
      color: 'bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800'
    },
    {
      title: 'One-Click Listing & Review Reporting',
      description: 'Every product card and review includes an immediate "Report" action. Students can flag suspicious pricing, miscategorized items, or duplicates instantly.',
      icon: <Flag className="w-5 h-5 text-[#BA4E29]" />,
      color: 'bg-orange-50 dark:bg-orange-950/80 border-orange-200 dark:border-orange-800'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F5] dark:bg-[#0D1C15] border-b border-[#E7E3DC] dark:border-emerald-900/60 transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300 text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-4 h-4 text-[#153225] dark:text-emerald-300" />
            <span>Campus Community Guidelines</span>
          </div>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#153225] dark:text-[#FAF8F5]">
            Trust & Safety Framework
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
            Campus marketplaces succeed because participants belong to the same college community. 
            Here is how we maintain a safe, respectful, and scam-free environment.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {rules.map((rule, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-[#14231D] border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border mb-4 ${rule.color}`}>
                  {rule.icon}
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mb-2">
                  {rule.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Red Flag Warning Box */}
        <div className="p-7 rounded-3xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/80 max-w-4xl mx-auto">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center shrink-0">
              <PhoneOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-amber-950 dark:text-amber-200 mb-1">
                Common Student Scams to Watch Out For
              </h4>
              <p className="text-xs text-amber-900/90 dark:text-amber-300/90 leading-relaxed mb-3">
                Watch out if someone asks you to click an unknown UPI link to "receive" payment, or claims they sent a courier driver to your hostel gate who needs a deposit code. 
                Genuine student buyers and sellers on campus will happily meet you face-to-face between classes.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-amber-950 dark:text-amber-200">
                <span className="bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-md">❌ Never enter UPI PIN to receive money</span>
                <span className="bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-md">❌ No third-party courier payments</span>
                <span className="bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-md">❌ No off-campus remote exchanges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="mt-8 text-center text-xs text-stone-500 dark:text-stone-400">
          <p>
            * Note for evaluation: The "Report listing" flow in this demo records reports locally. In production, reports connect to verified student moderators.
          </p>
        </div>

      </div>
    </section>
  );
};
