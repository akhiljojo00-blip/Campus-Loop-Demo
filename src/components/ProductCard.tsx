import React, { useState } from 'react';
import { Listing } from '../types';
import { useCampus } from '../context/CampusContext';
import { 
  Bookmark, 
  MapPin, 
  Sparkles, 
  Tag, 
  User, 
  Clock, 
  BookOpen, 
  Laptop, 
  PenTool, 
  Compass, 
  Home, 
  ShieldCheck 
} from 'lucide-react';

interface ProductCardProps {
  listing: Listing;
}

export const ProductCard: React.FC<ProductCardProps> = ({ listing }) => {
  const { setSelectedProduct, toggleSaveItem, isItemSaved } = useCampus();
  const [imageError, setImageError] = useState(false);
  const saved = isItemSaved(listing.id);

  // Category visual icon fallback
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Textbooks': return <BookOpen className="w-8 h-8 text-emerald-800" />;
      case 'Electronics': return <Laptop className="w-8 h-8 text-blue-800" />;
      case 'Stationery': return <PenTool className="w-8 h-8 text-amber-800" />;
      case 'Study essentials': return <Compass className="w-8 h-8 text-purple-800" />;
      case 'Hostel essentials': return <Home className="w-8 h-8 text-orange-800" />;
      case 'College essentials': return <ShieldCheck className="w-8 h-8 text-teal-800" />;
      default: return <Tag className="w-8 h-8 text-stone-700" />;
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Like New':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Good condition':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const savingsPercent = listing.originalPrice 
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : 0;

  return (
    <article 
      onClick={() => setSelectedProduct(listing)}
      className="group relative flex flex-col bg-white rounded-2xl border border-[#E7E3DC] hover:border-[#153225]/40 shadow-warm hover:shadow-warm-md transition-all duration-200 cursor-pointer overflow-hidden transform hover:-translate-y-1"
    >
      {/* Product Image Area with Fallback */}
      <div className="relative w-full aspect-4/3 bg-[#F4EFEA] overflow-hidden">
        {!imageError ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#FAF8F5] to-[#E8EFEA] text-center">
            {getCategoryIcon(listing.category)}
            <span className="text-xs font-semibold text-stone-600 mt-2">{listing.category}</span>
            <span className="text-[10px] text-stone-400">CampusLoop Item</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center z-10">
          {listing.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#153225] text-[#FAF8F5] text-[10px] font-bold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" /> Featured
            </span>
          )}

          {listing.isUserListing && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#BA4E29] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
              Demo listing
            </span>
          )}

          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getConditionColor(listing.condition)} backdrop-blur-xs`}>
            {listing.condition}
          </span>
        </div>

        {/* Save / Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveItem(listing.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 shadow-xs ${
            saved
              ? 'bg-[#BA4E29] text-white'
              : 'bg-white/90 text-stone-600 hover:text-[#BA4E29] hover:bg-white'
          }`}
          title={saved ? 'Remove from saved' : 'Save item'}
          aria-label={saved ? 'Remove from saved' : 'Save item'}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {/* Savings Badge */}
        {savingsPercent > 0 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
            Save {savingsPercent}%
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Location Header */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
            <span className="font-semibold text-emerald-800 uppercase tracking-wide">
              {listing.category}
            </span>
            <span className="flex items-center gap-1 text-stone-500 truncate max-w-[140px]" title={listing.campusLocation}>
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate">{listing.campusLocation}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-stone-900 text-base leading-snug line-clamp-1 group-hover:text-[#153225] transition-colors">
            {listing.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Price & Footer Meta */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-extrabold text-lg text-[#153225]">
                ₹{listing.price}
              </span>
              {listing.originalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{listing.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
              <Clock className="w-2.5 h-2.5" />
              <span>{listing.dateListed}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-xs font-medium text-stone-700">
              <User className="w-3 h-3 text-stone-400" />
              <span className="truncate max-w-[90px]">{listing.sellerName.split(' ')[0]}</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block">
              Direct Campus Pickup
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
