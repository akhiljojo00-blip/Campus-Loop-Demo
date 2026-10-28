import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Eye, 
  MapPin, 
  CheckCircle2, 
  Flag,
  HelpCircle,
  PhoneOff,
  UserX
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';

export const TrustSafetySection: React.FC = () => {
  const { setActiveTab } = useCampus();

  const rules = [
    {
      title: 'Designated Public Campus Spots Only',
      description: 'Always meet inside the college campus during active university hours. Ideal locations include the Central Library foyer, Student Canteen, and Academic Block lobbies.',
      icon: <MapPin className="w-5 h-5 text-emerald-800" />,
      color: 'bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Inspect First, Pay Second',
      description: 'Always power on gadgets, verify textbook edition, and check calculator LCD screens thoroughly in person before sending any money.',
      icon: <Eye className="w-5 h-5 text-blue-800" />,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Zero Advance Payments & No OTP Sharing',
      description: 'Never pay token amounts or booking deposits to any student online before seeing the item. Genuine peers will happily meet you at the campus quadrangle.',
      icon: <Lock className="w-5 h-5 text-red-800" />,
      color: 'bg-red-50 border-red-200'
    },
    {
      title: 'Direct Face-to-Face UPI or Cash',
      description: 'Once you are satisfied with the item, scan the seller’s UPI QR code directly on their phone or hand over cash. No middleman holding your money.',
      icon: <CheckCircle2 className="w-5 h-5 text-amber-800" />,
      color: 'bg-amber-50 border-amber-200'
    },
    {
      title: 'Prohibited & Restricted Items Policy',
      description: 'CampusLoop strictly prohibits weapons, alcohol, prescription drugs, copyrighted test answer keys, or stolen equipment. Listings violating this are removed.',
      icon: <AlertTriangle className="w-5 h-5 text-purple-800" />,
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'One-Click Listing Reporting',
      description: 'Every product card includes an immediate "Report listing" action. Students can flag suspicious pricing, miscategorized items, or duplicates instantly.',
      icon: <Flag className="w-5 h-5 text-[#BA4E29]" />,
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F5] border-b border-[#E7E3DC]">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1EDE5] text-[#153225] text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-4 h-4 text-[#153225]" />
            <span>Campus Community Guidelines</span>
          </div>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#153225]">
            Trust & Safety Framework
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
            Campus marketplaces succeed because participants belong to the same college community. 
            Here is how we maintain a safe, respectful, and scam-free environment.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {rules.map((rule, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-3xl bg-white border border-[#E7E3DC] shadow-warm flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border mb-4 ${rule.color}`}>
                  {rule.icon}
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 mb-2">
                  {rule.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Red Flag Warning Box */}
        <div className="p-7 rounded-3xl bg-amber-50/80 border border-amber-200/90 max-w-4xl mx-auto">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <PhoneOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-amber-950 mb-1">
                Common Student Scams to Watch Out For
              </h4>
              <p className="text-xs text-amber-900/90 leading-relaxed mb-3">
                Watch out if someone asks you to click an unknown UPI link to "receive" payment, or claims they sent a courier driver to your hostel gate who needs a deposit code. 
                Genuine student buyers and sellers on campus will happily meet you face-to-face between classes.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-amber-950">
                <span className="bg-amber-100 px-2.5 py-1 rounded-md">❌ Never enter UPI PIN to receive money</span>
                <span className="bg-amber-100 px-2.5 py-1 rounded-md">❌ No third-party courier payments</span>
                <span className="bg-amber-100 px-2.5 py-1 rounded-md">❌ No off-campus remote exchanges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="mt-8 text-center text-xs text-stone-500">
          <p>
            * Note for evaluation: The "Report listing" flow in this demo records reports locally. In production, reports connect to verified student moderators.
          </p>
        </div>

      </div>
    </section>
  );
};
