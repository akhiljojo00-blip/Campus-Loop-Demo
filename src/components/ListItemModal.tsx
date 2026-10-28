import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Tag, 
  MapPin, 
  User, 
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';
import { Category, Condition, ContactPreference, Listing } from '../types';
import { SAMPLE_PRESET_IMAGES } from '../data/seedListings';

export const ListItemModal: React.FC = () => {
  const { 
    isListItemModalOpen, 
    setIsListItemModalOpen, 
    addListing, 
    setSelectedProduct,
    setActiveTab 
  } = useCampus();

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState<Category>('Textbooks');
  const [condition, setCondition] = useState<Condition>('Good condition');
  const [description, setDescription] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerDepartment, setSellerDepartment] = useState('1st Year BCA');
  const [campusLocation, setCampusLocation] = useState('Central Library Lobby');
  const [contactPreference, setContactPreference] = useState<ContactPreference>('Campus Chat');
  const [imageUrl, setImageUrl] = useState(SAMPLE_PRESET_IMAGES[0].url);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdListing, setCreatedListing] = useState<Listing | null>(null);

  if (!isListItemModalOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.';
    } else if (title.trim().length > 70) {
      errs.title = 'Title cannot exceed 70 characters.';
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      errs.price = 'Please enter a valid price in ₹ greater than 0.';
    } else if (numPrice > 50000) {
      errs.price = 'Price exceeds maximum reasonable student listing limit.';
    }

    if (originalPrice) {
      const orig = Number(originalPrice);
      if (isNaN(orig) || orig < numPrice) {
        errs.originalPrice = 'Original retail price should be higher than campus used price.';
      }
    }

    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Please write a brief description (at least 10 characters).';
    } else if (description.trim().length > 500) {
      errs.description = 'Description cannot exceed 500 characters.';
    }

    if (!sellerName.trim() || sellerName.trim().length < 2) {
      errs.sellerName = 'Please provide your first name or display name.';
    }

    if (!campusLocation.trim() || campusLocation.trim().length < 3) {
      errs.campusLocation = 'Specify a convenient campus pickup location.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newListing = addListing({
        title: title.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        category,
        condition,
        description: description.trim(),
        conditionNotes: conditionNotes.trim() || undefined,
        sellerName: sellerName.trim(),
        sellerDepartment: sellerDepartment.trim(),
        campusLocation: campusLocation.trim(),
        contactPreference,
        imageUrl: imageUrl.trim() || SAMPLE_PRESET_IMAGES[0].url,
        tags: [category, condition, 'StudentListing'],
      });

      setIsSubmitting(false);
      setCreatedListing(newListing);
    }, 400);
  };

  const handleResetForm = () => {
    setTitle('');
    setPrice('');
    setOriginalPrice('');
    setDescription('');
    setConditionNotes('');
    setErrors({});
    setCreatedListing(null);
  };

  const handleClose = () => {
    handleResetForm();
    setIsListItemModalOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#E7E3DC] shadow-warm-lg overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#153225] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white">
                List an Item on CampusLoop
              </h2>
              <p className="text-[11px] text-[#FAF8F5]/80">
                Help a junior, clear your hostel desk, and recover money
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto">
          
          {createdListing ? (
            /* Success Confirmation State */
            <div className="text-center py-6 sm:py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Listing Published (Demo Session)
              </span>
              <h3 className="font-serif font-bold text-2xl text-stone-900 mt-3 mb-2">
                "{createdListing.title}" is Live!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed mb-6">
                Your listing has been saved to your browser’s localStorage and added to the top of the Campus Marketplace with a <strong>Demo Listing</strong> badge.
              </p>

              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-stone-200 max-w-sm mx-auto mb-8 text-left text-xs">
                <div className="flex justify-between font-semibold text-stone-800 mb-1">
                  <span>Price: ₹{createdListing.price}</span>
                  <span className="text-emerald-800">{createdListing.category}</span>
                </div>
                <p className="text-stone-500 text-[11px]">
                  Pickup location: {createdListing.campusLocation}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedProduct(createdListing);
                    setIsListItemModalOpen(false);
                    handleResetForm();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#153225] text-white text-xs font-bold hover:bg-[#1E4333] transition-colors cursor-pointer"
                >
                  View My Listing
                </button>

                <button
                  onClick={() => {
                    setActiveTab('marketplace');
                    setIsListItemModalOpen(false);
                    handleResetForm();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Subtle prototype notice */}
              <div className="p-3 rounded-xl bg-[#F5F2EB] border border-[#DDD2C4] flex items-center gap-2.5 text-xs text-stone-600">
                <Info className="w-4 h-4 text-[#BA4E29] shrink-0" />
                <span>
                  Demo Mode: This listing is saved locally in your browser to demonstrate the campus product flow.
                </span>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Higher Engineering Mathematics by B.S. Grewal"
                  className={`w-full py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-white focus:outline-none transition-all ${
                    errors.title ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-stone-200 focus:border-[#153225]'
                  }`}
                  maxLength={70}
                />
                <div className="flex justify-between text-[11px] mt-1 text-stone-400">
                  <span>{errors.title && <span className="text-red-600 font-medium">{errors.title}</span>}</span>
                  <span>{title.length}/70</span>
                </div>
              </div>

              {/* Category & Condition Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full py-2.5 px-3 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 bg-white focus:border-[#153225] outline-none cursor-pointer"
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
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                    Condition *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as Condition)}
                    className="w-full py-2.5 px-3 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 bg-white focus:border-[#153225] outline-none cursor-pointer"
                  >
                    <option value="Like New">Like New (Mint)</option>
                    <option value="Good condition">Good condition (Standard wear)</option>
                    <option value="Well used">Well used (Functional, pencil notes)</option>
                  </select>
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                    Your Price in ₹ *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 180"
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-white focus:outline-none ${
                        errors.price ? 'border-red-500' : 'border-stone-200 focus:border-[#153225]'
                      }`}
                      min={1}
                    />
                  </div>
                  {errors.price && <p className="text-[11px] text-red-600 mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                    Original Retail Price in ₹ (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="e.g. 650 (shows savings)"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 bg-white focus:border-[#153225] outline-none"
                      min={1}
                    />
                  </div>
                  {errors.originalPrice && <p className="text-[11px] text-red-600 mt-1">{errors.originalPrice}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                  Item Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention edition, semester syllabus relevance, whether CD/accessories are included, and general condition."
                  rows={3}
                  className={`w-full py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-white focus:outline-none ${
                    errors.description ? 'border-red-500' : 'border-stone-200 focus:border-[#153225]'
                  }`}
                  maxLength={500}
                />
                <div className="flex justify-between text-[11px] mt-1 text-stone-400">
                  <span>{errors.description && <span className="text-red-600 font-medium">{errors.description}</span>}</span>
                  <span>{description.length}/500</span>
                </div>
              </div>

              {/* Photo Selector with 6 presets */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1.5">
                  Item Photo
                </label>
                <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[11px] text-stone-500 shrink-0 font-medium">Click Preset:</span>
                  {SAMPLE_PRESET_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setImageUrl(preset.url)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border shrink-0 transition-colors cursor-pointer ${
                        imageUrl === preset.url
                          ? 'bg-[#153225] text-white border-[#153225]'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = SAMPLE_PRESET_IMAGES[0].url;
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste any custom image URL"
                    className="flex-1 py-2 px-3 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white focus:border-[#153225] outline-none"
                  />
                </div>
              </div>

              {/* Seller details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="e.g. Rohan V."
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 text-xs text-stone-900 bg-white focus:border-[#153225] outline-none"
                  />
                  {errors.sellerName && <p className="text-[10px] text-red-600 mt-0.5">{errors.sellerName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                    Department / Year
                  </label>
                  <input
                    type="text"
                    value={sellerDepartment}
                    onChange={(e) => setSellerDepartment(e.target.value)}
                    placeholder="e.g. 1st Year BCA"
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 text-xs text-stone-900 bg-white focus:border-[#153225] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                    Campus Pickup Spot *
                  </label>
                  <input
                    type="text"
                    value={campusLocation}
                    onChange={(e) => setCampusLocation(e.target.value)}
                    placeholder="e.g. Central Library Steps"
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 text-xs text-stone-900 bg-white focus:border-[#153225] outline-none"
                  />
                  {errors.campusLocation && <p className="text-[10px] text-red-600 mt-0.5">{errors.campusLocation}</p>}
                </div>
              </div>

              {/* Contact preference */}
              <div>
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">
                  Exchange Contact Preference
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Campus Chat', 'WhatsApp', 'Meet at Library'] as ContactPreference[]).map((pref) => (
                    <button
                      type="button"
                      key={pref}
                      onClick={() => setContactPreference(pref)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors cursor-pointer ${
                        contactPreference === pref
                          ? 'bg-[#153225] text-white border-[#153225]'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#153225] hover:bg-[#1E4333] text-white text-xs font-bold shadow-warm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Publishing to Campus Loop...</span>
                  ) : (
                    <>
                      <span>Publish Demo Listing</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
