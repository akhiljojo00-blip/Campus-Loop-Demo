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
  ShieldCheck,
  Flame,
  Star,
  Zap
} from 'lucide-react';
import { calculateHaversineDistance, formatDistance } from '../lib/location';

interface ProductCardProps {
  listing: Listing;
}

export const ProductCard: React.FC<ProductCardProps> = ({ listing }) => {
  const { 
    setSelectedProduct, 
    toggleSaveItem, 
    isItemSaved,
    getSellerProfile,
    setSelectedSellerProfile,
    userCoords,
    setIsPromoteModalOpen,
    setPromotingTarget
  } = useCampus();

  const [imageError, setImageError] = useState(false);
  const saved = isItemSaved(listing.id);
  const sellerProfile = getSellerProfile(listing.sellerName);

  const distanceKm = (userCoords && listing.coordinates)
    ? calculateHaversineDistance(userCoords.lat, userCoords.lng, listing.coordinates.lat, listing.coordinates.lng)
    : null;
  const distanceBadge = distanceKm !== null ? formatDistance(distanceKm) : null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Textbooks': return <BookOpen className="w-8 h-8 text-emerald-800 dark:text-emerald-300" />;
      case 'Electronics': return <Laptop className="w-8 h-8 text-blue-800 dark:text-blue-300" />;
      case 'Stationery': return <PenTool className="w-8 h-8 text-amber-800 dark:text-amber-300" />;
      case 'Study essentials': return <Compass className="w-8 h-8 text-purple-800 dark:text-purple-300" />;
      case 'Hostel essentials': return <Home className="w-8 h-8 text-orange-800 dark:text-orange-300" />;
      case 'College essentials': return <ShieldCheck className="w-8 h-8 text-teal-800 dark:text-teal-300" />;
      default: return <Tag className="w-8 h-8 text-stone-700 dark:text-stone-300" />;
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Like New':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Good condition':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700';
    }
  };

  const savingsPercent = listing.originalPrice 
    ? Math.round(((listing.originalPrice - (listing.agreedPrice || listing.price)) / listing.originalPrice) * 100)
    : 0;

  return (
    <article 
      onClick={() => setSelectedProduct(listing)}
      className="group perspective-card relative flex flex-col bg-white dark:bg-[#14231D] rounded-3xl border border-[#E7E3DC] dark:border-emerald-900/60 hover:border-[#153225]/40 dark:hover:border-emerald-500/40 shadow-warm hover:shadow-warm-md transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1.5"
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-4/3 bg-[#F4EFEA] dark:bg-stone-900 overflow-hidden">
        {!imageError ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#FAF8F5] to-[#E8EFEA] dark:from-stone-900 dark:to-stone-800 text-center">
            {getCategoryIcon(listing.category)}
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 mt-2">{listing.category}</span>
            <span className="text-[10px] text-stone-400">Campus Market Item</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center z-10">
          {listing.isBoosted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs animate-pulse">
              <Flame className="w-3 h-3" /> Boosted
            </span>
          )}

          {listing.isFeatured && !listing.isBoosted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#153225] dark:bg-emerald-800 text-[#FAF8F5] text-[10px] font-bold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" /> Featured
            </span>
          )}

          {listing.isUserListing ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#BA4E29] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
              Your Listing
            </span>
          ) : listing.isDemoListing ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-medium tracking-wide border border-stone-300/70 dark:border-stone-700">
              Demo Sample
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
              <ShieldCheck className="w-3 h-3" /> Live Campus
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
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 shadow-xs cursor-pointer ${
            saved
              ? 'bg-[#BA4E29] text-white'
              : 'bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 hover:text-[#BA4E29] hover:bg-white'
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

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Location Header */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1.5">
            <span className="font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
              {listing.category}
            </span>
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 truncate max-w-[160px]">
              <span className="flex items-center gap-1 truncate" title={listing.campusLocation}>
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="truncate">{listing.campusLocation}</span>
              </span>
              {distanceBadge && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[9px] shrink-0">
                  {distanceBadge}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base leading-snug line-clamp-1 group-hover:text-[#153225] dark:group-hover:text-emerald-300 transition-colors">
            {listing.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-1.5 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Price & Footer Meta */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-emerald-900/40 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-extrabold text-lg text-[#153225] dark:text-emerald-300">
                ₹{listing.agreedPrice || listing.price}
              </span>
              {listing.originalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{listing.originalPrice}
                </span>
              )}
            </div>
            {listing.agreedPrice && (
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                Agreed in Bargain
              </span>
            )}
            <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
              <Clock className="w-2.5 h-2.5" />
              <span>{listing.dateListed}</span>
            </div>
          </div>

          {/* Seller Pill with Rating Click */}
          <div className="text-right">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSellerProfile(sellerProfile);
              }}
              className="flex items-center justify-end gap-1 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-[#BA4E29] transition-colors cursor-pointer"
              title="View seller profile & reviews"
            >
              <User className="w-3 h-3 text-stone-400" />
              <span className="truncate max-w-[85px]">{listing.sellerName.split(' ')[0]}</span>
              <span className="text-[11px] text-amber-500 font-bold flex items-center">
                ★ {sellerProfile.averageRating}
              </span>
            </button>
            {listing.isUserListing ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPromotingTarget({
                    type: 'listing',
                    id: listing.id,
                    title: listing.title,
                    category: listing.category
                  });
                  setIsPromoteModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-[10px] font-bold transition-colors cursor-pointer"
                title="Promote / Boost listing"
              >
                <Zap className="w-2.5 h-2.5 text-amber-600" />
                <span>Promote ₹3</span>
              </button>
            ) : (
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                Direct Campus Pickup
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
