import React from 'react';
import { useCampus } from '../context/CampusContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useCampus();

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isWarning = toast.type === 'warning';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-in">
      <div className={`p-4 rounded-xl shadow-warm-lg border flex items-start gap-3 backdrop-blur-md ${
        isSuccess 
          ? 'bg-[#153225] text-white border-forest-700' 
          : isWarning 
            ? 'bg-amber-900 text-amber-50 border-amber-800' 
            : 'bg-[#2B2B2B] text-white border-neutral-700'
      }`}>
        <div className="mt-0.5 shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
          {!isSuccess && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold tracking-tight">{toast.title}</p>
          <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={hideToast}
          className="text-neutral-400 hover:text-white p-1 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
