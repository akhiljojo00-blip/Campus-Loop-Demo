import React, { useState, useMemo } from 'react';
import { useCampus } from '../context/CampusContext';
import { ProductCard } from './ProductCard';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  RotateCcw, 
  ArrowUpDown, 
  BookOpen, 
  Laptop, 
  PenTool, 
  Compass, 
  Home, 
  ShieldCheck, 
  Tag,
  PlusCircle,
  Filter
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
    clearAllFilters,
    setIsListItemModalOpen
  } = useCampus();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available categories with visual indicators
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

  const conditions: (Condition | 'All')[] = [
    'All',
    'Like New',
    'Good condition',
    'Well used'
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

    // Sorting
    result.sort((a, b) => {
      if (selectedSort === 'price-low') {
        return a.price - b.price;
      }
      if (selectedSort === 'price-high') {
        return b.price - a.price;
      }
      if (selectedSort === 'savings') {
        const savingsA = (a.originalPrice || a.price) - a.price;
        const savingsB = (b.originalPrice || b.price) - b.price;
        return savingsB - savingsA;
      }
      // 'newest' default
      return b.timestamp - a.timestamp;
    });

    return result;
  }, [listings, searchQuery, selectedCategory, selectedCondition, selectedSort]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedCondition !== 'All' || selectedSort !== 'newest';

  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5] min-h-[85vh]">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Marketplace Title & Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E7E3DC]">
          <div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#153225]">
              Campus Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Affordable textbooks, electronics, drawing kits & essentials listed by your college peers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsListItemModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#153225] hover:bg-[#1E4333] text-white text-xs sm:text-sm font-semibold shadow-warm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>+ List an item</span>
            </button>
          </div>
        </div>

        {/* Search, Filter & Sort Controls Bar */}
        <div className="bg-white rounded-2xl border border-[#E7E3DC] shadow-warm p-4 sm:p-5 mb-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Search Input Bar (Col 6) */}
            <div className="md:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="marketplace-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search textbooks, Casio fx-991, lab coat, keyboard..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 focus:border-[#153225] focus:ring-2 focus:ring-[#153225]/15 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 bg-[#FAF8F5]/50 focus:bg-white transition-all outline-none"
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

            {/* Condition Filter (Col 3) */}
            <div className="hidden sm:block md:col-span-3">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value as Condition | 'All')}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 focus:border-[#153225] text-xs sm:text-sm text-stone-800 bg-[#FAF8F5]/50 focus:bg-white outline-none cursor-pointer"
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
                className="w-full py-2.5 px-3 rounded-xl border border-stone-200 focus:border-[#153225] text-xs sm:text-sm text-stone-800 bg-[#FAF8F5]/50 focus:bg-white outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest Listed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="savings">Highest Student Savings</option>
              </select>
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="flex sm:hidden items-center justify-between gap-2 pt-1">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-stone-200 bg-[#FAF8F5] text-xs font-semibold text-stone-700"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters & Sort</span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="py-2 px-3 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

          </div>

          {/* Mobile Expandable Filter Sheet */}
          {mobileFilterOpen && (
            <div className="sm:hidden mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 gap-3 animate-in fade-in duration-150">
              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase block mb-1">
                  Item Condition
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value as Condition | 'All')}
                  className="w-full py-2 px-3 rounded-lg border border-stone-200 text-xs bg-white"
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
                  className="w-full py-2 px-3 rounded-lg border border-stone-200 text-xs bg-white"
                >
                  <option value="newest">Sort: Newest Listed</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="savings">Highest Student Savings</option>
                </select>
              </div>
            </div>
          )}

          {/* Category Horizontal Scroll Pills */}
          <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#153225] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Metadata Bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-stone-500 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">
              Showing {filteredListings.length} {filteredListings.length === 1 ? 'item' : 'items'}
            </span>
            {selectedCategory !== 'All' && (
              <span className="bg-[#E1EDE5] text-[#153225] px-2 py-0.5 rounded-full text-[11px] font-semibold">
                in {selectedCategory}
              </span>
            )}
            {selectedCondition !== 'All' && (
              <span className="bg-stone-200/70 text-stone-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                {selectedCondition}
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
          /* Thoughtful Empty State */
          <div className="bg-white rounded-3xl border border-[#E7E3DC] p-10 sm:p-14 text-center max-w-lg mx-auto shadow-warm">
            <div className="w-16 h-16 rounded-2xl bg-[#FAECE6] text-[#BA4E29] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900 mb-2">
              No campus listings found
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed mb-6">
              We couldn’t find any items matching "{searchQuery || selectedCategory || selectedCondition}". 
              Try adjusting your search terms or be the first classmate to list this item!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={clearAllFilters}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setIsListItemModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#153225] text-white hover:bg-[#1E4333] text-xs font-bold transition-colors cursor-pointer"
              >
                + List this item now
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
