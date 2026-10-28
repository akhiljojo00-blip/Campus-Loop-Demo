import React, { useState, useMemo } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  RotateCcw, 
  PlusCircle, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  User, 
  MessageSquare,
  DollarSign,
  ChevronRight,
  Flame,
  HelpCircle
} from 'lucide-react';
import { Category, WantedStatus, WantedUrgency } from '../types';

export const WantedBoardView: React.FC = () => {
  const { 
    wantedRequests, 
    setIsPostWantedModalOpen, 
    setSelectedWantedRequest, 
    loopCoinsBalance,
    setIsWalletModalOpen
  } = useCampus();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<WantedStatus | 'All'>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<WantedUrgency | 'All'>('All');
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<number>(1000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories: (Category | 'All')[] = [
    'All',
    'Textbooks',
    'Electronics',
    'Stationery',
    'Study essentials',
    'Hostel essentials',
    'College essentials'
  ];

  const filteredRequests = useMemo(() => {
    return wantedRequests.filter(req => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = req.title.toLowerCase().includes(q) ||
          req.description.toLowerCase().includes(q) ||
          req.campusLocation.toLowerCase().includes(q) ||
          req.buyerName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== 'All' && req.category !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus !== 'All' && req.status !== selectedStatus) {
        return false;
      }

      // Urgency
      if (selectedUrgency !== 'All' && req.urgency !== selectedUrgency) {
        return false;
      }

      // Budget
      if (req.minBudget > maxBudgetFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Highlighted first
      if (a.isHighlighted && !b.isHighlighted) return -1;
      if (!a.isHighlighted && b.isHighlighted) return 1;
      // Urgent next
      if (a.urgency.includes('Urgent') && !b.urgency.includes('Urgent')) return -1;
      if (!a.urgency.includes('Urgent') && b.urgency.includes('Urgent')) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [wantedRequests, searchQuery, selectedCategory, selectedStatus, selectedUrgency, maxBudgetFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedUrgency('All');
    setMaxBudgetFilter(1000);
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedUrgency !== 'All' || maxBudgetFilter < 1000;

  const getStatusBadge = (status: WantedStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Offers Received':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Fulfilled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700';
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5] dark:bg-[#0D1C15] min-h-[85vh] transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E7E3DC] dark:border-emerald-900/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAECE6] dark:bg-orange-950/60 text-[#BA4E29] text-xs font-bold tracking-wide uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Buyer Requests</span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#153225] dark:text-[#FAF8F5]">
              Wanted Board
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
              Can't find what you need in the marketplace? Post your textbook or gadget request with your budget, and classmates with matching items can propose an offer.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all hover:bg-amber-100 cursor-pointer shadow-xs"
              title="Open LoopCoins Rewards Wallet"
            >
              <span className="text-sm">🪙</span>
              <span>{loopCoinsBalance} Coins</span>
            </button>

            <button
              onClick={() => setIsPostWantedModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#BA4E29] hover:bg-[#A34322] text-white text-xs sm:text-sm font-semibold shadow-warm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Post What You Need</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-[#14231D] rounded-2xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm p-4 sm:p-5 mb-8 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Search Input (Col 5) */}
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wanted books, Casio fx-991, lab coat..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-900/80 focus:border-[#153225] dark:focus:border-emerald-400 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 bg-[#FAF8F5]/50 dark:bg-stone-900/40 focus:bg-white dark:focus:bg-[#14231D] transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Dropdown (Col 2) */}
            <div className="hidden sm:block md:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as WantedStatus | 'All')}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-800 dark:text-stone-200 bg-[#FAF8F5]/50 dark:bg-stone-900/40 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open Requests</option>
                <option value="Offers Received">Offers Received</option>
                <option value="Fulfilled">Fulfilled</option>
              </select>
            </div>

            {/* Urgency Filter (Col 3) */}
            <div className="hidden sm:block md:col-span-3">
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value as WantedUrgency | 'All')}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 text-xs text-stone-800 dark:text-stone-200 bg-[#FAF8F5]/50 dark:bg-stone-900/40 outline-none cursor-pointer"
              >
                <option value="All">All Urgency Levels</option>
                <option value="Urgent (Need within 24h)">🔥 Urgent (Within 24h)</option>
                <option value="Within a week">Within a week</option>
                <option value="No rush">No rush</option>
              </select>
            </div>

            {/* Max Budget Slider (Col 2) */}
            <div className="hidden md:flex flex-col md:col-span-2 text-xs">
              <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                <span>Max Budget:</span>
                <span className="font-bold text-[#153225] dark:text-emerald-300">₹{maxBudgetFilter}</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={maxBudgetFilter}
                onChange={(e) => setMaxBudgetFilter(Number(e.target.value))}
                className="w-full accent-[#BA4E29] cursor-pointer"
              />
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="flex sm:hidden items-center justify-between gap-2 pt-1">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-[#FAF8F5] dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-200"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters & Urgency</span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

          </div>

          {/* Mobile Filter Sheet */}
          {mobileFilterOpen && (
            <div className="sm:hidden mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 gap-3 animate-in fade-in duration-150">
              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as WantedStatus | 'All')}
                  className="w-full py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-900 dark:text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open Requests</option>
                  <option value="Offers Received">Offers Received</option>
                  <option value="Fulfilled">Fulfilled</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">
                  Urgency
                </label>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value as WantedUrgency | 'All')}
                  className="w-full py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-900 dark:text-white"
                >
                  <option value="All">All Urgency Levels</option>
                  <option value="Urgent (Need within 24h)">🔥 Urgent (Within 24h)</option>
                  <option value="Within a week">Within a week</option>
                  <option value="No rush">No rush</option>
                </select>
              </div>
            </div>
          )}

          {/* Category Horizontal Pills */}
          <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-emerald-900/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#153225] dark:bg-emerald-700 text-white shadow-xs'
                      : 'bg-[#FAF8F5] dark:bg-stone-900/60 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/60 dark:border-emerald-900/40'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between mb-6 text-xs text-stone-500 dark:text-stone-400 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 dark:text-stone-200">
              Showing {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
            </span>
            {selectedCategory !== 'All' && (
              <span className="bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                in {selectedCategory}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#BA4E29] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Request Cards Grid */}
        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedWantedRequest(req)}
                className={`relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-[#14231D] border transition-all duration-200 cursor-pointer shadow-warm hover:shadow-warm-md hover:-translate-y-1 ${
                  req.isHighlighted
                    ? 'border-amber-400 dark:border-amber-500/80 ring-1 ring-amber-400/30'
                    : 'border-[#E7E3DC] dark:border-emerald-900/60 hover:border-[#153225]/40 dark:hover:border-emerald-500/40'
                }`}
              >
                <div>
                  {/* Top Tags & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {req.isHighlighted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          <Flame className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      {req.isUserRequest ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#BA4E29] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          Your Request
                        </span>
                      ) : req.isDemoRequest ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-medium tracking-wide border border-stone-300/70 dark:border-stone-700">
                          Demo Sample
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          Live Request
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300 bg-[#E1EDE5] dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                        {req.category}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-snug mb-2 hover:text-[#BA4E29] transition-colors">
                    {req.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
                    {req.description}
                  </p>

                  {/* Budget Pill */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#0D1C15]/80 border border-stone-200/80 dark:border-emerald-900/40 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Buyer Budget
                      </span>
                      <span className="font-serif font-extrabold text-base text-[#153225] dark:text-emerald-300">
                        ₹{req.minBudget} – ₹{req.maxBudget}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Desired Condition
                      </span>
                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {req.desiredCondition}
                      </span>
                    </div>
                  </div>

                  {/* Meta: Location, Urgency, Radius */}
                  <div className="space-y-1.5 text-xs text-stone-500 dark:text-stone-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#BA4E29] shrink-0" />
                      <span className="truncate">{req.campusLocation} ({req.searchRadius})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-medium text-stone-600 dark:text-stone-300">{req.urgency}</span>
                      <span>• {req.expiresAt}</span>
                    </div>
                  </div>
                </div>

                {/* Footer / CTA Area */}
                <div className="pt-3 border-t border-stone-100 dark:border-emerald-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#153225] dark:bg-emerald-800 text-white flex items-center justify-center font-bold text-[10px]">
                      {req.buyerName.charAt(0)}
                    </div>
                    <span className="font-semibold text-stone-700 dark:text-stone-300 truncate max-w-[100px]">
                      {req.buyerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[#BA4E29] font-bold group">
                    <span>{req.offers.length > 0 ? `${req.offers.length} Offers` : 'Send Offer'}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-[#14231D] rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-warm">
            <div className="w-16 h-16 rounded-2xl bg-[#FAECE6] dark:bg-orange-950/60 text-[#BA4E29] flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100 mb-2">
              No matching wanted requests
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
              No requests match your current filters. Post what you need and let campus classmates reach out to you!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={clearFilters}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setIsPostWantedModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#BA4E29] text-white hover:bg-[#A34322] text-xs font-bold transition-colors cursor-pointer"
              >
                + Post What You Need
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
