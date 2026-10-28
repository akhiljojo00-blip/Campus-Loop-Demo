export type Category = 
  | 'Textbooks' 
  | 'Electronics' 
  | 'Stationery' 
  | 'Study essentials' 
  | 'Hostel essentials' 
  | 'College essentials' 
  | 'Other';

export type Condition = 
  | 'Like New' 
  | 'Good condition' 
  | 'Well used';

export type ContactPreference = 
  | 'Campus Chat' 
  | 'WhatsApp' 
  | 'Meet at Library';

export interface CampusCoordinates {
  lat: number;
  lng: number;
  zoneName: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  agreedPrice?: number;
  category: Category;
  condition: Condition;
  description: string;
  sellerName: string;
  sellerDepartment?: string;
  sellerId?: string;
  campusLocation: string;
  coordinates?: { lat: number; lng: number };
  dateListed: string;
  timestamp: number;
  imageUrl: string;
  isFeatured?: boolean;
  isUserListing?: boolean;
  contactPreference: ContactPreference;
  tags: string[];
  conditionNotes?: string;
  isBoosted?: boolean;
  boostExpiresAt?: number;
}

// Feature 1: Wanted Board
export type WantedUrgency = 'Urgent (Need within 24h)' | 'Within a week' | 'No rush';
export type WantedStatus = 'Open' | 'Offers Received' | 'Fulfilled' | 'Expired';

export interface WantedOffer {
  id: string;
  requestId: string;
  sellerName: string;
  sellerDepartment?: string;
  proposedPrice: number;
  message: string;
  listingId?: string;
  createdAt: number;
  dateStr: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export interface WantedRequest {
  id: string;
  title: string;
  category: Category;
  minBudget: number;
  maxBudget: number;
  desiredCondition: 'Like New' | 'Good condition' | 'Any condition';
  campusLocation: string;
  searchRadius: string;
  description: string;
  urgency: WantedUrgency;
  expiresAt: string;
  status: WantedStatus;
  buyerName: string;
  buyerDepartment: string;
  createdAt: number;
  datePosted: string;
  isHighlighted?: boolean;
  isUserRequest?: boolean;
  offers: WantedOffer[];
}

// Feature 2: Bargaining & Offers
export type OfferStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Countered' | 'Cancelled' | 'Expired';

export interface BargainOffer {
  id: string;
  listingId: string;
  buyerName: string;
  originalPrice: number;
  offeredPrice: number;
  counterPrice?: number;
  message: string;
  status: OfferStatus;
  createdAt: number;
  updatedAt: number;
  history: {
    sender: 'buyer' | 'seller';
    price: number;
    message?: string;
    timestamp: number;
  }[];
}

// Feature 3: Ratings & Reviews
export interface ProductReview {
  id: string;
  listingId?: string;
  itemTitle: string;
  itemCategory: Category;
  sellerName: string;
  reviewerName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  timestamp: number;
  isReported?: boolean;
}

export interface SellerProfileData {
  name: string;
  department: string;
  campusLocation: string;
  memberSince: string;
  completedExchanges: number;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Feature 4: LoopCoins Virtual Rewards
export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  reason: string;
  timestamp: number;
  dateStr: string;
}

export interface LoopCoinsWallet {
  balance: number;
  transactions: CoinTransaction[];
}

// Feature 5: Location Sharing Simulation
export interface LiveLocationSession {
  isActive: boolean;
  sharedBy: string;
  campusSpot: string;
  lat: number;
  lng: number;
  expiresAt: number;
  timeRemainingSeconds: number;
}

export type ReportReason = 
  | 'Suspicious or fraudulent listing'
  | 'Inaccurate item description or condition'
  | 'Unrealistic or misleading pricing'
  | 'Prohibited or unsafe campus item'
  | 'Duplicate listing or already sold';

export type SortOption = 
  | 'newest' 
  | 'price-low' 
  | 'price-high' 
  | 'savings'
  | 'nearest';
