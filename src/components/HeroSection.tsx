import React from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  ArrowRight, 
  PlusCircle, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Recycle, 
  MapPin, 
  Laptop, 
  PenTool, 
  Compass, 
  Home, 
  Tag
} from 'lucide-react';
import { Category } from '../types';

export const HeroSection: React.FC = () => {
  const { 
    setActiveTab, 
    setIsListItemModalOpen, 
    setSelectedCategory,
    listings 
  } = useCampus();

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    setActiveTab('marketplace');
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-[#E7E3DC] bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5] to-[#F5F2EB]">
      {/* Decorative background subtle grid & circles */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#153225]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[#BA4E29]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Vision, Headline, CTAs, Trust Pills */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E1EDE5] border border-[#C2DBCB] text-[#153225] text-xs font-bold tracking-wide uppercase mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#BA4E29]" />
              <span>Your campus. Your stuff. Your loop.</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif font-extrabold text-4xl sm:text-5xl xl:text-6xl text-[#153225] tracking-tight leading-[1.12] mb-6">
              Good stuff deserves <br className="hidden sm:block" />
              <span className="italic font-normal text-[#BA4E29]">another semester.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl font-normal leading-relaxed mb-8">
              Buy, sell, swap, and share student essentials within your campus community. 
              Sellers recover money from items they no longer need, juniors find affordable course gear, 
              and textbooks stay in circulation.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <button
                onClick={() => setActiveTab('marketplace')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#153225] hover:bg-[#1E4333] active:bg-[#10271D] text-white text-base font-semibold shadow-warm hover:shadow-warm-md transition-all group cursor-pointer"
              >
                <span>Explore marketplace</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setIsListItemModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 active:bg-stone-100 text-[#153225] border-2 border-[#153225] text-base font-semibold transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-[#BA4E29]" />
                <span>List an item</span>
              </button>
            </div>

            {/* Trust Badges - Honest student attributes without fake statistics */}
            <div className="pt-6 border-t border-[#DDD2C4]/70 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E1EDE5] text-[#153225] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">Made for campus life</p>
                  <p className="text-[11px] text-stone-500">Meet peers inside college grounds</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAECE6] text-[#BA4E29] flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">Student-friendly prices</p>
                  <p className="text-[11px] text-stone-500">Up to 70% off retail pricing</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#DDE7DF] text-emerald-800 flex items-center justify-center shrink-0">
                  <Recycle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">Reuse more, waste less</p>
                  <p className="text-[11px] text-stone-500">Pass gear batch-to-batch</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Designed Showcase Collage Preview featuring books, calculator, backpack, headphones */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Collage Frame */}
              <div className="bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#E7E3DC] shadow-warm-lg">
                
                {/* Collage Header Pill */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#153225]"></span>
                    <span className="text-xs font-serif font-bold text-stone-800">Campus Loop Spotlight</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                    Live Campus Feed
                  </span>
                </div>

                {/* 2x2 Curated Product Collage Grid */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Item 1: Textbook */}
                  <div 
                    onClick={() => setActiveTab('marketplace')}
                    className="group bg-[#FAF8F5] p-2.5 rounded-2xl border border-stone-200/80 hover:border-[#153225] transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-200 mb-2 relative">
                      <img 
                        src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80" 
                        alt="Engineering Maths" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-[#153225] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Textbook
                      </span>
                    </div>
                    <p className="font-serif font-bold text-xs text-stone-900 truncate">Engineering Maths</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-[#153225]">₹180</span>
                      <span className="text-[10px] text-stone-400 line-through">₹650</span>
                    </div>
                  </div>

                  {/* Item 2: Casio Calculator */}
                  <div 
                    onClick={() => setActiveTab('marketplace')}
                    className="group bg-[#FAF8F5] p-2.5 rounded-2xl border border-stone-200/80 hover:border-[#153225] transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-200 mb-2 relative">
                      <img 
                        src="https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=400&q=80" 
                        alt="Casio fx-991EX" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-[#BA4E29] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Casio
                      </span>
                    </div>
                    <p className="font-serif font-bold text-xs text-stone-900 truncate">fx-991EX Calculator</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-[#153225]">₹450</span>
                      <span className="text-[10px] text-stone-400 line-through">₹1295</span>
                    </div>
                  </div>

                  {/* Item 3: Backpack */}
                  <div 
                    onClick={() => setActiveTab('marketplace')}
                    className="group bg-[#FAF8F5] p-2.5 rounded-2xl border border-stone-200/80 hover:border-[#153225] transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-200 mb-2 relative">
                      <img 
                        src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80" 
                        alt="College Backpack" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-stone-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Hostel
                      </span>
                    </div>
                    <p className="font-serif font-bold text-xs text-stone-900 truncate">30L Tech Backpack</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-[#153225]">₹350</span>
                      <span className="text-[10px] text-stone-400 line-through">₹1200</span>
                    </div>
                  </div>

                  {/* Item 4: Wireless Headphones */}
                  <div 
                    onClick={() => setActiveTab('marketplace')}
                    className="group bg-[#FAF8F5] p-2.5 rounded-2xl border border-stone-200/80 hover:border-[#153225] transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-200 mb-2 relative">
                      <img 
                        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80" 
                        alt="Wireless Headphones" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-blue-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Audio
                      </span>
                    </div>
                    <p className="font-serif font-bold text-xs text-stone-900 truncate">boAt Rockerz 450</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-[#153225]">₹650</span>
                      <span className="text-[10px] text-stone-400 line-through">₹1499</span>
                    </div>
                  </div>

                </div>

                {/* Floating Micro-Badge */}
                <div className="mt-4 p-2.5 bg-[#FAF8F5] rounded-xl border border-stone-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[11px] font-medium text-stone-700">Verified exchange zone: Central Library</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-semibold">0 middleman fee</span>
                </div>

              </div>

              {/* Floating Testimonial/Tag Pill */}
              <div className="hidden sm:flex absolute -bottom-5 -right-4 bg-white border border-[#E7E3DC] shadow-warm px-3.5 py-2 rounded-xl items-center gap-2.5 animate-bounce-short">
                <span className="text-lg">🔄</span>
                <div>
                  <p className="text-xs font-bold text-[#153225]">Reuse over retail</p>
                  <p className="text-[10px] text-stone-500">Passing resources to the next batch</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Category Shortcuts Bar */}
        <div className="mt-14 pt-8 border-t border-[#DDD2C4]/70">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-stone-500">
              Browse by Campus Category
            </h2>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="text-xs font-semibold text-[#BA4E29] hover:underline"
            >
              View all listings &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {[
              { name: 'Textbooks', icon: <BookOpen className="w-4 h-4 text-emerald-800" />, desc: 'BCA & Course Books' },
              { name: 'Electronics', icon: <Laptop className="w-4 h-4 text-blue-800" />, desc: 'Keyboards & Audio' },
              { name: 'Stationery', icon: <PenTool className="w-4 h-4 text-amber-800" />, desc: 'Kits & Notebooks' },
              { name: 'Study essentials', icon: <Compass className="w-4 h-4 text-purple-800" />, desc: 'Calculators & Stands' },
              { name: 'Hostel essentials', icon: <Home className="w-4 h-4 text-orange-800" />, desc: 'Lamps & Storage' },
              { name: 'Other', icon: <Tag className="w-4 h-4 text-stone-700" />, desc: 'All Student Gear' },
            ].map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name as Category)}
                className="flex flex-col items-start p-3 rounded-xl bg-white hover:bg-[#F5F2EB] border border-[#E7E3DC] hover:border-[#153225]/40 text-left transition-all group shadow-xs cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-[#FAF8F5] group-hover:bg-white mb-2 transition-colors">
                  {cat.icon}
                </div>
                <span className="text-xs font-bold text-stone-900 group-hover:text-[#153225]">
                  {cat.name}
                </span>
                <span className="text-[10px] text-stone-500 mt-0.5">
                  {cat.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
