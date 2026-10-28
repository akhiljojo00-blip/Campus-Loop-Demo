import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Sparkles, 
  Tag, 
  MapPin, 
  Flame, 
  ArrowRight, 
  Info,
  Clock,
  Coins,
  Loader2
} from 'lucide-react';
import { Category, WantedUrgency } from '../types';

export const PostWantedModal: React.FC = () => {
  const { 
    isPostWantedModalOpen, 
    setIsPostWantedModalOpen, 
    addWantedRequest,
    loopCoinsBalance,
    highlightWantedRequest,
    showToast
  } = useCampus();

  const { profile } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Textbooks');
  const [minBudget, setMinBudget] = useState('150');
  const [maxBudget, setMaxBudget] = useState('300');
  const [desiredCondition, setDesiredCondition] = useState<'Like New' | 'Good condition' | 'Any condition'>('Good condition');
  const [campusLocation, setCampusLocation] = useState(profile?.campus_location || 'Central Library Steps');
  const [searchRadius, setSearchRadius] = useState('Within 500m / Campus Only');
  const [urgency, setUrgency] = useState<WantedUrgency>('Within a week');
  const [expiresAt, setExpiresAt] = useState('In 7 days');
  const [description, setDescription] = useState('');
  const [buyerName, setBuyerName] = useState(profile?.full_name || 'Akhil (You)');
  const [buyerDepartment, setBuyerDepartment] = useState(profile?.department || '1st Year BCA');
  const [boostWithCoins, setBoostWithCoins] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setBuyerName(profile.full_name);
      if (profile.department) setBuyerDepartment(profile.department);
      if (profile.campus_location) setCampusLocation(profile.campus_location);
    }
  }, [profile]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isPostWantedModalOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }
    const min = Number(minBudget);
    const max = Number(maxBudget);
    if (!minBudget || isNaN(min) || min <= 0) {
      errs.minBudget = 'Enter a valid minimum budget.';
    }
    if (!maxBudget || isNaN(max) || max <= 0) {
      errs.maxBudget = 'Enter a valid maximum budget.';
    } else if (max < min) {
      errs.maxBudget = 'Max budget cannot be less than min budget.';
    }

    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Please explain what you need (at least 10 characters).';
    }

    if (!buyerName.trim()) {
      errs.buyerName = 'Please enter your display name.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (boostWithCoins && loopCoinsBalance < 25) {
      showToast('Insufficient LoopCoins', 'You need 25 LoopCoins to highlight this request. Uncheck to post normally.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReq = await addWantedRequest({
        title: title.trim(),
        category,
        minBudget: Number(minBudget),
        maxBudget: Number(maxBudget),
        desiredCondition,
        campusLocation,
        searchRadius,
        urgency,
        expiresAt,
        description: description.trim(),
        buyerName: buyerName.trim(),
        buyerDepartment: buyerDepartment.trim(),
        isHighlighted: boostWithCoins
      });

      if (boostWithCoins && newReq?.id) {
        highlightWantedRequest(newReq.id, 25);
      }

      setIsSubmitting(false);
      setIsPostWantedModalOpen(false);
    } catch (err) {
      console.error('Error adding wanted request:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={() => setIsPostWantedModalOpen(false)}
    >
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-[#14231D] rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#BA4E29] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white">
                Post on Campus Wanted Board
              </h2>
              <p className="text-[11px] text-white/80">
                Let seniors and classmates know what textbook or gear you need
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPostWantedModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1">
                What item are you looking for? *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Database Systems 6th Edition or Casio fx-991EX"
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 focus:outline-none transition-all ${
                  errors.title ? 'border-red-500' : 'border-stone-200 dark:border-emerald-900/80 focus:border-[#BA4E29]'
                }`}
                maxLength={80}
              />
              {errors.title && <p className="text-[11px] text-red-600 mt-1">{errors.title}</p>}
            </div>

            {/* Category & Desired Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 focus:border-[#BA4E29] outline-none"
                >
                  <option value="Textbooks">Textbooks</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Study essentials">Study essentials</option>
                  <option value="Hostel essentials">Hostel essentials</option>
                  <option value="College essentials">College essentials</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1">
                  Acceptable Condition *
                </label>
                <select
                  value={desiredCondition}
                  onChange={(e) => setDesiredCondition(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 focus:border-[#BA4E29] outline-none"
                >
                  <option value="Like New">Like New (Mint only)</option>
                  <option value="Good condition">Good condition (Standard wear)</option>
                  <option value="Any condition">Any condition (Working condition)</option>
                </select>
              </div>
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1">
                  Min Budget (₹) *
                </label>
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="100"
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 focus:border-[#BA4E29] outline-none"
                  min={1}
                />
                {errors.minBudget && <p className="text-[10px] text-red-600 mt-0.5">{errors.minBudget}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1">
                  Max Budget (₹) *
                </label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="300"
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 focus:border-[#BA4E29] outline-none"
                  min={1}
                />
                {errors.maxBudget && <p className="text-[10px] text-red-600 mt-0.5">{errors.maxBudget}</p>}
              </div>
            </div>

            {/* Campus & Radius */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1">
                  Preferred Pickup Zone
                </label>
                <select
                  value={campusLocation}
                  onChange={(e) => setCampusLocation(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 focus:border-[#BA4E29] outline-none"
                >
                  <option value="Central Library Steps">Central Library Steps</option>
                  <option value="Block C Computer Lab">Block C Computer Lab</option>
                  <option value="Science Quad Cafeteria">Science Quad Cafeteria</option>
                  <option value="Hostel Block 3 Common Room">Hostel Block 3 Common Room</option>
                  <option value="Student Activity Center">Student Activity Center</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1">
                  Search Radius
                </label>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 focus:border-[#BA4E29] outline-none"
                >
                  <option value="Within 500m / Campus Only">Within 500m / Campus Only</option>
                  <option value="Within 1 km / Hostels">Within 1 km / Hostels</option>
                  <option value="Across All Campuses">Across All Campuses</option>
                </select>
              </div>
            </div>

            {/* Urgency & Expiry */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as WantedUrgency)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 focus:border-[#BA4E29] outline-none"
                >
                  <option value="Urgent (Need within 24h)">🔥 Urgent (Within 24h)</option>
                  <option value="Within a week">Within a week</option>
                  <option value="No rush">No rush</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1">
                  Request Expiry
                </label>
                <select
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 focus:border-[#BA4E29] outline-none"
                >
                  <option value="In 3 days">In 3 days</option>
                  <option value="In 7 days">In 7 days</option>
                  <option value="In 14 days">In 14 days</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-1">
                Details & Subject Requirements *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify syllabus edition, author, which exam it's needed for, or any special preferences."
                rows={3}
                className="w-full py-2 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 focus:border-[#BA4E29] outline-none"
                maxLength={300}
              />
              {errors.description && <p className="text-[11px] text-red-600 mt-0.5">{errors.description}</p>}
            </div>

            {/* LoopCoins Boost Option */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={boostWithCoins}
                  onChange={(e) => setBoostWithCoins(e.target.checked)}
                  className="w-4 h-4 accent-[#BA4E29] rounded"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>Highlight on Wanted Board (25 LoopCoins)</span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    Pins your request with amber glow for 2x faster responses
                  </p>
                </div>
              </label>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Bal: {loopCoinsBalance} 🪙
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-100 dark:border-emerald-900/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPostWantedModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#BA4E29] hover:bg-[#A34322] text-white text-xs font-bold shadow-warm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Wanted Request'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
