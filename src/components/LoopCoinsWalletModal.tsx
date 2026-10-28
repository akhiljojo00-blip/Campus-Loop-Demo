import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  X, 
  Coins, 
  Sparkles, 
  Flame, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Tag,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';

export const LoopCoinsWalletModal: React.FC = () => {
  const { 
    isWalletModalOpen, 
    setIsWalletModalOpen, 
    loopCoinsBalance, 
    coinTransactions, 
    earnCoins, 
    boostListing,
    listings,
    userListingIds,
    showToast
  } = useCampus();

  const [activeTab, setActiveTab] = useState<'balance' | 'boost' | 'earn'>('balance');
  const [selectedListingToBoost, setSelectedListingToBoost] = useState<string>('');
  const [checkedInToday, setCheckedInToday] = useState(false);

  if (!isWalletModalOpen) return null;

  const handleDailyCheckIn = () => {
    if (checkedInToday) {
      showToast('Already Claimed', 'You have already claimed today’s check-in reward.', 'info');
      return;
    }
    setCheckedInToday(true);
    earnCoins(10, 'Daily Campus Attendance Check-In');
  };

  const handleBoost = () => {
    if (!selectedListingToBoost) {
      showToast('Select an Item', 'Please pick an item to boost.', 'warning');
      return;
    }
    const success = boostListing(selectedListingToBoost, 48, 40);
    if (success) {
      setSelectedListingToBoost('');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={() => setIsWalletModalOpen(false)}
    >
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-[#14231D] rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm-lg overflow-hidden my-auto animate-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-xs">
              🪙
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200">
                Virtual Student Rewards
              </span>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-white">
                LoopCoins Campus Wallet
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Balance Banner */}
        <div className="p-5 sm:p-6 bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Available Demo Balance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif font-extrabold text-3xl sm:text-4xl text-amber-900 dark:text-amber-200">
                {loopCoinsBalance}
              </span>
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                LoopCoins
              </span>
            </div>
          </div>

          <button
            onClick={handleDailyCheckIn}
            disabled={checkedInToday}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
              checkedInToday
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>{checkedInToday ? 'Checked In Today ✓' : 'Daily Check-In (+10 🪙)'}</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#E7E3DC] dark:border-emerald-900/60 bg-[#FAF8F5] dark:bg-stone-900 text-xs font-bold">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${
              activeTab === 'balance'
                ? 'bg-white dark:bg-[#14231D] text-[#153225] dark:text-emerald-300 border-b-2 border-[#153225] dark:border-emerald-400'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            Transaction History
          </button>

          <button
            onClick={() => setActiveTab('boost')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${
              activeTab === 'boost'
                ? 'bg-white dark:bg-[#14231D] text-[#BA4E29] border-b-2 border-[#BA4E29]'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            Spend Coins (Boost Item)
          </button>

          <button
            onClick={() => setActiveTab('earn')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer ${
              activeTab === 'earn'
                ? 'bg-white dark:bg-[#14231D] text-amber-700 dark:text-amber-300 border-b-2 border-amber-600'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
            }`}
          >
            How to Earn
          </button>
        </div>

        {/* Content Tabs */}
        <div className="p-5 max-h-[55vh] overflow-y-auto">
          
          {/* Tab 1: Transaction History */}
          {activeTab === 'balance' && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Recent Activity
              </span>

              {coinTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-emerald-900/40 flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      tx.type === 'earned' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                    }`}>
                      {tx.type === 'earned' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-stone-100">
                        {tx.reason}
                      </p>
                      <span className="text-[10px] text-stone-400">
                        {tx.dateStr}
                      </span>
                    </div>
                  </div>

                  <span className={`font-serif font-extrabold text-sm ${
                    tx.type === 'earned' 
                      ? 'text-emerald-700 dark:text-emerald-400' 
                      : 'text-[#BA4E29]'
                  }`}>
                    {tx.type === 'earned' ? `+${tx.amount}` : `-${tx.amount}`} 🪙
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Spend Coins to Boost */}
          {activeTab === 'boost' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 mb-1">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Featured Listing Boost — 40 LoopCoins</span>
                </div>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                  Pins your item to the top of the marketplace feed with a radiant "Featured" badge for 48 hours.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase mb-1.5">
                  Select Listing to Boost
                </label>
                <select
                  value={selectedListingToBoost}
                  onChange={(e) => setSelectedListingToBoost(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs bg-white dark:bg-stone-900 dark:text-white outline-none"
                >
                  <option value="">Choose an item from the marketplace...</option>
                  {listings.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} (₹{item.price}) {item.isFeatured ? '— [Already Featured]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                <div className="flex justify-between">
                  <span>Boost Duration:</span>
                  <span className="font-bold">48 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Coin Cost:</span>
                  <span className="font-bold text-[#BA4E29]">40 LoopCoins</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance After Boost:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {Math.max(0, loopCoinsBalance - 40)} LoopCoins
                  </span>
                </div>
              </div>

              <button
                onClick={handleBoost}
                disabled={!selectedListingToBoost || loopCoinsBalance < 40}
                className="w-full py-2.5 rounded-xl bg-[#BA4E29] hover:bg-[#A34322] text-white text-xs font-bold transition-all shadow-warm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Flame className="w-4 h-4" />
                <span>Confirm & Boost Listing (40 Coins)</span>
              </button>
            </div>
          )}

          {/* Tab 3: How to Earn */}
          {activeTab === 'earn' && (
            <div className="space-y-3 text-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Eligible Campus Activities
              </span>

              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900 dark:text-stone-100">🤝 Complete an Exchange Agreement</p>
                  <p className="text-[11px] text-stone-500">Reach an accepted offer with a classmate</p>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">+25 🪙</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900 dark:text-stone-100">📦 List an Unused Item</p>
                  <p className="text-[11px] text-stone-500">Post a textbook, gadget, or hostel essential</p>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">+15 🪙</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900 dark:text-stone-100">⭐ Leave a Peer Review</p>
                  <p className="text-[11px] text-stone-500">Rate product quality and seller promptness</p>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">+15 🪙</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900 dark:text-stone-100">🔍 Post a Wanted Request</p>
                  <p className="text-[11px] text-stone-500">Let classmates know what course book you need</p>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">+10 🪙</span>
              </div>
            </div>
          )}

        </div>

        {/* Legal / Coursework Disclaimer Box */}
        <div className="p-3.5 border-t border-[#E7E3DC] dark:border-emerald-900/60 bg-[#FAF8F5] dark:bg-stone-900 text-[10px] text-stone-500 dark:text-stone-400 flex items-start gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <span>
            BCA Coursework Disclaimer: LoopCoins are virtual demonstration tokens stored in your browser's localStorage. They have zero cash value and cannot be redeemed for real currency. Normal marketplace browsing and listing remain 100% free.
          </span>
        </div>

      </div>
    </div>
  );
};
