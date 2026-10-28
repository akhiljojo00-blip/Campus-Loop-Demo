import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { X, Flag, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ReportReason } from '../types';

export const ReportModal: React.FC = () => {
  const { reportingProduct, setReportingProduct, submitReport } = useCampus();
  const [selectedReason, setSelectedReason] = useState<ReportReason>('Suspicious or fraudulent listing');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!reportingProduct) return null;

  const reasons: ReportReason[] = [
    'Suspicious or fraudulent listing',
    'Inaccurate item description or condition',
    'Unrealistic or misleading pricing',
    'Prohibited or unsafe campus item',
    'Duplicate listing or already sold'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      submitReport(reportingProduct.id, selectedReason, details);
      setIsSubmitted(false);
      setDetails('');
    }, 700);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setReportingProduct(null)}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#E7E3DC] shadow-warm-lg overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Report Campus Listing
              </h3>
              <p className="text-[11px] text-stone-400">
                Help maintain our peer community standard
              </p>
            </div>
          </div>

          <button
            onClick={() => setReportingProduct(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Target Item summary */}
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-200/80 mb-4 flex items-center gap-3">
            <img 
              src={reportingProduct.imageUrl} 
              alt={reportingProduct.title} 
              className="w-10 h-10 rounded-lg object-cover bg-stone-200 shrink-0" 
            />
            <div className="truncate">
              <p className="font-serif font-bold text-xs text-stone-900 truncate">
                {reportingProduct.title}
              </p>
              <p className="text-[10px] text-stone-500">
                ₹{reportingProduct.price} • Seller: {reportingProduct.sellerName}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
                Reason for Reporting *
              </label>
              <div className="space-y-2">
                {reasons.map((reason) => (
                  <label 
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedReason === reason 
                        ? 'border-[#BA4E29] bg-orange-50/50 text-[#BA4E29] font-semibold' 
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="reportReason" 
                      checked={selectedReason === reason} 
                      onChange={() => setSelectedReason(reason)} 
                      className="accent-[#BA4E29]" 
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                Additional Details (Optional)
              </label>
              <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any context for campus reviewers..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white focus:border-[#153225] outline-none"
              />
            </div>

            {/* Prototype simulation disclaimer */}
            <div className="p-2.5 rounded-xl bg-stone-100 text-[11px] text-stone-600 leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Demonstration Notice: Reports are simulated locally for this academic showcase. No live student moderation team is contacted.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReportingProduct(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitted}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isSubmitted ? 'Logging Report...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
