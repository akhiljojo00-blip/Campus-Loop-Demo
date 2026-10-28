import React, { useState, useMemo } from 'react';
import { useCampus } from '../context/CampusContext';
import { ProductCard } from './ProductCard';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  RotateCcw, 
  MapPin,
  PlusCircle,
  Compass
} from 'lucide-react';
import { Category, Condition, SortOption } from '../types';

export const MarketplaceView: React.FC = () => {
  const { 
    listings, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    selectedCondition, 
    setSelectedCondition, 
    selectedSort, 
    setSelectedSort, 
    selectedCampusZone,
    setSelectedCampusZone,
    clearAllFilters,
    setIsListItemModalOpen,
    setActiveTab,
    userCoords
  } = useCampus();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories: (Category | 'All')[] = [
    'All',
    'Textbooks',
    'Electronics',
    'Stationery',
    'Study essentials',
    'Hostel essentials',
    'College essentials',
    'Other'
  ];

  const campusZones = [
    'All',
    'Central Library Steps',
    'Block C Computer Lab',
    'Science Quad Cafeteria',
    'Biochemistry / Science Wing',
    'Hostel Block 3 Common Room',
    'Student Activity Center',
    'Engineering Drawing Hall'
  ];

  // Filtering & Sorting computation
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Search query: title, description, category, tags
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.campusLocation.toLowerCase().includes(q) ||
        item.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Condition filter
    if (selectedCondition !== 'All') {
      result = result.filter(item => item.condition === selectedCondition);
    }

    // Campus location filter
    if (selectedCampusZone !== 'All') {
      result = result.filter(item => item.campusLocation.toLowerCase().includes(selectedCampusZone.toLowerCase()));
    }

    // Sorting
    result.sort((a, b) => {
      // Pinned / Boosted items first
      if (a.isBoosted && !b.isBoosted) return -1;
      if (!a.isBoosted && b.isBoosted) return 1;

      if (selectedSort === 'price-low') {
        return (a.agreedPrice || a.price) - (b.agreedPrice || b.price);
      }
      if (selectedSort === 'price-high') {
        return (b.agreedPrice || b.price) - (a.agreedPrice || a.price);
      }
      if (selectedSort === 'savings') {
        const savingsA = (a.originalPrice || a.price) - (a.agreedPrice || a.price);
        const savingsB = (b.originalPrice || b.price) - (b.agreedPrice || b.price);
        return savingsB - savingsA;
      }
      if (selectedSort === 'nearest' && userCoords) {
        const distA = Math.hypot((a.coordinates?.lat || 28.545) - userCoords.lat, (a.coordinates?.lng || 77.192) - userCoords.lng);
        const distB = Math.hypot((b.coordinates?.lat || 28.545) - userCoords.lat, (b.coordinates?.lng || 77.192) - userCoords.lng);
        return distA - distB;
      }
      // 'newest' default
      return b.timestamp - a.timestamp;
    });

    return result;
  }, [listings, searchQuery, selectedCategory, selectedCondition, selectedSort, selectedCampusZone, userCoords]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedCondition !== 'All' || selectedSort !== 'newest' || selectedCampusZone !== 'All';

  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5] dark:bg-[#0D1C15] min-h-[85vh] transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Marketplace Title & Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E7E3DC] dark:border-emerald-900/60">
          <div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#153225] dark:text-[#FAF8F5]">
              Campus Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
              Affordable textbooks, electronics, drawing kits & essentials listed by your college peers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('map')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-emerald-900/80 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 shadow-xs transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Campus Map View</span>
            </button>

            <button
              onClick={() => setIsListItemModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#153225] dark:bg-emerald-700 hover:bg-[#1E4333] text-white text-xs sm:text-sm font-semibold shadow-warm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>+ List an item</span>
            </button>
          </div>
        </div>

        {/* Search, Filter & Sort Controls Bar */}
        <div className="bg-white dark:bg-[#14231D] rounded-2xl border border-[#E7E3DC] dark:border-emerald-900/60 shadow-warm p-4 sm:p-5 mb-8 transition-colors">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Search Input Bar (Col 4) */}
            <div className="md:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="marketplace-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search textbooks, Casio fx-991, lab coat..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-900/80 focus:border-[#153225] dark:focus:border-emerald-400 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 bg-[#FAF8F5]/50 dark:bg-stone-900/50 focus:bg-white dark:focus:bg-stone-900 transition-all outline-none"
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

            {/* Campus Zone Filter (Col 3) */}
            <div className="hidden sm:block md:col-span-3">
              <select
                value={selectedCampusZone}
                onChange={(e) => setSelectedCampusZone(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 focus:border-[#153225] text-xs text-stone-800 dark:text-stone-200 bg-[#FAF8F5]/50 dark:bg-stone-900/50 outline-none cursor-pointer"
              >
                <option value="All">📍 All Campus Landmarks</option>
                {campusZones.slice(1).map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            {/* Condition Filter (Col 2) */}
            <div className="hidden sm:block md:col-span-2">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value as Condition | 'All')}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 focus:border-[#153225] text-xs text-stone-800 dark:text-stone-200 bg-[#FAF8F5]/50 dark:bg-stone-900/50 outline-none cursor-pointer"
              >
                <option value="All">All Conditions</option>
                <option value="Like New">Like New (Mint)</option>
                <option value="Good condition">Good Condition</option>
                <option value="Well used">Well Used (Fair)</option>
              </select>
            </div>

            {/* Sort Dropdown (Col 3) */}
            <div className="hidden sm:block md:col-span-3">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as SortOption)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 dark:border-emerald-900/80 focus:border-[#153225] text-xs text-stone-800 dark:text-stone-200 bg-[#FAF8F5]/50 dark:bg-stone-900/50 outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest Listed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="savings">Highest Student Savings</option>
                <option value="nearest">Nearest Location First</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex sm:hidden items-center justify-between gap-2 pt-1">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-[#FAF8F5] dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-200"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters & Landmarks</span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
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
                  Campus Landmark
                </label>
                <select
                  value={selectedCampusZone}
                  onChange={(e) => setSelectedCampusZone(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-900 dark:text-white"
                >
                  <option value="All">All Campus Landmarks</option>
                  {campusZones.slice(1).map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">
                  Item Condition
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value as Condition | 'All')}
                  className="w-full py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-900 dark:text-white"
                >
                  <option value="All">All Conditions</option>
                  <option value="Like New">Like New (Mint)</option>
                  <option value="Good condition">Good Condition</option>
                  <option value="Well used">Well Used (Fair)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">
                  Sort Order
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as SortOption)}
                  className="w-full py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-900 dark:text-white"
                >
                  <option value="newest">Sort: Newest Listed</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="savings">Highest Student Savings</option>
                  <option value="nearest">Nearest Location First</option>
                </select>
              </div>
            </div>
          )}

          {/* Category Horizontal Scroll Pills */}
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

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-stone-500 dark:text-stone-400 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 dark:text-stone-200">
              Showing {filteredListings.length} {filteredListings.length === 1 ? 'item' : 'items'}
            </span>
            {selectedCategory !== 'All' && (
              <span className="bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                in {selectedCategory}
              </span>
            )}
            {selectedCampusZone !== 'All' && (
              <span className="bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#BA4E29]" />
                {selectedCampusZone}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#BA4E29] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Product Grid Area */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredListings.map((item) => (
              <ProductCard key={item.id} listing={item} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-[#14231D] rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-warm">
            <div className="w-16 h-16 rounded-2xl bg-[#FAECE6] dark:bg-orange-950/60 text-[#BA4E29] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100 mb-2">
              No campus listings found
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
              We couldn’t find any items matching your selected criteria. Try resetting filters or post what you need on the Wanted Board!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={clearAllFilters}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setIsListItemModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#153225] text-white hover:bg-[#1E4333] text-xs font-bold transition-colors cursor-pointer"
              >
                + List an item now
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
