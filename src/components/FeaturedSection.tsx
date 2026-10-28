import React from 'react';
import { useCampus } from '../context/CampusContext';
import { ProductCard } from './ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FeaturedSection: React.FC = () => {
  const { listings, setActiveTab, setSelectedCategory } = useCampus();

  const featuredListings = listings.filter(item => item.isFeatured || item.isBoosted).slice(0, 4);

  return (
    <section className="py-14 sm:py-18 bg-[#FAF8F5] dark:bg-[#0D1C15] border-b border-[#E7E3DC] dark:border-emerald-900/60 transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1EDE5] dark:bg-emerald-950 text-[#153225] dark:text-emerald-300 text-xs font-bold tracking-wide uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#BA4E29]" />
              <span>Campus Curated</span>
            </div>
            <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#153225] dark:text-[#FAF8F5] tracking-tight">
              Featured Student Listings
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
              High-utility course material, calculators, and electronics listed by peers ready for immediate campus pickup.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCategory('All');
              setActiveTab('marketplace');
            }}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#BA4E29] hover:text-[#9B3F1F] transition-colors group self-start md:self-auto cursor-pointer"
          >
            <span>View all {listings.length} campus items</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredListings.map((item) => (
            <ProductCard key={item.id} listing={item} />
          ))}
        </div>

      </div>
    </section>
  );
};
