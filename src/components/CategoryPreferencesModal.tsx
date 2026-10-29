import React, { useState, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import { Category } from '../types';
import { Bell, Check, Sparkles, Moon, X, SlidersHorizontal, BookOpen, Laptop, ShoppingBag, PenTool, Coffee, Building } from 'lucide-react';

const ALL_CATEGORIES: Category[] = [
  'Textbooks',
  'Electronics',
  'Stationery',
  'Study essentials',
  'Hostel essentials',
  'College essentials',
  'Other'
];

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  Textbooks: <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  Electronics: <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
  Stationery: <PenTool className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
  'Study essentials': <Coffee className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
  'Hostel essentials': <Building className="w-4 h-4 text-orange-600 dark:text-orange-400" />,
  'College essentials': <ShoppingBag className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
  Other: <Sparkles className="w-4 h-4 text-stone-600 dark:text-stone-400" />
};

export const CategoryPreferencesModal: React.FC = () => {
  const {
    isPreferencesModalOpen,
    setIsPreferencesModalOpen,
    userCategoryPreferences,
    saveCategoryPreferences,
    showToast
  } = useCampus();

  const [buyCategories, setBuyCategories] = useState<Category[]>([]);
  const [sellCategories, setSellCategories] = useState<Category[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('23:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [enableQuietHours, setEnableQuietHours] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userCategoryPreferences) {
      setBuyCategories(userCategoryPreferences.buyCategories || []);
      setSellCategories(userCategoryPreferences.sellCategories || []);
      setNotificationsEnabled(userCategoryPreferences.notificationsEnabled !== false);
      if (userCategoryPreferences.quietHoursStart && userCategoryPreferences.quietHoursEnd) {
        setEnableQuietHours(true);
        setQuietHoursStart(userCategoryPreferences.quietHoursStart.slice(0, 5));
        setQuietHoursEnd(userCategoryPreferences.quietHoursEnd.slice(0, 5));
      }
    }
  }, [userCategoryPreferences, isPreferencesModalOpen]);

  if (!isPreferencesModalOpen) return null;

  const toggleBuyCategory = (cat: Category) => {
    setBuyCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSellCategory = (cat: Category) => {
    setSellCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCategoryPreferences({
        buyCategories,
        sellCategories,
        wantedCategories: buyCategories,
        notificationsEnabled,
        quietHoursStart: enableQuietHours ? `${quietHoursStart}:00` : null,
        quietHoursEnd: enableQuietHours ? `${quietHoursEnd}:00` : null
      });
      showToast('Preferences Saved', 'Your category alerts and match filters have been updated.', 'success');
      setIsPreferencesModalOpen(false);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update preferences', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-[#14231D] text-stone-900 dark:text-stone-100 rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg max-w-lg w-full overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#153225] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                Match & Alerts Customizer
              </span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-white">
                Category Preferences
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsPreferencesModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Intro notice */}
          <div className="p-3.5 rounded-2xl bg-[#E1EDE5] dark:bg-emerald-950/70 border border-[#C2DBCB] dark:border-emerald-800 text-xs text-[#153225] dark:text-emerald-300 flex items-start gap-2.5">
            <Bell className="w-4 h-4 shrink-0 mt-0.5 text-[#BA4E29]" />
            <span>
              Get immediate in-app notifications whenever someone lists gear you want to buy, or posts a Wanted request you can fulfill from your room.
            </span>
          </div>

          {/* Buying Alert Preferences */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                1. What are you looking to buy?
              </label>
              <span className="text-[11px] text-stone-500">
                {buyCategories.length} selected
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
              We'll notify you when peers list items in these categories:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_CATEGORIES.map(cat => {
                const active = buyCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleBuyCategory(cat)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#153225] text-white border-[#153225] shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-emerald-400'
                    }`}
                  >
                    <span className="shrink-0">{CATEGORY_ICONS[cat]}</span>
                    <span className="truncate">{cat}</span>
                    {active && <Check className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selling / Wanted Matching Preferences */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                2. What can you sell or supply?
              </label>
              <span className="text-[11px] text-stone-500">
                {sellCategories.length} selected
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
              We'll alert you when juniors or hostel peers post Wanted requests for these:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_CATEGORIES.map(cat => {
                const active = sellCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleSellCategory(cat)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-[#BA4E29] text-white border-[#BA4E29] shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-orange-400'
                    }`}
                  >
                    <span className="shrink-0">{CATEGORY_ICONS[cat]}</span>
                    <span className="truncate">{cat}</span>
                    {active && <Check className="w-3.5 h-3.5 ml-auto text-orange-200 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification delivery & Quiet Hours */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Enable In-App Match Notifications
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Receive live alerts in your notification bell
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={e => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#153225] cursor-pointer"
              />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Quiet Hours (Mute late night alerts)</span>
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Pause matching alerts during study and sleep hours
                </p>
              </div>
              <input
                type="checkbox"
                checked={enableQuietHours}
                onChange={e => setEnableQuietHours(e.target.checked)}
                className="w-4 h-4 accent-[#153225] cursor-pointer"
              />
            </div>

            {enableQuietHours && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-stone-500 font-bold block mb-1">From</span>
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={e => setQuietHoursStart(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-stone-500 font-bold block mb-1">Until</span>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={e => setQuietHoursEnd(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-stone-50 dark:bg-[#0D1C15] border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsPreferencesModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 cursor-pointer"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#153225] hover:bg-[#1E4333] text-white text-xs font-bold transition-all shadow-warm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};
