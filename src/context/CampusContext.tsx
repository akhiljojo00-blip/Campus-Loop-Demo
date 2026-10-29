import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Listing, 
  Category, 
  Condition, 
  ReportReason, 
  SortOption,
  WantedRequest,
  WantedOffer,
  BargainOffer,
  OfferStatus,
  ExchangeRecord,
  ProductReview,
  SellerProfileData,
  CoinTransaction,
  LiveLocationSession
} from '../types';
import { INITIAL_SEED_LISTINGS } from '../data/seedListings';
import { INITIAL_SEED_WANTED } from '../data/seedWanted';
import { INITIAL_SEED_REVIEWS, INITIAL_SELLER_PROFILES } from '../data/seedReviews';

const STORAGE_KEY_LISTINGS = 'campusloop_listings_v2';
const STORAGE_KEY_SAVED = 'campusloop_saved_items_v2';
const STORAGE_KEY_USER_LISTINGS = 'campusloop_user_listings_v2';
const STORAGE_KEY_WANTED = 'campusloop_wanted_v2';
const STORAGE_KEY_OFFERS = 'campusloop_offers_v2';
const STORAGE_KEY_REVIEWS = 'campusloop_reviews_v2';
const STORAGE_KEY_COINS = 'campusloop_coins_v2';
const STORAGE_KEY_THEME = 'campusloop_theme_v2';

interface CampusContextType {
  listings: Listing[];
  savedItemIds: string[];
  userListingIds: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (cat: Category | 'All') => void;
  selectedCondition: Condition | 'All';
  setSelectedCondition: (cond: Condition | 'All') => void;
  selectedSort: SortOption;
  setSelectedSort: (sort: SortOption) => void;
  selectedCampusZone: string;
  setSelectedCampusZone: (zone: string) => void;
  
  // Backend & Loading State
  isDataLoading: boolean;
  refreshBackendData: () => Promise<void>;

  // Theme Toggle (Light / Dark)
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Modals & Panels
  isListItemModalOpen: boolean;
  setIsListItemModalOpen: (open: boolean) => void;
  isPostWantedModalOpen: boolean;
  setIsPostWantedModalOpen: (open: boolean) => void;
  selectedProduct: Listing | null;
  setSelectedProduct: (product: Listing | null) => void;
  contactingProduct: Listing | null;
  setContactingProduct: (product: Listing | null) => void;
  reportingProduct: Listing | null;
  setReportingProduct: (product: Listing | null) => void;
  isProfileDrawerOpen: boolean;
  setIsProfileDrawerOpen: (open: boolean) => void;
  isResetConfirmOpen: boolean;
  setIsResetConfirmOpen: (open: boolean) => void;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  reviewingTarget: { sellerName: string; itemTitle: string; category: Category; exchangeId: string } | null;
  setReviewingTarget: (target: { sellerName: string; itemTitle: string; category: Category; exchangeId: string } | null) => void;
  selectedSellerProfile: SellerProfileData | null;
  setSelectedSellerProfile: (profile: SellerProfileData | null) => void;
  selectedWantedRequest: WantedRequest | null;
  setSelectedWantedRequest: (req: WantedRequest | null) => void;

  // Feature 1: Wanted Board
  wantedRequests: WantedRequest[];
  addWantedRequest: (reqData: Omit<WantedRequest, 'id' | 'createdAt' | 'datePosted' | 'status' | 'offers' | 'isUserRequest' | 'isDemoRequest'>) => Promise<WantedRequest>;
  submitWantedOffer: (requestId: string, proposedPrice: number, message: string, listingId?: string) => void;
  acceptWantedOffer: (requestId: string, offerId: string) => void;
  markRequestFulfilled: (requestId: string) => Promise<void>;

  // Feature 2: Bargaining & Offers
  bargainOffers: BargainOffer[];
  exchanges: ExchangeRecord[];
  makeOffer: (listingId: string, offeredPrice: number, message: string) => Promise<BargainOffer | null>;
  respondToOffer: (offerId: string, action: 'accept' | 'reject' | 'counter', counterPrice?: number, message?: string) => Promise<void>;
  cancelOffer: (offerId: string) => Promise<void>;
  getOfferForListing: (listingId: string) => BargainOffer | undefined;
  confirmExchange: (exchangeId: string) => Promise<void>;

  // Feature 3: Ratings & Reviews
  reviews: ProductReview[];
  completedExchangeIds: string[];
  addReview: (sellerName: string, itemTitle: string, itemCategory: Category, rating: number, comment: string, exchangeId: string) => void;
  reportReview: (reviewId: string) => void;
  getSellerReviews: (sellerName: string) => ProductReview[];
  getSellerProfile: (sellerName: string) => SellerProfileData;

  // Feature 4: LoopCoins Virtual Rewards
  loopCoinsBalance: number;
  coinTransactions: CoinTransaction[];
  earnCoins: (amount: number, reason: string) => void;
  spendCoins: (amount: number, reason: string) => boolean;
  boostListing: (listingId: string, durationHours: number, coinCost: number) => boolean;
  highlightWantedRequest: (requestId: string, coinCost: number) => boolean;

  // Feature 5: Location & Map
  liveLocationSession: LiveLocationSession | null;
  startLiveLocationSharing: (campusSpot: string) => void;
  stopLiveLocationSharing: () => void;
  userCoords: { lat: number; lng: number } | null;
  setUserCoords: (coords: { lat: number; lng: number } | null) => void;
  requestUserLocation: () => Promise<boolean>;

  // Presentation Mode
  isPresentationMode: boolean;
  setIsPresentationMode: (active: boolean) => void;
  presentationStep: number;
  setPresentationStep: (step: number) => void;
  nextPresentationStep: () => void;
  prevPresentationStep: () => void;
  
  // Toast notifications
  toast: { title: string; message: string; type?: 'success' | 'info' | 'warning' } | null;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  hideToast: () => void;

  // Core Actions
  addListing: (newListingData: Omit<Listing, 'id' | 'timestamp' | 'dateListed' | 'isUserListing' | 'isDemoListing'>) => Promise<Listing>;
  deleteListing: (id: string) => Promise<void>;
  toggleSaveItem: (id: string) => Promise<void>;
  isItemSaved: (id: string) => boolean;
  resetDemoData: () => void;
  clearAllFilters: () => void;
  submitReport: (id: string, reason: ReportReason, details?: string) => void;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_THEME);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (e) {
      console.warn('Failed reading theme preference', e);
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY_THEME, next);
      } catch (e) {
        console.warn('Failed saving theme', e);
      }
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auth state & Backend loading
  const { user, profile } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState<boolean>(() => isSupabaseConfigured);

  // Listings State
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LISTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading listings from localStorage:', e);
    }
    return INITIAL_SEED_LISTINGS;
  });

  // Saved Items
  const [savedItemIds, setSavedItemIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading saved items:', e);
    }
    return ['cl-3'];
  });

  // User Listings
  const [userListingIds, setUserListingIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER_LISTINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading user listings:', e);
    }
    return [];
  });

  // Wanted Requests
  const [wantedRequests, setWantedRequests] = useState<WantedRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WANTED);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading wanted requests:', e);
    }
    return INITIAL_SEED_WANTED;
  });

  // Bargain Offers
  const [bargainOffers, setBargainOffers] = useState<BargainOffer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OFFERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading bargain offers:', e);
    }
    return [
      {
        id: 'offer-seed-1',
        listingId: 'cl-3', // Casio fx-991EX
        buyerName: 'Akhil (You)',
        originalPrice: 450,
        offeredPrice: 380,
        message: 'Can pick it up right now at Science Quad cafeteria if ₹380 is okay!',
        status: 'Countered',
        counterPrice: 400,
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 1800000,
        history: [
          { sender: 'buyer', price: 380, message: 'Proposed ₹380 for instant pickup', timestamp: Date.now() - 3600000 },
          { sender: 'seller', price: 400, message: 'I can do ₹400 with fresh batteries included!', timestamp: Date.now() - 1800000 }
        ]
      }
    ];
  });

  // Real Exchanges (Phase C)
  const [exchanges, setExchanges] = useState<ExchangeRecord[]>([]);

  // Reviews
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading reviews:', e);
    }
    return INITIAL_SEED_REVIEWS;
  });

  // Completed exchange tracker for eligible reviews
  const [completedExchangeIds, setCompletedExchangeIds] = useState<string[]>(['exchange-initial-demo']);

  // LoopCoins Wallet
  const [loopCoinsBalance, setLoopCoinsBalance] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COINS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.balance === 'number') return parsed.balance;
      }
    } catch (e) {
      console.warn('Error reading coin balance:', e);
    }
    return 150; // Starting demo student balance
  });

  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COINS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed?.transactions)) return parsed.transactions;
      }
    } catch (e) {
      console.warn('Error reading coin transactions:', e);
    }
    return [
      {
        id: 'tx-welcome',
        amount: 100,
        type: 'earned',
        reason: 'Welcome CampusLoop Starter Grant',
        timestamp: Date.now() - 604800000,
        dateStr: '1 week ago'
      },
      {
        id: 'tx-login',
        amount: 50,
        type: 'earned',
        reason: 'Daily Campus Check-In Reward',
        timestamp: Date.now() - 86400000,
        dateStr: 'Yesterday'
      }
    ];
  });

  // Live Location Session (Simulation)
  const [liveLocationSession, setLiveLocationSession] = useState<LiveLocationSession | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({ lat: 28.5450, lng: 77.1926 });

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedCondition, setSelectedCondition] = useState<Condition | 'All'>('All');
  const [selectedSort, setSelectedSort] = useState<SortOption>('newest');
  const [selectedCampusZone, setSelectedCampusZone] = useState<string>('All');

  // Modals
  const [isListItemModalOpen, setIsListItemModalOpen] = useState(false);
  const [isPostWantedModalOpen, setIsPostWantedModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Listing | null>(null);
  const [contactingProduct, setContactingProduct] = useState<Listing | null>(null);
  const [reportingProduct, setReportingProduct] = useState<Listing | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingTarget, setReviewingTarget] = useState<{ sellerName: string; itemTitle: string; category: Category; exchangeId: string } | null>(null);
  const [selectedSellerProfile, setSelectedSellerProfile] = useState<SellerProfileData | null>(null);
  const [selectedWantedRequest, setSelectedWantedRequest] = useState<WantedRequest | null>(null);

  // Presentation Mode
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationStep, setPresentationStep] = useState(0);

  // Toast
  const [toast, setToast] = useState<{ title: string; message: string; type?: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const hideToast = () => setToast(null);

  // Load real data from Supabase backend when configured
  const refreshBackendData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsDataLoading(true);

    try {
      // 1. Fetch live listings
      const { data: remoteListings, error: listErr } = await supabase
        .from('listings')
        .select('*, profiles(full_name, department, campus_location)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (listErr) {
        console.warn('Supabase listings fetch error:', listErr.message);
      } else if (remoteListings) {
        if (remoteListings.length > 0) {
          const mapped: Listing[] = remoteListings.map(row => ({
            id: row.id,
            title: row.title,
            price: Number(row.price),
            originalPrice: row.original_price ? Number(row.original_price) : undefined,
            category: row.category,
            condition: row.condition,
            description: row.description,
            sellerName: row.profiles?.full_name || 'Campus Student',
            sellerDepartment: row.profiles?.department || '1st Year BCA',
            sellerId: row.seller_id,
            campusLocation: row.campus_location,
            coordinates: row.latitude && row.longitude ? { lat: row.latitude, lng: row.longitude } : undefined,
            dateListed: new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            timestamp: new Date(row.created_at).getTime(),
            imageUrl: row.image_url,
            isFeatured: row.is_featured,
            isUserListing: user?.id === row.seller_id,
            contactPreference: row.contact_preference,
            tags: row.tags || [],
            conditionNotes: row.condition_notes,
            isDemoListing: false
          }));
          setListings(mapped);
          if (user?.id) {
            setUserListingIds(remoteListings.filter(r => r.seller_id === user.id).map(r => r.id));
          }
        } else {
          // Empty database: show seed listings clearly tagged as demo items
          setListings(INITIAL_SEED_LISTINGS.map(l => ({ ...l, isDemoListing: true })));
        }
      }

      // 2. Fetch live wanted requests
      const { data: remoteWanted, error: wantedErr } = await supabase
        .from('wanted_requests')
        .select('*, profiles(full_name, department, campus_location)')
        .order('created_at', { ascending: false });

      if (wantedErr) {
        console.warn('Supabase wanted fetch error:', wantedErr.message);
      } else if (remoteWanted) {
        if (remoteWanted.length > 0) {
          const mappedWanted: WantedRequest[] = remoteWanted.map(row => ({
            id: row.id,
            title: row.title,
            category: row.category,
            minBudget: Number(row.min_budget),
            maxBudget: Number(row.max_budget),
            desiredCondition: row.desired_condition,
            campusLocation: row.campus_location,
            searchRadius: row.search_radius,
            description: row.description,
            urgency: row.urgency,
            expiresAt: new Date(row.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            status: row.status,
            buyerName: row.profiles?.full_name || 'Campus Student',
            buyerDepartment: row.profiles?.department || '1st Year BCA',
            requesterId: row.requester_id,
            createdAt: new Date(row.created_at).getTime(),
            datePosted: new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            isHighlighted: row.is_highlighted,
            isUserRequest: user?.id === row.requester_id,
            isDemoRequest: false,
            offers: []
          }));
          setWantedRequests(mappedWanted);
        } else {
          setWantedRequests(INITIAL_SEED_WANTED.map(w => ({ ...w, isDemoRequest: true })));
        }
      }

      // 3. Fetch user's saved listings if authenticated
      if (user?.id) {
        const { data: savedData, error: savedErr } = await supabase
          .from('saved_listings')
          .select('listing_id')
          .eq('user_id', user.id);

        if (!savedErr && savedData) {
          setSavedItemIds(savedData.map(s => s.listing_id));
        }

        // 4. Fetch user's bargain offers (as buyer or seller)
        const { data: offersData } = await supabase
          .from('bargain_offers')
          .select('*, offer_history(*), profiles!bargain_offers_buyer_id_fkey(full_name)')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (offersData && offersData.length > 0) {
          const mappedOffers: BargainOffer[] = offersData.map((row: any) => ({
            id: row.id,
            conversationId: row.conversation_id,
            listingId: row.listing_id,
            buyerId: row.buyer_id,
            sellerId: row.seller_id,
            buyerName: row.profiles?.full_name || (row.buyer_id === user.id ? 'You' : 'Student Buyer'),
            originalPrice: Number(row.original_price),
            offeredPrice: Number(row.offered_price),
            counterPrice: row.counter_price ? Number(row.counter_price) : undefined,
            message: row.message || '',
            status: row.status as OfferStatus,
            createdAt: new Date(row.created_at).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
            history: (row.offer_history || [])
              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((h: any) => ({
                sender: h.sender_role as 'buyer' | 'seller',
                price: Number(h.price),
                message: h.message || '',
                timestamp: new Date(h.created_at).getTime()
              }))
          }));
          setBargainOffers(mappedOffers);
        }

        // 5. Fetch user's active exchanges
        const { data: exchangeData } = await supabase
          .from('exchanges')
          .select('*')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (exchangeData) {
          const mappedExchanges: ExchangeRecord[] = exchangeData.map((row: any) => ({
            id: row.id,
            listingId: row.listing_id,
            offerId: row.offer_id,
            buyerId: row.buyer_id,
            sellerId: row.seller_id,
            agreedPrice: Number(row.agreed_price),
            status: row.status as 'reserved' | 'completed' | 'cancelled',
            meetupLocation: row.meetup_location,
            buyerConfirmedAt: row.buyer_confirmed_at,
            sellerConfirmedAt: row.seller_confirmed_at,
            createdAt: new Date(row.created_at).getTime()
          }));
          setExchanges(mappedExchanges);
        }
      }
    } catch (err) {
      console.warn('Failed to refresh Supabase data:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  // Persistence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
    } catch (e) {
      console.error('Failed saving listings', e);
    }
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedItemIds));
    } catch (e) {
      console.error('Failed saving saved items', e);
    }
  }, [savedItemIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER_LISTINGS, JSON.stringify(userListingIds));
    } catch (e) {
      console.error('Failed saving user listings', e);
    }
  }, [userListingIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WANTED, JSON.stringify(wantedRequests));
    } catch (e) {
      console.error('Failed saving wanted requests', e);
    }
  }, [wantedRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify(bargainOffers));
    } catch (e) {
      console.error('Failed saving bargain offers', e);
    }
  }, [bargainOffers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed saving reviews', e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COINS, JSON.stringify({ balance: loopCoinsBalance, transactions: coinTransactions }));
    } catch (e) {
      console.error('Failed saving coins', e);
    }
  }, [loopCoinsBalance, coinTransactions]);

  // Live Location Countdown
  useEffect(() => {
    if (!liveLocationSession || !liveLocationSession.isActive) return;

    const interval = setInterval(() => {
      setLiveLocationSession(prev => {
        if (!prev) return null;
        const remaining = Math.max(0, Math.floor((prev.expiresAt - Date.now()) / 1000));
        if (remaining <= 0) {
          showToast('Sharing Ended', 'Live campus exchange location sharing expired automatically.', 'info');
          return null;
        }
        return { ...prev, timeRemainingSeconds: remaining };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [liveLocationSession]);

  // LoopCoins actions
  const earnCoins = (amount: number, reason: string) => {
    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      amount,
      type: 'earned',
      reason,
      timestamp: Date.now(),
      dateStr: 'Just now'
    };
    setLoopCoinsBalance(prev => prev + amount);
    setCoinTransactions(prev => [newTx, ...prev]);
    showToast(`+${amount} LoopCoins Earned!`, reason, 'success');
  };

  const spendCoins = (amount: number, reason: string): boolean => {
    if (loopCoinsBalance < amount) {
      showToast('Insufficient LoopCoins', `You need ${amount} LoopCoins for this action (Current balance: ${loopCoinsBalance}).`, 'warning');
      return false;
    }
    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      amount,
      type: 'spent',
      reason,
      timestamp: Date.now(),
      dateStr: 'Just now'
    };
    setLoopCoinsBalance(prev => prev - amount);
    setCoinTransactions(prev => [newTx, ...prev]);
    showToast(`Spent ${amount} LoopCoins`, reason, 'info');
    return true;
  };

  const boostListing = (listingId: string, durationHours: number, coinCost: number): boolean => {
    if (!spendCoins(coinCost, `Featured Boost for ${durationHours} hours`)) return false;

    setListings(prev => prev.map(item => {
      if (item.id === listingId) {
        return {
          ...item,
          isFeatured: true,
          isBoosted: true,
          boostExpiresAt: Date.now() + durationHours * 3600000
        };
      }
      return item;
    }));

    showToast('Listing Boosted!', `Item will appear pinned with high visibility for ${durationHours} hours.`, 'success');
    return true;
  };

  const highlightWantedRequest = (requestId: string, coinCost: number): boolean => {
    if (!spendCoins(coinCost, 'Highlighted Urgent Wanted Board Request')) return false;

    setWantedRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return { ...req, isHighlighted: true };
      }
      return req;
    }));

    showToast('Request Highlighted!', 'Your wanted request is now pinned at the top with an urgent badge.', 'success');
    return true;
  };

  // Feature 1: Wanted Board Actions
  const addWantedRequest = async (
    reqData: Omit<WantedRequest, 'id' | 'createdAt' | 'datePosted' | 'status' | 'offers' | 'isUserRequest' | 'isDemoRequest'>
  ): Promise<WantedRequest> => {
    if (isSupabaseConfigured && user?.id) {
      try {
        const { data, error } = await supabase
          .from('wanted_requests')
          .insert({
            requester_id: user.id,
            title: reqData.title,
            category: reqData.category,
            min_budget: reqData.minBudget,
            max_budget: reqData.maxBudget,
            desired_condition: reqData.desiredCondition,
            campus_location: reqData.campusLocation,
            search_radius: reqData.searchRadius,
            description: reqData.description,
            urgency: reqData.urgency,
            is_highlighted: reqData.isHighlighted || false,
            status: 'Open'
          })
          .select('*, profiles(full_name, department, campus_location)')
          .single();

        if (error) {
          showToast('Failed to post request', error.message, 'warning');
          throw error;
        }

        const createdReq: WantedRequest = {
          id: data.id,
          title: data.title,
          category: data.category,
          minBudget: Number(data.min_budget),
          maxBudget: Number(data.max_budget),
          desiredCondition: data.desired_condition,
          campusLocation: data.campus_location,
          searchRadius: data.search_radius,
          description: data.description,
          urgency: data.urgency,
          expiresAt: new Date(data.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          status: 'Open',
          buyerName: data.profiles?.full_name || profile?.full_name || 'You',
          buyerDepartment: data.profiles?.department || profile?.department || '1st Year BCA',
          requesterId: data.requester_id,
          createdAt: new Date(data.created_at).getTime(),
          datePosted: 'Just now',
          isHighlighted: data.is_highlighted,
          isUserRequest: true,
          isDemoRequest: false,
          offers: []
        };

        setWantedRequests(prev => [createdReq, ...prev]);
        earnCoins(10, 'Created a Wanted Board Request');
        showToast('Wanted Request Posted in Supabase!', `Classmates can now see your request for "${createdReq.title}".`, 'success');
        return createdReq;
      } catch (err: unknown) {
        console.warn('Backend wanted request error, falling back to local state:', err);
      }
    }

    const newReq: WantedRequest = {
      ...reqData,
      id: `req-user-${Date.now()}`,
      createdAt: Date.now(),
      datePosted: 'Just now',
      status: 'Open',
      isUserRequest: true,
      isDemoRequest: !isSupabaseConfigured,
      offers: []
    };

    setWantedRequests(prev => [newReq, ...prev]);
    earnCoins(10, 'Created a Wanted Board Request');
    showToast('Wanted Request Posted (Demo)', `Classmates can now see your request for "${newReq.title}".`, 'success');
    return newReq;
  };

  const submitWantedOffer = (requestId: string, proposedPrice: number, message: string, listingId?: string) => {
    const offer: WantedOffer = {
      id: `off-${Date.now()}`,
      requestId,
      sellerName: 'You (Student Seller)',
      sellerDepartment: '1st Year BCA',
      proposedPrice,
      message,
      listingId,
      createdAt: Date.now(),
      dateStr: 'Just now',
      status: 'Pending'
    };

    setWantedRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'Offers Received',
          offers: [offer, ...req.offers]
        };
      }
      return req;
    }));

    earnCoins(15, 'Sent an Offer on Wanted Board');
    showToast('Offer Sent to Buyer', `Proposed ₹${proposedPrice}. The student will review your offer.`, 'success');
  };

  const acceptWantedOffer = (requestId: string, offerId: string) => {
    setWantedRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updatedOffers = req.offers.map(o => o.id === offerId ? { ...o, status: 'Accepted' as const } : o);
        return {
          ...req,
          status: 'Fulfilled',
          offers: updatedOffers
        };
      }
      return req;
    }));

    earnCoins(25, 'Agreed on Wanted Board Match');
    showToast('Offer Accepted!', 'Deal agreed! You can now meet on campus for exchange.', 'success');
  };

  const markRequestFulfilled = async (requestId: string): Promise<void> => {
    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase
          .from('wanted_requests')
          .update({ status: 'Fulfilled' })
          .eq('id', requestId)
          .eq('requester_id', user.id);
      } catch (e) {
        console.warn('Error updating wanted request status in Supabase:', e);
      }
    }

    setWantedRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'Fulfilled' } : req));
    showToast('Request Marked Fulfilled', 'Moved to fulfilled requests archive.', 'info');
  };

  // Feature 2: Bargaining & Offers
  const makeOffer = async (listingId: string, offeredPrice: number, message: string): Promise<BargainOffer | null> => {
    if (isSupabaseConfigured && user?.id) {
      try {
        const { data, error } = await supabase.rpc('create_bargain_offer', {
          p_listing_id: listingId,
          p_offered_price: offeredPrice,
          p_message: message.trim() || undefined
        });

        if (error) {
          showToast('Could Not Send Offer', error.message, 'warning');
          return null;
        }

        const newOffer: BargainOffer = {
          id: data.id,
          conversationId: data.conversation_id,
          listingId: data.listing_id,
          buyerId: data.buyer_id,
          sellerId: data.seller_id,
          buyerName: user.user_metadata?.full_name || 'You',
          originalPrice: Number(data.original_price),
          offeredPrice: Number(data.offered_price),
          message: data.message || '',
          status: 'Pending',
          createdAt: new Date(data.created_at).getTime(),
          updatedAt: new Date(data.updated_at).getTime(),
          history: [
            {
              sender: 'buyer',
              price: offeredPrice,
              message,
              timestamp: Date.now()
            }
          ]
        };

        setBargainOffers(prev => [newOffer, ...prev.filter(o => o.listingId !== listingId)]);
        earnCoins(10, 'Proposed Peer Bargain Offer');
        showToast('Offer Sent to Seller!', `Offered ₹${offeredPrice}. Notification sent in chat.`, 'success');
        return newOffer;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to send offer';
        showToast('Offer Error', msg, 'warning');
        return null;
      }
    }

    const targetItem = listings.find(i => i.id === listingId);
    const originalPrice = targetItem ? targetItem.price : offeredPrice;

    const newOffer: BargainOffer = {
      id: `offer-${Date.now()}`,
      listingId,
      buyerName: 'You (Student Buyer)',
      originalPrice,
      offeredPrice,
      message,
      status: 'Pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      history: [
        {
          sender: 'buyer',
          price: offeredPrice,
          message,
          timestamp: Date.now()
        }
      ]
    };

    setBargainOffers(prev => [newOffer, ...prev.filter(o => o.listingId !== listingId)]);
    showToast('Offer Proposed (Demo)', `Offered ₹${offeredPrice} (Original: ₹${originalPrice}). Waiting for seller response.`, 'info');
    return newOffer;
  };

  const respondToOffer = async (
    offerId: string, 
    action: 'accept' | 'reject' | 'counter', 
    counterPrice?: number, 
    message?: string
  ): Promise<void> => {
    if (isSupabaseConfigured && user?.id) {
      try {
        if (action === 'accept') {
          const { data, error } = await supabase.rpc('accept_bargain_offer', {
            p_offer_id: offerId,
            p_message: message || undefined
          });

          if (error) {
            showToast('Could Not Accept Offer', error.message, 'warning');
            return;
          }

          const agreedPrice = Number(data.offer.agreed_price);
          setBargainOffers(prev => prev.map(o => o.id === offerId ? {
            ...o,
            status: 'Accepted',
            history: [...o.history, { sender: 'seller', price: agreedPrice, message: message || 'Deal accepted!', timestamp: Date.now() }]
          } : o.listingId === o.listingId ? { ...o, status: 'Rejected' } : o));

          setListings(prev => prev.map(l => l.id === data.exchange?.listing_id ? { ...l, agreedPrice } : l));
          earnCoins(25, 'Successful Campus Bargain Agreement');
          showToast('Offer Accepted!', `Deal agreed on ₹${agreedPrice}! Meetup details ready.`, 'success');
          return;
        }

        if (action === 'counter' && counterPrice) {
          const { data, error } = await supabase.rpc('counter_bargain_offer', {
            p_offer_id: offerId,
            p_counter_price: counterPrice,
            p_message: message || undefined
          });

          if (error) {
            showToast('Could Not Propose Counteroffer', error.message, 'warning');
            return;
          }

          setBargainOffers(prev => prev.map(o => o.id === offerId ? {
            ...o,
            status: 'Countered',
            counterPrice: Number(data.counter_price),
            history: [...o.history, { sender: 'seller', price: counterPrice, message: message || `Countered with ₹${counterPrice}`, timestamp: Date.now() }]
          } : o));
          showToast('Counteroffer Sent', `Countered with ₹${counterPrice}.`, 'info');
          return;
        }

        if (action === 'reject') {
          const { error } = await supabase.rpc('reject_bargain_offer', {
            p_offer_id: offerId,
            p_message: message || undefined
          });

          if (error) {
            showToast('Could Not Reject Offer', error.message, 'warning');
            return;
          }

          setBargainOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Rejected' } : o));
          showToast('Offer Declined', 'The offer was declined.', 'warning');
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Offer response failed';
        showToast('Error', msg, 'warning');
        return;
      }
    }

    setBargainOffers(prev => prev.map(offer => {
      if (offer.id !== offerId) return offer;

      if (action === 'accept') {
        const agreedPrice = offer.counterPrice || offer.offeredPrice;
        // Update listing price to agreedPrice
        setListings(lList => lList.map(item => item.id === offer.listingId ? { ...item, agreedPrice } : item));
        earnCoins(25, 'Successful Campus Bargain Agreement');

        // Allow review
        const exchangeId = `exchange-${Date.now()}`;
        setCompletedExchangeIds(ex => [...ex, exchangeId]);

        showToast('Offer Accepted (Demo)', `Agreed on ₹${agreedPrice}! Meetup details ready.`, 'success');

        return {
          ...offer,
          status: 'Accepted',
          updatedAt: Date.now(),
          history: [
            ...offer.history,
            { sender: 'seller', price: agreedPrice, message: message || 'Deal accepted! Let us meet on campus.', timestamp: Date.now() }
          ]
        };
      }

      if (action === 'counter' && counterPrice) {
        showToast('Counteroffer Proposed (Demo)', `Countered with ₹${counterPrice}.`, 'info');
        return {
          ...offer,
          status: 'Countered',
          counterPrice,
          updatedAt: Date.now(),
          history: [
            ...offer.history,
            { sender: 'seller', price: counterPrice, message: message || `I can meet halfway at ₹${counterPrice}`, timestamp: Date.now() }
          ]
        };
      }

      // reject
      showToast('Offer Declined (Demo)', 'The offer was rejected by the seller.', 'warning');
      return {
        ...offer,
        status: 'Rejected',
        updatedAt: Date.now(),
        history: [
          ...offer.history,
          { sender: 'seller', price: offer.originalPrice, message: message || 'Sorry, price is firm at this time.', timestamp: Date.now() }
        ]
      };
    }));
  };

  const cancelOffer = async (offerId: string): Promise<void> => {
    if (isSupabaseConfigured && user?.id) {
      try {
        const { error } = await supabase.rpc('cancel_bargain_offer', {
          p_offer_id: offerId
        });
        if (error) {
          showToast('Could Not Cancel Offer', error.message, 'warning');
          return;
        }
      } catch (err: unknown) {
        console.warn('Backend cancel offer error:', err);
      }
    }

    setBargainOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'Cancelled' as const } : o));
    showToast('Offer Cancelled', 'Your pending offer was cancelled.', 'info');
  };

  const confirmExchange = async (exchangeId: string): Promise<void> => {
    if (isSupabaseConfigured && user?.id) {
      try {
        const { data, error } = await supabase.rpc('confirm_exchange_completion', {
          p_exchange_id: exchangeId
        });
        if (error) {
          showToast('Confirmation Error', error.message, 'warning');
          return;
        }

        if (data.status === 'completed') {
          showToast('Exchange Completed!', 'Both students confirmed the handover! Listing marked sold.', 'success');
          earnCoins(30, 'Completed In-Person Campus Handover');
        } else {
          showToast('Confirmation Recorded', 'Your confirmation was recorded. Waiting for peer confirmation.', 'info');
        }
        await refreshBackendData();
        return;
      } catch (err: unknown) {
        console.warn('Confirm exchange error:', err);
      }
    }

    showToast('Handover Confirmed (Demo)', 'Verified exchange complete.', 'success');
  };

  const getOfferForListing = (listingId: string) => {
    return bargainOffers.find(o => o.listingId === listingId && o.status !== 'Cancelled');
  };

  // Feature 3: Reviews
  const addReview = (sellerName: string, itemTitle: string, itemCategory: Category, rating: number, comment: string, exchangeId: string) => {
    if (completedExchangeIds.includes(exchangeId) && reviews.some(r => r.id === `rev-${exchangeId}`)) {
      showToast('Review Already Submitted', 'You have already reviewed this exchange.', 'warning');
      return;
    }

    const newRev: ProductReview = {
      id: `rev-${exchangeId || Date.now()}`,
      sellerName,
      itemTitle,
      itemCategory,
      reviewerName: 'You (Verified Campus Buyer)',
      rating,
      comment,
      date: 'Just now',
      timestamp: Date.now()
    };

    setReviews(prev => [newRev, ...prev]);
    earnCoins(15, 'Left an Honest Peer Review');
    setIsReviewModalOpen(false);
    showToast('Review Published', `Thank you! Your ${rating}-star review for ${sellerName} has been recorded.`, 'success');
  };

  const reportReview = (reviewId: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isReported: true } : r));
    showToast('Review Flagged', 'Review reported for moderation review in demo mode.', 'info');
  };

  const getSellerReviews = (sellerName: string) => {
    return reviews.filter(r => r.sellerName.toLowerCase() === sellerName.toLowerCase() && !r.isReported);
  };

  const getSellerProfile = (sellerName: string): SellerProfileData => {
    if (INITIAL_SELLER_PROFILES[sellerName]) {
      const base = INITIAL_SELLER_PROFILES[sellerName];
      const sellerRevs = getSellerReviews(sellerName);
      if (sellerRevs.length > 0) {
        const avg = Number((sellerRevs.reduce((acc, r) => acc + r.rating, 0) / sellerRevs.length).toFixed(1));
        return {
          ...base,
          averageRating: avg,
          totalReviews: sellerRevs.length
        };
      }
      return base;
    }

    // Default dynamic profile for any other seller
    return {
      name: sellerName,
      department: 'Campus Student',
      campusLocation: 'Central Campus',
      memberSince: 'Semester 1',
      completedExchanges: 3,
      averageRating: 4.8,
      totalReviews: 3,
      ratingBreakdown: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 }
    };
  };

  // Feature 5: Location Sharing
  const startLiveLocationSharing = (campusSpot: string) => {
    const durationSec = 15 * 60; // 15 mins
    const session: LiveLocationSession = {
      isActive: true,
      sharedBy: 'You (Student)',
      campusSpot,
      lat: 28.5450 + (Math.random() - 0.5) * 0.002,
      lng: 77.1926 + (Math.random() - 0.5) * 0.002,
      expiresAt: Date.now() + durationSec * 1000,
      timeRemainingSeconds: durationSec
    };
    setLiveLocationSession(session);
    showToast('Temporary Location Active', `Sharing 15-minute meetup proximity near ${campusSpot}.`, 'info');
  };

  const stopLiveLocationSharing = () => {
    setLiveLocationSession(null);
    showToast('Location Sharing Stopped', 'Your location simulation was disabled.', 'info');
  };

  const requestUserLocation = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        showToast('GPS Unavailable', 'Geolocation is not supported by your browser. Using campus default location.', 'warning');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          showToast('Location Updated', 'Located relative to university campus.', 'success');
          resolve(true);
        },
        (err) => {
          console.warn('Geolocation permission denied or error:', err);
          showToast('Campus Default Set', 'Location access was not granted. Using Central Library landmark.', 'info');
          setUserCoords({ lat: 28.5450, lng: 77.1926 });
          resolve(false);
        },
        { timeout: 7000 }
      );
    });
  };

  // Standard Listings actions
  const addListing = async (
    newListingData: Omit<Listing, 'id' | 'timestamp' | 'dateListed' | 'isUserListing' | 'isDemoListing'>
  ): Promise<Listing> => {
    if (isSupabaseConfigured && user?.id) {
      try {
        const { data, error } = await supabase
          .from('listings')
          .insert({
            seller_id: user.id,
            title: newListingData.title,
            description: newListingData.description,
            category: newListingData.category,
            condition: newListingData.condition,
            price: newListingData.price,
            original_price: newListingData.originalPrice,
            contact_preference: newListingData.contactPreference,
            campus_location: newListingData.campusLocation,
            latitude: newListingData.coordinates?.lat,
            longitude: newListingData.coordinates?.lng,
            image_url: newListingData.imageUrl,
            tags: newListingData.tags,
            condition_notes: newListingData.conditionNotes,
            is_featured: newListingData.isFeatured || false,
            status: 'active'
          })
          .select('*, profiles(full_name, department, campus_location)')
          .single();

        if (error) {
          showToast('Failed to create listing', error.message, 'warning');
          throw error;
        }

        const createdListing: Listing = {
          id: data.id,
          title: data.title,
          price: Number(data.price),
          originalPrice: data.original_price ? Number(data.original_price) : undefined,
          category: data.category,
          condition: data.condition,
          description: data.description,
          sellerName: data.profiles?.full_name || profile?.full_name || 'You',
          sellerDepartment: data.profiles?.department || profile?.department || '1st Year BCA',
          sellerId: data.seller_id,
          campusLocation: data.campus_location,
          coordinates: data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : undefined,
          dateListed: 'Just now',
          timestamp: new Date(data.created_at).getTime(),
          imageUrl: data.image_url,
          isFeatured: data.is_featured,
          isUserListing: true,
          contactPreference: data.contact_preference,
          tags: data.tags || [],
          conditionNotes: data.condition_notes,
          isDemoListing: false
        };

        setListings(prev => [createdListing, ...prev]);
        setUserListingIds(prev => [createdListing.id, ...prev]);
        earnCoins(15, 'Created a New Listing');
        showToast('Listing Created in Supabase!', `"${createdListing.title}" is now live on campus.`, 'success');
        return createdListing;
      } catch (err: unknown) {
        console.warn('Backend listing creation error, falling back to local state:', err);
      }
    }

    const newId = `user-listing-${Date.now()}`;
    const newListing: Listing = {
      ...newListingData,
      id: newId,
      timestamp: Date.now(),
      dateListed: 'Just now',
      isUserListing: true,
      isFeatured: false,
      isDemoListing: !isSupabaseConfigured
    };

    setListings(prev => [newListing, ...prev]);
    setUserListingIds(prev => [newId, ...prev]);
    earnCoins(15, 'Created a New Listing');
    showToast('Listing Created (Demo)', `"${newListing.title}" is saved locally.`, 'success');
    return newListing;
  };

  const deleteListing = async (id: string): Promise<void> => {
    if (isSupabaseConfigured && user?.id) {
      try {
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', id)
          .eq('seller_id', user.id);

        if (error) {
          showToast('Could not delete listing', error.message, 'warning');
          return;
        }
      } catch (e) {
        console.warn('Error deleting listing from Supabase:', e);
      }
    }

    const itemToDelete = listings.find(item => item.id === id);
    setListings(prev => prev.filter(item => item.id !== id));
    setUserListingIds(prev => prev.filter(item => item !== id));
    setSavedItemIds(prev => prev.filter(itemId => itemId !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }
    showToast('Listing Removed', `"${itemToDelete?.title || 'Item'}" was removed.`, 'info');
  };

  const toggleSaveItem = async (id: string): Promise<void> => {
    const isCurrentlySaved = savedItemIds.includes(id);

    if (isSupabaseConfigured && user?.id) {
      try {
        if (isCurrentlySaved) {
          await supabase
            .from('saved_listings')
            .delete()
            .eq('user_id', user.id)
            .eq('listing_id', id);
        } else {
          await supabase
            .from('saved_listings')
            .insert({ user_id: user.id, listing_id: id });
        }
      } catch (e) {
        console.warn('Error syncing bookmark with Supabase:', e);
      }
    }

    const item = listings.find(i => i.id === id);
    if (isCurrentlySaved) {
      setSavedItemIds(prev => prev.filter(itemId => itemId !== id));
      showToast('Removed from Saved', `"${item?.title || 'Item'}" removed from your saved list.`, 'info');
    } else {
      setSavedItemIds(prev => [...prev, id]);
      showToast('Saved for Later', `"${item?.title || 'Item'}" added to your saved list.`, 'success');
    }
  };

  const isItemSaved = (id: string) => savedItemIds.includes(id);

  const resetDemoData = () => {
    setListings(INITIAL_SEED_LISTINGS);
    setSavedItemIds(['cl-3']);
    setUserListingIds([]);
    setWantedRequests(INITIAL_SEED_WANTED);
    setReviews(INITIAL_SEED_REVIEWS);
    setLoopCoinsBalance(150);
    setLiveLocationSession(null);
    setIsResetConfirmOpen(false);
    showToast('Demo Data Reset', 'Restored original seed listings, wanted requests, and initial demo balance.', 'info');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedSort('newest');
    setSelectedCampusZone('All');
  };

  const submitReport = (id: string, reason: ReportReason, details?: string) => {
    setReportingProduct(null);
    showToast('Report Simulated', `Thank you. Report for reason "${reason}" logged in demo mode.`, 'info');
  };

  const nextPresentationStep = () => {
    setPresentationStep(prev => Math.min(prev + 1, 4));
  };

  const prevPresentationStep = () => {
    setPresentationStep(prev => Math.max(prev - 1, 0));
  };

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (contactingProduct) setContactingProduct(null);
        else if (reportingProduct) setReportingProduct(null);
        else if (selectedProduct) setSelectedProduct(null);
        else if (selectedWantedRequest) setSelectedWantedRequest(null);
        else if (selectedSellerProfile) setSelectedSellerProfile(null);
        else if (isReviewModalOpen) setIsReviewModalOpen(false);
        else if (isWalletModalOpen) setIsWalletModalOpen(false);
        else if (isPostWantedModalOpen) setIsPostWantedModalOpen(false);
        else if (isListItemModalOpen) setIsListItemModalOpen(false);
        else if (isProfileDrawerOpen) setIsProfileDrawerOpen(false);
        else if (isResetConfirmOpen) setIsResetConfirmOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    contactingProduct, reportingProduct, selectedProduct, selectedWantedRequest, 
    selectedSellerProfile, isReviewModalOpen, isWalletModalOpen, isPostWantedModalOpen, 
    isListItemModalOpen, isProfileDrawerOpen, isResetConfirmOpen
  ]);

  return (
    <CampusContext.Provider
      value={{
        listings,
        savedItemIds,
        userListingIds,
        activeTab,
        setActiveTab,
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
        isDataLoading,
        refreshBackendData,
        theme,
        toggleTheme,
        isListItemModalOpen,
        setIsListItemModalOpen,
        isPostWantedModalOpen,
        setIsPostWantedModalOpen,
        selectedProduct,
        setSelectedProduct,
        contactingProduct,
        setContactingProduct,
        reportingProduct,
        setReportingProduct,
        isProfileDrawerOpen,
        setIsProfileDrawerOpen,
        isResetConfirmOpen,
        setIsResetConfirmOpen,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isReviewModalOpen,
        setIsReviewModalOpen,
        reviewingTarget,
        setReviewingTarget,
        selectedSellerProfile,
        setSelectedSellerProfile,
        selectedWantedRequest,
        setSelectedWantedRequest,
        wantedRequests,
        addWantedRequest,
        submitWantedOffer,
        acceptWantedOffer,
        markRequestFulfilled,
        bargainOffers,
        exchanges,
        makeOffer,
        respondToOffer,
        cancelOffer,
        getOfferForListing,
        confirmExchange,
        reviews,
        completedExchangeIds,
        addReview,
        reportReview,
        getSellerReviews,
        getSellerProfile,
        loopCoinsBalance,
        coinTransactions,
        earnCoins,
        spendCoins,
        boostListing,
        highlightWantedRequest,
        liveLocationSession,
        startLiveLocationSharing,
        stopLiveLocationSharing,
        userCoords,
        setUserCoords,
        requestUserLocation,
        isPresentationMode,
        setIsPresentationMode,
        presentationStep,
        setPresentationStep,
        nextPresentationStep,
        prevPresentationStep,
        toast,
        showToast,
        hideToast,
        addListing,
        deleteListing,
        toggleSaveItem,
        isItemSaved,
        resetDemoData,
        clearAllFilters,
        submitReport,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = (): CampusContextType => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};
