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

export interface Listing {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  category: Category;
  condition: Condition;
  description: string;
  sellerName: string;
  sellerDepartment?: string;
  campusLocation: string;
  dateListed: string;
  timestamp: number;
  imageUrl: string;
  isFeatured?: boolean;
  isUserListing?: boolean;
  contactPreference: ContactPreference;
  tags: string[];
  conditionNotes?: string;
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
  | 'savings';
